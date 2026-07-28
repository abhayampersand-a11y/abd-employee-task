import type { Metadata } from "next";
import { SupportContent } from "@/components/support/support-content";

export const metadata: Metadata = { title: "Support — TaskFlow" };

export default function EmployeeSupportPage() {
  return <SupportContent />;
}
