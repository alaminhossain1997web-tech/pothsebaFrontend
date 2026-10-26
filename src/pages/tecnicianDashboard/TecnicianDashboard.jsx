
import { useEffect } from "react";

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
  const {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useGetTechnicianRequestsQuery(undefined, {
    pollingInterval: 30000,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const serverRequests = getRequestList(data);

  const requests = [...serverRequests].sort(
    (a, b) =>
      new Date(b.createdAt || 0).getTime() -
      new Date(a.createdAt || 0).getTime()
  );
  const groups = [
    { title: "New Requests", statuses: ["pending"] },
    { title: "Active Requests", statuses: ["accepted", "on_the_way", "in_progress"] },
    { title: "Request History", statuses: ["rejected", "completed", "cancelled"] },
  ];

  useEffect(() => {
    const socket = getSharedSocket();

    const refresh = () => refetch();

    socket.on("request:new", refresh);
    socket.on("request:updated", refresh);
    socket.on("connect", refresh);

    connectSharedSocket(socket);

    return () => {
      socket.off("request:new", refresh);
      socket.off("request:updated", refresh);
      socket.off("connect", refresh);
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
                Assigned Service Requests
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
            <div className="space-y-8">
              {groups.map(({ title, statuses }) => {
                const groupedRequests = requests.filter((request) => statuses.includes(String(request?.status || "pending").toLowerCase()));
                return (
                  <section key={title} aria-label={title}>
                    <div className="mb-3 flex items-center gap-3">
                      <h3 className="font-semibold text-[#1C2333]">{title}</h3>
                      <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-[#c75d00]">{groupedRequests.length}</span>
                    </div>
                    {groupedRequests.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-gray-200 bg-white p-4 text-sm text-gray-500">No {title.toLowerCase()}.</p>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {groupedRequests.map((request) => <RequestPendingCard key={getRequestId(request)} request={request} />)}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default TecnicianDashboard;
