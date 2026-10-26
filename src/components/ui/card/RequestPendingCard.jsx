import { useEffect, useRef, useState } from "react";
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

const placeNameCache = new Map();

const isValidCoordinates = (coordinates) =>
  Array.isArray(coordinates) && coordinates.length === 2 &&
  Number.isFinite(Number(coordinates[0])) && Number.isFinite(Number(coordinates[1])) &&
  Math.abs(Number(coordinates[0])) <= 180 && Math.abs(Number(coordinates[1])) <= 90;

const getPlaceName = async (coordinates) => {
  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  if (!token || !isValidCoordinates(coordinates)) return null;
  const [longitude, latitude] = coordinates.map(Number);
  const cacheKey = `${longitude},${latitude}`;
  if (placeNameCache.has(cacheKey)) return placeNameCache.get(cacheKey);
  const lookup = fetch(`https://api.mapbox.com/search/geocode/v6/reverse?longitude=${longitude}&latitude=${latitude}&access_token=${encodeURIComponent(token)}`)
    .then((response) => response.ok ? response.json() : null)
    .then((data) => {
      const feature = data?.features?.[0];
      const properties = feature?.properties;
      return properties?.full_address || properties?.place_formatted || properties?.name || feature?.text || null;
    })
    .catch(() => null);
  placeNameCache.set(cacheKey, lookup);
  return lookup;
};

const getApproximateDistance = (from, to) => {
  if (!isValidCoordinates(from) || !isValidCoordinates(to)) return null;
  const radians = (degrees) => degrees * Math.PI / 180;
  const [longitude1, latitude1] = from.map(Number);
  const [longitude2, latitude2] = to.map(Number);
  const latitudeDelta = radians(latitude2 - latitude1);
  const longitudeDelta = radians(longitude2 - longitude1);
  const a = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(radians(latitude1)) * Math.cos(radians(latitude2)) * Math.sin(longitudeDelta / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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

const RequestPendingCard = ({ request, technicianLocation, compact = false }) => {
  const customer = request?.rider || request?.user || request?.customer || {};
  const service = request?.service || {};
  const location = request?.location || {};
  const coordinates = location?.coordinates;
  const providedLocationName = location?.address || request?.address || "";
  const coordinateText = isValidCoordinates(coordinates) ? `${Number(coordinates[1]).toFixed(5)}, ${Number(coordinates[0]).toFixed(5)}` : "Location not provided";
  const [resolvedLocation, setResolvedLocation] = useState({ key: "", name: "" });
  const [updateRequestStatus, { isLoading }] = useUpdateRequestStatusMutation();
  const [pendingAction, setPendingAction] = useState(null);
  const submittingRef = useRef(false);
  const status = String(request?.status || "pending").toLowerCase();

  useEffect(() => {
    let isMounted = true;
    const coordinateKey = isValidCoordinates(coordinates) ? coordinates.map(Number).join(",") : "";
    if (!providedLocationName && coordinateKey) {
      getPlaceName(coordinates).then((placeName) => {
        if (isMounted && placeName) setResolvedLocation({ key: coordinateKey, name: placeName });
      });
    }
    return () => { isMounted = false; };
  }, [providedLocationName, coordinateText, coordinates]);

  const distanceKm = getApproximateDistance(technicianLocation, coordinates);
  const coordinateKey = isValidCoordinates(coordinates) ? coordinates.map(Number).join(",") : "";
  const locationName = providedLocationName || (resolvedLocation.key === coordinateKey ? resolvedLocation.name : "") || coordinateText;

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
    <article className={`w-full rounded-2xl border border-orange-200 bg-white shadow-sm ${compact ? "p-3" : "p-4 sm:p-5"}`}>
      <div className="flex items-start gap-4">
        {!compact && <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600 sm:h-16 sm:w-16">
          <FaCarCrash className="text-2xl sm:text-3xl" />
        </div>}
        <div className="min-w-0 flex-1">
          <h3 className="break-words text-base font-bold text-[#1C2333] sm:text-lg">
            {service?.name || service?.serviceName || request?.serviceName || "Service request"}
          </h3>
          <p className="mt-1 text-sm text-gray-600">{request?.description || "No problem description provided."}</p>
          <p className="mt-2 text-sm text-gray-500">Rider: {customer?.name || customer?.fullName || customer?.email || "Rider"}</p>
          {(customer?.phone || customer?.phoneNumber) && <p className="mt-1 text-sm text-gray-500">Phone: {customer.phone || customer.phoneNumber}</p>}
          <div className="mt-2 flex items-start gap-1.5 text-sm text-gray-500">
            <SlLocationPin className="mt-0.5 shrink-0 text-lg text-[#F97316]" />
            <span className="break-words"><span className="font-medium text-gray-700">{locationName}</span>{isValidCoordinates(coordinates) && <span className="mt-0.5 block text-xs text-gray-400">{coordinateText}</span>}</span>
          </div>
          <p className="ml-6 mt-1 text-xs text-gray-500">{distanceKm === null ? "Distance unavailable · shop location not found" : `Approx. ${distanceKm.toFixed(1)} km from your shop`}</p>
          <p className="mt-2 text-xs text-gray-500">Created: {createdAt}</p>
          {!compact && <p className="mt-2 text-sm font-semibold text-[#1C2333]">Status: {labels[status] || status}</p>}
        </div>
      </div>
      {availableActions.length > 0 && (
        <div className={`${compact ? "mt-3" : "mt-5"} flex flex-wrap gap-3`}>
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
