import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * CLI-only configuration (migrate, studio, db pull).
 *
 * Migrations run over the DIRECT connection: Neon's pooled endpoint sits behind
 * PgBouncer in transaction mode, which cannot execute the DDL and advisory locks
 * Prisma Migrate needs. The application itself uses the pooled DATABASE_URL —
 * see `lib/prisma.ts`.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
