import { FiTool, FiClock, FiMapPin } from "react-icons/fi";

const ActivityCard = ({
  jobTitle = "Car Repair",
  customerName = "Rahim Ahmed",
  location = "Mirpur, Dhaka",
  time = "10 min ago",
}) => {
  return (
    <div className="w-full rounded-2xl border border-[#FFE3D1] bg-[#FFF8F2] p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md sm:p-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        
        {/* Icon */}
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFE6D5] text-[#F97316]">
          <FiTool className="h-5 w-5" />
        </div>

        {/* Status */}
        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-600">
          Active
        </span>
      </div>

      {/* Job Information */}
      <div className="mt-5">
        <h3 className="text-lg font-semibold text-[#1C2333]">
          {jobTitle}
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Customer: {customerName}
        </p>
      </div>

      {/* Location */}
      <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
        <FiMapPin className="shrink-0 text-[#F97316]" />

        <span className="truncate">
          {location}
        </span>
      </div>

      {/* Time */}
      <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
        <FiClock className="shrink-0 text-gray-400" />

        <span>{time}</span>
      </div>

      {/* Action Button */}
      <button
        type="button"
        className="mt-5 w-full rounded-xl bg-[#F97316] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#ea580c] cursor-pointer"
      >
        View Job
      </button>
    </div>
  );
};

export default ActivityCard;