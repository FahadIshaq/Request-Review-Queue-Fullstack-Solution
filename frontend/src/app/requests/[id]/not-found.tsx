import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card mx-auto max-w-md space-y-2 p-8 text-center">
      <h1 className="text-xl font-semibold text-ink dark:text-slate-100">
        Request not found
      </h1>
      <p className="text-sm text-ink-muted dark:text-slate-400">
        The request you’re looking for doesn’t exist or was removed.
      </p>
      <Link href="/" className="btn btn-secondary mt-4 inline-flex">
        Back to queue
      </Link>
    </div>
  );
}
