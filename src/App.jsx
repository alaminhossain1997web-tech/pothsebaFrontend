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

const App = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/traffic"element={<TrafficService />}/>
        <Route path="/fuelpump"element={<FuelPumpService />}/>
        <Route path="/ride"element={<TakeRide />}/>
        <Route path="/tecnician"element={<FindTechnician />}/>
         <Route path="/technician_dashboard"element={<TecnicianDashboard />}/>

        
      </Route>
      <Route path="/registration"element={<Registration />}/>
        <Route path="/login"element={<Login/>}/>
        <Route path="/technician-profile"element={<TechnicianProfile />}/>
      {/* Unknown Route */}
      <Route path="*"element={<Navigate to="/registration" replace />}/>
    </Routes>
  );
};

export default App;