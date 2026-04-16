"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Clock, ExternalLink, Copy, MoreHorizontal, Pencil, Trash2, Link2, Search } from "lucide-react";

interface EventType {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  durationMinutes: number;
  bufferMinutes: number;
  isActive: boolean;
}

export default function EventTypesPage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/event-types")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setEventTypes(data); })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this event type?")) return;
    await fetch(`/api/event-types/${id}`, { method: "DELETE" });
    setEventTypes((prev) => prev.filter((e) => e.id !== id));
    setMenuOpen(null);
  };

  const handleToggle = async (id: number, currentActive: boolean) => {
    const res = await fetch(`/api/event-types/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !currentActive }),
    });
    if (res.ok) {
      setEventTypes((prev) =>
        prev.map((e) => (e.id === id ? { ...e, isActive: !currentActive } : e))
      );
    }
  };

  const handleCopyLink = (slug: string, id: number) => {
    navigator.clipboard.writeText(`${window.location.origin}/book/${slug}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = eventTypes.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[22px] font-bold text-white tracking-tight">Event types</h1>
          <p className="mt-0.5 text-[14px] text-gray-400">
            Configure different events for people to book on your calendar.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="w-56 rounded-md border border-[#2c2c2c] bg-transparent py-2 pl-9 pr-3 text-[13px] text-white placeholder-gray-500 outline-none transition-all focus:border-gray-500"
            />
          </div>
          <Link
            href="/event-types/new"
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-black hover:bg-gray-200 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" /> New
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2c2c2c] border-t-white" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-[8px] border border-[#2c2c2c] bg-[#111111] flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#1c1c1c]">
            <Link2 className="h-6 w-6 text-gray-500" />
          </div>
          <h3 className="text-[14px] font-semibold text-white">
            {search ? "No matching event types" : "No event types yet"}
          </h3>
          <p className="mt-1 text-[13px] text-gray-400">
            {search
              ? "Try a different search term."
              : "Create your first event type to start accepting bookings."}
          </p>
          {!search && (
            <Link href="/event-types/new" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-black hover:bg-gray-200 transition-colors">
              <Plus className="h-4 w-4" /> New event type
            </Link>
          )}
        </div>
      ) : (
        <div className="rounded-[8px] border border-[#2c2c2c] bg-[#111111]">
          <ul className="divide-y divide-[#2c2c2c]">
            {filtered.map((ev, idx) => (
              <li
                key={ev.id}
                className={`group flex items-center justify-between px-5 py-[18px] transition-colors hover:bg-white/[0.02] ${idx === 0 ? "rounded-t-[8px]" : ""} ${idx === filtered.length - 1 ? "rounded-b-[8px]" : ""}`}
              >
                {/* Left: event info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <Link
                      href={`/event-types/${ev.id}/edit`}
                      className="text-[14px] font-bold text-white hover:underline underline-offset-2 truncate"
                    >
                      {ev.title}
                    </Link>
                    <span className="text-[12px] text-[#888888] truncate font-medium">
                      /akshay-fgapfg/{ev.slug}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-[#1C1C1C] border border-[#2c2c2c] px-2 py-1 text-[11px] font-semibold text-[#a1a1aa] shadow-sm">
                      <Clock className="h-3 w-3 opacity-70" />
                      {ev.durationMinutes}m
                    </span>
                  </div>
                </div>

                {/* Right: actions */}
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  
                  {!ev.isActive && (
                     <span className="text-[13px] font-medium text-[#777] hidden sm:block mr-2">
                       Hidden
                     </span>
                  )}

                  {/* Toggle */}
                  <button
                    onClick={() => handleToggle(ev.id, ev.isActive)}
                    className={`relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      ev.isActive ? "bg-white" : "bg-[#2c2c2c]"
                    }`}
                    title={ev.isActive ? "Disable" : "Enable"}
                  >
                    <span
                      className={`inline-block h-[20px] w-[20px] rounded-full transition-transform duration-200 ease-in-out ${
                        ev.isActive ? "translate-x-[20px] bg-black" : "translate-x-0 bg-[#888]"
                      }`}
                    />
                  </button>

                  <div className="flex items-center gap-1.5 ml-2">
                    {/* Open in new tab */}
                    <Link
                      href={`/book/${ev.slug}`}
                      target="_blank"
                      className="rounded-md border border-[#2c2c2c] p-2 text-[#a1a1aa] hover:text-white hover:border-[#444] hover:bg-[#1C1C1C] transition-colors"
                      title="Preview"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>

                    {/* Copy link */}
                    <button
                      onClick={() => handleCopyLink(ev.slug, ev.id)}
                      className="rounded-md border border-[#2c2c2c] p-2 text-[#a1a1aa] hover:text-white hover:border-[#444] hover:bg-[#1C1C1C] transition-colors"
                      title="Copy link"
                    >
                      <Copy className="h-4 w-4" />
                    </button>

                    {/* More menu */}
                    <div className="relative">
                      <button
                        onClick={() => setMenuOpen(menuOpen === ev.id ? null : ev.id)}
                        className="rounded-md border border-[#2c2c2c] p-2 text-[#a1a1aa] hover:text-white hover:border-[#444] hover:bg-[#1C1C1C] transition-colors"
                        title="More"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>

                      {menuOpen === ev.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                          <div className="absolute right-0 bottom-full z-20 mb-1 w-40 rounded-lg border border-[#2c2c2c] bg-[#1a1a1a] py-1 shadow-2xl">
                            <Link
                              href={`/event-types/${ev.id}/edit`}
                              className="flex items-center gap-2 px-3 py-2 text-[13px] text-white hover:bg-white/[0.04] transition-colors"
                              onClick={() => setMenuOpen(null)}
                            >
                              <Pencil className="h-3.5 w-3.5" /> Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(ev.id)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-red-500 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Copied toast */}
      {copiedId && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-[#111827] px-4 py-2.5 text-[13px] font-medium text-white shadow-lg animate-in fade-in slide-in-from-bottom-2">
          Link copied to clipboard!
        </div>
      )}
    </div>
  );
}
