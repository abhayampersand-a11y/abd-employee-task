import type {
  Company,
  Task,
  TaskComment,
  User,
} from "@/lib/generated/prisma/client";
import type {
  CommentDto,
  CompanyDto,
  EmployeeDto,
  PersonDto,
  TaskDto,
  UserDto,
} from "@/lib/dto";
import { canDeleteTask, canEditTask, canChangeStatus } from "@/lib/permissions";

/**
 * Prisma row -> API shape. Every field is picked explicitly, so adding a
 * column to the schema can never silently expose it over HTTP.
 */

export function toPerson(user: User): PersonDto {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: `${user.firstName} ${user.lastName}`,
    avatarTone: user.avatarTone,
  };
}

export function toUser(user: User): UserDto {
  return {
    ...toPerson(user),
    email: user.email,
    employeeId: user.employeeId,
    role: user.role,
    status: user.status,
    mustChangePassword: user.mustChangePassword,
  };
}

export function toEmployee(
  user: User & { _count?: { assignedTasks: number } },
): EmployeeDto {
  return {
    ...toUser(user),
    taskCount: user._count?.assignedTasks ?? 0,
    joined: user.createdAt.toISOString(),
  };
}

export function toComment(comment: TaskComment & { user: User }): CommentDto {
  return {
    id: comment.id,
    body: comment.body,
    createdAt: comment.createdAt.toISOString(),
    author: toPerson(comment.user),
  };
}

export function toCompany(company: Company): CompanyDto {
  return {
    id: company.id,
    name: company.name,
    industry: company.industry,
    size: company.size,
    phone: company.phone,
    address: company.address,
    logoUrl: company.logoUrl,
  };
}

export function toTask(
  task: Task & { assignee: User; createdBy: User },
  actor: { id: string; role: User["role"] },
): TaskDto {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    category: task.category,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate?.toISOString() ?? null,
    completedAt: task.completedAt?.toISOString() ?? null,
    createdAt: task.createdAt.toISOString(),
    assignee: toPerson(task.assignee),
    createdBy: toPerson(task.createdBy),
    can: {
      edit: canEditTask(actor, task),
      changeStatus: canChangeStatus(actor, task),
      delete: canDeleteTask(actor, task),
    },
  };
}
