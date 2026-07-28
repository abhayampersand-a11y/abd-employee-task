import { api } from "@/store/api";
import type { CompanyDto, MeDto } from "@/lib/dto";

export const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    me: build.query<MeDto, void>({
      query: () => "/auth/me",
      providesTags: ["Me"],
    }),

    signup: build.mutation<
      MeDto,
      { firstName: string; lastName: string; email: string; password: string }
    >({
      query: (body) => ({ url: "/auth/signup", method: "POST", body }),
      invalidatesTags: ["Me"],
    }),

    login: build.mutation<MeDto, { identifier: string; password: string }>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      // A different person may be signing in — drop every cached response.
      invalidatesTags: ["Me", "Company", "Employee", "Task", "Stats"],
    }),

    logout: build.mutation<{ ok: true }, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      invalidatesTags: ["Me", "Company", "Employee", "Task", "Stats"],
    }),

    changePassword: build.mutation<
      { ok: true },
      { currentPassword: string; newPassword: string }
    >({
      query: (body) => ({ url: "/auth/change-password", method: "POST", body }),
      invalidatesTags: ["Me"],
    }),

    createCompany: build.mutation<
      CompanyDto,
      {
        name: string;
        industry?: string | null;
        size?: string | null;
        phone?: string | null;
        address?: string | null;
      }
    >({
      query: (body) => ({ url: "/company", method: "POST", body }),
      invalidatesTags: ["Me", "Company"],
    }),
  }),
});

export const {
  useMeQuery,
  useSignupMutation,
  useLoginMutation,
  useLogoutMutation,
  useChangePasswordMutation,
  useCreateCompanyMutation,
} = authApi;
