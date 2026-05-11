import Link from "next/link";
import { notFound } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { RequestDetail } from "./RequestDetail";

export default async function RequestDetailPage({
  params,
}: {
  params: { id: string };
}) {
  try {
    const [request, owners] = await Promise.all([
      api.getRequest(params.id),
      api.listOwners(),
    ]);
    return (
      <div className="space-y-6">
        <Link
          href="/"
          className="text-sm text-ink-muted hover:underline dark:text-slate-400"
        >
          ← Back to queue
        </Link>
        <RequestDetail initial={request} owners={owners} />
      </div>
    );
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }
}
