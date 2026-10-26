
import { useCallback, useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

import LocationPicker from "../components/LocationPicker";
import PrimaryButton from "../components/ui/button/PrimaryButton";

import {
  useLazyFindTechnicianQuery,
  useCreateRequestMutation,
} from "../services/Api";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const DEFAULT_CENTER = [90.4125, 23.8103];

const isValidCoordinates = (coordinates) =>
  Array.isArray(coordinates) &&
  coordinates.length === 2 &&
  Number.isFinite(Number(coordinates[0])) &&
  Number.isFinite(Number(coordinates[1])) &&
  Number(coordinates[0]) >= -180 &&
  Number(coordinates[0]) <= 180 &&
  Number(coordinates[1]) >= -90 &&
  Number(coordinates[1]) <= 90;

const getTechnicianId = (technician) =>
  technician?._id || technician?.id || null;

const getTechnicianCoordinates = (technician) =>
  technician?.location?.coordinates ||
  technician?.coordinates ||
  null;

const getShopName = (technician) =>
  technician?.shopname ||
  technician?.shopName ||
  technician?.name ||
  "Technician";

const getServicesText = (technician) => {
  const services = technician?.services;

  if (!Array.isArray(services) || services.length === 0) {
    return "Vehicle repair and roadside assistance";
  }

  return services
    .map((service) => {
      if (typeof service === "string") return service;

      return (
        service?.name ||
        service?.serviceName ||
        service?.title ||
        "Vehicle service"
      );
    })
    .join(", ");
};

export default function FindTechnician() {
  const navigate = useNavigate();
  const submittingRef = useRef(false);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const technicianMarkersRef = useRef([]);

  const [location, setLocation] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [description, setDescription] = useState(
    "My vehicle engine is having a problem. I need assistance."
  );

  const [findTechnician, { isFetching: isFinding }] =
    useLazyFindTechnicianQuery();

  const [createRequest, { isLoading: isCreatingRequest }] =
    useCreateRequestMutation();

  // Initialize Mapbox map
  useEffect(() => {
    if (!MAPBOX_TOKEN) {
      console.error("VITE_MAPBOX_ACCESS_TOKEN is missing.");
      return;
    }

    if (!mapContainerRef.current || mapRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: DEFAULT_CENTER,
      zoom: 12,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    mapRef.current = map;

    return () => {
      userMarkerRef.current?.remove();

      technicianMarkersRef.current.forEach((marker) =>
        marker.remove()
      );

      technicianMarkersRef.current = [];
      map.remove();

      mapRef.current = null;
      userMarkerRef.current = null;
    };
  }, []);

  // Display the selected user location on the map
  useEffect(() => {
    const map = mapRef.current;
    const coordinates = location?.coordinates;

    if (!map || !isValidCoordinates(coordinates)) return;

    map.flyTo({
      center: coordinates,
      zoom: 14,
      essential: true,
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLngLat(coordinates);
    } else {
      const markerElement = document.createElement("div");

      markerElement.style.width = "18px";
      markerElement.style.height = "18px";
      markerElement.style.borderRadius = "50%";
      markerElement.style.backgroundColor = "#ff7f11";
      markerElement.style.border = "3px solid white";
      markerElement.style.boxShadow =
        "0 0 0 4px rgba(255,127,17,0.25)";

      userMarkerRef.current = new mapboxgl.Marker({
        element: markerElement,
      })
        .setLngLat(coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 20 }).setText("Your location")
        )
        .addTo(map);
    }
  }, [location]);

  // Display nearby technicians on the map
  useEffect(() => {
    const map = mapRef.current;

    if (!map) return;

    technicianMarkersRef.current.forEach((marker) =>
      marker.remove()
    );

    technicianMarkersRef.current = [];

    technicians.forEach((technician) => {
      const coordinates = getTechnicianCoordinates(technician);

      if (!isValidCoordinates(coordinates)) return;

      const markerElement = document.createElement("button");

      markerElement.type = "button";
      markerElement.textContent = "🔧";
      markerElement.title = getShopName(technician);
      markerElement.style.width = "38px";
      markerElement.style.height = "38px";
      markerElement.style.borderRadius = "50%";
      markerElement.style.backgroundColor = "#1C2333";
      markerElement.style.border = "2px solid white";
      markerElement.style.cursor = "pointer";
      markerElement.style.fontSize = "19px";

      markerElement.addEventListener("click", () => {
        setSelectedTechnician(technician);

        map.flyTo({
          center: coordinates,
          zoom: 15,
          essential: true,
        });
      });

      const marker = new mapboxgl.Marker({
        element: markerElement,
      })
        .setLngLat(coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 20 }).setText(
            getShopName(technician)
          )
        )
        .addTo(map);

      technicianMarkersRef.current.push(marker);
    });
  }, [technicians]);

  // Handle location selection
  const handleLocationSelect = useCallback((selectedLocation) => {
    if (!isValidCoordinates(selectedLocation?.coordinates)) {
      toast.error("Please select a valid location.");
      return;
    }

    setLocation(selectedLocation);
    setTechnicians([]);
    setSelectedTechnician(null);
  }, []);

  // Find nearby technicians
  const handleFindTechnician = useCallback(async () => {
    if (!isValidCoordinates(location?.coordinates)) {
      toast.error("Please select your location first.");
      return;
    }

    const [longitude, latitude] = location.coordinates;

    try {
      const response = await findTechnician({
        longitude,
        latitude,
      }).unwrap();

      const result =
        response?.data?.technicians ??
        response?.technicians ??
        (Array.isArray(response?.data) ? response.data : []);

      const nearbyTechnicians = Array.isArray(result)
        ? result
        : [];

      setTechnicians(nearbyTechnicians);
      setSelectedTechnician(null);

      if (nearbyTechnicians.length === 0) {
        toast.error("No technicians found near your location.");
      } else {
        toast.success(
          `${nearbyTechnicians.length} technician(s) found.`
        );
      }
    } catch (error) {
      const messages = {
        401: "Please sign in again to find a technician.",
        403: "You are not allowed to find technicians with this account.",
        404: "The technician search service is unavailable.",
      };
      toast.error(
        error?.data?.message ||
          messages[error?.status] ||
          error?.error ||
          "Failed to find technicians."
      );
    }
  }, [location, findTechnician]);

  // Create a technician service request
  const handleRequestTechnician = useCallback(async () => {
    if (submittingRef.current) return;
    if (!selectedTechnician) {
      toast.error("Please select a technician first.");
      return;
    }

    if (!isValidCoordinates(location?.coordinates)) {
      toast.error("Please select your location first.");
      return;
    }

    const technicianId = getTechnicianId(selectedTechnician);

    if (!technicianId) {
      toast.error("Technician ID is missing.");
      return;
    }

    const services = selectedTechnician?.services;

    const firstService = Array.isArray(services)
      ? services[0]
      : null;

    const serviceId =
      typeof firstService === "string"
        ? firstService
        : firstService?._id || firstService?.id;

    if (!serviceId) {
      toast.error("No valid service ID found for this technician.");
      return;
    }

    const requestData = {
      technicianId,
      serviceId,
      location: {
        type: "Point",
        coordinates: location.coordinates,
      },
      description: description.trim(),
    };

    if (!requestData.description) {
      toast.error("Please enter a description of your problem.");
      return;
    }

    try {
      submittingRef.current = true;
      const response = await createRequest(requestData).unwrap();
      if (response?.success === false || !response?.data?.request) {
        throw new Error(response?.message || "The server did not confirm the request.");
      }
      toast.success(
        response?.message || "Technician request sent successfully!"
      );
      navigate("/my-requests");
    } catch (error) {
      const messages = {
        401: "Your session expired. Please sign in again.",
        403: "You are not allowed to create this request.",
        404: "The request service or selected technician could not be found.",
        409: "This request conflicts with the current service state. Refresh and try again.",
      };
      toast.error(
        error?.data?.message || error?.message ||
          messages[error?.status] ||
          error?.error ||
          "Failed to send technician request."
      );
    } finally {
      submittingRef.current = false;
    }
  }, [
    selectedTechnician,
    location,
    description,
    createRequest,
    navigate,
  ]);

  return (
    <div className="min-h-screen bg-[#F7F6F2] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Page heading */}
        <div className="mb-6">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#ff7f11]">
            PothSeba Roadside Assistance
          </p>

          <h1 className="text-2xl font-bold text-[#1C2333] sm:text-3xl">
            Find a Technician
          </h1>

          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Select your location and find nearby technicians.
          </p>
        </div>

        {/* Location picker and search */}
        <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm sm:p-6">
          <h2 className="mb-4 text-lg font-semibold text-[#1C2333]">
            Your Location
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            <div className="min-w-0">
              <LocationPicker
                onLocationSelect={handleLocationSelect}
              />
            </div>

            <div className="flex min-w-0 items-center">
              <PrimaryButton
                onClick={handleFindTechnician}
                disabled={!location?.coordinates || isFinding}
              >
                {isFinding
                  ? "Searching..."
                  : "Find Nearby Technicians"}
              </PrimaryButton>
            </div>
          </div>

          {location?.address && (
            <p className="mt-4 break-words text-sm text-gray-600">
              <span className="font-semibold text-[#1C2333]">
                Selected Address:
              </span>{" "}
              {location.address}
            </p>
          )}

          {location?.coordinates && (
            <p className="mt-1 text-xs text-gray-500">
              Coordinates: {location.coordinates[0]},{" "}
              {location.coordinates[1]}
            </p>
          )}
        </div>

        {/* Map */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
            <h2 className="font-semibold text-[#1C2333]">
              Technician Map
            </h2>

            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-[#ff7f11]">
              {technicians.length} found
            </span>
          </div>

          {!MAPBOX_TOKEN ? (
            <div className="flex min-h-64 items-center justify-center p-6 text-center text-sm text-red-600">
              Map configuration is missing. Please check your
              VITE_MAPBOX_ACCESS_TOKEN environment variable.
            </div>
          ) : (
            <div
              ref={mapContainerRef}
              className="h-[350px] w-full sm:h-[430px] lg:h-[480px]"
            />
          )}
        </div>

        {/* Technician results */}
        <div className="mb-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-bold text-[#1C2333]">
              Nearby Technicians
            </h2>

            <span className="text-sm text-gray-500">
              {technicians.length} technician(s)
            </span>
          </div>

          {isFinding ? (
            <div className="rounded-2xl bg-white p-8 text-center text-gray-600 shadow-sm">
              Searching for nearby technicians...
            </div>
          ) : technicians.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
              <div className="mb-3 text-4xl">🔧</div>

              <h3 className="font-semibold text-[#1C2333]">
                No Technicians Found Yet
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Select your location and click Find Nearby Technicians.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {technicians.map((technician, index) => {
                const technicianId = getTechnicianId(technician);

                const isSelected =
                  getTechnicianId(selectedTechnician) === technicianId;

                return (
                  <div
                    key={technicianId || index}
                    className={`rounded-2xl border bg-white p-5 shadow-sm transition ${
                      isSelected
                        ? "border-[#ff7f11] ring-2 ring-orange-100"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1C2333] text-2xl">
                        🔧
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="break-words font-bold text-[#1C2333]">
                          {getShopName(technician)}
                        </h3>

                        <p className="mt-1 break-words text-sm text-gray-500">
                          {getServicesText(technician)}
                        </p>
                      </div>
                    </div>

                    {technician?.phone && (
                      <p className="mt-3 text-sm text-gray-600">
                        <span className="font-semibold">Phone:</span>{" "}
                        {technician.phone}
                      </p>
                    )}

                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTechnician(technician);

                          const coordinates =
                            getTechnicianCoordinates(technician);

                          if (
                            mapRef.current &&
                            isValidCoordinates(coordinates)
                          ) {
                            mapRef.current.flyTo({
                              center: coordinates,
                              zoom: 15,
                              essential: true,
                            });
                          }
                        }}
                        className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                          isSelected
                            ? "bg-orange-100 text-[#c75d00]"
                            : "border border-gray-200 text-[#1C2333] hover:border-[#ff7f11] hover:text-[#ff7f11]"
                        }`}
                      >
                        {isSelected
                          ? "Technician Selected ✓"
                          : "Select Technician"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Request form */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-[#1C2333]">
            Request a Technician
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            Send a service request to your selected technician with a
            description of your problem.
          </p>

          {selectedTechnician ? (
            <div className="mt-5 rounded-xl border border-orange-200 bg-orange-50 p-4">
              <p className="text-sm text-gray-600">
                Selected Technician
              </p>

              <p className="mt-1 font-bold text-[#1C2333]">
                {getShopName(selectedTechnician)}
              </p>

              <p className="mt-1 break-all text-xs text-gray-500">
                ID: {getTechnicianId(selectedTechnician)}
              </p>
            </div>
          ) : (
            <div className="mt-5 rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
              Select a technician from the list above before sending a
              request.
            </div>
          )}

          <div className="mt-5">
            <label
              htmlFor="request-description"
              className="mb-2 block text-sm font-semibold text-[#1C2333]"
            >
              Problem Description
            </label>

            <textarea
              id="request-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="Describe your vehicle problem in detail..."
              className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#ff7f11] focus:ring-2 focus:ring-orange-100"
            />

            <p className="mt-1 text-right text-xs text-gray-400">
              {description.length}/1000
            </p>
          </div>

          {location?.coordinates && (
            <p className="mt-3 text-xs text-gray-500">
              Your selected location will be included with your request.
            </p>
          )}

          <div className="mt-5">
            <PrimaryButton
              onClick={handleRequestTechnician}
              disabled={
                !selectedTechnician ||
                !location?.coordinates ||
                isCreatingRequest
              }
            >
              {isCreatingRequest
                ? "Sending Request..."
                : "Request a Technician"}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
