import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router";
import Registration from "./pages/Registration";
import Login from "./pages/Login";
import TechnicianProfile from "./pages/TechnicianProfile";
import Home from "./pages/Home";
import Layout from "./Layout/Layout";
import TrafficService from "./pages/TrafficService";
import FuelPumpService from "./pages/FuelPumpService";
import TakeRide from "./pages/TakeRide";
import FindTechnician from "./pages/FindTechnician";
import TecnicianDashboard from "./pages/tecnicianDashboard/TecnicianDashboard";
import RiderRequests from "./pages/RiderRequests";
import UserDashboard from "./pages/UserDashboard";
const PumpDashboard = lazy(() => import("./features/pump/PumpDashboard"));
const Overview = lazy(() => import("./features/pump/pages/Overview"));
const MyPumps = lazy(() => import("./features/pump/pages/MyPumps"));
const CreatePump = lazy(() => import("./features/pump/pages/CreatePump"));
const PumpDetails = lazy(() => import("./features/pump/pages/PumpDetails"));
const ProfileSettings = lazy(() => import("./features/pump/pages/ProfileSettings"));
const MyPumpReview = lazy(() => import("./features/pump/pages/MyPumpReview"));
const AdminLayout = lazy(() => import("./features/admin/AdminLayout"));
const AdminGuard = lazy(() => import("./features/admin/AdminGuard"));
const AdminPagesRenderer = lazy(() => import("./features/admin/AdminPages").then((module) => ({ default: ({ name, ...props }) => { const Page = module[name]; return <Page {...props} />; } })));


const App = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/my-requests" element={<RiderRequests />} />
        <Route path="/traffic"element={<TrafficService />}/>
        <Route path="/fuelpump"element={<FuelPumpService />}/>
        <Route path="/ride"element={<TakeRide />}/>
        <Route path="/tecnician"element={<FindTechnician />}/>
         <Route path="/technician_dashboard"element={<TecnicianDashboard />}/>
         <Route path="/user_dashboard"element={<UserDashboard />}/>

        
      </Route>
      <Route path="/registration"element={<Registration />}/>
        <Route path="/login"element={<Login/>}/>
        <Route path="/technician-profile"element={<TechnicianProfile />}/>
      <Route path="/pump" element={<Suspense fallback={<div className="min-h-screen bg-[#F7F6F2] p-8 text-sm text-gray-500">Loading pump dashboard...</div>}><PumpDashboard /></Suspense>}>
        <Route index element={<Overview />} />
        <Route path="pumps" element={<MyPumps />} />
        <Route path="fuel" element={<MyPumps mode="fuel" />} />
        <Route path="create" element={<CreatePump />} />
        <Route path="pumps/:pumpId" element={<PumpDetails />} />
        <Route path="profile" element={<ProfileSettings />} />
        <Route path="reviews" element={<MyPumpReview />} />
      </Route>
      <Route path="/pump/my_pumps" element={<Navigate to="/pump/pumps" replace />} />
      <Route path="/pump_dashboard" element={<Navigate to="/pump" replace />} />
      <Route element={<Suspense fallback={<div className="min-h-screen bg-[#F7F6F2] p-8 text-sm text-gray-500">Loading admin workspace...</div>}><AdminGuard /></Suspense>}>
        <Route path="/admin" element={<Suspense fallback={<div className="p-8 text-sm text-gray-500">Loading...</div>}><AdminLayout /></Suspense>}>
          <Route index element={<AdminPage name="AdminOverview" />} />
          <Route path="technicians" element={<AdminPage name="AdminTechnicians" />} />
          <Route path="technicians/pending" element={<AdminPage name="AdminTechnicians" filter="pending" />} />
          <Route path="technicians/approved" element={<AdminPage name="AdminTechnicians" filter="approved" />} />
          <Route path="technicians/rejected" element={<AdminPage name="AdminTechnicians" filter="rejected" />} />
          <Route path="technicians/:technicianId" element={<AdminPage name="AdminTechnicianDetails" />} />
          <Route path="pumps" element={<AdminPage name="AdminPumps" />} />
          <Route path="pumps/pending" element={<AdminPage name="AdminPumps" filter="pending" />} />
          <Route path="pumps/approved" element={<AdminPage name="AdminPumps" filter="approved" />} />
          <Route path="pumps/rejected" element={<AdminPage name="AdminPumps" filter="rejected" />} />
          <Route path="pumps/:pumpId" element={<AdminPage name="AdminPumpDetails" />} />
          <Route path="users" element={<AdminPage name="AdminUsers" />} />
          <Route path="users/history" element={<AdminPage name="AdminRoleHistory" />} />
          <Route path="areas" element={<AdminPage name="AdminAreas" />} />
          <Route path="areas/create" element={<AdminPage name="AdminCreateArea" />} />
          <Route path="areas/hierarchy" element={<AdminPage name="AdminAreaHierarchy" />} />
          <Route path="areas/zones" element={<AdminPage name="AdminAreas" mode="zones" />} />
          <Route path="areas/:areaId" element={<AdminPage name="AdminAreaDetails" />} />
          <Route path="services" element={<AdminPage name="AdminServices" />} />
          <Route path="services/create" element={<AdminPage name="AdminServices" create />} />
          <Route path="reviews" element={<AdminPage name="AdminReviews" />} />
          <Route path="settings" element={<AdminPage name="AdminSettings" />} />
        </Route>
      </Route>
      {/* Unknown Route */}
      <Route path="*"element={<Navigate to="/registration" replace />}/>
    </Routes>
  );
};

const AdminPage = (props) => <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-white" />}><AdminPagesRenderer {...props} /></Suspense>;

export default App;
