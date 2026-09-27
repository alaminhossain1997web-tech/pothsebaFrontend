import { useState } from "react";

const LocationPicker = ({ onLocationSelect }) => {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getCurrentLocation = () => {
    setError("");
    setAddress("");
    setLoading(true);

    // ==========================================
    // CHECK GEOLOCATION SUPPORT
    // ==========================================

    if (!navigator.geolocation) {
      setError("Your browser does not support location services.");
      setLoading(false);
      return;
    }

    // ==========================================
    // GET CURRENT LOCATION
    // ==========================================

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        // GeoJSON format
        // [longitude, latitude]
        const coordinates = [longitude, latitude];

        console.log("📍 Coordinates:", coordinates);

        // Save coordinates
        setLocation(coordinates);

        try {
          // ========================================
          // MAPBOX TOKEN
          // ========================================

          const mapboxToken =
            import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

          if (!mapboxToken) {
            throw new Error(
              "Mapbox access token is missing."
            );
          }

          // ========================================
          // REVERSE GEOCODING
          // ========================================

          const response = await fetch(
            `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${longitude}&latitude=${latitude}&access_token=${mapboxToken}`
          );

          if (!response.ok) {
            throw new Error(
              "Failed to get address from Mapbox."
            );
          }

          const data = await response.json();

          console.log(
            "Mapbox Reverse Geocoding Response:",
            data
          );

          // ========================================
          // GET ADDRESS
          // ========================================

          const placeName =
            data.features?.[0]?.properties?.full_address ||
            data.features?.[0]?.properties?.name ||
            "Address not found";

          setAddress(placeName);

          // ========================================
          // SEND DATA TO PARENT
          // ========================================

          if (onLocationSelect) {
            onLocationSelect({
              coordinates,
              address: placeName,
            });
          }

          console.log("📍 Address:", placeName);
        } catch (error) {
          console.error(
            "❌ Reverse Geocoding Error:",
            error
          );

          // Coordinates পাওয়া গেছে,
          // কিন্তু address পাওয়া যায়নি

          if (onLocationSelect) {
            onLocationSelect({
              coordinates,
              address: "",
            });
          }

          setError(
            "Location detected, but we couldn't find the exact address."
          );
        } finally {
          setLoading(false);
        }
      },

      // ==========================================
      // GEOLOCATION ERROR
      // ==========================================

      (error) => {
        setLoading(false);

        console.error(
          "❌ Geolocation Error:",
          error
        );

        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError(
              "Location permission denied. Please allow location access."
            );
            break;

          case error.POSITION_UNAVAILABLE:
            setError(
              "Location information is unavailable."
            );
            break;

          case error.TIMEOUT:
            setError(
              "Location request timed out. Please try again."
            );
            break;

          default:
            setError(
              "Something went wrong while getting your location."
            );
        }
      },

      // ==========================================
      // GEOLOCATION OPTIONS
      // ==========================================

      {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 60000,
      }
    );
  };

  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden">

      {/* ==================================
          LOCATION BUTTON
      ================================== */}

      <button
        type="button"
        onClick={getCurrentLocation}
        disabled={loading}
        className="
          block
          w-full
          min-w-0
          max-w-full
          cursor-pointer
          rounded-lg
          bg-green-500
          px-4
          py-3
          text-sm
          font-bold
          text-white
          transition
          hover:bg-green-600
          disabled:cursor-not-allowed
          disabled:opacity-50
          sm:text-base
        "
      >
        {loading
          ? "Getting Location..."
          : "Allow Location Access"}
      </button>

      {/* ==================================
          ERROR
      ================================== */}

      {error && (
        <p className="mt-2 w-full break-words text-xs leading-5 text-red-500 sm:text-sm">
          {error}
        </p>
      )}

      {/* ==================================
          LOCATION RESULT
      ================================== */}

      {location && (
        <div className="mt-3 w-full min-w-0 max-w-full overflow-hidden rounded-lg border border-green-200 bg-green-50 p-3 sm:p-4">

          {/* Success Message */}

          <p className="text-sm font-semibold text-green-700">
            Your current location:
          </p>

          {/* Address */}

          {address && (
            <p className="mt-2 break-words text-sm leading-6 text-gray-700">
              📍 {address}
            </p>
          )}

        </div>
      )}
    </div>
  );
};

export default LocationPicker;