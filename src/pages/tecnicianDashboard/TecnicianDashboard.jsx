import { useEffect } from "react";
import { useGetTechnicianRequestsQuery } from "../../services/Api";
import TechnicianStatusCard from "../../components/ui/card/TechnicianStatusCard";
import RequestPendingCard from "../../components/ui/card/RequestPendingCard";
import { connectSharedSocket, getSharedSocket } from "../../services/socket";

const getRequestList = (response) => {
  const candidates = [response?.data?.requests, response?.requests, response?.data];
  return candidates.find(Array.isArray) || [];
};

const TecnicianDashboard = () => {
  const {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useGetTechnicianRequestsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const requests = getRequestList(data);

  useEffect(() => {
    const socket = getSharedSocket();
    let hasConnectedBefore = socket.connected;

    const handleNewRequest = () => {
      refetch();
    };

    const handleRequestUpdated = () => {
      // The socket is authenticated for the logged-in technician, so the
      // event is only a signal to reload the authoritative request list.
      refetch();
    };

    const handleConnect = () => {
      if (hasConnectedBefore) {
        refetch();
      }
      hasConnectedBefore = true;
    };

    const handleConnectError = () => {
      console.warn("Socket.IO connection failed. Verify backend availability and the /socket.io/ path.");
    };

    const handleDisconnect = () => {
      console.info("Socket.IO disconnected.");
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
              <h2 className="text-lg font-semibold text-[#1C2333]">New Service Requests</h2>
              <p className="mt-1 text-sm text-gray-500">New requests refresh when received. You can also refresh manually.</p>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-[#1C2333] disabled:opacity-60"
            >
              {isFetching ? "Refreshing…" : "Refresh"}
            </button>
          </div>

          {isLoading ? (
            <div className="rounded-xl bg-white p-6 text-gray-600">Loading service requests…</div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
              <p>{error?.data?.message || "Could not load service requests."}</p>
              <button type="button" onClick={() => refetch()} className="mt-3 font-semibold underline">Try again</button>
            </div>
          ) : requests.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
              No service requests right now. New requests will appear here.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {requests.map((request, index) => (
                <RequestPendingCard key={request?._id || request?.id || index} request={request} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default TecnicianDashboard;
