
import React from "react";
import { Link } from "react-router";
import ImageSlider from "../components/ui/slider/ImageSlider";

const UserDashboard = () => {
  return (
    <div className="min-h-screen bg-theme px-4 py-6 sm:px-6 lg:px-8">
      {/* Image Slider */}
      <div className="py-8">
        <ImageSlider />
      </div>

      {/* Two Cards Layout */}
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 items-stretch gap-5 md:grid-cols-2">

        {/* Available Service Card */}
        <div className="order-1 flex h-full flex-col rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-[#1C2333]">
            Available Service
          </h2>

          <div className="flex flex-1 flex-col">
            <Link
              to="/ride"
              className="flex flex-1 items-center gap-4 rounded-xl border border-gray-200 p-4 transition hover:border-[#ff7f11] hover:bg-orange-50"
            >
              <img
                src="/ride-hailing.png"
                alt="ride"
                className="h-14 w-14 shrink-0 object-contain"
              />

              <div>
                <p className="text-sm font-semibold text-[#1C2333]">
                  Take a Ride
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Find a driver near you.
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Safety Alert Card */}
        <div className="order-2 flex h-full flex-col rounded-2xl border border-orange-200 bg-white p-5 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-[#1C2333]">
            Ride Safety Tips
          </h2>

          <ul className="flex-1 list-inside list-decimal space-y-3 text-sm leading-relaxed text-gray-600">
            <li>
              Confirm the fare before starting your journey.
            </li>

            <li>
              Verify the driver's name, photo, and rating before booking a ride.
            </li>

            <li>
              Check that the vehicle's registration number and model match the
              details shown in the app.
            </li>

            <li>
              In case of an emergency, contact the police or emergency services.
            </li>
          </ul>

          <p className="mt-4 border-t border-gray-100 pt-3 text-sm text-gray-700">
            <strong>Remember:</strong> Your safety comes first. Stay alert and
            travel safely.
          </p>
        </div>

      </div>
    </div>
  );
};

export default UserDashboard;
