
import { useEffect, useState } from "react";

import { useGetTechnicianRequestsQuery } from "../../services/Api";
import TechnicianStatusCard from "../../components/ui/card/TechnicianStatusCard";
import RequestPendingCard from "../../components/ui/card/RequestPendingCard";
import { connectSharedSocket, getSharedSocket } from "../../services/socket";

const getRequestList = (response) => {
  const candidates = [
    response?.data?.requests,
    response?.requests,
    response?.data,
  ];

  return candidates.find(Array.isArray) || [];
};

const getRequestId = (request) =>
  String(request?._id || request?.requestId || request?.id || "");

const TecnicianDashboard = () => {
  const [liveRequests, setLiveRequests] = useState([]);

  const {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useGetTechnicianRequestsQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const serverRequests = getRequestList(data);

  // Merge API requests with requests received directly over Socket.IO.
  // Live requests are retained even if the current API response is empty.
  const requestMap = new Map();

  serverRequests.forEach((request) => {
    const id = getRequestId(request);

    if (id) {
      requestMap.set(id, request);
    }
  });

  liveRequests.forEach((request) => {
    const id = getRequestId(request);

    if (id) {
      requestMap.set(id, {
        ...requestMap.get(id),
        ...request,
      });
    }
  });

  const requests = Array.from(requestMap.values()).sort(
    (a, b) =>
      new Date(b.createdAt || 0).getTime() -
      new Date(a.createdAt || 0).getTime()
  );

  useEffect(() => {
    const socket = getSharedSocket();

    const handleNewRequest = (newRequest) => {
      if (!newRequest) {
        console.warn("Received an empty request:new event.");
        return;
      }

      const newId = getRequestId(newRequest);

      if (!newId) {
        console.warn("request:new event is missing a request ID.");
        return;
      }

      console.info("Real-time service request received:", newId);

      setLiveRequests((currentRequests) => {
        const alreadyExists = currentRequests.some(
          (request) => getRequestId(request) === newId
        );

        if (alreadyExists) {
          return currentRequests.map((request) =>
            getRequestId(request) === newId
              ? { ...request, ...newRequest }
              : request
          );
        }

        return [newRequest, ...currentRequests];
      });
    };

    const handleRequestUpdated = () => {
      // Refresh when an existing request changes status.
      refetch();
    };

    const handleConnect = () => {
      console.info("Technician dashboard Socket.IO connected.");
      refetch();
    };

    const handleConnectError = (socketError) => {
      console.error(
        "Socket.IO connection failed:",
        socketError.message
      );
    };

    const handleDisconnect = (reason) => {
      console.warn("Socket.IO disconnected:", reason);
    };

    socket.on("request:new", handleNewRequest);
    socket.on("request:updated", handleRequestUpdated);
    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);
    socket.on("disconnect", handleDisconnect);

    connectSharedSocket(socket);

    return () => {
      socket.off("request:new", handleNewRequest);
      socket.off("request:updated", handleRequestUpdated);
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
      socket.off("disconnect", handleDisconnect);
    };
  }, [refetch]);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <TechnicianStatusCard />

        <section className="mt-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[#1C2333]">
                New Service Requests
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                New requests appear automatically when received.
              </p>
            </div>

            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-[#1C2333] transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isFetching ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {isLoading ? (
            <div className="rounded-xl bg-white p-6 text-gray-600">
              Loading service requests...
            </div>
          ) : error && requests.length === 0 ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
              <p>
                {error?.data?.message ||
                  error?.error ||
                  "Could not load service requests."}
              </p>

              <button
                type="button"
                onClick={() => refetch()}
                className="mt-3 font-semibold underline"
              >
                Try again
              </button>
            </div>
          ) : requests.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
              <h3 className="font-semibold text-[#1C2333]">
                No Service Requests
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                New service requests will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {requests.map((request) => (
                <RequestPendingCard
                  key={getRequestId(request)}
                  request={request}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default TecnicianDashboard;
