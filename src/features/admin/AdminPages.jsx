import { useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import toast from "react-hot-toast";
import { FiArrowRight, FiCheck, FiDroplet, FiMapPin, FiPlus, FiSearch, FiUsers, FiX } from "react-icons/fi";
import {
  useApproveAdminPumpMutation, useApprovePendingTechnicianMutation, useCreateAdminAreaMutation,
  useCreateAdminServiceMutation, useDeleteAdminAreaMutation, useGetAdminAreasQuery,
  useGetAdminAreaHierarchyQuery, useGetAdminPumpQuery, useGetAdminPumpsQuery,
  useGetAdminRoleHistoryQuery, useGetAdminZoneWardsQuery,
  useServicesQuery, useLazySearchAdminUserQuery, useRejectAdminPumpMutation,
  useRejectPendingTechnicianMutation, useUpdateAdminAreaMutation,
  useUpdateAdminAreaStatusMutation, useUpdateAdminUserRoleMutation,
} from "../../services/Api";

const listFrom = (value) => {
  const options = [value?.data?.pumps, value?.data?.areas, value?.data?.services, value?.data?.users, value?.data?.items, value?.data?.results, value?.data?.hierarchy, value?.data?.zones, value?.data?.history, value?.history, value?.pumps, value?.areas, value?.services, value?.items, value?.results, value?.data];
  return options.find(Array.isArray) || [];
};
const idOf = (item) => String(item?._id || item?.id || item?.userId || item?.pumpId || item?.areaId || item?.technicianId || "");
const statusOf = (item) => String(item?.approvalStatus || item?.status || "unknown").toLowerCase();
const messageOf = (error) => error?.data?.message || error?.error || error?.message || "Request failed. Please try again.";
const titleCase = (value) => String(value || "Unknown").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const assertApiSuccess = (response) => { if (response?.success === false) throw new Error(response.message || "The server could not complete this request."); return response; };
const booleanStatus = (value, truthy, falsy) => value == null ? "unknown" : value ? truthy : falsy;

export const PageHeader = ({ eyebrow = "PothSeba administration", title, description, action }) => <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#c75d00]">{eyebrow}</p><h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1><p className="mt-1 max-w-2xl text-sm text-gray-500">{description}</p></div>{action}</div>;

const Card = ({ children, className = "" }) => <section className={`rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6 ${className}`}>{children}</section>;
const Notice = ({ children, tone = "amber" }) => <div className={`rounded-xl border p-4 text-sm ${tone === "red" ? "border-red-200 bg-red-50 text-red-800" : tone === "green" ? "border-green-200 bg-green-50 text-green-800" : "border-amber-200 bg-amber-50 text-amber-900"}`}>{children}</div>;
const Status = ({ value }) => { const status = String(value || "unknown").toLowerCase(); const color = ["approved", "active", "open"].includes(status) ? "bg-emerald-50 text-emerald-700" : ["rejected", "inactive", "closed"].includes(status) ? "bg-rose-50 text-rose-700" : status === "unknown" ? "bg-gray-100 text-gray-600" : "bg-amber-50 text-amber-700"; return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${color}`}>{titleCase(value)}</span>; };
const LoadingRows = () => <div className="space-y-3">{[1, 2, 3, 4].map((n) => <div key={n} className="h-14 animate-pulse rounded-xl bg-gray-100" />)}</div>;
const Empty = ({ children = "No records found." }) => <div className="rounded-xl border border-dashed border-gray-300 px-5 py-12 text-center text-sm text-gray-500">{children}</div>;
const Confirm = ({ title, description, busy, onCancel, onConfirm, confirmLabel = "Confirm", danger = false, children, confirmDisabled = false }) => <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/40 p-4"><div role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><h2 className="text-lg font-bold">{title}</h2><p className="mt-2 text-sm leading-6 text-gray-600">{description}</p>{children}<div className="mt-6 flex justify-end gap-2"><button onClick={onCancel} disabled={busy} className="rounded-xl border px-4 py-2 text-sm font-semibold">Cancel</button><button onClick={onConfirm} disabled={busy || confirmDisabled} className={`rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${danger ? "bg-rose-600" : "bg-[#ff7f11]"}`}>{busy ? "Working..." : confirmLabel}</button></div></div></div>;

const StatCard = ({ label, value, icon: Icon, detail }) => <Card><div className="flex items-start justify-between"><div><p className="text-sm text-gray-500">{label}</p><p className="mt-3 text-3xl font-bold">{value ?? "—"}</p>{detail && <p className="mt-1 text-xs text-gray-400">{detail}</p>}</div><span className="rounded-xl bg-orange-50 p-3 text-[#c75d00]"><Icon size={20} /></span></div></Card>;

export const AdminOverview = () => {
  const pumpsQuery = useGetAdminPumpsQuery({ page: 1, limit: 5 }); const areasQuery = useGetAdminAreasQuery({ page: 1, limit: 1 }); const servicesQuery = useServicesQuery();
  const pumps = listFrom(pumpsQuery.data); const services = listFrom(servicesQuery.data);
  const pumpTotal = pumpsQuery.data?.data?.pagination?.total;
  const areaTotal = areasQuery.data?.total;
  return <div><PageHeader title="Dashboard Overview" description="A quick view of PothSeba operations and the management areas that need attention." />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Total Users" value="Unavailable" icon={FiUsers} detail="User list API unavailable" /><StatCard label="Total Technicians" value="Unavailable" icon={FiUsers} detail="Technician list API unavailable" /><StatCard label="Pending Technicians" value="Unavailable" icon={FiUsers} detail="Technician list API unavailable" /><StatCard label="Total Pumps" value={pumpsQuery.isLoading ? "…" : pumpsQuery.isError ? "—" : pumpTotal ?? "Unavailable"} icon={FiDroplet} /><StatCard label="Pending Pumps" value={pumpsQuery.isLoading ? "…" : pumpsQuery.isError ? "—" : "Unavailable"} icon={FiDroplet} /><StatCard label="Approved Pumps" value={pumpsQuery.isLoading ? "…" : pumpsQuery.isError ? "—" : "Unavailable"} icon={FiDroplet} /><StatCard label="Total Areas" value={areasQuery.isLoading ? "…" : areasQuery.isError ? "—" : areaTotal ?? "Unavailable"} icon={FiMapPin} /><StatCard label="Total Reviews" value="Unavailable" icon={FiCheck} detail="Admin review list API unavailable" /></div>
    <div className="mt-6 grid gap-5 xl:grid-cols-[1.4fr_1fr]"><Card><div className="mb-4 flex items-center justify-between"><div><h2 className="font-bold">Recent Pump Registrations</h2><p className="mt-1 text-sm text-gray-500">Latest pumps returned by the admin list API.</p></div><Link to="/admin/pumps" className="text-sm font-semibold text-[#c75d00]">View all <FiArrowRight className="inline" /></Link></div>{pumpsQuery.isLoading ? <LoadingRows /> : pumpsQuery.isError ? <Notice tone="red">{messageOf(pumpsQuery.error)}</Notice> : pumps.length === 0 ? <Empty>No pump records are available.</Empty> : <div className="divide-y divide-gray-100">{pumps.slice(0, 5).map((pump) => <Link key={idOf(pump)} to={`/admin/pumps/${idOf(pump)}`} className="flex items-center justify-between gap-4 py-3 hover:bg-gray-50"><div className="min-w-0"><p className="truncate text-sm font-semibold">{pump.name || "Unnamed pump"}</p><p className="truncate text-xs text-gray-500">{pump.address || "Address unavailable"}</p></div><Status value={statusOf(pump)} /></Link>)}</div>}</Card>
      <Card><h2 className="font-bold">Quick Management Actions</h2><p className="mt-1 text-sm text-gray-500">Jump into a management workspace.</p><div className="mt-4 grid gap-2">{[["Review pump approvals", "/admin/pumps/pending"], ["Search a user", "/admin/users"], ["Create an area", "/admin/areas/create"], ["Add a service", "/admin/services/create"]].map(([label, path]) => <Link key={path} to={path} className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 text-sm font-medium hover:border-orange-200 hover:bg-orange-50">{label}<FiArrowRight className="text-[#c75d00]" /></Link>)}</div><div className="mt-5 border-t pt-4"><p className="text-xs font-semibold uppercase text-gray-500">Connected data</p><p className="mt-2 text-sm text-gray-600">{areasQuery.isError ? "Areas could not be loaded." : `${areaTotal ?? "Unavailable"} areas`} · {servicesQuery.isError ? "Services could not be loaded." : `${services.length} services`}</p></div></Card></div>
  </div>;
};

export const AdminPumps = ({ filter = "all" }) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pending, setPending] = useState(null);
  const { data, error, isLoading, refetch } = useGetAdminPumpsQuery({ approvalStatus: filter === "all" ? undefined : filter, search: search.trim() || undefined, page, limit: 10 });
  const [approve, approveState] = useApproveAdminPumpMutation();
  const [reject, rejectState] = useRejectAdminPumpMutation();
  const navigate = useNavigate();
  const pumps = listFrom(data);
  const pagination = data?.data?.pagination;
  const title = filter === "all" ? "All Pumps" : titleCase(filter) + " Pumps";
  const perform = async () => {
    if (!pending?.id || (pending.action === "reject" && !pending.reason?.trim())) return;
    try {
      const result = pending.action === "approve"
        ? await approve(pending.id).unwrap()
        : await reject({ id: pending.id, reason: pending.reason.trim() }).unwrap();
      assertApiSuccess(result);
      toast.success(result?.message || "Pump " + pending.action + "d.");
      setPending(null);
    } catch (e) { toast.error(messageOf(e)); }
  };
  return <div><PageHeader title={title} description="Review pump registrations, verify details, and manage approval status." /><Card>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><label className="flex min-w-56 items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5"><FiSearch className="text-gray-400" /><input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search pump name or phone" className="w-full text-sm outline-none" /></label><span className="text-sm text-gray-500">{pagination?.total ?? 0} records</span></div>
    {isLoading ? <LoadingRows /> : error ? <Notice tone="red">{messageOf(error)} <button onClick={refetch} className="ml-2 underline">Retry</button></Notice> : pumps.length === 0 ? <Empty>No pumps match this view.</Empty> : <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-sm"><thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500"><tr>{["Pump", "Owner", "Contact", "Location", "Approval", "Availability", "Rating", "Created", "Actions"].map((x) => <th key={x} className="px-3 py-3">{x}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{pumps.map((pump) => <tr key={idOf(pump)} className="hover:bg-gray-50/80"><td className="px-3 py-3 font-semibold">{pump.name || "?"}</td><td className="px-3 py-3">{pump.createdBy?.name || "?"}</td><td className="px-3 py-3"><span className="block">{pump.phone || "?"}</span><span className="text-xs text-gray-500">{pump.email || pump.createdBy?.email || "?"}</span></td><td className="px-3 py-3">{pump.address || "?"}<span className="block text-xs text-gray-500">{pump.district || ""}</span></td><td className="px-3 py-3"><Status value={statusOf(pump)} /></td><td className="px-3 py-3"><Status value={booleanStatus(pump.isOpen, "open", "closed")} /><span className="ml-1"><Status value={booleanStatus(pump.isActive, "active", "inactive")} /></span></td><td className="px-3 py-3">? {pump.avgRating == null ? "?" : Number(pump.avgRating).toFixed(1)}<span className="block text-xs text-gray-500">{pump.reviewCount == null ? "? reviews" : pump.reviewCount + " reviews"}</span></td><td className="px-3 py-3">{pump.createdAt ? new Date(pump.createdAt).toLocaleDateString() : "?"}</td><td className="px-3 py-3"><div className="flex items-center gap-2"><button onClick={() => navigate("/admin/pumps/" + idOf(pump))} className="font-semibold text-[#c75d00]">Details</button>{statusOf(pump) === "pending" && <><button onClick={() => setPending({ id: idOf(pump), action: "approve" })} aria-label="Approve pump" className="rounded-lg bg-emerald-50 p-2 text-emerald-700"><FiCheck /></button><button onClick={() => setPending({ id: idOf(pump), action: "reject", reason: "" })} aria-label="Reject pump" className="rounded-lg bg-rose-50 p-2 text-rose-700"><FiX /></button></>}</div></td></tr>)}</tbody></table></div>}
    {!isLoading && !error && pagination && pagination.totalPages > 1 && <div className="mt-4 flex items-center justify-between"><span className="text-sm text-gray-500">Page {pagination.page} of {pagination.totalPages}</span><div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Previous</button><button disabled={page >= pagination.totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Next</button></div></div>}
  </Card>{pending && <Confirm title={titleCase(pending.action) + " pump?"} description={pending.action === "reject" ? "Provide the required reason for rejecting this pump." : "Confirm approval for this pump."} busy={approveState.isLoading || rejectState.isLoading} danger={pending.action === "reject"} confirmDisabled={pending.action === "reject" && !pending.reason.trim()} confirmLabel={titleCase(pending.action)} onCancel={() => setPending(null)} onConfirm={perform}>{pending.action === "reject" && <label className="mt-4 block text-sm font-medium">Rejection reason<textarea required value={pending.reason} onChange={(event) => setPending((current) => ({ ...current, reason: event.target.value }))} rows={3} className="mt-1 w-full rounded-xl border px-3 py-2.5" /></label>}</Confirm>}</div>;
};

export const AdminPumpDetails = () => {
  const { pumpId = "" } = useParams();
  const { data, error, isLoading, refetch } = useGetAdminPumpQuery(pumpId, { skip: !pumpId });
  const [pending, setPending] = useState(null);
  const [approve, approveState] = useApproveAdminPumpMutation();
  const [reject, rejectState] = useRejectAdminPumpMutation();
  const navigate = useNavigate();
  const pump = data?.data;
  const act = async () => {
    if (pending?.action === "reject" && !pending.reason?.trim()) return;
    try {
      const result = pending.action === "approve"
        ? await approve(pumpId).unwrap()
        : await reject({ id: pumpId, reason: pending.reason.trim() }).unwrap();
      assertApiSuccess(result);
      toast.success(result?.message || "Pump " + pending.action + "d.");
      setPending(null);
      navigate("/admin/pumps");
    } catch (e) { toast.error(messageOf(e)); }
  };
  if (isLoading) return <><PageHeader title="Pump Details" description="Loading pump information." /><LoadingRows /></>;
  if (error) return <><PageHeader title="Pump Details" description="Pump registration and approval information." /><Notice tone="red">{messageOf(error)} <button onClick={refetch} className="underline">Retry</button></Notice></>;
  if (!pump || typeof pump !== "object" || !pump._id) return <><PageHeader title="Pump Details" description="Pump registration and approval information." /><Notice>Pump details were not found in the API response.</Notice><Link to="/admin/pumps" className="mt-4 inline-block text-sm font-semibold text-[#c75d00]">Back to pumps</Link></>;
  const areas = Array.isArray(pump.areaIds) ? pump.areaIds : [];
  const sections = [["Pump Information", [["Name", pump.name], ["Description", pump.description], ["Slug", pump.slug], ["Phone", pump.phone], ["Email", pump.email], ["Address", pump.address], ["Division", pump.division], ["District", pump.district], ["Location name", pump.locationName]]], ["Location", [["Latitude", pump.location?.coordinates?.[1]], ["Longitude", pump.location?.coordinates?.[0]], ["Areas", areas.map((area) => area.name).filter(Boolean).join(", ") || "—"]]], ["Owner Information", [["Owner", pump.createdBy?.name], ["Owner email", pump.createdBy?.email], ["Created", pump.createdAt ? new Date(pump.createdAt).toLocaleString() : "—"]]], ["Approval & Status", [["Approval status", titleCase(pump.approvalStatus)], ["Approved by", pump.approvedBy?.name || pump.approvedBy], ["Approved date", pump.approvedAt ? new Date(pump.approvedAt).toLocaleString() : "—"], ["Rejection reason", pump.rejectionReason], ["Availability", booleanStatus(pump.isOpen, "Open", "Closed")], ["Account status", booleanStatus(pump.isActive, "Active", "Inactive")], ["Average rating", pump.avgRating], ["Review count", pump.reviewCount], ["Facilities", Array.isArray(pump.facilities) ? pump.facilities.join(", ") : pump.facilities]]]];
  return <div><PageHeader title={pump.name || "Pump Details"} description="Pump profile, location, fuel inventory, owner, and approval history." action={<Link to="/admin/pumps" className="rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold">Back to pumps</Link>} />{statusOf(pump) === "pending" && <div className="mb-5 flex gap-2"><button onClick={() => setPending({ action: "approve" })} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white">Approve pump</button><button onClick={() => setPending({ action: "reject", reason: "" })} className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white">Reject pump</button></div>}<div className="grid gap-5 lg:grid-cols-2">{sections.map(([sectionTitle, values]) => <Card key={sectionTitle}><h2 className="mb-4 font-bold">{sectionTitle}</h2><dl className="grid grid-cols-2 gap-x-4 gap-y-4">{values.map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-xs text-gray-500">{label}</dt><dd className="mt-1 break-words text-sm font-medium">{value === undefined || value === null || value === "" ? "—" : String(value)}</dd></div>)}</dl></Card>)}<Card className="lg:col-span-2"><h2 className="mb-4 font-bold">Fuel Information</h2>{pump.fuels?.length ? <div className="overflow-x-auto"><table className="w-full min-w-[520px] text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="p-3">Fuel type</th><th className="p-3">Price</th><th className="p-3">Availability</th></tr></thead><tbody className="divide-y">{pump.fuels.map((fuel, index) => <tr key={fuel.type + "-" + index}><td className="p-3">{fuel.type}</td><td className="p-3">{fuel.price}</td><td className="p-3"><Status value={fuel.available ? "Available" : "Unavailable"} /></td></tr>)}</tbody></table></div> : <Empty>Fuel information is not available.</Empty>}<p className="mt-3 text-xs text-gray-500">Last fuel update: {pump.fuelsUpdatedAt ? new Date(pump.fuelsUpdatedAt).toLocaleString() : "—"}</p></Card></div>{pending && <Confirm title={titleCase(pending.action) + " pump?"} description={pending.action === "reject" ? "Provide the required reason for rejecting this pump." : "Confirm approval for this pump."} busy={approveState.isLoading || rejectState.isLoading} danger={pending.action === "reject"} confirmDisabled={pending.action === "reject" && !pending.reason.trim()} confirmLabel={titleCase(pending.action)} onCancel={() => setPending(null)} onConfirm={act}>{pending.action === "reject" && <label className="mt-4 block text-sm font-medium">Rejection reason<textarea required value={pending.reason} onChange={(event) => setPending((current) => ({ ...current, reason: event.target.value }))} rows={3} className="mt-1 w-full rounded-xl border px-3 py-2.5" /></label>}</Confirm>}</div>;
};

export const AdminTechnicians = ({ filter = "all" }) => {
  const [search, setSearch] = useState(""); const [pending, setPending] = useState(null); const [approve, a] = useApprovePendingTechnicianMutation(); const [reject, r] = useRejectPendingTechnicianMutation();
  const title = filter === "all" ? "All Technicians" : `${titleCase(filter)} Technicians`;
  const submit = async () => { if (pending?.id) { try { const result = pending.action === "approve" ? await approve(pending.id).unwrap() : await reject(pending.id).unwrap(); if (result?.success === false) throw new Error(result.message); toast.success(result?.message || "Technician status updated."); setPending(null); } catch (e) { toast.error(messageOf(e)); } } };
  return <div><PageHeader title={title} description="Manage technician account approvals and review registration details." /><Card><div className="mb-4 flex items-center gap-2 rounded-xl border px-3 py-2.5 sm:max-w-md"><FiSearch className="text-gray-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search technicians" className="w-full text-sm outline-none" /></div><Notice>Technician listing endpoint was not provided. Available actions are PATCH `/admin/pending_technician/:technicianId/approve`, `/reject`, and `/:technicianId`; a GET endpoint is required to load actual technician rows. No sample records are shown.</Notice><div className="mt-4 flex flex-wrap gap-2">{filter !== "approved" && <button onClick={() => setPending({ action: "approve" })} className="rounded-xl border px-4 py-2 text-sm font-semibold">Approve by ID…</button>}{filter !== "rejected" && <button onClick={() => setPending({ action: "reject" })} className="rounded-xl border px-4 py-2 text-sm font-semibold text-rose-700">Reject by ID…</button>}</div>{search && <p className="mt-3 text-xs text-gray-400">Search will apply once a technician list endpoint is available.</p>}</Card>{pending && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/40 p-4"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"><h2 className="text-lg font-bold">{pending.action === "approve" ? "Approve technician" : "Reject technician"}</h2><form className="mt-4 space-y-3" onSubmit={(e) => { e.preventDefault(); void submit(); }}><label className="block text-sm font-medium">Technician ID<input value={pending.id || ""} onChange={(e) => setPending((x) => ({ ...x, id: e.target.value }))} className="mt-1 w-full rounded-xl border px-3 py-2.5" required /></label><div className="flex justify-end gap-2"><button type="button" onClick={() => setPending(null)} className="rounded-xl border px-4 py-2">Cancel</button><button disabled={a.isLoading || r.isLoading} className="rounded-xl bg-[#ff7f11] px-4 py-2 font-semibold text-white">{a.isLoading || r.isLoading ? "Saving…" : "Continue"}</button></div></form></div></div>}</div>;
};

export const AdminTechnicianDetails = () => {
  const { technicianId = "" } = useParams();
  return <div><PageHeader title="Technician Details" description="Technician identity and approval details." action={<Link to="/admin/technicians" className="rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold">Back to technicians</Link>} /><Card><div className="mb-4"><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Technician ID</p><p className="mt-1 font-mono text-sm">{technicianId}</p></div><Notice>The supplied backend endpoints do not include a technician detail GET endpoint. Required API: `GET /api/v1/admin/pending_technician/:technicianId` (or an equivalent admin technician detail endpoint) to show verified profile information.</Notice></Card></div>;
};

export const AdminUsers = () => {
  const [email, setEmail] = useState("");
  const [trigger, query] = useLazySearchAdminUserQuery();
  const [updateRole, roleState] = useUpdateAdminUserRoleMutation();
  const [confirm, setConfirm] = useState(false);
  const [role, setRole] = useState("");
  const [reason, setReason] = useState("");
  const user = query.data?.data;
  const search = async (event) => {
    event.preventDefault();
    if (!email.trim()) return;
    try { await trigger(email.trim().toLowerCase()).unwrap(); setRole(""); setReason(""); }
    catch { /* Render query error inline. */ }
  };
  const save = async () => {
    if (!user?._id || !role) return;
    try {
      const body = { role, ...(reason.trim() ? { reason: reason.trim() } : {}) };
      const result = await updateRole({ userId: user._id, body }).unwrap();
      assertApiSuccess(result);
      toast.success(result?.message || "User role updated.");
      setConfirm(false);
      await trigger(email.trim().toLowerCase()).unwrap();
    } catch (e) { toast.error(messageOf(e)); }
  };
  return <div><PageHeader title="Search Users" description="Find an account by email and manage its assigned role." /><Card><form onSubmit={search} className="flex flex-col gap-3 sm:flex-row"><label className="flex flex-1 items-center gap-2 rounded-xl border px-3 py-2.5"><FiSearch className="text-gray-400" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className="w-full text-sm outline-none" required /></label><button disabled={query.isFetching} className="rounded-xl bg-[#1C2333] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{query.isFetching ? "Searching?" : "Search user"}</button></form>{query.isError && <div className="mt-4"><Notice tone="red">{messageOf(query.error)}</Notice></div>}{user && <div className="mt-5 rounded-xl border p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-lg font-bold">{user.name || "User profile"}</p><p className="mt-1 text-sm text-gray-500">{user.email || email}</p><p className="mt-1 text-xs text-gray-500">ID: {user._id}</p></div><Status value={user.role} /></div><div className="mt-5 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-end"><label className="text-sm font-medium">Change role<select value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 block w-full rounded-xl border px-3 py-2.5 sm:w-56"><option value="">Select role</option>{["User", "Rider", "Technician", "PumpOwner"].map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label className="flex-1 text-sm font-medium">Reason (optional)<input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} className="mt-1 block w-full rounded-xl border px-3 py-2.5" placeholder="Reason for role change" /></label><button disabled={!role || role === user.role || !user._id} onClick={() => setConfirm(true)} className="rounded-xl bg-[#ff7f11] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40">Update role</button><Link to={"/admin/users/history?userId=" + encodeURIComponent(user._id)} className="rounded-xl border px-4 py-2.5 text-center text-sm font-semibold">Role history</Link></div></div>}</Card>{confirm && <Confirm title="Confirm role change" description={"Change " + (user?.email || "this user's") + " role from " + (user?.role || "unknown") + " to " + role + "?"} busy={roleState.isLoading} onCancel={() => setConfirm(false)} onConfirm={save} confirmLabel="Update role" />}</div>;
};

export const AdminRoleHistory = () => {
  const [params] = useSearchParams();
  const [userId, setUserId] = useState(params.get("userId") || "");
  const [submitted, setSubmitted] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const query = useGetAdminRoleHistoryQuery({ userId: submitted, page, limit }, { skip: !submitted });
  const historyRows = Array.isArray(query.data?.data) ? query.data.data : [];
  const pagination = query.data?.pagination;
  return <div><PageHeader title="Role Change History" description="Review recorded role updates for a user account." /><Card><form onSubmit={(e) => { e.preventDefault(); setPage(1); setSubmitted(userId.trim()); }} className="flex gap-3"><input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="User ID" className="min-w-0 flex-1 rounded-xl border px-3 py-2.5 text-sm" required /><button className="rounded-xl bg-[#1C2333] px-4 py-2 text-sm font-semibold text-white">Load history</button></form>{query.isLoading && <div className="mt-5"><LoadingRows /></div>}{query.error && <div className="mt-5"><Notice tone="red">{messageOf(query.error)}</Notice></div>}{submitted && !query.isLoading && !query.error && (historyRows.length ? <><div className="mt-5 divide-y">{historyRows.map((row) => <div key={idOf(row)} className="flex flex-wrap justify-between gap-3 py-4 text-sm"><span><b>{row.previousRole || "?"}</b> ? <b>{row.newRole || "?"}</b></span><span className="text-gray-500">{row.changedBy?.name || "Admin"} ? {row.createdAt ? new Date(row.createdAt).toLocaleString() : "?"}</span></div>)}</div>{pagination && pagination.totalPages > 1 && <div className="mt-4 flex items-center justify-between"><span className="text-sm text-gray-500">Page {pagination.currentPage} of {pagination.totalPages}</span><div className="flex gap-2"><button disabled={!pagination.hasPrevPage} onClick={() => setPage((value) => value - 1)} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Previous</button><button disabled={!pagination.hasNextPage} onClick={() => setPage((value) => value + 1)} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Next</button></div></div>}</> : <Empty>No role change history found.</Empty>)}</Card></div>;
};

export const AdminAreas = ({ mode = "all" }) => {
  const [search, setSearch] = useState("");
  const [type, setType] = useState(mode === "zones" ? "Zone" : "");
  const [active, setActive] = useState("");
  const [page, setPage] = useState(1);
  const [selectedZone, setSelectedZone] = useState("");
  const [pendingDeactivate, setPendingDeactivate] = useState(null);
  const query = useGetAdminAreasQuery({ search: search.trim() || undefined, type: type || undefined, isActive: active || undefined, page, limit: 10 });
  const areas = listFrom(query.data);
  const pagination = query.data?.pagination;
  const zones = mode === "zones" ? areas : [];
  const currentZone = zones.find((zone) => idOf(zone) === selectedZone) || zones[0];
  const wardsQuery = useGetAdminZoneWardsQuery(idOf(currentZone), { skip: mode !== "zones" || !currentZone });
  const wards = listFrom(wardsQuery.data);
  const [deleteArea, deleteState] = useDeleteAdminAreaMutation();
  const [setAreaStatus, statusState] = useUpdateAdminAreaStatusMutation();
  const act = async () => {
    if (!pendingDeactivate?.id) return;
    try {
      const response = await deleteArea(pendingDeactivate.id).unwrap();
      assertApiSuccess(response);
      toast.success(response?.message || "Area deactivated.");
      setPendingDeactivate(null);
    } catch (e) { toast.error(messageOf(e)); }
  };
  const toggleStatus = async (area) => {
    try {
      const response = await setAreaStatus({ areaId: idOf(area), isActive: !area.isActive }).unwrap();
      assertApiSuccess(response);
      toast.success(response?.message || "Area status updated.");
    } catch (e) { toast.error(messageOf(e)); }
  };
  return <div><PageHeader title={mode === "zones" ? "Zones & Wards" : "All Areas"} description="Browse Zone, Ward, and Neighbourhood records and their active status." action={<Link to="/admin/areas/create" className="inline-flex items-center gap-2 rounded-xl bg-[#ff7f11] px-4 py-2.5 text-sm font-semibold text-white"><FiPlus />Create area</Link>} /><Card>
    <div className="mb-4 flex flex-wrap items-center gap-3"><label className="flex min-w-48 flex-1 items-center gap-2 rounded-xl border px-3 py-2.5"><FiSearch className="text-gray-400" /><input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search area" className="w-full text-sm outline-none" /></label><select aria-label="Filter by area type" disabled={mode === "zones"} value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className="rounded-xl border bg-white px-3 py-2.5 text-sm"><option value="">All types</option><option>Zone</option><option>Ward</option><option>Neighbourhood</option></select><select aria-label="Filter by active status" value={active} onChange={(e) => { setActive(e.target.value); setPage(1); }} className="rounded-xl border bg-white px-3 py-2.5 text-sm"><option value="">All statuses</option><option value="true">Active</option><option value="false">Inactive</option></select><span className="text-sm text-gray-500">{query.data?.total ?? 0} areas</span></div>
    {query.isLoading ? <LoadingRows /> : query.error ? <Notice tone="red">{messageOf(query.error)} <button onClick={query.refetch} className="ml-2 underline">Retry</button></Notice> : areas.length === 0 ? <Empty>No area records are available.</Empty> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr>{["Area", "Level", "Parent", "Status", "Actions"].map((label) => <th key={label} className="p-3">{label}</th>)}</tr></thead><tbody className="divide-y">{areas.map((area) => <tr key={idOf(area)}><td className="p-3 font-semibold">{area.name || "—"}</td><td className="p-3">{titleCase(area.type)}</td><td className="p-3">{area.parentAreaId?.name || "—"}</td><td className="p-3"><Status value={booleanStatus(area.isActive, "active", "inactive")} /></td><td className="p-3"><div className="flex flex-wrap items-center gap-3"><Link to={"/admin/areas/" + idOf(area)} className="font-semibold text-[#c75d00]">Details</Link><button disabled={statusState.isLoading} onClick={() => toggleStatus(area)} className="text-sm font-medium disabled:opacity-50">Set {area.isActive ? "inactive" : "active"}</button>{area.isActive && <button onClick={() => setPendingDeactivate(area)} className="text-sm text-rose-600">Deactivate</button>}</div></td></tr>)}</tbody></table></div>}
    {!query.isLoading && !query.error && pagination?.totalPages > 1 && <div className="mt-4 flex items-center justify-between"><span className="text-sm text-gray-500">Page {pagination.currentPage} of {pagination.totalPages}</span><div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Previous</button><button disabled={page >= pagination.totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Next</button></div></div>}
  </Card>{mode === "zones" && currentZone && <Card className="mt-5"><label className="mb-3 block max-w-sm text-sm font-semibold">Choose zone<select value={idOf(currentZone)} onChange={(e) => setSelectedZone(e.target.value)} className="mt-1 w-full rounded-xl border bg-white px-3 py-2.5">{zones.map((zone) => <option key={idOf(zone)} value={idOf(zone)}>{zone.name}</option>)}</select></label><h2 className="mb-3 font-bold">Wards in {currentZone.name}</h2>{wardsQuery.isLoading ? <LoadingRows /> : wardsQuery.error ? <Notice tone="red">{messageOf(wardsQuery.error)}</Notice> : wards.length ? <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{wards.map((ward) => <Link key={idOf(ward)} to={"/admin/areas/" + idOf(ward)} className="rounded-xl border p-3 text-sm font-medium hover:border-orange-200">{ward.name || "Unnamed ward"}</Link>)}</div> : <Empty>No wards are listed under this zone.</Empty>}</Card>}{pendingDeactivate && <Confirm title="Deactivate this area?" description="This soft-deactivates the area. The backend will reject deactivation while it has child areas, including inactive children." danger busy={deleteState.isLoading} onCancel={() => setPendingDeactivate(null)} onConfirm={act} confirmLabel="Deactivate" />}</div>;
};

export const AdminCreateArea = () => {
  const [create, state] = useCreateAdminAreaMutation();
  const [form, setForm] = useState({ name: "", nameBn: "", type: "Zone", parentAreaId: "", division: "", district: "", cityCorporation: "", upazila: "", zoneNo: "", wardNo: "", areaSqKm: "", boundary: "" });
  const navigate = useNavigate();
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    try {
      const body = { name: form.name.trim(), nameBn: form.nameBn.trim(), type: form.type, division: form.division.trim(), district: form.district.trim(), cityCorporation: form.cityCorporation.trim(), upazila: form.upazila.trim() };
      if (form.type !== "Zone") body.parentAreaId = form.parentAreaId.trim();
      if (form.type === "Zone") body.zoneNo = Number(form.zoneNo);
      if (form.type === "Ward") body.wardNo = Number(form.wardNo);
      if (form.areaSqKm !== "") body.areaSqKm = Number(form.areaSqKm);
      if (form.boundary.trim()) body.boundary = JSON.parse(form.boundary);
      const result = await create(body).unwrap();
      assertApiSuccess(result);
      toast.success(result.message || "Area created.");
      navigate("/admin/areas");
    } catch (error) { toast.error(error instanceof SyntaxError ? "Boundary must be valid GeoJSON JSON." : messageOf(error)); }
  };
  const field = (name, label, required = false, type = "text") => <label className="block text-sm font-medium">{label}<input name={name} type={type} required={required} value={form[name]} onChange={update} className="mt-1 w-full rounded-xl border px-3 py-2.5" /></label>;
  return <div><PageHeader title="Create Area" description="Create a Zone, Ward, or Neighbourhood using the documented area fields." action={<Link to="/admin/areas" className="rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold">Back to areas</Link>} /><Card className="max-w-3xl"><form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">{field("name", "Name", true)}{field("nameBn", "Bangla name")}<label className="block text-sm font-medium">Type<select name="type" value={form.type} onChange={update} className="mt-1 w-full rounded-xl border bg-white px-3 py-2.5"><option>Zone</option><option>Ward</option><option>Neighbourhood</option></select></label>{form.type !== "Zone" && field("parentAreaId", "Parent area ID", true)}{field("division", "Division", true)}{field("district", "District", true)}{field("cityCorporation", "City corporation")}{field("upazila", "Upazila")}{form.type === "Zone" && field("zoneNo", "Zone number", true, "number")}{form.type === "Ward" && field("wardNo", "Ward number", true, "number")}{field("areaSqKm", "Area (sq km)", false, "number")}<label className="block text-sm font-medium sm:col-span-2">Boundary GeoJSON (optional)<textarea name="boundary" value={form.boundary} onChange={update} rows={5} className="mt-1 w-full rounded-xl border px-3 py-2.5 font-mono text-xs" placeholder="Paste an existing Polygon/MultiPolygon JSON boundary" /></label><p className="text-xs text-gray-500 sm:col-span-2">No boundary is generated. For Ward and Neighbourhood, the parent must be an active Zone or Ward respectively.</p><button disabled={state.isLoading} className="w-fit rounded-xl bg-[#ff7f11] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{state.isLoading ? "Creating?" : "Create area"}</button></form></Card></div>;
};

export const AdminAreaHierarchy = () => {
  const { data, error, isLoading } = useGetAdminAreaHierarchyQuery();
  const roots = Array.isArray(data?.data) ? data.data : [];
  const render = (node, depth = 0) => <div key={idOf(node) || node.name} className="border-l border-gray-200" style={{ marginLeft: depth ? 18 : 0 }}><div className="my-2 flex items-center gap-3 rounded-xl border bg-white px-4 py-3"><span className="rounded-lg bg-orange-50 p-2 text-[#c75d00]"><FiMapPin /></span><div className="flex-1"><p className="text-sm font-semibold">{node.name || "Unnamed area"}</p><p className="text-xs text-gray-500">{titleCase(node.type)}</p></div><Status value={booleanStatus(node.isActive, "active", "inactive")} /></div>{(node.children || []).map((child) => render(child, depth + 1))}</div>;
  return <div><PageHeader title="Area Hierarchy" description="Explore Zone ? Ward ? Neighbourhood relationships returned by the hierarchy API." />{isLoading ? <LoadingRows /> : error ? <Notice tone="red">{messageOf(error)}</Notice> : roots.length ? <Card>{roots.map((root) => render(root))}</Card> : <Empty>Hierarchy data is not available.</Empty>}</div>;
};

export const AdminAreaDetails = () => {
  const { areaId = "" } = useParams();
  const selectedQuery = useGetAdminAreaQuery(areaId, { skip: !areaId });
  const area = selectedQuery.data?.data;
  const [updateArea, updateState] = useUpdateAdminAreaMutation();
  const [setAreaStatus, statusState] = useUpdateAdminAreaStatusMutation();
  const [form, setForm] = useState(null);
  const [boundary, setBoundary] = useState("");
  const current = form || area;
  const updateField = (event) => setForm((value) => ({ ...(value || area), [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    try {
      const body = {};
      for (const fieldName of ["name", "nameBn", "slug", "division", "district", "upazila", "cityCorporation"]) if (form?.[fieldName] !== undefined) body[fieldName] = form[fieldName];
      if (form?.areaSqKm !== undefined && form.areaSqKm !== "") body.areaSqKm = Number(form.areaSqKm);
      if (boundary.trim()) body.boundary = JSON.parse(boundary);
      const response = await updateArea({ areaId, ...body }).unwrap();
      assertApiSuccess(response);
      toast.success(response.message || "Area updated.");
      setForm(null); setBoundary("");
    } catch (error) { toast.error(error instanceof SyntaxError ? "Boundary must be valid GeoJSON JSON." : messageOf(error)); }
  };
  const toggleStatus = async () => {
    try {
      const response = await setAreaStatus({ areaId, isActive: !area.isActive }).unwrap();
      assertApiSuccess(response);
      toast.success(response.message || "Area status updated.");
    } catch (error) { toast.error(messageOf(error)); }
  };
  if (selectedQuery.isLoading) return <LoadingRows />;
  if (selectedQuery.error) return <><PageHeader title="Area Details" description="Inspect the selected area." /><Notice tone="red">{messageOf(selectedQuery.error)}</Notice></>;
  if (!area || typeof area !== "object" || !area._id) return <><PageHeader title="Area Details" description="Inspect the selected area." /><Notice>Area details were not found in the API response.</Notice></>;
  return <div><PageHeader title={area.name || "Area Details"} description="Inspect area hierarchy and edit documented fields." action={<Link to="/admin/areas" className="rounded-xl border px-4 py-2 text-sm">Back to areas</Link>} /><Card className="max-w-3xl"><dl className="mb-5 grid grid-cols-2 gap-4 text-sm">{[["ID", area._id], ["Level", area.type], ["Parent", area.parentAreaId?.name || "—"], ["Status", area.isActive ? "Active" : "Inactive"], ["Boundary", area.boundary ? "GeoJSON boundary exists" : "Not provided"], ["Children", area.children?.length ?? 0]].map(([label, value]) => <div key={label}><dt className="text-gray-500">{label}</dt><dd className="mt-1 font-semibold">{value}</dd></div>)}</dl><div className="mb-5 flex flex-wrap gap-2"><button onClick={toggleStatus} disabled={statusState.isLoading} className="rounded-xl border px-4 py-2.5 text-sm font-semibold disabled:opacity-50">{statusState.isLoading ? "Updating..." : "Set " + (area.isActive ? "inactive" : "active")}</button></div><form onSubmit={submit} className="grid gap-4 border-t pt-5 sm:grid-cols-2">{[["name", "Name"], ["nameBn", "Bangla name"], ["slug", "Slug"], ["division", "Division"], ["district", "District"], ["upazila", "Upazila"], ["cityCorporation", "City corporation"], ["areaSqKm", "Area (sq km)"]].map(([name, label]) => <label key={name} className="block text-sm font-medium">{label}<input name={name} type={name === "areaSqKm" ? "number" : "text"} value={current?.[name] ?? ""} onChange={updateField} className="mt-1 w-full rounded-xl border px-3 py-2.5" /></label>)}<label className="block text-sm font-medium sm:col-span-2">New boundary GeoJSON (optional)<textarea value={boundary} onChange={(event) => setBoundary(event.target.value)} rows={5} className="mt-1 w-full rounded-xl border px-3 py-2.5 font-mono text-xs" placeholder="Paste existing Polygon/MultiPolygon JSON; leave blank to preserve current boundary" /></label><p className="text-xs text-gray-500 sm:col-span-2">Deactivation is soft and is rejected while child areas exist.</p><button disabled={updateState.isLoading} className="w-fit rounded-xl bg-[#ff7f11] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{updateState.isLoading ? "Saving..." : "Save changes"}</button></form></Card></div>;
};

export const AdminServices = ({ create = false }) => {
  const [form, setForm] = useState({ name: "", description: "", icon: "" });
  const [createService, state] = useCreateAdminServiceMutation();
  const servicesQuery = useServicesQuery();
  const services = listFrom(servicesQuery.data);
  const navigate = useNavigate();
  const update = (event) => setForm((value) => ({ ...value, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    try {
      const result = await createService({ name: form.name.trim(), description: form.description.trim(), icon: form.icon.trim() }).unwrap();
      assertApiSuccess(result);
      toast.success(result.message || "Service created.");
      navigate("/admin/services");
    } catch (error) { toast.error(messageOf(error)); }
  };
  if (create) return <div><PageHeader title="Create Service" description="Add a service to the existing service catalog." action={<Link to="/admin/services" className="rounded-xl border px-4 py-2.5 text-sm">Back to services</Link>} /><Card className="max-w-2xl"><form onSubmit={submit} className="space-y-4"><label className="block text-sm font-medium">Name<input name="name" value={form.name} onChange={update} required className="mt-1 w-full rounded-xl border px-3 py-2.5" /></label><label className="block text-sm font-medium">Description (optional)<textarea name="description" value={form.description} onChange={update} rows={4} className="mt-1 w-full rounded-xl border px-3 py-2.5" /></label><label className="block text-sm font-medium">Icon (optional)<input name="icon" value={form.icon} onChange={update} className="mt-1 w-full rounded-xl border px-3 py-2.5" /></label><button disabled={state.isLoading} className="rounded-xl bg-[#ff7f11] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{state.isLoading ? "Creating..." : "Create service"}</button></form></Card></div>;
  return <div><PageHeader title="Service List" description="Services returned by the existing authenticated service catalog endpoint." action={<Link to="/admin/services/create" className="inline-flex items-center gap-2 rounded-xl bg-[#ff7f11] px-4 py-2.5 text-sm font-semibold text-white"><FiPlus />Create service</Link>} /><Card>{servicesQuery.isLoading ? <LoadingRows /> : servicesQuery.error ? <Notice tone="red">{messageOf(servicesQuery.error)}</Notice> : services.length === 0 ? <Empty>No services are available from the service list endpoint.</Empty> : <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{services.map((service) => <div key={idOf(service)} className="rounded-xl border border-gray-100 p-4"><div className="flex items-center justify-between"><h2 className="font-semibold">{service.name || "Unnamed service"}</h2><Status value={booleanStatus(service.isActive, "active", "inactive")} /></div><p className="mt-2 text-sm text-gray-500">{service.description || "No description"}</p></div>)}</div>}</Card></div>;
};

export const AdminReviews = () => <div><PageHeader title="Review Management" description="Inspect customer reviews and manage visibility when the admin review listing becomes available." /><Card><div className="mb-4 flex items-center gap-3"><span className="rounded-xl bg-orange-50 p-3 text-[#c75d00]"><FiUsers size={20} /></span><div><h2 className="font-bold">Review inbox</h2><p className="text-sm text-gray-500">No review data is requested until the backend provides a listing endpoint.</p></div></div><Notice>The frontend has no Admin GET reviews endpoint. Required API: a paginated `GET /api/v1/admin/review` that returns reviewer, pump, rating, comment, created date, visibility state, and review ID. `PATCH /api/v1/admin/review/:id/hide` is available and toggles visibility in both directions. The page remains read-only until the Admin review list API returns review records.</Notice></Card></div>;

export const AdminSettings = () => <div><PageHeader title="Settings" description="Administrator account and workspace information." /><Card className="max-w-2xl"><h2 className="font-bold">Admin account</h2><p className="mt-2 text-sm leading-6 text-gray-600">This workspace uses the signed-in PothSeba account and shared bearer token. Profile and notification preferences are not editable because no corresponding settings endpoints exist.</p></Card></div>;
