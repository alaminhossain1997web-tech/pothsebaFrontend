import { Navigate, Outlet } from "react-router";
import { useSelector } from "react-redux";

const AdminGuard = () => {
  const user = useSelector((state) => state.user.user);
  if (!localStorage.getItem("accessToken")) return <Navigate to="/login" replace />;
  if (String(user?.role || "").toLowerCase() !== "admin") return <Navigate to="/home" replace />;
  return <Outlet />;
};

export default AdminGuard;
