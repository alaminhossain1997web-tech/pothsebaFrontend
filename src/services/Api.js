import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const API_BASE_URL = "https://pothdeba-backend.onrender.com";

export const Api = createApi({
  reducerPath: "api",
  tagTypes: [
    "TechnicianRequests",
    "RiderRequests",
    "MyPumps",
    "Pump",
    "PumpDetails",
    "AdminPumps",
    "AdminTechnicians",
    "AdminAreas",
    "AdminZones",
    "AdminAreaHierarchy",
    "AdminServices",
    "AdminUsers",
    "AdminReviews",
  ],

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
      providesTags: ["AdminServices"],
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
      invalidatesTags: (result, error) =>
        !error && result?.success !== false ? ["RiderRequests"] : [],
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

    getRiderRequests: build.query({
      query: () => ({
        url: "/api/v1/request/my-requests",
        method: "GET",
      }),
      providesTags: ["RiderRequests"],
    }),

    updateRequestStatus: build.mutation({
      query: ({ requestId, status }) => ({
        url: `/api/v1/request/${encodeURIComponent(requestId)}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error) =>
        !error && result?.success !== false
          ? ["TechnicianRequests", "RiderRequests"]
          : [],
    }),
    createPump: build.mutation({
      query: (body) => ({ url: "/api/v1/pump/create", method: "POST", body }),
      invalidatesTags: (result, error) =>
        !error && result?.success !== false ? ["MyPumps"] : [],
    }),
    getMyPumps: build.query({
      query: (params = {}) => ({
        url: "/api/v1/pump/my_pumps",
        params: { page: 1, limit: 10, ...params },
      }),
      providesTags: ["MyPumps"],
    }),
    getPumpReviews: build.query({
      query: (pumpId) => ({
        url: `/api/v1/pump/${encodeURIComponent(pumpId)}/reviews`,
        method: "GET",
      }),
      providesTags: (_result, _error, pumpId) => [{ type: "Pump", id: pumpId }],
    }),
    updateMyPump: build.mutation({
      query: ({ pumpId, ...body }) => ({
        url: `/api/v1/pump/my_pumps/${encodeURIComponent(pumpId)}/update`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error) =>
        !error && result?.success !== false
          ? ["MyPumps", "Pump", "PumpDetails"]
          : [],
    }),
    updateMyPumpStatus: build.mutation({
      query: ({ pumpId, isOpen }) => ({
        url: `/api/v1/pump/my_pumps/${encodeURIComponent(pumpId)}/status`,
        method: "PATCH",
        body: { isOpen },
      }),
      invalidatesTags: (result, error) =>
        !error && result?.success !== false
          ? ["MyPumps", "Pump", "PumpDetails"]
          : [],
    }),
    updateMyPumpFuels: build.mutation({
      query: ({ pumpId, fuels }) => ({
        url: `/api/v1/pump/my_pumps/${encodeURIComponent(pumpId)}/fuels`,
        method: "PATCH",
        body: { fuels },
      }),
      invalidatesTags: (result, error) =>
        !error && result?.success !== false
          ? ["MyPumps", "Pump", "PumpDetails"]
          : [],
    }),
    submitPumpReview: build.mutation({
      query: ({ pumpId, ...body }) => ({
        url: `/api/v1/pump/${encodeURIComponent(pumpId)}/review`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { pumpId }) => [
        { type: "Pump", id: pumpId },
      ],
    }),
    deletePumpReview: build.mutation({
      query: ({ pumpId }) => ({
        url: `/api/v1/pump/${encodeURIComponent(pumpId)}/review`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { pumpId }) => [
        { type: "Pump", id: pumpId },
      ],
    }),
    // Admin endpoints use this same API slice and bearer token configuration.
    getAdminPumps: build.query({
      query: ({ approvalStatus, search, page = 1, limit = 10 } = {}) => ({
        url: "/api/v1/admin/pump/all_pumps",
        params: { approvalStatus, search: search || undefined, page, limit },
      }),
      providesTags: ["AdminPumps"],
    }),
    getAdminPump: build.query({
      query: (id) =>
        `/api/v1/admin/pump/selected_pump/${encodeURIComponent(id)}`,
      providesTags: (_result, _error, id) => [{ type: "AdminPumps", id }],
    }),
    approveAdminPump: build.mutation({
      query: (id) => ({
        url: `/api/v1/admin/pump/approve/${encodeURIComponent(id)}`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error) =>
        !error && result?.success !== false ? ["AdminPumps"] : [],
    }),
    rejectAdminPump: build.mutation({
      query: ({ id, reason }) => ({
        url: `/api/v1/admin/pump/reject/${encodeURIComponent(id)}`,
        method: "PATCH",
        body: { reason },
      }),
      invalidatesTags: (result, error) =>
        !error && result?.success !== false ? ["AdminPumps"] : [],
    }),
    approvePendingTechnician: build.mutation({
      query: (id) => ({
        url: `/api/v1/admin/pending_technician/${encodeURIComponent(id)}/approve`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error) =>
        !error && result?.success !== false ? ["AdminTechnicians"] : [],
    }),
    rejectPendingTechnician: build.mutation({
      query: (technicianId) => ({
        url: `/api/v1/admin/pending_technician/${encodeURIComponent(technicianId)}/reject`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error) =>
        !error && result?.success !== false ? ["AdminTechnicians"] : [],
    }),
    updatePendingTechnician: build.mutation({
      query: ({ technicianId, ...body }) => ({
        url: `/api/v1/admin/pending_technician/${encodeURIComponent(technicianId)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error) =>
        !error && result?.success !== false ? ["AdminTechnicians"] : [],
    }),
    getPendingTechnicians: build.query({
      query: () => {
        const url = "/api/v1/admin/pending_technician/all";
        return {
          url,
          method: "GET",
          responseHandler: async (response) => {
          const body = await response.text();
          const contentType = response.headers.get("content-type") || "";
          if (contentType.includes("application/json")) return JSON.parse(body);
          if (body.trimStart().startsWith("<")) {
            throw new Error(`Pending technicians API returned HTML instead of JSON (HTTP ${response.status}). Check the deployed backend route and API URL.`);
          }
          try {
            return JSON.parse(body);
          } catch {
            throw new Error(`Pending technicians API returned an invalid response (HTTP ${response.status}).`);
          }
          },
        };
      },
      transformResponse: (response) => {
        const lists = [
          response?.data,
          response?.technicians,
          response?.pendingTechnicians,
          response?.data?.technicians,
          response?.data?.pendingTechnicians,
          response?.items,
          response?.results,
        ];
        return { ...response, data: lists.find(Array.isArray) || [] };
      },
      providesTags: ["AdminTechnicians"],
    }),
    getApprovedTechnicians: build.query({
      query: () => ({
        url: "/api/v1/admin/list/approvedtechnicians",
        method: "GET",
      }),
      providesTags: ["AdminTechnicians"],
    }),
    getRejectedTechnicians: build.query({
      query: () => ({
        url: "/api/v1/admin/list/rejecttechnicians",
        method: "GET",
      }),
      providesTags: ["AdminTechnicians"],
    }),
    searchAdminUser: build.query({
      query: (email) => ({
        url: "/api/v1/admin/role/search",
        params: { email },
      }),
      providesTags: ["AdminUsers"],
    }),
    updateAdminUserRole: build.mutation({
      query: ({ userId, body }) => ({
        url: `/api/v1/admin/role/update/${encodeURIComponent(userId)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error) =>
        !error && result?.success !== false ? ["AdminUsers"] : [],
    }),
    getAdminRoleHistory: build.query({
      query: ({ userId, page = 1, limit = 10 }) => ({
        url: `/api/v1/admin/role/history/${encodeURIComponent(userId)}`,
        params: { page, limit },
      }),
      providesTags: (_result, _error, { userId }) => ["AdminUsers",
        { type: "AdminUsers", id: `history-${userId}` },
      ],
    }),
    getAdminAreas: build.query({
      query: (params = {}) => ({
        url: "/api/v1/admin/area/all_areas",
        params: { page: 1, limit: 10, ...params },
      }),
      providesTags: ["AdminAreas"],
    }),
    getAdminArea: build.query({
      query: (id) =>
        `/api/v1/admin/area/selected_area/${encodeURIComponent(id)}`,
      providesTags: (_result, _error, id) => [{ type: "AdminAreas", id }],
    }),
    getAdminZones: build.query({
      query: (params = {}) => ({
        url: "/api/v1/admin/area/all_areas",
        params: { type: "Zone", page: 1, limit: 100, ...params },
      }),
      providesTags: ["AdminZones"],
    }),
    getAdminZoneWards: build.query({
      query: (zoneId) =>
        `/api/v1/admin/area/zones/${encodeURIComponent(zoneId)}/wards`,
      providesTags: (_result, _error, zoneId) => [
        { type: "AdminZones", id: zoneId },
      ],
    }),
    getAdminAreaHierarchy: build.query({
      query: () => "/api/v1/admin/area/hierarchy",
      providesTags: ["AdminAreaHierarchy"],
    }),
    getAdminAreaChildren: build.query({
      query: (areaId) =>
        `/api/v1/admin/area/${encodeURIComponent(areaId)}/children`,
      providesTags: (_result, _error, areaId) => [
        { type: "AdminAreas", id: areaId },
      ],
    }),
    findAdminAreaByLocation: build.mutation({
      query: (body) => ({
        url: "/api/v1/admin/area/find-by-location",
        method: "POST",
        body,
      }),
    }),
    createAdminArea: build.mutation({
      query: (body) => ({
        url: "/api/v1/admin/area/create",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error) =>
        !error && result?.success !== false
          ? ["AdminAreas", "AdminZones", "AdminAreaHierarchy"]
          : [],
    }),
    updateAdminArea: build.mutation({
      query: ({ areaId, ...body }) => ({
        url: `/api/v1/admin/area/update_areas/${encodeURIComponent(areaId)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error) =>
        !error && result?.success !== false
          ? ["AdminAreas", "AdminZones", "AdminAreaHierarchy"]
          : [],
    }),
    updateAdminAreaStatus: build.mutation({
      query: ({ areaId, ...body }) => ({
        url: `/api/v1/admin/area/${encodeURIComponent(areaId)}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error) =>
        !error && result?.success !== false
          ? ["AdminAreas", "AdminZones", "AdminAreaHierarchy"]
          : [],
    }),
    deleteAdminArea: build.mutation({
      query: (areaId) => ({
        url: `/api/v1/admin/area/${encodeURIComponent(areaId)}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error) =>
        !error && result?.success !== false
          ? ["AdminAreas", "AdminZones", "AdminAreaHierarchy"]
          : [],
    }),
    createAdminService: build.mutation({
      query: (body) => ({
        url: "/api/v1/admin/services/createService",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error) =>
        !error && result?.success !== false ? ["AdminServices"] : [],
    }),
    hideAdminReview: build.mutation({
      query: (id) => ({
        url: `/api/v1/admin/review/${encodeURIComponent(id)}/hide`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error) =>
        !error && result?.success !== false ? ["AdminReviews", "AdminPumps"] : [],
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
  useGetRiderRequestsQuery,
  useUpdateRequestStatusMutation,
  useCreatePumpMutation,
  useGetMyPumpsQuery,
  useGetPumpReviewsQuery,
  useUpdateMyPumpMutation,
  useUpdateMyPumpStatusMutation,
  useUpdateMyPumpFuelsMutation,
  useSubmitPumpReviewMutation,
  useDeletePumpReviewMutation,
  useGetAdminPumpsQuery,
  useGetAdminPumpQuery,
  useApproveAdminPumpMutation,
  useRejectAdminPumpMutation,
  useApprovePendingTechnicianMutation,
  useRejectPendingTechnicianMutation,
  useUpdatePendingTechnicianMutation,
  useGetPendingTechniciansQuery,
  useGetApprovedTechniciansQuery,
  useGetRejectedTechniciansQuery,
  useLazySearchAdminUserQuery,
  useUpdateAdminUserRoleMutation,
  useGetAdminRoleHistoryQuery,
  useGetAdminAreasQuery,
  useGetAdminAreaQuery,
  useGetAdminZonesQuery,
  useGetAdminZoneWardsQuery,
  useGetAdminAreaHierarchyQuery,
  useGetAdminAreaChildrenQuery,
  useFindAdminAreaByLocationMutation,
  useCreateAdminAreaMutation,
  useUpdateAdminAreaMutation,
  useUpdateAdminAreaStatusMutation,
  useDeleteAdminAreaMutation,
  useCreateAdminServiceMutation,
  useHideAdminReviewMutation,
} = Api;
