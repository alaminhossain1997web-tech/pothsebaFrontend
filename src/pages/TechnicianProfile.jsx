import React, { useState } from "react";
import { useNavigate } from "react-router";

import PrimaryButton from "../components/ui/button/PrimaryButton";
import InputField from "../components/ui/input/InputField";
import ServiceSelect from "../components/ServiceSelect";
import LocationPicker from "../components/LocationPicker";
import { useTecnicianProileMutation } from "../services/Api";
import toast from "react-hot-toast";

const TechnicianProfile = () => {
  const [technicianProfile, { isLoading }] = useTecnicianProileMutation();

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    shopname: "",
    phone: "",
    location: {
      type: "Point",
      coordinates: [],
    },
    services: [],
  });

  // =========================
  // Input Change
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // Location
  // =========================
  const handleLocation = (locationData) => {
    console.log("Location Data From Picker:", locationData);

    setFormData((prev) => ({
      ...prev,
      location: {
        type: "Point",
        coordinates: locationData.coordinates,
      },
    }));
  };

  // =========================
  // Services
  // =========================
  const handleServices = (services) => {
    console.log("Selected Services:", services);

    setFormData((prev) => ({
      ...prev,
      services: services,
    }));
  };

  // =========================
  // Submit
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("================================");
    console.log("FORM DATA:", formData);
    console.log("SERVICES:", formData.services);
    console.log("LOCATION:", formData.location);
    console.log("================================");

    // Frontend validation
    if (formData.services.length === 0) {
      toast.error("Please select at least one service");
      return;
    }

    if (
      !formData.location.coordinates ||
      formData.location.coordinates.length !== 2
    ) {
      toast.error("Please select your location");
      return;
    }

    try {
      const response = await technicianProfile(formData).unwrap();

      console.log("Technician Profile Response:", response);

      toast.success("Technician profile created successfully!");

      navigate("/technician_dashboard");
    } catch (error) {
      console.log("Technician Profile Error:", error);

      const message = error?.data?.message;

      if (typeof message === "object") {
        toast.error(
          message.services ||
            message.shopname ||
            message.phone ||
            message.location ||
            "Please check your information",
        );
      } else {
        toast.error(message || "Failed to create technician profile");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md rounded-xl border border-secondary bg-white p-6 shadow-lg sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Location */}
          <div className="p-5">
            <LocationPicker onLocationSelect={handleLocation} />
          </div>

          {/* Shop Name */}
          <InputField
            label="Shop Name:"
            type="text"
            name="shopname"
            value={formData.shopname}
            onChange={handleChange}
            placeholder="Enter your shop name"
            required
          />

          {/* Phone */}
          <InputField
            label="Phone:"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter your contact number"
            required
          />

          {/* Services */}
          <div>
            <ServiceSelect
              value={formData.services}
              onChange={handleServices}
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <PrimaryButton
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Creating Profile..." : "Submit"}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TechnicianProfile;
