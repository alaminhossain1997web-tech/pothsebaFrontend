import { useRef, useState } from "react";
import { FaCarCrash } from "react-icons/fa";
import { SlLocationPin } from "react-icons/sl";
import toast from "react-hot-toast";
import { useUpdateRequestStatusMutation } from "../../../services/Api";

const RequestPendingCard = ({ request }) => {
  const customer = request?.rider || request?.user || request?.customer || {};
  const service = request?.service || {};
  const location = request?.location || {};
  const coordinates = location?.coordinates;
  const locationText =
    location?.address ||
    request?.address ||
    (Array.isArray(coordinates) ? `${coordinates[1]}, ${coordinates[0]}` : "Location not provided");
  const [statusOverride, setStatusOverride] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const submittingRef = useRef(false);
  const [updateRequestStatus, { isLoading }] = useUpdateRequestStatusMutation();
  const serverStatus = request?.status;
  const localOverride = statusOverride?.requestId === request?._id
    ? statusOverride.status
    : null;
  const status =
    serverStatus && serverStatus.toLowerCase() !== "pending"
      ? serverStatus
      : localOverride || serverStatus || "pending";

  const handleStatusChange = async (nextStatus) => {
    if (submittingRef.current) return;

    if (!request?._id) {
      toast.error("This request is missing its request ID.");
      return;
    }

    submittingRef.current = true;
    setPendingAction(nextStatus);
    try {
      const response = await updateRequestStatus({
        requestId: request._id,
        status: nextStatus,
      }).unwrap();

      if (response?.success === false) {
        throw new Error(response?.message || `Could not ${nextStatus} request.`);
      }

      const confirmedStatus =
        response?.data?.status || response?.status || nextStatus;
      setStatusOverride({ requestId: request._id, status: confirmedStatus });
      toast.success(confirmedStatus === "accepted" ? "Request accepted." : "Request rejected.");
    } catch (error) {
      const backendMessage =
        error?.data?.message ||
        error?.data?.error ||
        (typeof error?.data === "string" ? error.data : null) ||
        error?.error ||
        error?.message;
      const fallbackMessage = {
        400: "The request status was invalid. Please try again.",
        401: "Your session expired. Please sign in again.",
        403: "You are not allowed to update this request.",
        404: "The request or status route was not found. Check the backend deployment.",
        500: "The server could not update this request. Please try again later.",
      }[error?.status];
      toast.error(
        backendMessage || fallbackMessage ||
          `Could not ${nextStatus === "accepted" ? "accept" : "reject"} the request.`,
      );
    } finally {
      submittingRef.current = false;
      setPendingAction(null);
    }
  };

  const isPending = status?.toLowerCase() === "pending";

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
          <p className="mt-1 text-sm font-medium text-gray-600">
            {request?.description || "No problem description provided."}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Rider: {customer?.name || customer?.fullName || customer?.email || "Rider"}
          </p>
          <div className="mt-2 flex items-start gap-1.5 text-sm text-gray-500">
            <SlLocationPin className="mt-0.5 shrink-0 text-lg text-[#F97316]" />
            <span className="break-words">{locationText}</span>
          </div>
          <p className="mt-2 text-xs text-gray-500">Status: {status}</p>
        </div>
      </div>
      {isPending && (
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={() => handleStatusChange("rejected")}
            disabled={isLoading || !request?._id}
            className="w-full cursor-pointer rounded-xl bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading && pendingAction === "rejected" ? "Rejecting…" : "Reject"}
          </button>
          <button
            type="button"
            onClick={() => handleStatusChange("accepted")}
            disabled={isLoading || !request?._id}
            className="w-full cursor-pointer rounded-xl bg-green-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading && pendingAction === "accepted" ? "Accepting…" : "Accept"}
          </button>
        </div>
      )}
    </article>
  );
};

export default RequestPendingCard;
