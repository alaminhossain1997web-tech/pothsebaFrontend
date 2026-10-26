import { useCallback, useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import LocationPicker from "../components/LocationPicker";
import PrimaryButton from "../components/ui/button/PrimaryButton";
import { useCreateRequestMutation, useLazyFindTechnicianQuery } from "../services/Api";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
const DEFAULT_CENTER = [90.4125, 23.8103];
const isValidCoordinates = (coords) => Array.isArray(coords) && coords.length === 2 &&
  Number.isFinite(Number(coords[0])) && Number.isFinite(Number(coords[1])) &&
  Number(coords[0]) >= -180 && Number(coords[0]) <= 180 &&
  Number(coords[1]) >= -90 && Number(coords[1]) <= 90;
const getTechnicianId = (tech) => tech?._id || tech?.id || null;
const getCoordinates = (tech) => tech?.location?.coordinates || tech?.coordinates || null;
const getShopName = (tech) => tech?.shopname || tech?.shopName || tech?.name || "Technician";
const getServicesText = (tech) => {
  const services = tech?.services;
  if (!Array.isArray(services) || !services.length) return "Vehicle repair and roadside assistance";
  return services.map((service) => typeof service === "string" ? service : service?.name || service?.serviceName || service?.title || "Vehicle service").join(", ");
};
const getDistanceText = (tech, userCoordinates) => {
  const reported = tech?.distanceKm ?? tech?.distance;
  if (reported !== undefined && Number.isFinite(Number(reported))) return `${Number(reported).toFixed(1)} km away`;
  const coordinates = getCoordinates(tech);
  if (!isValidCoordinates(coordinates) || !isValidCoordinates(userCoordinates)) return "Distance unavailable";
  const radians = (degrees) => degrees * Math.PI / 180;
  const [lon1, lat1] = userCoordinates.map(Number);
  const [lon2, lat2] = coordinates.map(Number);
  const dLat = radians(lat2 - lat1);
  const dLon = radians(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(dLon / 2) ** 2;
  return `${(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1)} km away`;
};

export default function FindTechnician() {
  const navigate = useNavigate();
  const submittingRef = useRef(false);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const technicianMarkersRef = useRef([]);
  const [location, setLocation] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [description, setDescription] = useState("My vehicle engine is having a problem. I need assistance.");
  const [findTechnician, { isFetching: isFinding }] = useLazyFindTechnicianQuery();
  const [createRequest, { isLoading: isCreatingRequest }] = useCreateRequestMutation();

  useEffect(() => {
    if (!MAPBOX_TOKEN || !mapContainerRef.current || mapRef.current) return undefined;
    mapboxgl.accessToken = MAPBOX_TOKEN;
    const map = new mapboxgl.Map({ container: mapContainerRef.current, style: "mapbox://styles/mapbox/streets-v12", center: DEFAULT_CENTER, zoom: 12 });
    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    mapRef.current = map;
    return () => {
      userMarkerRef.current?.remove();
      technicianMarkersRef.current.forEach((marker) => marker.remove());
      technicianMarkersRef.current = [];
      map.remove();
      mapRef.current = null;
      userMarkerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const coordinates = location?.coordinates;
    if (!map || !isValidCoordinates(coordinates)) return;
    map.flyTo({ center: coordinates, zoom: 14, essential: true });
    if (userMarkerRef.current) userMarkerRef.current.setLngLat(coordinates);
    else {
      const element = document.createElement("div");
      Object.assign(element.style, { width: "18px", height: "18px", borderRadius: "50%", backgroundColor: "#ff7f11", border: "3px solid white", boxShadow: "0 0 0 4px rgba(255,127,17,0.25)" });
      userMarkerRef.current = new mapboxgl.Marker({ element }).setLngLat(coordinates).setPopup(new mapboxgl.Popup({ offset: 20 }).setText("Your location")).addTo(map);
    }
  }, [location]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    technicianMarkersRef.current.forEach((marker) => marker.remove());
    technicianMarkersRef.current = [];
    technicians.forEach((technician) => {
      const coordinates = getCoordinates(technician);
      if (!isValidCoordinates(coordinates)) return;
      const markerElement = document.createElement("button");
      markerElement.type = "button";
      markerElement.textContent = "🔧";
      markerElement.title = `Select ${getShopName(technician)}`;
      markerElement.setAttribute("aria-label", `Select ${getShopName(technician)}`);
      Object.assign(markerElement.style, { width: "38px", height: "38px", borderRadius: "50%", backgroundColor: "#1C2333", border: "2px solid white", cursor: "pointer", fontSize: "19px" });
      markerElement.addEventListener("click", () => {
        setSelectedTechnician(technician);
        setIsRequestModalOpen(true);
        map.flyTo({ center: coordinates, zoom: 15, essential: true });
      });
      technicianMarkersRef.current.push(new mapboxgl.Marker({ element: markerElement }).setLngLat(coordinates).setPopup(new mapboxgl.Popup({ offset: 20 }).setText(getShopName(technician))).addTo(map));
    });
  }, [technicians]);

  const handleLocationSelect = useCallback((selectedLocation) => {
    if (!isValidCoordinates(selectedLocation?.coordinates)) return toast.error("Please select a valid location.");
    setLocation(selectedLocation);
    setTechnicians([]);
    setSelectedTechnician(null);
    setIsRequestModalOpen(false);
  }, []);

  const handleFindTechnician = useCallback(async () => {
    if (!isValidCoordinates(location?.coordinates)) return toast.error("Please select your location first.");
    const [longitude, latitude] = location.coordinates;
    try {
      const response = await findTechnician({ longitude, latitude }).unwrap();
      const result = response?.data?.technicians ?? response?.technicians ?? (Array.isArray(response?.data) ? response.data : []);
      const nearby = Array.isArray(result) ? result : [];
      setTechnicians(nearby);
      setSelectedTechnician(null);
      setIsRequestModalOpen(false);
      if (!nearby.length) toast.error("No technicians found near your location.");
      else toast.success(`${nearby.length} technician(s) found.`);
    } catch (error) {
      const messages = { 401: "Please sign in again to find a technician.", 403: "You are not allowed to find technicians with this account.", 404: "The technician search service is unavailable." };
      toast.error(error?.data?.message || messages[error?.status] || error?.error || "Failed to find technicians.");
    }
  }, [location, findTechnician]);

  const handleRequestTechnician = useCallback(async () => {
    if (submittingRef.current) return;
    if (!selectedTechnician) return toast.error("Please select a technician first.");
    if (!isValidCoordinates(location?.coordinates)) return toast.error("Please select your location first.");
    const technicianId = getTechnicianId(selectedTechnician);
    const service = Array.isArray(selectedTechnician?.services) ? selectedTechnician.services[0] : null;
    const serviceId = typeof service === "string" ? service : service?._id || service?.id;
    if (!technicianId) return toast.error("Technician ID is missing.");
    if (!serviceId) return toast.error("No valid service ID found for this technician.");
    const requestData = { technicianId, serviceId, location: { type: "Point", coordinates: location.coordinates }, description: description.trim() };
    if (!requestData.description) return toast.error("Please enter a description of your problem.");
    submittingRef.current = true;
    try {
      const response = await createRequest(requestData).unwrap();
      if (response?.success === false || !response?.data?.request) throw new Error(response?.message || "The server did not confirm the request.");
      toast.success(response?.message || "Technician request sent successfully!");
      setIsRequestModalOpen(false);
      navigate("/my-requests");
    } catch (error) {
      const messages = { 401: "Your session expired. Please sign in again.", 403: "You are not allowed to create this request.", 404: "The request service or selected technician could not be found.", 409: "This request conflicts with the current service state. Refresh and try again." };
      toast.error(error?.data?.message || error?.message || messages[error?.status] || error?.error || "Failed to send technician request.");
    } finally {
      submittingRef.current = false;
    }
  }, [selectedTechnician, location, description, createRequest, navigate]);

  return (
    <main className="min-h-screen bg-[#f4f3ef] px-4 py-7 text-[#1C2333] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ff7f11]">PothSeba roadside assistance</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Find a Technician</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600 sm:text-base">Share your location to see nearby help, compare technicians, and request service.</p>
        </header>

        <section className="grid gap-5 lg:grid-cols-[minmax(280px,0.72fr)_minmax(0,1.6fr)]">
          <div className="flex flex-col rounded-3xl border border-white/70 bg-white/85 p-5 shadow-lg shadow-slate-900/5 backdrop-blur-xl sm:p-6">
            <div><p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Step 1</p><h2 className="mt-1 text-xl font-bold">Your location</h2><p className="mt-1 text-sm text-gray-500">Allow location access so we can find nearby technicians.</p></div>
            <div className="mt-5"><LocationPicker onLocationSelect={handleLocationSelect} /></div>
            <div className="mt-4 min-h-24 rounded-2xl border border-slate-100 bg-slate-50/80 p-4" aria-live="polite">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Live location status</p>
              {location?.coordinates ? <><p className="mt-2 text-sm font-semibold text-emerald-700">Location ready</p>{location.address && <p className="mt-1 text-sm text-gray-600">{location.address}</p>}<p className="mt-2 break-all font-mono text-xs text-gray-500">{location.coordinates[0]}, {location.coordinates[1]}</p></> : <p className="mt-2 text-sm text-gray-500">Waiting for your location.</p>}
            </div>
            <div className="mt-auto pt-5"><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Step 2</p><PrimaryButton onClick={handleFindTechnician} disabled={!location?.coordinates || isFinding}>{isFinding ? "Finding nearby technicians..." : "Find technician"}</PrimaryButton>{!location?.coordinates && <p className="mt-2 text-center text-xs text-gray-500">Set your location to start searching.</p>}</div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/85 shadow-lg shadow-slate-900/5 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5"><div><p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Explore nearby</p><h2 className="mt-1 text-lg font-bold">Technician map</h2></div><span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-[#d96500]">{technicians.length} found</span></div>
            {!MAPBOX_TOKEN ? <div className="flex min-h-[360px] items-center justify-center p-6 text-center text-sm text-red-600">Map configuration is missing. Check VITE_MAPBOX_ACCESS_TOKEN.</div> : <div ref={mapContainerRef} className="h-[360px] w-full sm:h-[460px] lg:h-full lg:min-h-[520px]" />}
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-[#ff7f11]">Nearby options</p><h2 className="mt-1 text-2xl font-bold">Technicians near you</h2></div><p className="text-sm text-gray-500">{technicians.length} technician{technicians.length === 1 ? "" : "s"}</p></div>
          {isFinding ? <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-sm" role="status"><span className="mx-auto mb-3 block h-7 w-7 animate-spin rounded-full border-2 border-orange-200 border-t-[#ff7f11]"/><p className="font-medium text-gray-700">Finding technicians close to you...</p></div> : technicians.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center"><h3 className="font-semibold">No technicians to show yet</h3><p className="mt-2 text-sm text-gray-500">Allow location access, then choose Find technician.</p></div> : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {technicians.map((technician, index) => {
              const id = getTechnicianId(technician);
              const selected = id && getTechnicianId(selectedTechnician) === id;
              const coordinates = getCoordinates(technician);
              const techLocation = technician?.address || technician?.location?.address || (isValidCoordinates(coordinates) ? `${coordinates[1]}, ${coordinates[0]}` : "Location unavailable");
              const rating = technician?.rating ?? technician?.averageRating;
              return <article key={id || index} className={`rounded-2xl border bg-white p-5 shadow-sm transition ${selected ? "border-[#ff7f11] ring-2 ring-orange-100" : "border-slate-200 hover:border-orange-200"}`}>
                <div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-start gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1C2333] text-xl text-white">🔧</div><div className="min-w-0"><h3 className="truncate font-bold">{getShopName(technician)}</h3><p className="mt-1 line-clamp-2 text-sm text-gray-500">{getServicesText(technician)}</p></div></div><span className="shrink-0 rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">★ {rating ?? "Not rated"}</span></div>
                {technician?.phone && <p className="mt-3 text-sm text-gray-600">Phone: {technician.phone}</p>}
                <div className="mt-4 space-y-2 text-sm text-gray-500"><p><span className="font-semibold text-gray-700">Specialty:</span> {getServicesText(technician)}</p><p><span className="font-semibold text-gray-700">Distance:</span> {getDistanceText(technician, location?.coordinates)}</p><p className="truncate" title={techLocation}><span className="font-semibold text-gray-700">Location:</span> {techLocation}</p></div>
                <button type="button" onClick={() => { setSelectedTechnician(technician); setIsRequestModalOpen(true); if (mapRef.current && isValidCoordinates(coordinates)) mapRef.current.flyTo({ center: coordinates, zoom: 15, essential: true }); }} className="mt-5 w-full rounded-xl bg-[#ff7f11] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#e96f05] focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2">{selected ? "Selected · Request service" : "Select technician"}</button>
              </article>;
            })}
          </div>}
        </section>
      </div>

      {isRequestModalOpen && selectedTechnician && <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget && !isCreatingRequest) setIsRequestModalOpen(false); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="request-modal-title" className="my-auto w-full max-w-xl rounded-3xl border border-white/70 bg-white p-5 shadow-2xl sm:p-7">
          <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ff7f11]">Service request</p><h2 id="request-modal-title" className="mt-1 text-2xl font-bold text-[#1C2333]">Request a Technician</h2><p className="mt-2 text-sm leading-6 text-gray-600">Send a service request to your selected technician with a description of your problem.</p></div><button type="button" onClick={() => setIsRequestModalOpen(false)} disabled={isCreatingRequest} aria-label="Close request dialog" className="rounded-full p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50">✕</button></div>
          <div className="mt-5 rounded-2xl border border-orange-100 bg-orange-50/80 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-orange-700">Selected technician</p><p className="mt-1 font-bold text-[#1C2333]">{getShopName(selectedTechnician)}</p><p className="mt-1 text-sm text-gray-600">{getServicesText(selectedTechnician)}</p>{selectedTechnician?.phone && <p className="mt-1 text-sm text-gray-600">{selectedTechnician.phone}</p>}</div>
          <div className="mt-5"><label htmlFor="request-description" className="mb-2 block text-sm font-semibold text-[#1C2333]">Problem description</label><textarea id="request-description" value={description} onChange={(event) => setDescription(event.target.value)} rows={4} maxLength={1000} placeholder="Describe your vehicle problem in detail..." className="w-full resize-y rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#ff7f11] focus:ring-2 focus:ring-orange-100"/><p className="mt-1 text-right text-xs text-gray-400">{description.length}/1000</p></div>
          <p className="mt-3 text-xs text-gray-500">Your selected location will be included with your request.</p>
          <div className="mt-5"><PrimaryButton onClick={handleRequestTechnician} disabled={!location?.coordinates || isCreatingRequest}>{isCreatingRequest ? "Sending request..." : "Request a Technician"}</PrimaryButton></div>
        </section>
      </div>}
    </main>
  );
}
