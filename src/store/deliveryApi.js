import { apiSlice } from "./apiSlice";

export const deliveryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDeliveries: builder.query({
      query: ({ page = 1, limit = 10, search = "", status } = {}) => {
        let url = `/jobs?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;
        if (status) {
          url += `&status=${encodeURIComponent(status)}`;
        }
        return {
          url,
          method: "GET"
        };
      },
      providesTags: ["Delivery"]
    }),
    createDelivery: builder.mutation({
      query: (body) => ({
        url: "/jobs",
        method: "POST",
        body
      }),
      invalidatesTags: ["Delivery"]
    }),
    updateDelivery: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/jobs/${id}`,
        method: "PUT",
        body
      }),
      invalidatesTags: ["Delivery"]
    }),
    deleteDelivery: builder.mutation({
      query: (id) => ({
        url: `/jobs/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Delivery"]
    }),
    getDeliveryById: builder.query({
      query: (id) => ({
        url: `/jobs/${id}`,
        method: "GET"
      }),
      providesTags: ["Delivery"]
    }),
    getDeliveryRepairs: builder.query({
      query: (deliveryId) => ({
        url: `/jobs/${deliveryId}/repairs`,
        method: "GET"
      }),
      providesTags: ["Repair"]
    }),
    getDeliveryTypes: builder.query({
      query: () => ({
        url: "/job-types",
        method: "GET"
      })
    })
  })
});

export const {
  useGetDeliveriesQuery,
  useCreateDeliveryMutation,
  useUpdateDeliveryMutation,
  useDeleteDeliveryMutation,
  useGetDeliveryByIdQuery,
  useGetDeliveryRepairsQuery,
  useGetDeliveryTypesQuery
} = deliveryApi;
