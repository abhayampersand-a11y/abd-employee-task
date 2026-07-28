/**
 * Shapes the API returns. Kept separate from Prisma models so nothing
 * sensitive (password hashes, token hashes) can leak by accident, and so the
 * client has one stable contract to type against.
 */

export type Role = "ADMIN" | "EMPLOYEE";
export type UserStatus = "INVITED" | "ACTIVE" | "DISABLED";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
export type TaskScope = "mine" | "created" | "all";

export type PersonDto = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatarTone: string;
};

export type UserDto = PersonDto & {
  email: string;
  employeeId: string | null;
  role: Role;
  status: UserStatus;
  mustChangePassword: boolean;
};

export type CompanyDto = {
  id: string;
  name: string;
  industry: string | null;
  size: string | null;
  phone: string | null;
  address: string | null;
  logoUrl: string | null;
};

export type MeDto = {
  user: UserDto;
  company: CompanyDto | null;
};

export type TaskDto = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  assignee: PersonDto;
  createdBy: PersonDto;
  /** Computed server-side so the UI never has to re-derive permissions. */
  can: { edit: boolean; changeStatus: boolean; delete: boolean };
};

export type EmployeeDto = UserDto & {
  taskCount: number;
  joined: string;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type AdminStatsDto = {
  kind: "admin";
  totalEmployees: number;
  totalTasks: number;
  inProgress: number;
  completed: number;
  overdue: number;
  byStatus: { todo: number; inProgress: number; done: number };
};

export type EmployeeStatsDto = {
  kind: "employee";
  myTasks: number;
  dueToday: number;
  completedThisWeek: number;
  overdue: number;
};

export type StatsDto = AdminStatsDto | EmployeeStatsDto;
