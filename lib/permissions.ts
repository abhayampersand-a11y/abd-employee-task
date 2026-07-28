import type { Role, Task } from "@/lib/generated/prisma/client";

/**
 * The single source of truth for who may do what.
 *
 * Every one of these is checked on the server inside the route handler.
 * The UI imports the same functions to decide what to show — but hiding a
 * button is UX, never the security boundary.
 */

type Actor = { id: string; role: Role };
type TaskLike = Pick<Task, "assigneeId" | "createdById">;

export function isAdmin(actor: Actor): boolean {
  return actor.role === "ADMIN";
}

/** Admins see the whole company. Employees see only what touches them. */
export function canViewTask(actor: Actor, task: TaskLike): boolean {
  return (
    isAdmin(actor) ||
    task.assigneeId === actor.id ||
    task.createdById === actor.id
  );
}

/** The person doing the work moves it along the board. */
export function canChangeStatus(actor: Actor, task: TaskLike): boolean {
  return isAdmin(actor) || task.assigneeId === actor.id;
}

/** The person who handed it out owns its details. */
export function canEditTask(actor: Actor, task: TaskLike): boolean {
  return isAdmin(actor) || task.createdById === actor.id;
}

export function canDeleteTask(actor: Actor, task: TaskLike): boolean {
  return canEditTask(actor, task);
}

export function canComment(actor: Actor, task: TaskLike): boolean {
  return canViewTask(actor, task);
}

export function canManageEmployees(actor: Actor): boolean {
  return isAdmin(actor);
}

export function canEditCompany(actor: Actor): boolean {
  return isAdmin(actor);
}

/**
 * Which slice of the task list an actor may request.
 * `all` is admin-only; employees get their own two views.
 */
export type TaskScope = "mine" | "created" | "all";

export function canUseScope(actor: Actor, scope: TaskScope): boolean {
  return scope === "all" ? isAdmin(actor) : true;
}
