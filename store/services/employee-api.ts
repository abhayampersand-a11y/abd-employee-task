import { api } from "@/store/api";
import type { EmployeeDto, Paginated, StatsDto } from "@/lib/dto";

export const employeeApi = api.injectEndpoints({
  endpoints: (build) => ({
    employees: build.query<
      Paginated<EmployeeDto>,
      { status?: string; q?: string; page?: number; pageSize?: number } | void
    >({
      query: (args) => ({
        url: "/employees",
        params: Object.fromEntries(
          Object.entries(args ?? {}).filter(
            ([, value]) => value !== undefined && value !== "",
          ),
        ),
      }),
      providesTags: [{ type: "Employee", id: "LIST" }],
    }),

    createEmployee: build.mutation<
      { employee: EmployeeDto; employeeId: string; password: string },
      { firstName: string; lastName: string; email?: string }
    >({
      query: (body) => ({ url: "/employees", method: "POST", body }),
      invalidatesTags: [{ type: "Employee", id: "LIST" }, "Stats"],
    }),

    stats: build.query<StatsDto, void>({
      query: () => "/stats",
      providesTags: ["Stats"],
    }),
  }),
});

export const { useEmployeesQuery, useCreateEmployeeMutation, useStatsQuery } =
  employeeApi;
