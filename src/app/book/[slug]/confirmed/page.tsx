"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle, Calendar, Clock, User, Globe, Mail } from "lucide-react";
import Link from "next/link";

function fmtDate(s: string) {
  if (!s) return "";
  return new Date(s + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
function fmtTime(t: string) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const p = h >= 12 ? "PM" : "AM";
  return `${h === 0 ? 12 : h > 12 ? h - 12 : h}:${m.toString().padStart(2, "0")} ${p}`;
}

function ConfirmationContent() {
  const sp = useSearchParams();
  const title = sp.get("title") || "Meeting";
  const date = sp.get("date") || "";
  const startTime = sp.get("startTime") || "";
  const endTime = sp.get("endTime") || "";
  const name = sp.get("name") || "";
  const duration = sp.get("duration") || "";

  return (
    <div className="flex min-h-screen flex-col bg-subtle">
      {/* Top bar */}
      <div className="border-b border-default bg-white px-4 py-3">
        <Link href="/" className="text-[17px] font-bold tracking-tight text-emphasis hover:opacity-80 transition-opacity w-fit block">
          Cal<span className="text-gray-400">.com</span>
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          {/* Success card */}
          <div className="card p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 ring-8 ring-green-50/50">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h1 className="text-xl font-bold text-emphasis">This meeting is scheduled</h1>
            <p className="mt-1 text-sm text-subtle">
              A calendar invitation has been sent to your email address.
            </p>

            <div className="mt-6 rounded-lg border border-default bg-subtle p-5 text-left">
              <h2 className="font-semibold text-emphasis mb-4">{title}</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted" />
                  <span className="text-sm text-default">{name}</span>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted" />
                  <span className="text-sm text-default">{fmtDate(date)}</span>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted" />
                  <span className="text-sm text-default">
                    {fmtTime(startTime)} – {fmtTime(endTime)}
                    {duration && <span className="text-muted"> ({duration} min)</span>}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Globe className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted" />
                  <span className="text-sm text-default">Asia / Kolkata</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-md bg-blue-50 px-4 py-3 text-left ring-1 ring-inset ring-blue-600/10">
              <Mail className="h-4 w-4 flex-shrink-0 text-blue-500" />
              <p className="text-xs text-blue-700">
                A confirmation email with a calendar invite has been sent to you.
              </p>
            </div>
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/event-types"
              className="text-sm font-medium text-subtle hover:text-emphasis transition-colors"
            >
              ← Back to Cal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-subtle">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-emphasis" />
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
