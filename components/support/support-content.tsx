import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextAreaField, TextField } from "@/components/ui/field";

const faqs = [
  {
    q: "How do I add a worker?",
    a: "Go to Teams and choose Add Employee. A login ID and password are generated on the spot — copy them and hand them over. The worker is asked to set their own password on first sign-in.",
  },
  {
    q: "Can workers assign jobs to each other?",
    a: "Yes. Anyone can create a task and assign it to any colleague — packing, stitching, data entry, anything. Admins additionally see every task in the factory.",
  },
  {
    q: "Who can mark a job done?",
    a: "The person it's assigned to, or an admin. The person who created the job is the one who can edit or delete it.",
  },
  {
    q: "How long does an invite link stay valid?",
    a: "Seven days. If one expires, generate a fresh invite from the Teams page.",
  },
];

/** Shared by the admin and employee support routes. */
export function SupportContent() {
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
              <dd className="mt-1.5 text-sm leading-relaxed text-muted">
                {faq.a}
              </dd>
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
            <Button type="button">Send message</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
