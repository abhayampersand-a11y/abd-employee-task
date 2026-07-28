import { api } from "@/store/api";
import type {
  Paginated,
  TaskDto,
  TaskPriority,
  TaskScope,
  TaskStatus,
} from "@/lib/dto";

export type TaskListArgs = {
  scope: TaskScope;
  status?: TaskStatus | "ALL";
  priority?: TaskPriority | "ALL";
  assigneeId?: string | "ALL";
  q?: string;
  page?: number;
  pageSize?: number;
};

export const taskApi = api.injectEndpoints({
  endpoints: (build) => ({
    tasks: build.query<Paginated<TaskDto>, TaskListArgs>({
      query: (args) => ({
        url: "/tasks",
        params: Object.fromEntries(
          Object.entries(args).filter(
            ([, value]) => value !== undefined && value !== "",
          ),
        ),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: "Task" as const, id })),
              { type: "Task" as const, id: "LIST" },
            ]
          : [{ type: "Task" as const, id: "LIST" }],
    }),

    createTask: build.mutation<
      TaskDto,
      {
        title: string;
        description?: string | null;
        category?: string | null;
        assigneeId: string;
        priority: TaskPriority;
        dueDate?: string | null;
      }
    >({
      query: (body) => ({ url: "/tasks", method: "POST", body }),
      invalidatesTags: [{ type: "Task", id: "LIST" }, "Stats"],
    }),

    updateTask: build.mutation<
      TaskDto,
      { id: string } & Partial<{
        title: string;
        description: string | null;
        category: string | null;
        assigneeId: string;
        priority: TaskPriority;
        status: TaskStatus;
        dueDate: string | null;
      }>
    >({
      query: ({ id, ...body }) => ({
        url: `/tasks/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, _error, { id }) => [
        { type: "Task", id },
        { type: "Task", id: "LIST" },
        "Stats",
      ],
      /**
       * Move the card immediately, roll back if the server disagrees.
       * Without this, dragging on the board feels broken on a slow network.
       */
      async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled, getState }) {
        const entries = taskApi.util.selectInvalidatedBy(getState(), [
          { type: "Task", id: "LIST" },
        ]);

        const undo = entries
          .filter((entry) => entry.endpointName === "tasks")
          .map((entry) =>
            dispatch(
              taskApi.util.updateQueryData(
                "tasks",
                entry.originalArgs as TaskListArgs,
                (draft) => {
                  const task = draft.items.find((item) => item.id === id);
                  if (task) Object.assign(task, patch);
                },
              ),
            ),
          );

        try {
          await queryFulfilled;
        } catch {
          undo.forEach((patchResult) => patchResult.undo());
        }
      },
    }),

    deleteTask: build.mutation<{ ok: true }, string>({
      query: (id) => ({ url: `/tasks/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Task", id: "LIST" }, "Stats"],
    }),
  }),
});

export const {
  useTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = taskApi;
