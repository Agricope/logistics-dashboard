import { apiSlice } from "./apiSlice";

export const technicianApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTechnicians: builder.query({
      query: ({ page = 1, limit = 10, search = "" } = {}) => ({
        url: `/technicians?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`,
        method: "GET"
      }),
      providesTags: ["Technician"]
    }),
    getOnlineTechnicians: builder.query({
      query: () => ({
        url: "/technicians?currentStatus=Online&applicationStatus=Approved&limit=100",
        method: "GET"
      }),
      providesTags: ["Technician"]
    }),
    createTechnician: builder.mutation({
      query: (formData) => ({
        url: "/technicians",
        method: "POST",
        body: formData
      }),
      invalidatesTags: ["Technician"]
    }),
    updateTechnician: builder.mutation({
      query: ({ id, formData }) => {
        // Append id to formData for backend processing
        formData.append('_technicianId', id);
        return {
          url: `/technicians/${id}`,
          method: "PUT",
          body: formData
        };
      },
      invalidatesTags: ["Technician"]
    }),
    deleteTechnician: builder.mutation({
      query: (id) => ({
        url: `/technicians/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Technician"]
    }),
    getTechnicianById: builder.query({
      query: (id) => ({
        url: `/technicians/${id}`,
        method: "GET"
      }),
      providesTags: ["Technician"]
    }),
    uploadDocuments: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/technicians/${id}/upload-documents`,
        method: "POST",
        body: formData,
        formData: true
      }),
      invalidatesTags: ["Technician"]
    }),
    getTechnicianPerformance: builder.query({
      query: (id) => ({
        url: `/technicians/${id}/performance`,
        method: "GET"
      }),
      providesTags: ["TechnicianPerformance"]
    }),
    getTechnicianStats: builder.query({
      query: (id) => ({
        url: `/technicians/${id}/stats`,
        method: "GET"
      }),
      providesTags: ["TechnicianStats"]
    }),
    getRecentJobs: builder.query({
      query: ({ id, limit = 10 }) => ({
        url: `/technicians/${id}/recent-jobs?limit=${limit}`,
        method: "GET"
      }),
      providesTags: ["TechnicianJobs"]
    }),
    getSettlements: builder.query({
      query: ({ id, limit = 10 }) => ({
        url: `/technicians/${id}/settlements?limit=${limit}`,
        method: "GET"
      }),
      providesTags: ["TechnicianSettlements"]
    }),
    settleBalance: builder.mutation({
      query: ({ id, amount, notes }) => ({
        url: `/technicians/${id}/settle-balance`,
        method: "POST",
        body: { amount, notes }
      }),
      invalidatesTags: ["TechnicianStats", "TechnicianSettlements", "Technician"]
    }),
    assignVehicle: builder.mutation({
      query: ({ id, vehicleId }) => ({
        url: `/technicians/${id}/assign-vehicle`,
        method: "PATCH",
        body: { vehicleId }
      }),
      invalidatesTags: ["Technician"]
    })
  })
});

export const {
  useGetTechniciansQuery,
  useGetOnlineTechniciansQuery,
  useCreateTechnicianMutation,
  useUpdateTechnicianMutation,
  useDeleteTechnicianMutation,
  useGetTechnicianByIdQuery,
  useUploadDocumentsMutation,
  useGetTechnicianPerformanceQuery,
  useGetTechnicianStatsQuery,
  useGetRecentJobsQuery,
  useGetSettlementsQuery,
  useSettleBalanceMutation,
  useAssignVehicleMutation,
} = technicianApi;