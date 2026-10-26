import { useRef, useState } from "react";
import { FaCarCrash } from "react-icons/fa";
import { SlLocationPin } from "react-icons/sl";
import toast from "react-hot-toast";
import { useUpdateRequestStatusMutation } from "../../../services/Api";

const actions = {
  pending: [ ["accepted", "Accept"], ["rejected", "Reject"] ],
  accepted: [["on_the_way", "Start Travel"]],
  on_the_way: [["in_progress", "Start Work"]],
  in_progress: [["completed", "Complete Work"]],
};

const labels = {
  pending: "Pending", accepted: "Accepted", rejected: "Rejected",
  on_the_way: "On the way", in_progress: "In progress",
  completed: "Completed", cancelled: "Cancelled",
};

const errorMessage = (error) => {
  const messages = {
    401: "Your session expired. Please sign in again.",
    403: "You are not allowed to update this request.",
    404: "This request could not be found.",
    409: "The request changed or this transition is no longer allowed. Refresh and try again.",
  };
  return error?.data?.message || error?.data?.error || messages[error?.status] || error?.error || "Could not update the request. Please try again.";
};

const RequestPendingCard = ({ request }) => {
  const customer = request?.rider || request?.user || request?.customer || {};
  const service = request?.service || {};
  const location = request?.location || {};
  const coordinates = location?.coordinates;
  const locationText = location?.address || request?.address ||
    (Array.isArray(coordinates) ? `${coordinates[1]}, ${coordinates[0]}` : "Location not provided");
  const [updateRequestStatus, { isLoading }] = useUpdateRequestStatusMutation();
  const [pendingAction, setPendingAction] = useState(null);
  const submittingRef = useRef(false);
  const status = String(request?.status || "pending").toLowerCase();

  const handleStatusChange = async (nextStatus) => {
    if (submittingRef.current) return;
    if (!request?._id && !request?.id && !request?.requestId) {
      toast.error("This request is missing its request ID.");
      return;
    }
    submittingRef.current = true;
    setPendingAction(nextStatus);
    try {
      const response = await updateRequestStatus({
        requestId: request._id || request.id || request.requestId,
        status: nextStatus,
      }).unwrap();
      if (response?.success === false) throw new Error(response?.message || "Request update failed.");
      toast.success(`Request ${labels[nextStatus].toLowerCase()}.`);
    } catch (error) {
      toast.error(error?.message && !error?.status ? error.message : errorMessage(error));
    } finally {
      submittingRef.current = false;
      setPendingAction(null);
    }
  };

  const availableActions = actions[status] || [];
  const createdAt = request?.createdAt ? new Date(request.createdAt).toLocaleString() : "Time unavailable";

  return (
    <article className="w-full rounded-2xl border border-orange-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600 sm:h-16 sm:w-16">
          <FaCarCrash className="text-2xl sm:text-3xl" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="break-words text-base font-bold text-[#1C2333] sm:text-lg">
            {service?.name || service?.serviceName || request?.serviceName || "Service request"}
          </h3>
          <p className="mt-1 text-sm text-gray-600">{request?.description || "No problem description provided."}</p>
          <p className="mt-2 text-sm text-gray-500">Rider: {customer?.name || customer?.fullName || customer?.email || "Rider"}</p>
          {(customer?.phone || customer?.phoneNumber) && <p className="mt-1 text-sm text-gray-500">Phone: {customer.phone || customer.phoneNumber}</p>}
          <div className="mt-2 flex items-start gap-1.5 text-sm text-gray-500">
            <SlLocationPin className="mt-0.5 shrink-0 text-lg text-[#F97316]" />
            <span className="break-words">{locationText}</span>
          </div>
          <p className="mt-2 text-xs text-gray-500">Created: {createdAt}</p>
          <p className="mt-2 text-sm font-semibold text-[#1C2333]">Status: {labels[status] || status}</p>
        </div>
      </div>
      {availableActions.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-3">
          {availableActions.map(([nextStatus, label]) => {
            const destructive = nextStatus === "rejected";
            return <button key={nextStatus} type="button" aria-label={`${label} request`} onClick={() => handleStatusChange(nextStatus)} disabled={isLoading || !request?._id && !request?.id && !request?.requestId} className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 ${destructive ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700"}`}>
              {isLoading && pendingAction === nextStatus ? `${label}...` : label}
            </button>;
          })}
        </div>
      )}
    </article>
  );
};

export default RequestPendingCard;
