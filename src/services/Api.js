import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const Api = createApi({
  reducerPath: "api",

  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8000",

    // ==========================================
    // Send Cookies With Every Request
    // ==========================================
    credentials: "include",
  }),

  endpoints: (build) => ({
    // ==========================================
    // Registration
    // ==========================================
    registration: build.mutation({
      query: (data) => ({
        url: "/api/v1/auth/registration",
        method: "POST",
        body: data,
      }),
    }),

    // ==========================================
    // Login
    // ==========================================
    login: build.mutation({
      query: (data) => ({
        url: "/api/v1/auth/login",
        method: "POST",
        body: data,
      }),
    }),

    // ==========================================
    // Technician Profile
    // ==========================================
    tecnicianProile: build.mutation({
      query: (data) => ({
        url: "/api/v1/create-profile/tecnicianprofile",
        method: "POST",
        body: data,
      }),
    }),

    // ==========================================
    // Get All Services
    // ==========================================
    services: build.query({
      query: () => ({
        url: "/api/v1/admin/services/getallService",
        method: "GET",
      }),
    }),

    // ==========================================
    // Logout
    // ==========================================
    logout: build.mutation({
      query: () => ({
        url: "/api/v1/auth/logout",
        method: "POST",
      }),
    }),
  }),
});

// ==========================================
// Hooks
// ==========================================

export const {
  useRegistrationMutation,
  useLoginMutation,
  useServicesQuery,
  useTecnicianProileMutation,
  useLogoutMutation,
} = Api;