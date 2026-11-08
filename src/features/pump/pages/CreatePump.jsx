import { useState } from "react";
import { Link, useNavigate } from "react-router";
import toast from "react-hot-toast";
import { useCreatePumpMutation } from "../../../services/Api";
import { Button, FacilityChecks, Field, FuelRows, LocationMap, Panel } from "../PumpShared";
import { ensureApiSuccess, getErrorMessage, hasValidFuelRows } from "../pumpUtils";
import { usePumpAuthError } from "../usePumpAuthError";

const CreatePump = () => {
  const navigate = useNavigate(); const [createPump, { isLoading }] = useCreatePumpMutation();
  const [form, setForm] = useState({ name: "", phone: "", address: "", lat: "", lng: "", email: "", description: "" });
  const [fuels, setFuels] = useState([{ type: "", price: "", available: true }]); const [facilities, setFacilities] = useState([]); const [error, setError] = useState(""); const [apiError, setApiError] = useState(null);
  usePumpAuthError(apiError);
  const change = (e) => setForm((current) => ({ ...current, [e.target.name]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault(); setError(""); setApiError(null);
    if (!hasValidFuelRows(fuels)) { setError("Choose a unique fuel type for each row and enter a non-negative numeric price."); return; }
    if (!Number.isFinite(Number(form.lat)) || !Number.isFinite(Number(form.lng)) || form.lat === "" || form.lng === "") { setError("Enter valid latitude and longitude coordinates."); return; }
    const payload = { ...form, lat: Number(form.lat), lng: Number(form.lng), fuels: fuels.map((fuel) => ({ type: fuel.type, price: Number(fuel.price), available: Boolean(fuel.available) })), facilities };
    for (const optional of ["email", "description"]) if (!payload[optional]) delete payload[optional];
    try { ensureApiSuccess(await createPump(payload).unwrap()); toast.success("Pump submitted. It is pending admin approval and will remain closed until approved."); navigate("/pump/pumps"); }
    catch (e) { const message = getErrorMessage(e); setError(message); setApiError(e); toast.error(message); }
  };
  return <div className="space-y-6"><div><Link to="/pump/pumps" className="text-sm font-semibold text-[#c75d00]">← My pumps</Link><p className="mt-4 text-sm font-semibold uppercase tracking-wider text-[#c75d00]">Registration</p><h1 className="mt-1 text-2xl font-bold sm:text-3xl">Add a new pump</h1><p className="mt-1 text-sm text-gray-500">Submit your station information for admin review.</p></div>
    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
    <form onSubmit={submit} className="space-y-5"><Panel title="Pump information" subtitle="Use the station’s official contact and address details."><div className="grid gap-4 sm:grid-cols-2"><Field label="Pump Name *" name="name" value={form.name} onChange={change} required maxLength={120} placeholder="Example Filling Station" /><Field label="Phone Number *" name="phone" type="tel" value={form.phone} onChange={change} required placeholder="01700000000" /><Field label="Address *" name="address" value={form.address} onChange={change} required className="sm:col-span-2" placeholder="Road 1, Dhaka" /><Field label="Email" name="email" type="email" value={form.email} onChange={change} placeholder="pump@example.com" /><label className="block text-sm font-medium">Description<textarea name="description" value={form.description} onChange={change} rows={3} maxLength={1000} className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2.5 outline-none focus:border-[#ff7f11]" placeholder="Optional information about your station" /></label></div></Panel>
      <Panel title="Pump location" subtitle="Choose a map point, use GPS, or enter coordinates directly."><LocationMap lat={form.lat} lng={form.lng} onChange={({ lat, lng }) => setForm((current) => ({ ...current, lat, lng }))} /><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Latitude *" name="lat" type="number" step="any" value={form.lat} onChange={change} required placeholder="23.7806" /><Field label="Longitude *" name="lng" type="number" step="any" value={form.lng} onChange={change} required placeholder="90.407" /></div><p className="mt-2 text-xs text-gray-500">Selected coordinates: {form.lat || "—"}, {form.lng || "—"}</p></Panel>
      <Panel title="Fuel information" subtitle="Add every fuel type available at this station."><FuelRows fuels={fuels} setFuels={setFuels} /></Panel>
      <Panel title="Facilities" subtitle="Select the facilities available to customers."><FacilityChecks value={facilities} onChange={setFacilities} /></Panel>
      <div className="flex flex-wrap justify-end gap-2"><Button type="button" kind="secondary" onClick={() => navigate("/pump/pumps")}>Cancel</Button><Button type="submit" disabled={isLoading}>{isLoading ? "Submitting..." : "Submit for approval"}</Button></div>
    </form></div>;
};
export default CreatePump;
