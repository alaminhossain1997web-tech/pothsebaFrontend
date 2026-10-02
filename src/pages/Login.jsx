import React, { useState } from "react";
import PrimaryButton from "../components/ui/button/PrimaryButton";
import InputField from "../components/ui/input/InputField";
import { Link, useNavigate } from "react-router";
import { useLoginMutation } from "../services/Api";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setUser } from "../features/user/userSlice";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [login, { isLoading }] = useLoginMutation();

  // =========================
  // Input Change
  // =========================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // Login
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await login(formData).unwrap();

      console.log("Login response:", response);

      // =========================
      // Save Access Token
      // =========================

      localStorage.setItem(
        "accessToken",
        response.data.accessToken
      );

      // =========================
      // User Information
      // =========================

      const role = response.data.user.role;
      dispatch(setUser(response.data.user));

      const hasProfile =
        response.data.technicianProfile;

      console.log("User role:", role);
      console.log("Technician profile:", hasProfile);

      toast.success("Login successful! 🎉");

      // =========================
      // Role Based Navigation
      // =========================

      if (role === "Technician") {
        if (hasProfile) {
          // Technician profile already exists
          navigate("/technician_dashboard");
        } else {
          // New technician
          // Profile does not exist yet
          navigate("/technician-profile");
        }
      } else {
        // Rider / Driver
        navigate("/home");
      }

    } catch (error) {
      console.log("Login error:", error);

      toast.error(
        error?.data?.message ||
          "Something went wrong!"
      );
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8"
      style={{ backgroundColor: "#F7F6F2" }}
    >
      <div
        className="w-full max-w-md rounded-xl border bg-white p-6 shadow-lg sm:p-8"
        style={{ borderColor: "#1C2333" }}
      >
        {/* Logo */}
        <div className="mb-4 flex justify-center">
          <img
            src="/full_log.png"
            alt="PothSeba logo"
            className="h-auto w-full max-w-[250px] rounded-xl object-contain"
          />
        </div>

        {/* Title */}
        <h2
          className="mb-6 text-center text-2xl font-bold sm:text-3xl"
          style={{ color: "#1C2333" }}
        >
          Login
        </h2>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 sm:space-y-5"
        >
          {/* Email */}
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

          {/* Password */}
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

          {/* Submit Button */}
          <div className="pt-2">
            <PrimaryButton
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading
                ? "Logging in..."
                : "Login"}
            </PrimaryButton>
          </div>
        </form>

        {/* Registration */}
        <p
          className="mt-6 text-center text-sm"
          style={{ color: "#1C2333" }}
        >
          Don't have an account?{" "}
          <Link
            to="/registration"
            className="font-bold underline hover:opacity-80"
          >
            Registration
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
