import type { Metadata } from "next";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextAreaField, TextField } from "@/components/ui/field";

export const metadata: Metadata = { title: "Support — TaskFlow" };

const faqs = [
  {
    q: "How do I add an employee?",
    a: "Go to Teams and choose Add Employee. You can either generate a login for them, or send an invite link so they set their own password.",
  },
  {
    q: "Can employees assign tasks to each other?",
    a: "Yes. Anyone in your company can create a task and assign it to any colleague. Admins additionally see every task in the workspace.",
  },
  {
    q: "How long does an invite link stay valid?",
    a: "Invite links expire after 7 days. If one expires, generate a new invite from the Teams page.",
  },
];

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-[880px] space-y-5">
      <Card>
        <CardHeader
          title="Frequently asked"
          description="Quick answers to the most common questions."
        />

        <dl className="mt-5 divide-y divide-line border-t border-line">
          {faqs.map((faq) => (
            <div key={faq.q} className="py-4">
              <dt className="font-semibold text-ink">{faq.q}</dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-muted">{faq.a}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card>
        <CardHeader
          title="Contact us"
          description="We usually reply within one business day."
        />

        <form className="mt-5 space-y-5">
          <TextField label="Subject" placeholder="What do you need help with?" />
          <TextAreaField
            label="Message"
            rows={5}
            placeholder="Describe the issue in as much detail as you can..."
          />
          <div className="flex justify-end">
            <Button>Send message</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
