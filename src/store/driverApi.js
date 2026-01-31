import { apiSlice } from "./apiSlice";

export const driverApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDrivers: builder.query({
      query: ({ page = 1, limit = 10, search = "" } = {}) => ({
        url: `/technicians?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`,
        method: "GET"
      }),
      providesTags: ["Driver"]
    }),
    getOnlineDrivers: builder.query({
      query: () => ({
        url: "/technicians?currentStatus=Online&applicationStatus=Approved&limit=100",
        method: "GET"
      }),
      providesTags: ["Driver"]
    }),
    createDriver: builder.mutation({
      query: (formData) => ({
        url: "/technicians",
        method: "POST",
        body: formData
      }),
      invalidatesTags: ["Driver"]
    }),
    updateDriver: builder.mutation({
      query: ({ id, formData }) => {
        // Append id to formData for backend processing
        formData.append('_driverId', id);
        return {
          url: `/technicians/${id}`,
          method: "PUT",
          body: formData
        };
      },
      invalidatesTags: ["Driver"]
    }),
    deleteDriver: builder.mutation({
      query: (id) => ({
        url: `/technicians/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Driver"]
    }),
    getDriverById: builder.query({
      query: (id) => ({
        url: `/technicians/${id}`,
        method: "GET"
      }),
      providesTags: ["Driver"]
    }),
    uploadDocuments: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/technicians/${id}/upload-documents`,
        method: "POST",
        body: formData,
        formData: true
      }),
      invalidatesTags: ["Driver"]
    }),
    getDriverPerformance: builder.query({
      query: (id) => ({
        url: `/technicians/${id}/performance`,
        method: "GET"
      }),
      providesTags: ["DriverPerformance"]
    }),
    getDriverStats: builder.query({
      query: (id) => ({
        url: `/technicians/${id}/stats`,
        method: "GET"
      }),
      providesTags: ["DriverStats"]
    }),
    getRecentDeliveries: builder.query({
      query: ({ id, limit = 10 }) => ({
        url: `/technicians/${id}/recent-jobs?limit=${limit}`,
        method: "GET"
      }),
      providesTags: ["DriverDeliveries"]
    }),
    getSettlements: builder.query({
      query: ({ id, limit = 10 }) => ({
        url: `/technicians/${id}/settlements?limit=${limit}`,
        method: "GET"
      }),
      providesTags: ["DriverSettlements"]
    }),
    settleBalance: builder.mutation({
      query: ({ id, amount, notes }) => ({
        url: `/technicians/${id}/settle-balance`,
        method: "POST",
        body: { amount, notes }
      }),
      invalidatesTags: ["DriverStats", "DriverSettlements", "Driver"]
    }),
    assignVehicle: builder.mutation({
      query: ({ id, vehicleId }) => ({
        url: `/technicians/${id}/assign-vehicle`,
        method: "PATCH",
        body: { vehicleId }
      }),
      invalidatesTags: ["Driver"]
    })
  })
});

export const {
  useGetDriversQuery,
  useGetOnlineDriversQuery,
  useCreateDriverMutation,
  useUpdateDriverMutation,
  useDeleteDriverMutation,
  useGetDriverByIdQuery,
  useUploadDocumentsMutation,
  useGetDriverPerformanceQuery,
  useGetDriverStatsQuery,
  useGetRecentDeliveriesQuery,
  useGetSettlementsQuery,
  useSettleBalanceMutation,
  useAssignVehicleMutation,
} = driverApi;