import React, { useState } from "react";
import PrimaryButton from "../components/ui/button/PrimaryButton";
import InputField from "../components/ui/input/InputField";
import SelectField from "../components/ui/selectField/SelectField";
import { useRegistrationMutation } from "../services/Api";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router";

const Registration = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const [registration, { isLoading, isError, error }] =
    useRegistrationMutation();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await registration(formData).unwrap();

      toast.success("Account created successfully! 🎉");
       {/* navigate  login page */}
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      toast.error(error?.data?.message || "Something went wrong!");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8"
      style={{ backgroundColor: "#F7F6F2" }}
    >
      <div
        className="w-full max-w-md p-6 sm:p-8 bg-white rounded-xl shadow-lg border"
        style={{ borderColor: "#1C2333" }}
      >
        <div className="flex justify-center mb-4">
          <img
            src="/full_log.png"
            alt="logo"
            className="w-full max-w-[250px] h-auto object-contain rounded-xl"
            style={{ borderColor: "#1C2333" }}
          />
        </div>

        <h2
          className="text-2xl sm:text-3xl font-bold text-center mb-6"
          style={{ color: "#1C2333" }}
        >
          Create an Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Full Name Field */}
          <div>
            <InputField
              label="Name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
              required
            />
          </div>

          {/* Email Field */}
          <div>
            <InputField
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="@gmail.com"
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <InputField
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          {/* Role Field */}
          <div>
            <SelectField
              label="Select Role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              options={[
                {
                  value: "Technician",
                  label: "Technician",
                },
                {
                  value: "Rider",
                  label: "Rider",
                },
              ]}
              placeholder="Choose your role"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <PrimaryButton
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {/* disable button after registration form submitted*/}
              {isLoading ? "Registering..." : "Register"}
            </PrimaryButton>
          </div>
        </form>
        {/* 

        {/* showing error message from backend*/}
        {isError && error?.data?.message && (
          <p className="text-red-500 text-sm font-medium mt-1">
            {error.data.message}
          </p>
        )}

        <p className="text-center text-sm mt-6" style={{ color: "#1C2333" }}>
          Already have an account?{" "}
          <Link to="/login" className="font-bold underline hover:opacity-80">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Registration;
