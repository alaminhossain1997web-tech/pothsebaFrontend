import React from "react";
import TechnicianStatusCard from "../../components/ui/card/TechnicianStatusCard";
import ActivityCard from "../../components/ui/card/activityCard";
import RequestPendingCard from "../../components/ui/card/RequestPendingCard";
import { FiBattery, FiSettings, FiTruck } from "react-icons/fi";
import { RiFileSettingsFill } from "react-icons/ri";

const TecnicianDashboard = () => {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      {/* Dashboard Container */}
      <div className="mx-auto w-full max-w-7xl">
        {/* Online / Offline Status */}
        <TechnicianStatusCard />

        {/* Activity Cards */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Pending Request */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-[#1C2333]">
              New Service Request
            </h3>

            <div className="py-2.5">
            <RequestPendingCard />
            </div>
    
          </div>
    
          {/* Activity Section */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-[#1C2333]">
              Your Activities
            </h3>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <ActivityCard />
              <ActivityCard  icon={FiBattery}
                jobTitle="Battery Service"
                customerName="Karim Hasan"
                location="Uttara, Dhaka"
                time="25 min ago"/>
              <ActivityCard icon={FiTruck}
                jobTitle="Towing Service"
                customerName="Sakib Khan"
                location="Banani, Dhaka"
                time="1 hour ago" />
              <ActivityCard  icon={RiFileSettingsFill}
                jobTitle="General Service"
                customerName="Nayeem Islam"
                location="Mohakhali, Dhaka"
                time="2 hours ago"/>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default TecnicianDashboard;
