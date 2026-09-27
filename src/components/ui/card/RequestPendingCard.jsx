import React from "react";
import { FaCarCrash } from "react-icons/fa";
import { SlLocationPin } from "react-icons/sl";

const RequestPendingCard = ({
  carName = "Toyota Axio",
  problem = "Engine Problem",
  location = "Uttara, Dhaka",
  time = "10 mins ago",
}) => {
  return (
    <div className="w-full rounded-2xl border border-green-500 bg-green-100 p-4 shadow-sm sm:p-5">
      <div className="flex items-start gap-4">
        {/* Car Logo */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-500 sm:h-16 sm:w-16">
          <FaCarCrash className="text-2xl sm:text-3xl" />
        </div>

        {/* Car Information */}
        <div className="flex-1">
          {/* Car Name */}
          <h3 className="text-base font-bold text-[#1C2333] sm:text-lg">
            {carName}
          </h3>

          {/* Problem */}
          <p className="mt-1 text-sm font-medium text-gray-600 sm:text-base">
            {problem}
          </p>

          {/* Location */}
          <div className="mt-2 flex items-start gap-1.5 text-sm text-gray-500">
            <SlLocationPin className="mt-0.5 shrink-0 text-lg text-[#F97316]" />

            <span className="break-words">
              {location}
            </span>
          </div>
        </div>

        {/* Time */}
        <div className="shrink-0">
          <span className="whitespace-nowrap text-xs font-medium text-gray-500 sm:text-sm">
            {time}
          </span>
        </div>
      </div>
      {/* button */}
      <div className=" flex gap-10">
        <button
        type="button"
        className="mt-5 w-full rounded-xl bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#ea580c] cursor-pointer"
      >
        Reject
      </button>

       <button
        type="button"
        className="mt-5 w-full rounded-xl bg-green-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#ea580c] cursor-pointer"
      >
        Accept
      </button>

      </div>
    </div>
  );
};

export default RequestPendingCard;