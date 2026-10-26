import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useGetRiderRequestsQuery, useUpdateRequestStatusMutation } from "../services/Api";
import { connectSharedSocket, getSharedSocket } from "../services/socket";

const statuses = {
  pending: ["Waiting for Technician response", "bg-amber-50 text-amber-800"],
  accepted: ["Technician accepted the request", "bg-blue-50 text-blue-800"],
  on_the_way: ["Technician is on the way", "bg-indigo-50 text-indigo-800"],
  in_progress: ["Service work is in progress", "bg-violet-50 text-violet-800"],
  completed: ["Service completed", "bg-green-50 text-green-800"],
  rejected: ["Technician rejected the request", "bg-red-50 text-red-800"],
  cancelled: ["Request cancelled", "bg-gray-100 text-gray-700"],
};

const requestList = (data) => Array.isArray(data?.data?.requests) ? data.data.requests : Array.isArray(data?.requests) ? data.requests : [];
const requestId = (request) => request?._id || request?.id || request?.requestId;

const RiderRequests = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetRiderRequestsQuery(undefined, {
    pollingInterval: 30000,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const [updateRequestStatus, { isLoading: isUpdating }] = useUpdateRequestStatusMutation();
  const busyRef = useRef(false);
  const requests = requestList(data);

  useEffect(() => {
    const socket = getSharedSocket();
    const refresh = () => refetch();
    socket.on("request:updated", refresh);
    socket.on("connect", refresh);
    connectSharedSocket(socket);
    return () => {
      socket.off("request:updated", refresh);
      socket.off("connect", refresh);
    };
  }, [refetch]);

  const cancel = async (request) => {
    if (busyRef.current) return;
    const status = String(request?.status || "").toLowerCase();
    const id = requestId(request);
    if (!id || !["pending", "accepted"].includes(status)) return;
    busyRef.current = true;
    try {
      const response = await updateRequestStatus({ requestId: id, status: "cancelled" }).unwrap();
      if (response?.success === false) throw new Error(response?.message || "Cancellation failed.");
      toast.success("Request cancelled.");
    } catch (updateError) {
      const messages = { 401: "Your session expired. Please sign in again.", 403: "You are not allowed to cancel this request.", 404: "This request could not be found.", 409: "This request can no longer be cancelled. Refresh to see its latest status." };
      toast.error(updateError?.data?.message || messages[updateError?.status] || updateError?.error || "Could not cancel the request.");
    } finally {
      busyRef.current = false;
    }
  };

  return <main className="min-h-[calc(100vh-4rem)] bg-[#F7F6F2] px-4 py-8 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-sm font-semibold uppercase tracking-wider text-[#ff7f11]">Rider dashboard</p><h1 className="mt-1 text-2xl font-bold text-[#1C2333]">My Service Requests</h1><p className="mt-2 text-sm text-gray-600">Track your requests and their latest status.</p></div>
        <button type="button" onClick={() => refetch()} disabled={isFetching} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-[#1C2333] disabled:opacity-60" aria-label="Refresh requests">{isFetching ? "Refreshing..." : "Refresh"}</button>
      </div>
      {isLoading ? <div className="rounded-xl bg-white p-6 text-gray-600" role="status">Loading your requests...</div> : error && requests.length === 0 ? <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700"><p>{error?.data?.message || (error?.status === 401 ? "Please sign in to view your requests." : error?.status === 403 ? "You do not have access to these requests." : error?.error || "Could not load your requests.")}</p><button type="button" onClick={() => refetch()} className="mt-3 font-semibold underline">Try again</button></div> : requests.length === 0 ? <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center"><h2 className="font-semibold text-[#1C2333]">No service requests yet</h2><p className="mt-2 text-sm text-gray-500">Requests you create will appear here.</p></div> : <div className="grid gap-4 md:grid-cols-2">
        {requests.map((request) => {
          const status = String(request?.status || "pending").toLowerCase();
          const [message, style] = statuses[status] || [status, "bg-gray-100 text-gray-700"];
          const technician = request?.technician || {};
          const service = request?.service || {};
          const location = request?.location || {};
          const coordinates = location.coordinates;
          const locationText = location.address || request?.address || (Array.isArray(coordinates) ? `${coordinates[1]}, ${coordinates[0]}` : "Location not provided");
          return <article key={requestId(request)} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3"><h2 className="font-bold text-[#1C2333]">{service?.name || service?.serviceName || request?.serviceName || "Service request"}</h2><span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${style}`}>{status.replaceAll("_", " ")}</span></div>
            <p className="mt-3 text-sm font-medium text-[#1C2333]">{message}</p>
            <dl className="mt-4 space-y-2 text-sm text-gray-600">
              <div><dt className="inline font-semibold text-gray-700">Technician shop: </dt><dd className="inline">{technician?.shopname || technician?.shopName || technician?.name || request?.shopName || "Not provided"}</dd></div>
              {(technician?.phone || technician?.phoneNumber) && <div><dt className="inline font-semibold text-gray-700">Phone: </dt><dd className="inline">{technician.phone || technician.phoneNumber}</dd></div>}
              <div><dt className="inline font-semibold text-gray-700">Description: </dt><dd className="inline">{request?.description || "No description provided."}</dd></div>
              <div><dt className="inline font-semibold text-gray-700">Location: </dt><dd className="inline break-words">{locationText}</dd></div>
              <div><dt className="inline font-semibold text-gray-700">Created: </dt><dd className="inline">{request?.createdAt ? new Date(request.createdAt).toLocaleString() : "Time unavailable"}</dd></div>
            </dl>
            {["pending", "accepted"].includes(status) && <button type="button" aria-label="Cancel service request" onClick={() => cancel(request)} disabled={isUpdating || !requestId(request)} className="mt-5 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60">{isUpdating ? "Cancelling..." : "Cancel request"}</button>}
          </article>;
        })}
      </div>}
    </div>
  </main>;
};

export default RiderRequests;
