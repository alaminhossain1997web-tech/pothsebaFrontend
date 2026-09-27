import React, { useState } from "react";

const TechnicianStatusCard = () => {
  const [isOnline, setIsOnline] = useState(true);

  const handleToggle = () => {
    setIsOnline((prev) => !prev);
  };

  return (
    <div className="mx-auto w-full max-w-7xl rounded-2xl border border-black px-4 py-5 shadow-xl sm:px-6 sm:py-6 lg:px-8">
      <div className="flex flex-row items-center justify-between gap-3">
        
        {/* Left Side */}
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          
          {/* Status Indicator */}
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full sm:h-12 sm:w-12 ${
              isOnline ? "bg-green-100" : "bg-gray-100"
            }`}
          >
            <span
              className={`h-3 w-3 rounded-full sm:h-4 sm:w-4 ${
                isOnline ? "bg-green-500" : "bg-gray-400"
              }`}
            ></span>
          </div>

          {/* Status Text */}
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-[#1C2333] sm:text-lg">
              {isOnline ? "You're Online" : "You're Offline"}
            </h3>

            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
              {isOnline
                ? "Customers can request your service"
                : "You won't receive new service requests"}
            </p>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          
          <span
            className={`text-xs font-medium sm:text-sm ${
              isOnline ? "text-green-600" : "text-gray-500"
            }`}
          >
            {isOnline ? "Online" : "Offline"}
          </span>

          {/* Toggle Button */}
          <button
            type="button"
            onClick={handleToggle}
            aria-label="Toggle technician online status"
            className={`relative h-6 w-12 cursor-pointer shrink-0 overflow-hidden rounded-full transition-colors duration-300 sm:h-7 sm:w-14 ${
              isOnline ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-md transition-transform duration-300 sm:h-5 sm:w-5 ${
                isOnline ? "translate-x-6 sm:translate-x-7" : "translate-x-0"
              }`}
            ></span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TechnicianStatusCard;