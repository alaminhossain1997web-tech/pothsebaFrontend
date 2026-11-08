import { useEffect, useRef, useState } from "react";
import { FiMapPin, FiPlus, FiTrash2 } from "react-icons/fi";
import { FACILITIES, FUEL_TYPES } from "./pumpUtils";

export const Panel = ({ title, subtitle, action, children }) => <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6"><div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div>{title && <h2 className="text-lg font-bold">{title}</h2>}{subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}</div>{action}</div>{children}</section>;
export const Field = ({ label, ...props }) => <label className="block text-sm font-medium text-[#1C2333]">{label}<input {...props} className={`mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#ff7f11] focus:ring-2 focus:ring-orange-100 ${props.className || ""}`} /></label>;
export const StatusBadge = ({ children, tone }) => { const value = String(children || "unknown").toLowerCase(); const color = tone || (value === "approved" || value === "active" || value === "open" ? "bg-green-50 text-green-700" : value === "rejected" || value === "inactive" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"); return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${color}`}>{children || "Unknown"}</span>; };
export const EmptyState = ({ title, message, action }) => <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center"><div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-[#ff7f11]"><FiMapPin size={22} /></div><h3 className="font-bold">{title}</h3><p className="mx-auto mt-1 max-w-md text-sm text-gray-500">{message}</p>{action && <div className="mt-4">{action}</div>}</div>;
export const ConfirmDialog = ({ title, message, confirmLabel = "Confirm", busy = false, onConfirm, onClose }) => <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 p-4" role="presentation"><section role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><h2 id="confirm-title" className="text-lg font-bold">{title}</h2><p className="mt-2 text-sm leading-6 text-gray-600">{message}</p><div className="mt-6 flex justify-end gap-2"><Button kind="secondary" onClick={onClose} disabled={busy}>Cancel</Button><Button onClick={onConfirm} disabled={busy}>{busy ? "Saving..." : confirmLabel}</Button></div></section></div>;
export const Button = ({ children, kind = "primary", ...props }) => <button {...props} className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${kind === "primary" ? "bg-[#ff7f11] text-white hover:bg-[#e96f05]" : kind === "danger" ? "bg-red-600 text-white hover:bg-red-700" : "border border-gray-300 bg-white text-[#1C2333] hover:bg-gray-50"} ${props.className || ""}`}>{children}</button>;
export const FuelRows = ({ fuels, setFuels }) => {
  const update = (i, key, value) => setFuels((rows) => rows.map((row, index) => index === i ? { ...row, [key]: value } : row));
  return <div className="space-y-3">{fuels.map((fuel, i) => <div key={`${i}-${fuel.type}`} className="grid gap-3 rounded-xl border border-gray-200 p-3 sm:grid-cols-[1.1fr_1fr_auto_auto] sm:items-end">
    <label className="text-sm font-medium">Fuel type<select value={fuel.type} onChange={(e) => update(i, "type", e.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5"><option value="">Select type</option>{FUEL_TYPES.map((type) => <option key={type}>{type}</option>)}</select></label>
    <Field label="Price" type="number" min="0" step="any" value={fuel.price} onChange={(e) => update(i, "price", e.target.value)} required />
    <label className="flex items-center gap-2 py-2.5 text-sm"><input type="checkbox" checked={Boolean(fuel.available)} onChange={(e) => update(i, "available", e.target.checked)} className="accent-[#ff7f11]" />Available</label>
    <button type="button" aria-label="Remove fuel" disabled={fuels.length === 1} onClick={() => setFuels((rows) => rows.filter((_, index) => index !== i))} className="flex items-center justify-center rounded-lg p-2.5 text-red-600 hover:bg-red-50 disabled:opacity-40"><FiTrash2 /></button>
  </div>)}<button type="button" onClick={() => setFuels((rows) => [...rows, { type: "", price: "", available: true }])} className="inline-flex items-center gap-2 text-sm font-semibold text-[#c75d00]"><FiPlus />Add fuel type</button></div>;
};
export const FacilityChecks = ({ value = [], onChange }) => <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{FACILITIES.map((facility) => <label key={facility} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm"><input type="checkbox" checked={value.includes(facility)} onChange={(e) => onChange(e.target.checked ? [...value, facility] : value.filter((item) => item !== facility))} className="accent-[#ff7f11]" />{facility}</label>)}</div>;
export const LocationMap = ({ lat, lng, onChange }) => {
  const mapNode = useRef(null); const map = useRef(null); const marker = useRef(null); const [mapError, setMapError] = useState("");
  useEffect(() => {
    let cancelled = false;
    let instance;
    const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    if (!mapNode.current || !token) { setMapError("Map preview unavailable. Enter coordinates below or configure the Mapbox token."); return undefined; }
    const initialize = async () => {
      try {
        const { default: mapboxgl } = await import("mapbox-gl");
        if (cancelled) return;
        mapboxgl.accessToken = token;
        const center = Number.isFinite(Number(lng)) && Number.isFinite(Number(lat)) && lat !== "" && lng !== "" ? [Number(lng), Number(lat)] : [90.4125, 23.8103];
        instance = new mapboxgl.Map({ container: mapNode.current, style: "mapbox://styles/mapbox/streets-v12", center, zoom: lat && lng ? 13 : 9 });
        map.current = instance; instance.addControl(new mapboxgl.NavigationControl(), "top-right");
        marker.current = new mapboxgl.Marker({ color: "#ff7f11", draggable: true }).setLngLat(center).addTo(instance);
        const emit = (point) => onChange({ lat: Number(point.lat.toFixed(6)), lng: Number(point.lng.toFixed(6)) });
        instance.on("click", (event) => { marker.current.setLngLat(event.lngLat); emit(event.lngLat); });
        marker.current.on("dragend", () => emit(marker.current.getLngLat()));
      } catch {
        if (!cancelled) setMapError("The location map could not be loaded. Enter coordinates manually or use GPS.");
      }
    };
    void initialize();
    return () => { cancelled = true; instance?.remove(); map.current = null; };
  // The map is initialized once; subsequent marker/center sync is handled separately.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { if (lat !== "" && lng !== "" && marker.current) marker.current.setLngLat([Number(lng), Number(lat)]); }, [lat, lng]);
  const gps = () => { if (!navigator.geolocation) { setMapError("Location services are not supported in this browser."); return; } navigator.geolocation.getCurrentPosition(({ coords }) => onChange({ lat: Number(coords.latitude.toFixed(6)), lng: Number(coords.longitude.toFixed(6)) }), () => setMapError("Could not access your current location. Check browser permissions.")); };
  return <div><div className="mb-2 flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-medium">Select location on map</p><Button kind="secondary" type="button" onClick={gps}>Use my location</Button></div><div ref={mapNode} className="h-56 overflow-hidden rounded-xl border border-gray-200 bg-gray-100" />{mapError && <p className="mt-2 text-xs text-amber-700">{mapError}</p>}<p className="mt-2 text-xs text-gray-500">Click or drag the marker to choose a location.</p></div>;
};
