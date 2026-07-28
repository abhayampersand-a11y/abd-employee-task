import { api } from "@/store/api";
import type { CompanyDto } from "@/lib/dto";

export const companyApi = api.injectEndpoints({
  endpoints: (build) => ({
    company: build.query<CompanyDto, void>({
      query: () => "/company",
      providesTags: ["Company"],
    }),

    updateCompany: build.mutation<CompanyDto, Partial<CompanyDto>>({
      query: (body) => ({ url: "/company", method: "PATCH", body }),
      invalidatesTags: ["Company", "Me"],
    }),
  }),
});

export const { useCompanyQuery, useUpdateCompanyMutation } = companyApi;
