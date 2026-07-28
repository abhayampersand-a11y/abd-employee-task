import { z } from "zod";

const password = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(72, "Password is too long");

const name = z.string().trim().min(1, "Required").max(60);

export const signupSchema = z.object({
  firstName: name,
  lastName: name,
  email: z.email("Enter a valid email").trim().toLowerCase(),
  password,
});

export const loginSchema = z.object({
  // Email for admins, employee ID for staff.
  identifier: z.string().trim().min(1, "Required"),
  password: z.string().min(1, "Required"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Required"),
  newPassword: password,
});

export const companySchema = z.object({
  name: z.string().trim().min(1, "Company name is required").max(120),
  industry: z.string().trim().max(60).optional().nullable(),
  size: z.string().trim().max(30).optional().nullable(),
  phone: z.string().trim().max(30).optional().nullable(),
  address: z.string().trim().max(300).optional().nullable(),
  logoUrl: z.url().optional().nullable(),
});

export const companyPatchSchema = companySchema.partial();

export const createEmployeeSchema = z.object({
  firstName: name,
  lastName: name,
  email: z.email("Enter a valid email").trim().toLowerCase().optional(),
});

export const inviteSchema = z.object({
  firstName: name,
  lastName: name,
  email: z.email("Enter a valid email").trim().toLowerCase(),
});

export const acceptInviteSchema = z.object({ password });

export const employeePatchSchema = z.object({
  status: z.enum(["ACTIVE", "DISABLED"]),
});

const taskStatus = z.enum(["TODO", "IN_PROGRESS", "DONE"]);
const taskPriority = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Give the task a title").max(200),
  description: z.string().trim().max(2000).optional().nullable(),
  category: z.string().trim().max(60).optional().nullable(),
  assigneeId: z.string().min(1, "Pick someone to assign this to"),
  priority: taskPriority.default("MEDIUM"),
  dueDate: z.iso.datetime().optional().nullable(),
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).optional().nullable(),
  category: z.string().trim().max(60).optional().nullable(),
  assigneeId: z.string().min(1).optional(),
  priority: taskPriority.optional(),
  status: taskStatus.optional(),
  dueDate: z.iso.datetime().optional().nullable(),
});

export const commentSchema = z.object({
  body: z.string().trim().min(1, "Write something").max(2000),
});
