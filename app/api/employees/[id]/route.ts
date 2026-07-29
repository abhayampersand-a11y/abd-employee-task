import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { HttpError, requireAdmin } from "@/lib/auth";
import { handler } from "@/lib/api";
import { employeePatchSchema } from "@/lib/validation";
import { toEmployee } from "@/lib/serialize";
import type { EmployeeDto } from "@/lib/dto";

/** Enable or disable a team member. Admin only, and never another company's. */
export const PATCH = handler(
  async (request: Request, ctx: RouteContext<"/api/employees/[id]">) => {
    const admin = await requireAdmin();
    const { id } = await ctx.params;

    if (id === admin.id) {
      throw new HttpError(400, "You can't change your own account status");
    }

    const employee = await prisma.user.findFirst({
      where: { id, companyId: admin.companyId },
      select: { id: true, role: true },
    });

    if (!employee) throw new HttpError(404, "Employee not found");

    // Disabling the other admin would leave the company unmanageable.
    if (employee.role === "ADMIN") {
      throw new HttpError(403, "Admin accounts can't be disabled here");
    }

    const { status } = employeePatchSchema.parse(await request.json());

    const updated = await prisma.user.update({
      where: { id: employee.id },
      data: { status },
      include: { _count: { select: { assignedTasks: true } } },
    });

    // Disabling someone must not leave their phone signed in.
    if (status === "DISABLED") {
      await prisma.session.deleteMany({ where: { userId: employee.id } });
      await prisma.device.deleteMany({ where: { userId: employee.id } });
    }

    return NextResponse.json<EmployeeDto>(toEmployee(updated));
  },
);
