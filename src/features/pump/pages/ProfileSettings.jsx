import { useSelector } from "react-redux";
import { FiInfo } from "react-icons/fi";
import { Panel } from "../PumpShared";

const ProfileSettings = () => {
  const user = useSelector((state) => state.user.user);
  return <div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-wider text-[#c75d00]">Account</p><h1 className="mt-1 text-2xl font-bold sm:text-3xl">Profile settings</h1><p className="mt-1 text-sm text-gray-500">Account details used for this signed-in session.</p></div><Panel title="Account profile"><dl className="grid gap-5 sm:grid-cols-2"><div><dt className="text-sm text-gray-500">Name</dt><dd className="mt-1 font-semibold">{user?.name || "Not available"}</dd></div><div><dt className="text-sm text-gray-500">Email</dt><dd className="mt-1 font-semibold">{user?.email || "Not available"}</dd></div><div><dt className="text-sm text-gray-500">Account role</dt><dd className="mt-1 font-semibold">{user?.role || "Not available"}</dd></div></dl><div className="mt-5 flex gap-3 rounded-xl bg-blue-50 p-4 text-sm text-blue-800"><FiInfo className="mt-0.5 shrink-0" /><p>Account profile editing is not available because the current API does not provide a profile update endpoint.</p></div></Panel></div>;
};
export default ProfileSettings;
