import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { TaskPriority, TaskStatus } from "@/lib/dto";

/**
 * UI-only state. Server data lives in RTK Query's cache and must never be
 * copied in here.
 */
type UiState = {
  mobileNavOpen: boolean;
  createTaskOpen: boolean;
  addEmployeeOpen: boolean;
  taskFilters: {
    q: string;
    status: TaskStatus | "ALL";
    priority: TaskPriority | "ALL";
    assigneeId: string | "ALL";
  };
};

const initialState: UiState = {
  mobileNavOpen: false,
  createTaskOpen: false,
  addEmployeeOpen: false,
  taskFilters: { q: "", status: "ALL", priority: "ALL", assigneeId: "ALL" },
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setMobileNavOpen(state, action: PayloadAction<boolean>) {
      state.mobileNavOpen = action.payload;
    },
    setCreateTaskOpen(state, action: PayloadAction<boolean>) {
      state.createTaskOpen = action.payload;
    },
    setAddEmployeeOpen(state, action: PayloadAction<boolean>) {
      state.addEmployeeOpen = action.payload;
    },
    setTaskFilter(
      state,
      action: PayloadAction<Partial<UiState["taskFilters"]>>,
    ) {
      state.taskFilters = { ...state.taskFilters, ...action.payload };
    },
    resetTaskFilters(state) {
      state.taskFilters = initialState.taskFilters;
    },
  },
});

export const {
  setMobileNavOpen,
  setCreateTaskOpen,
  setAddEmployeeOpen,
  setTaskFilter,
  resetTaskFilters,
} = uiSlice.actions;

export const uiReducer = uiSlice.reducer;
