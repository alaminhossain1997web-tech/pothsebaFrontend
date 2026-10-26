import { useEffect, useMemo, useRef, useState } from "react";
import { FiUser } from "react-icons/fi";
import { IoMdNotificationsOutline } from "react-icons/io";
import { Link } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { Api, useGetTechnicianRequestsQuery } from "../../services/Api";
import RequestPendingCard from "../ui/card/RequestPendingCard";
import { connectSharedSocket, getSharedSocket } from "../../services/socket";

const getRequests = (response) => {
  const candidates = [response?.data?.requests, response?.requests, response?.data];
  return candidates.find(Array.isArray) || [];
};

const Navbar = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const technicianLocation = user?.technicianProfile?.location?.coordinates;
  const isTechnician = user?.role === "Technician" && Boolean(localStorage.getItem("accessToken"));
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { data, error, isLoading, isFetching, refetch } = useGetTechnicianRequestsQuery(undefined, {
    skip: !isTechnician,
    // Keep a slow recovery fallback until server event delivery is verified.
    pollingInterval: isTechnician ? 30000 : 0,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });

  const pendingRequests = useMemo(
    () => getRequests(data).filter((request) => String(request?.status || "pending").toLowerCase() === "pending"),
    [data],
  );

  useEffect(() => {
    if (!isTechnician) return undefined;
    const socket = getSharedSocket();
    let debounceTimer;
    let hasConnected = socket.connected;
    const recentEvents = new Set();
    const invalidateRequests = () => dispatch(Api.util.invalidateTags(["TechnicianRequests"]));
    const refreshRequests = (eventName) => (payload) => {
      // Ignore an exact duplicate event payload; the event schema is not needed
      // because the query response remains the source of truth.
      if (payload !== undefined) {
        let signature;
        try {
          signature = `${eventName}:${JSON.stringify(payload)}`;
        } catch {
          signature = null;
        }
        if (signature && recentEvents.has(signature)) return;
        if (signature) {
          recentEvents.add(signature);
          if (recentEvents.size > 100) recentEvents.delete(recentEvents.values().next().value);
        }
      }
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(invalidateRequests, 120);
    };
    const onReconnect = () => {
      const isReconnect = hasConnected;
      hasConnected = true;
      if (!isReconnect) return;
      clearTimeout(debounceTimer);
      invalidateRequests();
    };
    const onNewRequest = refreshRequests("request:new");
    const onRequestUpdated = refreshRequests("request:updated");
    socket.on("request:new", onNewRequest);
    socket.on("request:updated", onRequestUpdated);
    socket.on("connect", onReconnect);
    connectSharedSocket(socket);
    return () => {
      clearTimeout(debounceTimer);
      socket.off("request:new", onNewRequest);
      socket.off("request:updated", onRequestUpdated);
      socket.off("connect", onReconnect);
    };
  }, [dispatch, isTechnician]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!dropdownRef.current?.contains(event.target)) setIsOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        <Link to="/home" className="flex h-15 w-40 items-center justify-center" aria-label="PothSeba home">
          <img src="/sub_logo.png" alt="PothSeba" className="max-w-full" />
        </Link>

        <div className="flex items-center gap-2.5">
          {user && user.role !== "Technician" && <Link to="/my-requests" className="rounded-full border border-gray-200 px-3 py-2 text-sm font-medium text-[#1C2333] hover:border-[#ff7f11] hover:text-[#ff7f11]">My requests</Link>}

          {isTechnician && <div ref={dropdownRef} className="relative">
            <button type="button" onClick={() => setIsOpen((open) => !open)} aria-label={`Notifications${pendingRequests.length ? `, ${pendingRequests.length} pending requests` : ""}`} aria-expanded={isOpen} aria-controls="technician-request-notifications" className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-[#1C2333] transition hover:border-[#ff7f11] hover:bg-orange-50 hover:text-[#ff7f11] focus:outline-none focus:ring-2 focus:ring-orange-200">
              <IoMdNotificationsOutline className="text-2xl" />
              {pendingRequests.length > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white" aria-label={`${pendingRequests.length} pending requests`}>{pendingRequests.length > 9 ? "9+" : pendingRequests.length}</span>}
            </button>

            {isOpen && <section id="technician-request-notifications" aria-label="Pending technician requests" className="absolute right-0 top-full z-[60] mt-3 w-[min(92vw,24rem)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-slate-900/20">
              <header className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
                <div><h2 className="font-bold text-[#1C2333]">New requests</h2><p className="text-xs text-gray-500">{pendingRequests.length} pending</p></div>
                <button type="button" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh pending requests" className="rounded-lg px-2 py-1 text-xs font-semibold text-[#c75d00] hover:bg-orange-50 disabled:opacity-50">{isFetching ? "Refreshing..." : "Refresh"}</button>
              </header>

              <div className="max-h-[min(65vh,32rem)] space-y-3 overflow-y-auto bg-gray-50/70 p-3">
                {isLoading ? <div className="rounded-xl bg-white p-6 text-center text-sm text-gray-500" role="status">Loading pending requests...</div> : error && pendingRequests.length === 0 ? <div className="rounded-xl border border-red-100 bg-white p-4 text-sm text-red-700"><p>{error?.status === 401 ? "Your session expired. Please sign in again." : error?.status === 403 ? "You do not have access to technician requests." : error?.data?.message || error?.error || "Could not load pending requests."}</p><button type="button" onClick={() => refetch()} className="mt-2 font-semibold underline">Try again</button></div> : pendingRequests.length === 0 ? <div className="rounded-xl border border-dashed border-gray-200 bg-white p-6 text-center"><p className="font-semibold text-[#1C2333]">You’re all caught up</p><p className="mt-1 text-sm text-gray-500">New pending requests will appear here.</p></div> : pendingRequests.map((request, index) => <RequestPendingCard key={request?._id || request?.id || request?.requestId || index} request={request} technicianLocation={technicianLocation} compact />)}
              </div>

              <footer className="border-t border-gray-100 bg-white p-3">
                <Link to="/technician_dashboard" onClick={() => setIsOpen(false)} className="block rounded-xl bg-[#1C2333] px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-slate-700">View all requests</Link>
              </footer>
            </section>}
          </div>}

          <div className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-[#1C2333]">
            <FiUser className="text-xl" />
            {user ? <span className="max-w-36 truncate text-sm font-medium" title={user.name || user.email}>{user.name || user.email || "User"}</span> : <Link to="/login" className="text-sm font-medium hover:text-[#ff7f11]">Login</Link>}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
