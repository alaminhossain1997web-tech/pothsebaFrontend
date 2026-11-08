import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { FiGrid, FiMapPin, FiPlus, FiSettings, FiMenu, FiX, FiLogOut, FiDroplet, FiStar } from "react-icons/fi";
import { useLogoutMutation } from "../../services/Api";
import { clearUser } from "../user/userSlice";

const links = [
  ["Overview", "/pump", FiGrid, true],
  ["My Pumps", "/pump/pumps", FiMapPin],
  ["Add New Pump", "/pump/create", FiPlus],
  ["Fuel Management", "/pump/fuel", FiDroplet],
  ["My Review", "/pump/reviews", FiStar],
  ["Profile Settings", "/pump/profile", FiSettings],
];

const PumpDashboard = () => {
  const [open, setOpen] = useState(false);
  const user = useSelector((state) => state.user.user);
  const [logout] = useLogoutMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    if (!localStorage.getItem("accessToken")) navigate("/login", { replace: true });
  }, [navigate]);
  const signOut = async () => {
    try { await logout().unwrap(); } catch { /* Clear local session even if the server session has expired. */ }
    localStorage.removeItem("accessToken");
    dispatch(clearUser());
    dispatch({ type: "api/resetApiState" });
    navigate("/login", { replace: true });
  };
  return <div className="min-h-screen bg-[#F7F6F2] text-[#1C2333]">
    {open && <button aria-label="Close navigation overlay" onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-black/40 lg:hidden" />}
    <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#1C2333] text-white transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex h-20 items-center justify-between border-b border-white/10 px-6"><Link to="/home" className="text-xl font-bold">PothSeba <span className="text-[#ff7f11]">Partner</span></Link><button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><FiX /></button></div>
      <nav className="flex-1 space-y-1 p-4">{links.map(([label, to, Icon, end]) => <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${isActive ? "bg-[#ff7f11] text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}><Icon size={19} />{label}</NavLink>)}</nav>
      <button onClick={signOut} className="m-4 flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3 text-sm text-slate-300 hover:bg-red-500/15 hover:text-white"><FiLogOut />Sign out</button>
    </aside>
    <div className="lg:pl-64">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
        <div className="flex items-center gap-3"><button onClick={() => setOpen(true)} className="rounded-lg p-2 hover:bg-gray-100 lg:hidden" aria-label="Open navigation"><FiMenu size={20} /></button><p className="hidden text-sm text-gray-500 sm:block">Pump Owner Workspace</p></div>
        <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 font-bold text-[#c75d00]">{(user?.name || user?.email || "P").slice(0, 1).toUpperCase()}</div><div className="max-w-44"><p className="truncate text-sm font-semibold">{user?.name || "Pump owner"}</p><p className="text-xs text-gray-500">{user?.email || "Owner account"}</p></div></div>
      </header>
      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8"><Outlet /></main>
    </div>
  </div>;
};
export default PumpDashboard;
