import React, { useCallback, useEffect, useRef, useState } from "react";

import { createRoot } from "react-dom/client";

import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import { FiPhoneCall } from "react-icons/fi";
import { GiHomeGarage } from "react-icons/gi";
import { SlLocationPin } from "react-icons/sl";

import LocationPicker from "../components/LocationPicker";
import PrimaryButton from "../components/ui/button/PrimaryButton";
import { useLazyFindTechnicianQuery } from "../services/Api";
import { MdLocationPin } from "react-icons/md";

// ============================================================
// MAPBOX CONFIG
// ============================================================

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

mapboxgl.accessToken = MAPBOX_TOKEN;

// ============================================================
// CONSTANTS
// ============================================================

const DEFAULT_CENTER = [90.4125, 23.8103];

const DEFAULT_ZOOM = 12;

const USER_ZOOM = 14;

const MAX_FIT_ZOOM = 15;

const MAP_PADDING = 80;

const MAP_STYLE = "mapbox://styles/mapbox/streets-v12";

// ============================================================
// HELPERS
// ============================================================

const isValidCoordinates = (coordinates) => {
  if (!Array.isArray(coordinates)) {
    return false;
  }

  if (coordinates.length !== 2) {
    return false;
  }

  const longitude = Number(coordinates[0]);
  const latitude = Number(coordinates[1]);

  return (
    Number.isFinite(longitude) &&
    Number.isFinite(latitude) &&
    longitude >= -180 &&
    longitude <= 180 &&
    latitude >= -90 &&
    latitude <= 90
  );
};

// ============================================================

const normalizeCoordinates = (coordinates) => {
  if (!isValidCoordinates(coordinates)) {
    return null;
  }

  return [Number(coordinates[0]), Number(coordinates[1])];
};

// ============================================================

const getTechnicianCoordinates = (technician) => {
  return technician?.location?.coordinates || technician?.coordinates || null;
};

// ============================================================

const getTechnicianId = (technician) => {
  return technician?._id || technician?.id || null;
};

// ============================================================

const getShopName = (technician) => {
  return technician?.shopname || technician?.shopName || "Technician";
};

// ============================================================

const getServicesText = (services) => {
  if (!Array.isArray(services)) {
    return "";
  }

  return services
    .map((service) => {
      // If backend sends only service name
      if (typeof service === "string") {
        return service;
      }

      // If backend sends object
      return service?.name || service?.serviceName || service?.title || "";
    })
    .filter(Boolean)
    .join(" • ");
};

// ============================================================
// COMPONENT
// ============================================================

const FindTechnician = () => {
  // ==========================================================
  // MAP REFS
  // ==========================================================

  const mapContainerRef = useRef(null);

  const mapRef = useRef(null);

  const userMarkerRef = useRef(null);

  const technicianMarkersRef = useRef([]);

  // ==========================================================
  // MAP STATE
  // ==========================================================

  const [mapReady, setMapReady] = useState(false);

  // ==========================================================
  // API
  // ==========================================================

  const [findTechnician, { isFetching }] = useLazyFindTechnicianQuery();

  // ==========================================================
  // STATE
  // ==========================================================

  const [location, setLocation] = useState(null);

  const [technicians, setTechnicians] = useState([]);

  const [selectedTechnician, setSelectedTechnician] = useState(null);

  const [error, setError] = useState("");

  // ==========================================================
  // CLEAR USER MARKER
  // ==========================================================

  const clearUserMarker = useCallback(() => {
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();

      userMarkerRef.current = null;
    }
  }, []);

  // ==========================================================
  // CLEAR TECHNICIAN MARKERS
  // ==========================================================

  const clearTechnicianMarkers = useCallback(() => {
    technicianMarkersRef.current.forEach((marker) => {
      marker.remove();
    });

    technicianMarkersRef.current = [];
  }, []);

  // ==========================================================
  // LOCATION SELECT
  // ==========================================================

  const handleLocationSelect = useCallback(
    (data) => {
      console.log("LocationPicker data:", data);

      if (!data?.coordinates || !isValidCoordinates(data.coordinates)) {
        setError("Invalid location received.");

        return;
      }

      const coordinates = normalizeCoordinates(data.coordinates);

      const newLocation = {
        ...data,
        coordinates,
      };

      console.log("Normalized user location:", newLocation);

      setLocation(newLocation);

      setTechnicians([]);

      setSelectedTechnician(null);

      setError("");

      clearTechnicianMarkers();
    },
    [clearTechnicianMarkers],
  );

  // ==========================================================
  // INITIALIZE MAP
  // ==========================================================

  useEffect(() => {
    if (!MAPBOX_TOKEN) {
      console.error("VITE_MAPBOX_ACCESS_TOKEN is missing.");

      setError("Map service configuration is missing.");

      return;
    }

    if (!mapContainerRef.current) {
      return;
    }

    if (mapRef.current) {
      return;
    }

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLE,
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      attributionControl: true,
    });

    mapRef.current = map;

    // Navigation control
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Map loaded
    map.on("load", () => {
      console.log("Mapbox loaded successfully.");

      setMapReady(true);

      requestAnimationFrame(() => {
        map.resize();
      });
    });

    // Map error
    map.on("error", (event) => {
      console.error("Mapbox error:", event);
    });

    // Cleanup
    return () => {
      clearUserMarker();

      clearTechnicianMarkers();

      setMapReady(false);

      map.remove();

      mapRef.current = null;
    };
  }, [clearUserMarker, clearTechnicianMarkers]);

  // ==========================================================
  // SHOW USER LOCATION ON MAP
  // ==========================================================

  useEffect(() => {
    if (!mapReady || !location?.coordinates) {
      return;
    }

    const coordinates = normalizeCoordinates(location.coordinates);

    if (!coordinates) {
      return;
    }

    const map = mapRef.current;

    if (!map) {
      return;
    }

    const [longitude, latitude] = coordinates;

    console.log("Showing user location:", {
      longitude,
      latitude,
    });

    // --------------------------------------------------------
    // REMOVE OLD USER MARKER
    // --------------------------------------------------------

    clearUserMarker();

    // --------------------------------------------------------
    // CREATE USER MARKER
    // --------------------------------------------------------

    const marker = new mapboxgl.Marker({
      color: "#ff7f11",
      anchor: "center",
    })
      .setLngLat([longitude, latitude])
      .addTo(map);

    userMarkerRef.current = marker;

    // --------------------------------------------------------
    // MOVE MAP
    // --------------------------------------------------------

    map.flyTo({
      center: [longitude, latitude],

      zoom: USER_ZOOM,

      speed: 1.2,

      curve: 1,

      essential: true,
    });
  }, [location, mapReady, clearUserMarker]);

  // ==========================================================
  // FIND TECHNICIAN
  // ==========================================================

  const handleFindTechnician = useCallback(async () => {
    setError("");

    // ------------------------------------------------------
    // LOCATION VALIDATION
    // ------------------------------------------------------

    if (!location?.coordinates || !isValidCoordinates(location.coordinates)) {
      setError("Please allow your location first.");

      return;
    }

    const coordinates = normalizeCoordinates(location.coordinates);

    if (!coordinates) {
      setError("Invalid location coordinates.");

      return;
    }

    const [longitude, latitude] = coordinates;

    // ------------------------------------------------------
    // DEBUG
    // ------------------------------------------------------

    console.log("=================================");

    console.log("FIND TECHNICIAN FROM FRONTEND");

    console.log("Longitude:", longitude);

    console.log("Latitude:", latitude);

    console.log("=================================");

    try {
      // ====================================================
      // API REQUEST
      // ====================================================

      const response = await findTechnician({
        longitude,
        latitude,
      }).unwrap();

      console.log("FULL TECHNICIAN API RESPONSE:", response);

      // ====================================================
      // GET TECHNICIAN DATA
      // ====================================================

      const technicianData = Array.isArray(response?.data?.technicians)
        ? response.data.technicians
        : [];

      // ====================================================
      // GET DRIVER LOCATION
      // ====================================================

      const driverLocation = response?.data?.driverLocation || null;

      console.log("Driver Location:", driverLocation);

      console.log("Technicians:", technicianData);

      console.log("Total:", response?.data?.total);

      // ====================================================
      // UPDATE LOCATION
      // ====================================================

      if (driverLocation) {
        setLocation((previous) => ({
          ...previous,

          address: driverLocation.address || previous?.address || "",

          place: driverLocation.place || previous?.place || "",

          district: driverLocation.district || previous?.district || "",

          country: driverLocation.country || previous?.country || "",

          coordinates:
            normalizeCoordinates(driverLocation.coordinates) ||
            previous?.coordinates ||
            coordinates,
        }));
      }

      // ====================================================
      // UPDATE TECHNICIANS
      // ====================================================

      setTechnicians(technicianData);

      setSelectedTechnician(null);

      clearTechnicianMarkers();

      // ====================================================
      // NO TECHNICIAN
      // ====================================================

      if (technicianData.length === 0) {
        setError(
          response?.message ||
            "No available technician found near your location.",
        );

        return;
      }

      // ====================================================
      // MAP
      // ====================================================

      const map = mapRef.current;

      if (!map || !mapReady) {
        console.warn("Map is not ready yet.");

        return;
      }

      // ====================================================
      // FIT BOUNDS
      // ====================================================

      const bounds = new mapboxgl.LngLatBounds();

      // User location
      bounds.extend([longitude, latitude]);

      // Technician locations
      technicianData.forEach((technician) => {
        const technicianCoordinates = normalizeCoordinates(
          getTechnicianCoordinates(technician),
        );

        if (technicianCoordinates) {
          bounds.extend(technicianCoordinates);
        }
      });

      // Fit map
      map.fitBounds(bounds, {
        padding: MAP_PADDING,

        maxZoom: MAX_FIT_ZOOM,

        duration: 1200,
      });

      console.log("Map fitted to technicians.");
    } catch (requestError) {
      console.error("Find technician API error:", requestError);

      setTechnicians([]);

      setSelectedTechnician(null);

      setError(
        requestError?.data?.message ||
          requestError?.error ||
          "Failed to find technicians.",
      );
    }
  }, [location, findTechnician, clearTechnicianMarkers, mapReady]);

  // ==========================================================
  // CREATE TECHNICIAN POPUP
  // ==========================================================

  const createTechnicianPopup = useCallback((technician) => {
    const shopName = getShopName(technician);

    const phone = technician?.phone || "Phone not available";

    const distance = technician?.distanceText || "";

    const services = getServicesText(technician?.services);

    // ----------------------------------------------------
    // POPUP CONTAINER
    // ----------------------------------------------------

    const popupContent = document.createElement("div");

    popupContent.style.minWidth = "220px";

    popupContent.style.padding = "5px";

    // ----------------------------------------------------
    // HEADER
    // ----------------------------------------------------

    const header = document.createElement("div");

    header.style.display = "flex";

    header.style.alignItems = "center";

    header.style.gap = "8px";

    header.style.marginBottom = "10px";

    // ----------------------------------------------------
    // POPUP ICON
    // ----------------------------------------------------

    const iconWrapper = document.createElement("span");

    iconWrapper.style.display = "flex";

    iconWrapper.style.alignItems = "center";

    iconWrapper.style.justifyContent = "center";

    const iconRoot = createRoot(iconWrapper);

    iconRoot.render(<GiHomeGarage size={20} color="#ff7f11" />);

    header.appendChild(iconWrapper);

    // ----------------------------------------------------
    // TITLE
    // ----------------------------------------------------

    const title = document.createElement("h3");

    title.textContent = shopName;

    title.style.margin = "0";

    title.style.fontSize = "15px";

    title.style.fontWeight = "600";

    title.style.color = "#1C2333";

    header.appendChild(title);

    popupContent.appendChild(header);

    // ----------------------------------------------------
    // PHONE
    // ----------------------------------------------------

    const phoneRow = document.createElement("div");

    phoneRow.textContent = `📞 ${phone}`;

    phoneRow.style.fontSize = "13px";

    phoneRow.style.color = "#555";

    phoneRow.style.marginBottom = "6px";

    popupContent.appendChild(phoneRow);

    // ----------------------------------------------------
    // DISTANCE
    // ----------------------------------------------------

    if (distance) {
      const distanceRow = document.createElement("div");

      distanceRow.textContent = `📍 ${distance} away`;

      distanceRow.style.fontSize = "13px";

      distanceRow.style.color = "#555";

      distanceRow.style.marginBottom = "6px";

      popupContent.appendChild(distanceRow);
    }

    // ----------------------------------------------------
    // SERVICES
    // ----------------------------------------------------

    if (services) {
      const servicesRow = document.createElement("div");

      servicesRow.textContent = services;

      servicesRow.style.fontSize = "12px";

      servicesRow.style.color = "#777";

      servicesRow.style.marginBottom = "7px";

      popupContent.appendChild(servicesRow);
    }

    // ----------------------------------------------------
    // STATUS
    // ----------------------------------------------------

    const status = document.createElement("div");

    status.textContent = "● Available";

    status.style.fontSize = "13px";

    status.style.fontWeight = "600";

    status.style.color = "#16a34a";

    popupContent.appendChild(status);

    // ----------------------------------------------------
    // RETURN POPUP
    // ----------------------------------------------------

    return new mapboxgl.Popup({
      offset: 25,

      closeButton: true,

      closeOnClick: false,
    }).setDOMContent(popupContent);
  }, []);

  // ==========================================================
  // SHOW TECHNICIANS ON MAP
  // ==========================================================

  useEffect(() => {
    if (!mapReady || !mapRef.current) {
      return;
    }

    const map = mapRef.current;

    // --------------------------------------------------------
    // CLEAR OLD MARKERS
    // --------------------------------------------------------

    clearTechnicianMarkers();

    if (!technicians.length) {
      return;
    }

    console.log("Rendering technician markers:", technicians);

    // --------------------------------------------------------
    // CREATE MARKERS
    // --------------------------------------------------------

    technicians.forEach((technician) => {
      // ----------------------------------------------------
      // GET COORDINATES
      // ----------------------------------------------------

      const coordinates = normalizeCoordinates(
        getTechnicianCoordinates(technician),
      );

      if (!coordinates) {
        console.warn("Invalid technician coordinates:", technician);

        return;
      }

      const [longitude, latitude] = coordinates;

      // ====================================================
      // CREATE MAPBOX MARKER ELEMENT
      // ====================================================

      const markerElement = document.createElement("button");

      markerElement.type = "button";

      markerElement.setAttribute(
        "aria-label",
        `Select ${getShopName(technician)}`,
      );

      // ----------------------------------------------------
      // IMPORTANT
      //
      // Do NOT use transform on markerElement.
      //
      // Mapbox uses transform internally
      // to position the marker.
      //
      // If we use:
      //
      // markerElement.style.transform = "scale(...)"
      //
      // the marker can move/jump.
      // ----------------------------------------------------

      markerElement.style.width = "46px";

      markerElement.style.height = "46px";

      markerElement.style.display = "flex";

      markerElement.style.alignItems = "center";

      markerElement.style.justifyContent = "center";

      markerElement.style.cursor = "pointer";

      markerElement.style.padding = "0";

      markerElement.style.margin = "0";

      markerElement.style.border = "none";

      markerElement.style.background = "transparent";

      markerElement.style.outline = "none";

      // ====================================================
      // INNER ICON CONTAINER
      // ====================================================

      const iconElement = document.createElement("span");

      iconElement.style.width = "42px";

      iconElement.style.height = "42px";

      iconElement.style.borderRadius = "50%";

      iconElement.style.backgroundColor = "#1C2333";

      iconElement.style.border = "3px solid white";

      iconElement.style.boxShadow = "0 3px 10px rgba(0,0,0,0.25)";

      iconElement.style.display = "flex";

      iconElement.style.alignItems = "center";

      iconElement.style.justifyContent = "center";

      iconElement.style.transition = "transform 0.15s ease";

      // ====================================================
      // RENDER GiHomeGarage
      // ====================================================

      const iconRoot = createRoot(iconElement);

      iconRoot.render(<GiHomeGarage size={22} color="#ff7f11" />);

      // Add icon inside marker
      markerElement.appendChild(iconElement);

      // ====================================================
      // HOVER EFFECT
      // ====================================================
      //
      // Only iconElement scales.
      //
      // markerElement does NOT scale.
      //
      // So Mapbox position remains fixed.
      // ====================================================

      markerElement.addEventListener("mouseenter", () => {
        iconElement.style.transform = "scale(1.10)";
      });

      markerElement.addEventListener("mouseleave", () => {
        iconElement.style.transform = "scale(1)";
      });

      // ====================================================
      // CREATE POPUP
      // ====================================================

      const popup = createTechnicianPopup(technician);

      // ====================================================
      // CREATE MAPBOX MARKER
      // ====================================================

      const marker = new mapboxgl.Marker({
        element: markerElement,

        anchor: "center",
      })
        .setLngLat([longitude, latitude])
        .setPopup(popup)
        .addTo(map);

      // ====================================================
      // CLICK
      // ====================================================

      markerElement.addEventListener("click", (event) => {
        // Prevent unwanted map click behavior
        event.stopPropagation();

        console.log("Selected technician:", technician);

        setSelectedTechnician(technician);
      });

      // ====================================================
      // SAVE MARKER
      // ====================================================

      technicianMarkersRef.current.push(marker);
    });

    // --------------------------------------------------------
    // CLEANUP
    // --------------------------------------------------------

    return () => {
      clearTechnicianMarkers();
    };
  }, [technicians, mapReady, createTechnicianPopup, clearTechnicianMarkers]);

  // ==========================================================
  // REQUEST TECHNICIAN
  // ==========================================================

  const handleRequestTechnician = useCallback(() => {
    if (!selectedTechnician) {
      setError("Please select a technician first.");

      return;
    }

    console.log("Requesting technician:", selectedTechnician);

    console.log("User location:", location);

    alert(`Request sent to ${getShopName(selectedTechnician)}`);
  }, [selectedTechnician, location]);

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-theme">
      <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-5 sm:py-6 md:px-6 lg:px-8">
        {/* PAGE HEADER */}

        <div className="mb-5 sm:mb-6">
          <h1 className="text-xl font-bold text-[#1C2333] sm:text-2xl md:text-3xl">
            Find Technician
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Find nearby technicians and request roadside assistance.
          </p>
        </div>

        {/* MAIN CARD */}

        <div className="w-full overflow-hidden rounded-xl bg-white shadow-sm sm:rounded-2xl">
          {/* HEADER */}

          <div className="border-b border-gray-200 p-4 sm:p-5 md:p-6">
            <h2 className="text-base font-semibold text-[#1C2333] sm:text-lg">
              Find Nearby Technician
            </h2>

            <p className="mt-1 text-xs leading-5 text-gray-500 sm:text-sm">
              Allow your location and find available technicians near you.
            </p>
          </div>

          {/* ACTION BUTTONS */}

          <div className="border-b border-gray-200 p-4 sm:p-5 md:p-6">
            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
              {/* LOCATION */}

              <div className="w-full">
                <LocationPicker onLocationSelect={handleLocationSelect} />
              </div>

              {/* FIND TECHNICIAN */}

              <div className="w-full">
                <PrimaryButton
                  onClick={handleFindTechnician}
                  disabled={!location || isFetching}
                >
                  {isFetching ? "Finding..." : "Find Technician"}
                </PrimaryButton>
              </div>

              {/* REQUEST TECHNICIAN */}

              <div className="w-full">
                <PrimaryButton
                  onClick={handleRequestTechnician}
                  disabled={!selectedTechnician}
                >
                  Request a Technician
                </PrimaryButton>
              </div>
            </div>

            {/* ERROR */}

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}
          </div>

          {/* SELECTED TECHNICIAN */}

          {selectedTechnician && (
            <div className="border-b border-gray-200 bg-orange-50 p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Selected Technician
                  </p>

                  <h3 className="mt-1 flex items-center gap-2 text-base font-semibold text-[#1C2333]">
                    <GiHomeGarage className="text-[#ff7f11]" />

                    {getShopName(selectedTechnician)}
                  </h3>

                  <p className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                    <FiPhoneCall />

                    {selectedTechnician?.phone || "Phone not available"}
                  </p>

                  {getServicesText(selectedTechnician?.services) && (
                    <p className="mt-1 text-xs text-gray-500">
                      Services: {getServicesText(selectedTechnician?.services)}
                    </p>
                  )}
                </div>

                <div className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  Available
                </div>
              </div>
            </div>
          )}

          {/* MAP */}

          <div className="relative h-[300px] w-full overflow-hidden sm:h-[400px] md:h-[500px]">
            <div
              ref={mapContainerRef}
              className="absolute inset-0 h-full w-full"
            />
          </div>

          {/* LOCATION INFORMATION */}

          {location?.coordinates && (
            <div className="border-t border-gray-200 bg-gray-50 p-4 sm:p-5 md:p-6">
              <p className="flex items-start gap-2 break-words text-sm font-semibold leading-6 text-[#1C2333] sm:text-base">
                <SlLocationPin className="mt-1 shrink-0 text-[#ff7f11]" />

                <span>{location?.address || "Current Location"}</span>
              </p>

              {location?.place && (
                <p className="mt-1 text-xs text-gray-500">
                  Place: {location.place}
                </p>
              )}

              {location?.district && (
                <p className="text-xs text-gray-500">
                  District: {location.district}
                </p>
              )}

              <p className="mt-1 text-xs text-gray-500">
                Longitude: {location.coordinates[0]}
                {" | "}
                Latitude: {location.coordinates[1]}
              </p>
            </div>
          )}

          {/* TECHNICIAN LIST */}

          {technicians.length > 0 && (
            <div className="border-t border-gray-200 p-4 sm:p-5 md:p-6">
              <div className="mb-4">
                <h2 className="text-base font-semibold text-[#1C2333] sm:text-lg">
                  Nearby Technicians
                </h2>

                <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                  {technicians.length} technicians found
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {technicians.map((technician) => {
                  const technicianId = getTechnicianId(technician);

                  const shopName = getShopName(technician);

                  const phone = technician?.phone || "Phone not available";

                  const isSelected =
                    String(
                      selectedTechnician?._id || selectedTechnician?.id,
                    ) === String(technicianId);

                  const services = getServicesText(technician?.services);

                  return (
                    <button
                      key={technicianId}
                      type="button"
                      onClick={() => setSelectedTechnician(technician)}
                      className={`
                          w-full rounded-xl border p-4 text-left transition
                          ${
                            isSelected
                              ? "border-[#ff7f11] bg-orange-50"
                              : "border-gray-200 bg-white hover:border-[#ff7f11]"
                          }
                        `}
                    >
                      {/* TECHNICIAN HEADER */}

                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="flex items-center gap-2 font-semibold text-[#1C2333]">
                            <GiHomeGarage className="text-[#ff7f11]" />

                            {shopName}
                          </h3>

                          <p className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                            <FiPhoneCall />

                            {phone}
                          </p>
                        </div>

                        <span className="shrink-0 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                          Available
                        </span>
                      </div>

                      {/* DISTANCE */}

                      {technician?.distanceText && (
                        <p className="mt-2 flex items-center gap-1 text-xs font-medium text-[#ff7f11]">
                          <MdLocationPin className="shrink-0 text-base" />

                          <span>{technician.distanceText}</span>
                        </p>
                      )}

                      {/* SERVICES */}

                      {services && (
                        <p className="mt-2 text-xs text-gray-500">{services}</p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FindTechnician;
