import { Link } from "react-router";
import ImageSlider from "../components/ui/slider/ImageSlider";

const Home = () => {
  return (
    <div className="min-h-screen bg-theme px-4 py-6 sm:px-6 lg:px-8">
      <div className="py-8">
        <ImageSlider/>
      </div>
      <div className="mx-auto w-full max-w-7xl">

        {/* AVAILABLE SERVICES */}

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-[#1C2333]">
            Available Services
          </h2>

          {/* SERVICES */}

          <div className="flex flex-wrap gap-4">

            {/* TECHNICIAN */}

            <Link
              to="/tecnician"
              className="flex w-full items-center gap-4 rounded-xl border border-gray-200 p-4 transition hover:border-[#ff7f11] hover:bg-orange-50 sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)]"
            >
              <img
                src="/mechanic.png"
                alt="Technician"
                className="h-14 w-14 shrink-0 object-contain"
              />

              <div>
                <p className="text-sm font-semibold text-[#1C2333]">
                  Find Technician
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Find nearby technician
                </p>
              </div>
            </Link>

            {/* TRAFFIC SERVICE */}

            <Link
              to="/traffic"
              className="flex w-full items-center gap-4 rounded-xl border border-gray-200 p-4 transition hover:border-[#ff7f11] hover:bg-orange-50 sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)]"
            >
              <img
                src="/transport.png"
                alt="Traffic Service"
                className="h-14 w-14 shrink-0 object-contain"
              />

              <div>
                <p className="text-sm font-semibold text-[#1C2333]">
                  Traffic Service
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Check traffic information
                </p>
              </div>
            </Link>

            {/* FUEL PUMP */}

            <Link
              to="/fuelpump"
              className="flex w-full items-center gap-4 rounded-xl border border-gray-200 p-4 transition hover:border-[#ff7f11] hover:bg-orange-50 sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)]"
            >
              <img
                src="/gas-pump.png"
                alt="Fuel Pump"
                className="h-14 w-14 shrink-0 object-contain"
              />

              <div>
                <p className="text-sm font-semibold text-[#1C2333]">
                  Find Fuel Pump
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Find nearby fuel pumps
                </p>
              </div>
            </Link>

            {/* TAKE RIDE */}

            <Link
              to="/ride"
              className="flex w-full items-center gap-4 rounded-xl border border-gray-200 p-4 transition hover:border-[#ff7f11] hover:bg-orange-50 sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)]"
            >
              <img
                src="/ride-hailing.png"
                alt="Ride"
                className="h-14 w-14 shrink-0 object-contain"
              />

              <div>
                <p className="text-sm font-semibold text-[#1C2333]">
                  Find a Ride
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Find and book a ride
                </p>
              </div>
            </Link>

            {/* EMERGENCY */}

            <Link
              to="/emergency"
              className="flex w-full items-center gap-4 rounded-xl border border-gray-200 p-4 transition hover:border-[#ff7f11] hover:bg-orange-50 sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)]"
            >
              <img
                src="/alarm.png"
                alt="Emergency"
                className="h-14 w-14 shrink-0 object-contain"
              />

              <div>
                <p className="text-sm font-semibold text-[#1C2333]">
                  Emergency Service
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Get emergency assistance
                </p>
              </div>
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;