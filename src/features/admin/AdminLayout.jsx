import { useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { FiActivity, FiBell, FiChevronDown, FiChevronLeft, FiChevronRight, FiChevronUp, FiGrid, FiLayers, FiLogOut, FiMap, FiMenu, FiMessageSquare, FiSettings, FiTool, FiUsers, FiX, FiDroplet } from "react-icons/fi";
import { useLogoutMutation } from "../../services/Api";
import { clearUser } from "../user/userSlice";

const navigation = [
  { title: "Dashboard Overview", path: "/admin", icon: FiGrid, end: true },
  { title: "Technician Management", icon: FiTool, children: [["All Technicians", "/admin/technicians"], ["Pending Approvals", "/admin/technicians/pending"], ["Approved", "/admin/technicians/approved"], ["Rejected", "/admin/technicians/rejected"]] },
  { title: "Pump Management", icon: FiDroplet, children: [["All Pumps", "/admin/pumps"], ["Pending Pumps", "/admin/pumps/pending"], ["Approved Pumps", "/admin/pumps/approved"], ["Rejected Pumps", "/admin/pumps/rejected"]] },
  { title: "User Management", icon: FiUsers, children: [["Search Users", "/admin/users"], ["Role Change History", "/admin/users/history"]] },
  { title: "Area Management", icon: FiMap, children: [["All Areas", "/admin/areas"], ["Create Area", "/admin/areas/create"], ["Area Hierarchy", "/admin/areas/hierarchy"], ["Zones", "/admin/areas/zones"]] },
  { title: "Service Management", icon: FiLayers, children: [["Service List", "/admin/services"], ["Create Service", "/admin/services/create"]] },
  { title: "Review Management", path: "/admin/reviews", icon: FiMessageSquare },
  { title: "Settings", path: "/admin/settings", icon: FiSettings },
];

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [profileOpen, setProfileOpen] = useState(false);
  const user = useSelector((state) => state.user.user);
  const [logout] = useLogoutMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const logoutAdmin = async () => {
    try { await logout().unwrap(); } catch { /* Clear the local session if the server session ended. */ }
    localStorage.removeItem("accessToken"); dispatch(clearUser()); dispatch({ type: "api/resetApiState" }); navigate("/login", { replace: true });
  };
  const crumbLabels = {
    admin: "Admin",
    technicians: "Technicians",
    pending: "Pending approvals",
    approved: "Approved",
    rejected: "Rejected",
    pumps: "Pumps",
    users: "Users",
    history: "Role history",
    areas: "Areas",
    create: "Create",
    hierarchy: "Area hierarchy",
    zones: "Zones",
    services: "Services",
    reviews: "Reviews",
    settings: "Settings",
    profile: "Profile",
  };
  const pathParts = location.pathname.split("/").filter(Boolean);
  const crumbs = pathParts.map((part, index) => {
    if (index === 0 && part === "admin" && pathParts.length === 1) return "Dashboard Overview";
    if (index > 0 && /^[a-f\d]{24}$/i.test(part)) return "Details";
    return crumbLabels[part] || part.replaceAll("-", " ");
  });
  const sidebar = <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#1C2333] text-white transition-all duration-200 ${collapsed ? "w-[84px]" : "w-72"} ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
    <div className="flex h-[72px] items-center justify-between border-b border-white/10 px-5"><Link to="/admin" className="truncate text-lg font-bold">{collapsed ? "PS" : <>PothSeba <span className="text-[#ff7f11]">Admin</span></>}</Link><button onClick={() => setMobileOpen(false)} className="lg:hidden" aria-label="Close sidebar"><FiX /></button></div>
    <nav className="flex-1 space-y-1 overflow-y-auto p-3">{navigation.map((item) => {
      const Icon = item.icon; const activeGroup = item.children?.some(([, path]) => location.pathname === path || location.pathname.startsWith(`${path}/`)); const open = expanded[item.title] ?? activeGroup;
      if (!item.children) return <NavLink key={item.path} to={item.path} end={item.end} onClick={() => setMobileOpen(false)} title={collapsed ? item.title : undefined} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${isActive ? "bg-[#ff7f11] text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}><Icon size={18} /><span className={collapsed ? "lg:hidden" : ""}>{item.title}</span></NavLink>;
      return <div key={item.title}><button onClick={() => setExpanded((value) => ({ ...value, [item.title]: !open }))} title={collapsed ? item.title : undefined} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium ${activeGroup ? "text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}><Icon size={18} /><span className={`flex-1 ${collapsed ? "lg:hidden" : ""}`}>{item.title}</span>{!collapsed && (open ? <FiChevronUp /> : <FiChevronDown />)}</button>{open && <div className={`mt-1 space-y-1 ${collapsed ? "lg:hidden" : "ml-9"}`}>{item.children.map(([title, path]) => <NavLink key={path} to={path} end={path === "/admin/technicians"} onClick={() => setMobileOpen(false)} className={({ isActive }) => `block rounded-lg px-3 py-2 text-xs ${isActive ? "bg-white/10 font-semibold text-white" : "text-slate-400 hover:text-white"}`}>{title}</NavLink>)}</div>}</div>;
    })}</nav>
    <button onClick={logoutAdmin} className="m-3 flex items-center gap-3 rounded-xl border border-white/10 px-3 py-3 text-sm text-slate-300 hover:bg-red-500/15 hover:text-white" title="Logout"><FiLogOut size={18} /><span className={collapsed ? "lg:hidden" : ""}>Logout</span></button>
    <button onClick={() => setCollapsed((value) => !value)} className="hidden h-12 items-center justify-center border-t border-white/10 text-slate-400 hover:text-white lg:flex" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>{collapsed ? <FiChevronRight /> : <FiChevronLeft />}</button>
  </aside>;
  return <div className="min-h-screen bg-[#F7F6F2] text-[#1C2333]">{mobileOpen && <button aria-label="Close sidebar overlay" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-black/40 lg:hidden" />}{sidebar}<div className={`min-h-screen transition-[padding] duration-200 ${collapsed ? "lg:pl-[84px]" : "lg:pl-72"}`}>
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6"><div className="flex min-w-0 items-center gap-3"><button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 hover:bg-gray-100 lg:hidden" aria-label="Open sidebar"><FiMenu size={20} /></button><div className="hidden items-center gap-2 text-sm text-gray-500 sm:flex"><FiActivity className="text-[#ff7f11]" />{crumbs.map((crumb, index) => <span key={`${crumb}-${index}`} className="capitalize">{index > 0 && <span className="mr-2 text-gray-300">/</span>}{crumb}</span>)}</div><span className="font-semibold sm:hidden">Admin workspace</span></div><div className="flex items-center gap-2 sm:gap-4"><span aria-label="Notifications unavailable" title="Notifications are not configured" className="rounded-xl p-2.5 text-gray-400"><FiBell size={19} /></span><div className="relative"><button onClick={() => setProfileOpen((value) => !value)} className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-gray-50"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 font-bold text-[#c75d00]">{(user?.name || user?.email || "A").slice(0, 1).toUpperCase()}</span><span className="hidden max-w-36 text-left sm:block"><span className="block truncate text-sm font-semibold">{user?.name || "Administrator"}</span><span className="block text-xs text-gray-500">Admin</span></span><FiChevronDown className="hidden text-gray-400 sm:block" /></button>{profileOpen && <div className="absolute right-0 top-12 z-40 w-48 rounded-xl border border-gray-100 bg-white p-2 shadow-lg"><Link to="/admin/settings" onClick={() => setProfileOpen(false)} className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-50">Admin settings</Link><button onClick={logoutAdmin} className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">Logout</button></div>}</div></div></header>
    <main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8"><Outlet /></main>
  </div></div>;
};
export default AdminLayout;
