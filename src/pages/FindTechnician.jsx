import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import LocationPicker from "../components/LocationPicker";
import PrimaryButton from "../components/ui/button/PrimaryButton";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

mapboxgl.accessToken = MAPBOX_TOKEN;

const FindTechnician = () => {
  // ==========================================
  // MAP REFERENCES
  // ==========================================

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // ==========================================
  // USER LOCATION
  // ==========================================

  const [location, setLocation] = useState(null);

  // ==========================================
  // LOCATION SELECT
  // ==========================================

  const handleLocationSelect = (data) => {
    console.log("Location received:", data);
    setLocation(data);
  };

  // ==========================================
  // INITIALIZE MAP
  // ==========================================

  useEffect(() => {
    console.log("Mapbox Token:", MAPBOX_TOKEN);

    if (!MAPBOX_TOKEN) {
      console.error("❌ Mapbox access token is missing.");
      return;
    }

    if (!mapContainerRef.current) {
      console.error("❌ Map container not found.");
      return;
    }

    if (mapRef.current) {
      return;
    }

    // ========================================
    // CREATE MAP
    // ========================================

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [90.4125, 23.8103],
      zoom: 12,
    });

    mapRef.current = map;

    // ========================================
    // NAVIGATION CONTROL
    // ========================================

    map.addControl(
      new mapboxgl.NavigationControl(),
      "top-right"
    );

    // ========================================
    // MAP LOAD
    // ========================================

    map.on("load", () => {
      console.log("✅ Mapbox map loaded successfully");

      setTimeout(() => {
        map.resize();
      }, 100);
    });

    // ========================================
    // MAP ERROR
    // ========================================

    map.on("error", (event) => {
      console.error("❌ Mapbox Error:", event);
    });

    // ========================================
    // CLEANUP
    // ========================================

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // ==========================================
  // UPDATE MAP WHEN LOCATION CHANGES
  // ==========================================

  useEffect(() => {
    if (!location) return;

    if (!mapRef.current) {
      console.log("Map is not ready yet.");
      return;
    }

    if (!location.coordinates) {
      console.error("❌ Location coordinates not found.");
      return;
    }

    const [longitude, latitude] = location.coordinates;

    console.log("📍 Moving map to:", {
      longitude,
      latitude,
    });

    // ========================================
    // MOVE MAP
    // ========================================

    mapRef.current.flyTo({
      center: [longitude, latitude],
      zoom: 15,
      speed: 1.2,
      curve: 1,
      essential: true,
    });

    // ========================================
    // REMOVE OLD MARKER
    // ========================================

    if (markerRef.current) {
      markerRef.current.remove();
    }

    // ========================================
    // CREATE NEW MARKER
    // ========================================

    const marker = new mapboxgl.Marker({
      color: "#ff7f11",
    })
      .setLngLat([longitude, latitude])
      .addTo(mapRef.current);

    markerRef.current = marker;

    // ========================================
    // RESIZE MAP
    // ========================================

    setTimeout(() => {
      mapRef.current?.resize();
    }, 100);
  }, [location]);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-theme">
      <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-5 sm:py-6 md:px-6 lg:px-8">

        {/* ==================================
            PAGE HEADER
        ================================== */}

        <div className="mb-5 w-full sm:mb-6">
          <h1 className="text-xl font-bold text-[#1C2333] sm:text-2xl md:text-3xl">
            Find Technician
          </h1>
        </div>

        {/* ==================================
            MAIN CARD
        ================================== */}

        <div className="w-full max-w-full overflow-hidden rounded-xl bg-white shadow-sm sm:rounded-2xl">

          {/* ==================================
              HEADER
          ================================== */}

          <div className="w-full border-b border-gray-200 p-4 sm:p-5 md:p-6">
            <h2 className="text-base font-semibold text-[#1C2333] sm:text-lg">
              Your Location
            </h2>

            <p className="mt-1 text-xs leading-5 text-gray-500 sm:text-sm">
              Select your current location to find nearby technicians.
            </p>
          </div>

          {/* ==================================
              LOCATION + REQUEST BUTTON
          ================================== */}

          <div className="w-full border-b border-gray-200 p-4 sm:p-5 md:p-6">

            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">

              {/* ==============================
                  LOCATION PICKER
              ============================== */}

              <div className="min-w-0 w-full">
                <LocationPicker
                  onLocationSelect={handleLocationSelect}
                />
              </div>

              {/* ==============================
                  REQUEST BUTTON
              ============================== */}

              <div className="min-w-0 w-full">
                <PrimaryButton>
                  Request Technician
                </PrimaryButton>
              </div>

            </div>

          </div>

          {/* ==================================
              MAP
          ================================== */}

          <div className="relative h-[260px] w-full max-w-full overflow-hidden sm:h-[360px] md:h-[450px] lg:h-[500px]">
            <div
              ref={mapContainerRef}
              className="absolute inset-0 h-full w-full"
            />
          </div>

          {/* ==================================
              LOCATION INFORMATION
          ================================== */}

          {location && location.coordinates && (
            <div className="w-full border-t border-gray-200 bg-gray-50 p-4 sm:p-5 md:p-6">

              <div className="mb-4 w-full">
                <p className="break-words text-sm font-semibold leading-6 text-[#1C2333] sm:text-base">
                  📍 {location.address}
                </p>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default FindTechnician;