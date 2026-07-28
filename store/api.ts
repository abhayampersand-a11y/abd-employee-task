import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/**
 * The single RTK Query API. Feature slices attach to it with
 * `api.injectEndpoints(...)` — never create a second createApi.
 */
export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    // Session lives in an httpOnly cookie, so it must ride along.
    credentials: "include",
  }),
  tagTypes: ["Me", "Company", "Employee", "Task", "Stats"],
  endpoints: () => ({}),
});
