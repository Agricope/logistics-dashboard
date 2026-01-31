import { apiSlice } from "./apiSlice";

export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getEarningsData: builder.query({
      query: (timeframe = "12months") => ({
        url: `/dashboard/earnings?timeframe=${timeframe}`,
        method: "GET"
      }),
      providesTags: ["Dashboard"]
    }),
    getJobCompletionData: builder.query({
      query: (timeframe = "12months") => ({
        url: `/dashboard/job-completion?timeframe=${timeframe}`,
        method: "GET"
      }),
      providesTags: ["Dashboard"]
    }),
    getAllDriversPerformance: builder.query({
      query: () => ({
        url: "/dashboard/driver-performance",
        method: "GET"
      }),
      providesTags: ["Dashboard"]
    }),
    getEarningsByDate: builder.query({
      query: (dateString) => {
        let formattedDate;
        if (!dateString) {
          const today = new Date();
          const year = today.getFullYear();
          const month = String(today.getMonth() + 1).padStart(2, '0');
          const day = String(today.getDate()).padStart(2, '0');
          formattedDate = `${year}-${month}-${day}`;
        } else if (dateString instanceof Date) {
          // Format as YYYY-MM-DD in local timezone
          const year = dateString.getFullYear();
          const month = String(dateString.getMonth() + 1).padStart(2, '0');
          const day = String(dateString.getDate()).padStart(2, '0');
          formattedDate = `${year}-${month}-${day}`;
        } else {
          // It's already a string (ISO format), extract just the date part
          formattedDate = dateString.split('T')[0];
        }
        return {
          url: `/dashboard/earnings-by-date?date=${formattedDate}`,
          method: "GET"
        };
      },
      providesTags: ["Dashboard"]
    })
  })
});

export const {
  useGetEarningsDataQuery,
  useGetJobCompletionDataQuery,
  useGetAllDriversPerformanceQuery,
  useGetEarningsByDateQuery
} = dashboardApi;
