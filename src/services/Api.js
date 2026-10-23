import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const API_BASE_URL = "https://pothdeba-backend.onrender.com";

export const Api = createApi({
  reducerPath: "api",
  tagTypes: ["TechnicianRequests"],

  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,

    // Login stores the access token in localStorage. Send it with protected
    // endpoints such as findTechnician.
    prepareHeaders: (headers) => {
      const accessToken = localStorage.getItem("accessToken");

      if (accessToken) {
        headers.set("authorization", `Bearer ${accessToken}`);
      }

      return headers;
    },

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
    // Logout
    // ==========================================
    logout: build.mutation({
      query: () => ({
        url: "/api/v1/auth/logout",
        method: "POST",
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
    // technician status
    // ==========================================
    updateTechnicianStatus: build.mutation({
      query: (isOnline) => ({
        url: "/api/v1/technician/status",
        method: "PATCH",
        body: { isOnline },
      }),
    }),

    // ==========================================
    // Get All Services
    // ==========================================
    services: build.query({
      query: () => ({
        url: "/api/v1/allservice/getallService",
        method: "GET",
      }),
    }),

    // ==========================================
    // Find all technician
    // ==========================================
    // ==========================================
    // Find Nearby Technicians
    // ==========================================
    findTechnician: build.query({
      query: ({ longitude, latitude }) => ({
        url: "/api/v1/request/findTechnician",
        method: "GET",
        params: {
          longitude,
          latitude,
        },
      }),
    }),

    // ==========================================
    //  Send a requet to tecnichian
    // ==========================================

    createRequest: build.mutation({
      query: (requestData) => ({
        url: "/api/v1/request/createRequest",
        method: "POST",
        body: requestData,
      }),
    }),
    // ==========================================
    //  get request from driver
    // ==========================================
    getTechnicianRequests: build.query({
      query: () => ({
        url: "/api/v1/request/getrequest",
        method: "GET",
      }),
      providesTags: ["TechnicianRequests"],
    }),
    updateRequestStatus: build.mutation({
      query: ({ requestId, status }) => ({
        url: `/api/v1/request/${encodeURIComponent(requestId)}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error) =>
        !error && result?.success !== false ? ["TechnicianRequests"] : [],
    }),
    // ==========================================
    //
    // ==========================================
  }),
});

export const {
  useRegistrationMutation,
  useLoginMutation,
  useServicesQuery,
  useTecnicianProileMutation,
  useUpdateTechnicianStatusMutation,
  useLogoutMutation,
  useLazyFindTechnicianQuery,
  useCreateRequestMutation,
  useGetTechnicianRequestsQuery,
  useUpdateRequestStatusMutation,
} = Api;
