import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { hashToken } from "../lib/tokens";
import type { TaskPriority, TaskStatus } from "../lib/generated/prisma/enums";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DIRECT_URL / DATABASE_URL missing — check your .env");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

/** Offsets from today, so seeded dates always look current. */
function days(offset: number, hour = 17): Date {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  date.setHours(hour, 0, 0, 0);
  return date;
}

const PASSWORD = "Admin@123";

type Seeded = { id: string; firstName: string };

async function main() {
  console.log("Clearing existing data...");
  await prisma.taskComment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.invite.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  // =========================================================================
  // Shreeji Fashion — a dress manufacturing unit. This is the tenant you
  // sign in to. Work is shop-floor work: cutting, stitching, packing,
  // quality checks, plus the office-side data entry.
  // =========================================================================
  const shreeji = await prisma.company.create({
    data: {
      name: "Shreeji Fashion",
      industry: "Apparel Manufacturing",
      size: "51-200",
      phone: "+91 98765 43210",
      address: "Plot 42, GIDC Estate, Narol, Ahmedabad, Gujarat 382405",
    },
  });

  const staff = [
    { first: "Nilesh", last: "Patel", tone: "indigo", role: "ADMIN" as const, status: "ACTIVE" as const },
    { first: "Kavita", last: "Chauhan", tone: "emerald", role: "EMPLOYEE" as const, status: "ACTIVE" as const },
    { first: "Ramesh", last: "Solanki", tone: "amber", role: "EMPLOYEE" as const, status: "ACTIVE" as const },
    { first: "Imran", last: "Shaikh", tone: "violet", role: "EMPLOYEE" as const, status: "ACTIVE" as const },
    { first: "Meena", last: "Vaghela", tone: "slate", role: "EMPLOYEE" as const, status: "ACTIVE" as const },
    { first: "Jignesh", last: "Rana", tone: "emerald", role: "EMPLOYEE" as const, status: "ACTIVE" as const },
    { first: "Asha", last: "Makwana", tone: "amber", role: "EMPLOYEE" as const, status: "ACTIVE" as const },
    { first: "Suresh", last: "Parmar", tone: "violet", role: "EMPLOYEE" as const, status: "ACTIVE" as const },
    { first: "Pooja", last: "Zala", tone: "indigo", role: "EMPLOYEE" as const, status: "INVITED" as const },
    { first: "Dinesh", last: "Thakor", tone: "slate", role: "EMPLOYEE" as const, status: "DISABLED" as const },
  ];

  const users: Record<string, Seeded> = {};

  for (const [index, person] of staff.entries()) {
    const employeeId = `${person.first.toLowerCase()}.${person.last.toLowerCase()}`;

    const created = await prisma.user.create({
      data: {
        companyId: shreeji.id,
        email: `${person.first.toLowerCase()}@shreejifashion.com`,
        // Invited people have no login handle until they accept.
        employeeId: person.status === "INVITED" ? null : employeeId,
        passwordHash,
        firstName: person.first,
        lastName: person.last,
        role: person.role,
        status: person.status,
        avatarTone: person.tone,
        createdAt: days(-120 + index * 11),
      },
    });

    users[person.first] = { id: created.id, firstName: created.firstName };
  }

  const { Nilesh, Kavita, Ramesh, Imran, Meena, Jignesh, Asha, Suresh } = users;

  // -------------------------------------------------------------------------
  // Tasks — real shop-floor jobs, spread across department, status, priority
  // and due date so every filter, stat card and dashboard has content.
  // Categories double as the department chip shown on mobile cards.
  // -------------------------------------------------------------------------
  type TaskSeed = {
    title: string;
    description?: string;
    category: string;
    status: TaskStatus;
    priority: TaskPriority;
    due: number | null;
    assignee: Seeded;
    creator: Seeded;
  };

  const taskSeeds: TaskSeed[] = [
    // --- assigned TO Nilesh, the admin (drives his "My Tasks") ---
    { title: "Pack 200 kurtis into poly bags — Lot 45", description: "Size stickers go on the bag, not the garment.", category: "Packing", status: "TODO", priority: "HIGH", due: -1, assignee: Nilesh, creator: Kavita },
    { title: "Check stitching quality — saree lot 22", description: "Reject anything with loose hem or skipped stitch.", category: "Quality", status: "TODO", priority: "MEDIUM", due: 0, assignee: Nilesh, creator: Suresh },
    { title: "Approve sample piece for Surat buyer", description: "Buyer wants the neck depth reduced by half inch.", category: "Sampling", status: "TODO", priority: "LOW", due: 1, assignee: Nilesh, creator: Asha },
    { title: "Enter fabric GRN for roll lot 88", description: "12 rolls rayon, 3 rolls cotton — match with the challan.", category: "Data Entry", status: "TODO", priority: "HIGH", due: 0, assignee: Nilesh, creator: Kavita },
    { title: "Settle dyeing job-work bill", category: "Accounts", status: "TODO", priority: "LOW", due: 8, assignee: Nilesh, creator: Ramesh },
    { title: "Load dispatch van — Rajkot order 908", description: "38 cartons. Get the LR copy signed.", category: "Dispatch", status: "IN_PROGRESS", priority: "HIGH", due: -2, assignee: Nilesh, creator: Kavita },
    { title: "Plan next week's cutting schedule", description: "Order 4417 and 4420 both due Friday.", category: "Cutting", status: "IN_PROGRESS", priority: "MEDIUM", due: 5, assignee: Nilesh, creator: Meena },
    { title: "Update stock register — zips and buttons", category: "Store", status: "IN_PROGRESS", priority: "MEDIUM", due: 4, assignee: Nilesh, creator: Jignesh },
    { title: "Record weekly fabric wastage", description: "Cutting table wastage crossed 4% last week.", category: "Data Entry", status: "IN_PROGRESS", priority: "LOW", due: 3, assignee: Nilesh, creator: Meena },
    { title: "Hand over salary sheet to accounts", category: "Accounts", status: "DONE", priority: "LOW", due: -4, assignee: Nilesh, creator: Nilesh },
    { title: "Replace broken needle plate — machine 12", category: "Maintenance", status: "DONE", priority: "HIGH", due: -5, assignee: Nilesh, creator: Suresh },
    { title: "Confirm shade card 12 with dyeing unit", category: "Dyeing", status: "DONE", priority: "MEDIUM", due: -6, assignee: Nilesh, creator: Asha },
    { title: "File last month's job-work challans", category: "Data Entry", status: "DONE", priority: "LOW", due: -8, assignee: Nilesh, creator: Ramesh },

    // --- assigned BY Nilesh to workers (drives "Assigned by Me") ---
    { title: "Attach buttons to shirt batch #212", description: "180 pieces. Two spare buttons stitched inside each.", category: "Stitching", status: "IN_PROGRESS", priority: "MEDIUM", due: 1, assignee: Kavita, creator: Nilesh },
    { title: "Cut 150 mtr cotton for kurti order #4417", description: "Marker is on the cutting table, size ratio S:M:L = 2:3:2.", category: "Cutting", status: "TODO", priority: "MEDIUM", due: 4, assignee: Ramesh, creator: Nilesh },
    { title: "Thread trimming — anarkali batch 19", description: "220 pieces pending from yesterday.", category: "Finishing", status: "TODO", priority: "LOW", due: 9, assignee: Imran, creator: Nilesh },
    { title: "Iron and fold 300 blouses before dispatch", category: "Ironing", status: "DONE", priority: "HIGH", due: -7, assignee: Meena, creator: Nilesh },
    { title: "Kaja-button work on shirt lot 51", description: "Buttonholes on placket and cuff both.", category: "Stitching", status: "IN_PROGRESS", priority: "HIGH", due: 2, assignee: Jignesh, creator: Nilesh },
    { title: "Attach size labels to 400 tops", category: "Finishing", status: "TODO", priority: "MEDIUM", due: 12, assignee: Asha, creator: Nilesh },
    { title: "Sort defective pieces from lot 61", description: "Keep repairable and reject piles separate.", category: "Quality", status: "TODO", priority: "HIGH", due: -3, assignee: Suresh, creator: Nilesh },

    // --- worker to worker (admin's "all tasks" has rows he never touched) ---
    { title: "Overlock stitching — palazzo batch 7", category: "Stitching", status: "TODO", priority: "MEDIUM", due: 6, assignee: Meena, creator: Kavita },
    { title: "Embroidery on dupatta lot 33", description: "Zari work, design sheet is with the master.", category: "Embroidery", status: "IN_PROGRESS", priority: "LOW", due: 2, assignee: Imran, creator: Ramesh },
    { title: "Dye 80 mtr rayon — shade card 12", category: "Dyeing", status: "DONE", priority: "HIGH", due: -10, assignee: Kavita, creator: Jignesh },
    { title: "Clean and oil all stitching machines", description: "Saturday shutdown, after the shift.", category: "Maintenance", status: "TODO", priority: "LOW", due: 20, assignee: Ramesh, creator: Meena },
    { title: "Pack lehenga order 908 into cartons", description: "6 pieces per carton, invoice copy on top.", category: "Packing", status: "IN_PROGRESS", priority: "MEDIUM", due: 7, assignee: Jignesh, creator: Kavita },
    { title: "Count finished pieces — kurti lot 45", category: "Store", status: "TODO", priority: "MEDIUM", due: 10, assignee: Asha, creator: Jignesh },
    { title: "Re-stitch rejected pieces from lot 38", description: "26 pieces returned by quality.", category: "Stitching", status: "TODO", priority: "HIGH", due: -4, assignee: Kavita, creator: Suresh },
    { title: "Fusing on collar batch 14", category: "Finishing", status: "DONE", priority: "MEDIUM", due: -9, assignee: Imran, creator: Asha },
    { title: "Enter daily production count in register", category: "Data Entry", status: "DONE", priority: "LOW", due: -12, assignee: Suresh, creator: Ramesh },
    { title: "Issue 40 mtr lining fabric to cutting", category: "Store", status: "TODO", priority: "HIGH", due: 3, assignee: Ramesh, creator: Jignesh },
    { title: "Prepare packing list for Ahmedabad order", category: "Dispatch", status: "IN_PROGRESS", priority: "MEDIUM", due: 11, assignee: Asha, creator: Imran },
    { title: "Fix uneven hem on palazzo lot 29", category: "Quality", status: "DONE", priority: "MEDIUM", due: -2, assignee: Jignesh, creator: Kavita },
    { title: "Sort fabric rolls by shade in godown", category: "Store", status: "TODO", priority: "MEDIUM", due: 14, assignee: Kavita, creator: Ramesh },
    { title: "Stitch 50 sample pieces for exhibition", category: "Sampling", status: "TODO", priority: "LOW", due: 16, assignee: Suresh, creator: Meena },
    { title: "Return leftover fabric to store", category: "Store", status: "DONE", priority: "LOW", due: -15, assignee: Ramesh, creator: Kavita },
    { title: "Check button colour against approved swatch", description: "Buyer rejected the last lot for shade mismatch.", category: "Quality", status: "IN_PROGRESS", priority: "HIGH", due: 1, assignee: Imran, creator: Meena },
    { title: "Fold and bag 250 leggings", category: "Packing", status: "TODO", priority: "LOW", due: 18, assignee: Asha, creator: Suresh },
    { title: "Set up new interlock machine", category: "Maintenance", status: "DONE", priority: "HIGH", due: -11, assignee: Meena, creator: Jignesh },
    { title: "Verify job-work challan for embroidery unit", category: "Data Entry", status: "DONE", priority: "MEDIUM", due: -13, assignee: Ramesh, creator: Imran },
    { title: "Trim and press kurti lot 47", category: "Ironing", status: "TODO", priority: "MEDIUM", due: 5, assignee: Kavita, creator: Nilesh },
  ];

  const createdTasks = [];

  for (const seed of taskSeeds) {
    const task = await prisma.task.create({
      data: {
        companyId: shreeji.id,
        title: seed.title,
        description: seed.description ?? null,
        category: seed.category,
        status: seed.status,
        priority: seed.priority,
        dueDate: seed.due === null ? null : days(seed.due),
        completedAt: seed.status === "DONE" ? days(seed.due ?? 0) : null,
        assigneeId: seed.assignee.id,
        createdById: seed.creator.id,
      },
    });

    createdTasks.push(task);
  }

  // A few threads so the task detail view has something to render.
  const commented = createdTasks.slice(0, 3);
  await prisma.taskComment.createMany({
    data: [
      { taskId: commented[0].id, userId: Kavita.id, body: "Poly bags are short by about 40. Should I use the old stock?", createdAt: days(-1, 10) },
      { taskId: commented[0].id, userId: Nilesh.id, body: "Yes, use the old stock. New lot comes tomorrow.", createdAt: days(-1, 14) },
      { taskId: commented[1].id, userId: Suresh.id, body: "12 pieces have loose hem, kept aside for re-stitch.", createdAt: days(0, 9) },
      { taskId: commented[2].id, userId: Asha.id, body: "Sample is ready, kept on the master's table.", createdAt: days(0, 11) },
    ],
  });

  // -------------------------------------------------------------------------
  // Invites — one live, one already expired, so both screens are testable
  // with real tokens rather than made-up ones.
  // -------------------------------------------------------------------------
  const liveToken = "seedinvite0000000000000000000000live";
  const deadToken = "seedinvite0000000000000000000000dead";

  await prisma.invite.create({
    data: {
      companyId: shreeji.id,
      email: "hetal@shreejifashion.com",
      firstName: "Hetal",
      lastName: "Joshi",
      tokenHash: hashToken(liveToken),
      expiresAt: days(7),
      createdById: Nilesh.id,
    },
  });

  await prisma.invite.create({
    data: {
      companyId: shreeji.id,
      email: "bhavesh@shreejifashion.com",
      firstName: "Bhavesh",
      lastName: "Trivedi",
      tokenHash: hashToken(deadToken),
      expiresAt: days(-3),
      createdById: Nilesh.id,
    },
  });

  // =========================================================================
  // Riddhi Garments — a second factory, existing only to prove tenant
  // isolation. Nothing here may ever surface inside Shreeji, or the reverse.
  // =========================================================================
  const riddhi = await prisma.company.create({
    data: { name: "Riddhi Garments", industry: "Apparel Manufacturing", size: "11-50" },
  });

  const bhavna = await prisma.user.create({
    data: {
      companyId: riddhi.id,
      email: "admin@riddhigarments.com",
      employeeId: "bhavna.mehta",
      passwordHash,
      firstName: "Bhavna",
      lastName: "Mehta",
      role: "ADMIN",
      status: "ACTIVE",
      avatarTone: "violet",
    },
  });

  await prisma.task.create({
    data: {
      companyId: riddhi.id,
      title: "RIDDHI ONLY — must never appear inside Shreeji Fashion",
      category: "Packing",
      status: "TODO",
      priority: "HIGH",
      assigneeId: bhavna.id,
      createdById: bhavna.id,
    },
  });

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  console.log("\nSeed complete:", {
    companies: await prisma.company.count(),
    users: await prisma.user.count(),
    tasks: await prisma.task.count(),
    comments: await prisma.taskComment.count(),
    invites: await prisma.invite.count(),
  });

  console.log(`
  ─────────────────────────────────────────────────────────────
  SHREEJI FASHION — password for everyone: ${PASSWORD}
  ─────────────────────────────────────────────────────────────
  Admin (owner)   nilesh@shreejifashion.com   or  nilesh.patel
  Worker          kavita@shreejifashion.com   or  kavita.chauhan
  Worker          ramesh@shreejifashion.com   or  ramesh.solanki
  Disabled        dinesh@shreejifashion.com       → must be refused
  Other factory   admin@riddhigarments.com    or  bhavna.mehta

  INVITE LINKS
  Valid    ${base}/invite/${liveToken}
  Expired  ${base}/invite/${deadToken}
  ─────────────────────────────────────────────────────────────
`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
