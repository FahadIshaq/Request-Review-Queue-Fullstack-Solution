import Link from "next/link";
import { NewRequestForm } from "./NewRequestForm";

export default function NewRequestPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/" className="text-sm text-ink-muted hover:underline">
          ← Back to queue
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-ink">New request</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Submit a request to enter the review queue. It starts in{" "}
          <span className="font-semibold">NEW</span> status; a reviewer will
          pick it up next.
        </p>
      </div>
      <NewRequestForm />
    </div>
  );
}
