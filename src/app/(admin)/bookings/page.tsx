"use client";

import { useEffect, useState, useCallback } from "react";
import { Clock, User, Mail, X, RefreshCw, ChevronLeft, ChevronRight, CalendarDays, Check, Video, MapPin } from "lucide-react";

interface Booking {
  id: number;
  bookerName: string;
  bookerEmail: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
  eventType: { title: string; slug: string; durationMinutes: number };
}

interface TimeSlot { startTime: string; endTime: string; }

type Tab = "upcoming" | "past" | "cancelled";

const EVENT_COLORS = [
  "border-l-blue-500",
  "border-l-emerald-500",
  "border-l-violet-500",
  "border-l-amber-500",
  "border-l-rose-500",
  "border-l-cyan-500",
];

function fmtDate(s: string) {
  return new Date(s + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
function fmtDateFull(s: string) {
  return new Date(s + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
function fmtTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const p = h >= 12 ? "PM" : "AM";
  return `${h === 0 ? 12 : h > 12 ? h - 12 : h}:${m.toString().padStart(2, "0")} ${p}`;
}

function getColorForTitle(title: string) {
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash);
  return EVENT_COLORS[Math.abs(hash) % EVENT_COLORS.length];
}

/* ─── Reschedule Modal ─── */
function RescheduleModal({
  booking,
  onClose,
  onReschedule,
}: {
  booking: Booking;
  onClose: () => void;
  onReschedule: (id: number, date: string, slot: TimeSlot) => Promise<void>;
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!selectedDate) return;
    setSlotsLoading(true);
    setSelectedSlot(null);
    fetch(`/api/slots?slug=${booking.eventType.slug}&date=${selectedDate}`)
      .then((r) => r.json())
      .then((d) => { setSlots(d.slots || []); setSlotsLoading(false); })
      .catch(() => { setSlots([]); setSlotsLoading(false); });
  }, [selectedDate, booking.eventType.slug]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const fmt = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const isPast = (day: number) => fmt(day) < todayStr;
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const prevDisabled = new Date(year, month - 1, 1) < new Date(today.getFullYear(), today.getMonth(), 1);

  const handleConfirm = async () => {
    if (!selectedDate || !selectedSlot) return;
    setSubmitting(true);
    await onReschedule(booking.id, selectedDate, selectedSlot);
    setSubmitting(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-default px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-emphasis">Reschedule booking</h3>
            <p className="text-xs text-muted mt-0.5">{booking.eventType.title} with {booking.bookerName}</p>
          </div>
          <button onClick={onClose} className="btn-icon !p-1.5">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row">
          {/* Calendar */}
          <div className="flex-1 p-5 border-b sm:border-b-0 sm:border-r border-default">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
                disabled={prevDisabled}
                className="rounded-md p-1 text-subtle hover:bg-muted disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <h4 className="text-sm font-semibold text-emphasis">
                {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </h4>
              <button
                onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
                className="rounded-md p-1 text-subtle hover:bg-muted transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-7 mb-1">
              {dayNames.map((n) => (
                <div key={n} className="py-1 text-center text-[11px] font-medium text-muted">{n}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = fmt(day);
                const sel = selectedDate === dateStr;
                const dis = isPast(day);
                return (
                  <button
                    key={day}
                    onClick={() => !dis && setSelectedDate(dateStr)}
                    disabled={dis}
                    className={`aspect-square flex items-center justify-center rounded-md text-xs font-medium transition-all
                      ${dis ? "cursor-not-allowed text-gray-200" : "cursor-pointer"}
                      ${sel ? "bg-emphasis text-white" : ""}
                      ${dateStr === todayStr && !sel ? "ring-1 ring-emphasis text-emphasis" : ""}
                      ${!sel && !dis ? "text-default hover:bg-muted" : ""}
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time slots */}
          <div className="w-full sm:w-48 p-5">
            {!selectedDate ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CalendarDays className="h-8 w-8 text-gray-200 mb-2" />
                <p className="text-xs text-muted">Select a date</p>
              </div>
            ) : slotsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-emphasis" />
              </div>
            ) : slots.length === 0 ? (
              <p className="text-xs text-muted text-center py-8">No times available</p>
            ) : (
              <div className="space-y-1.5 max-h-[280px] overflow-y-auto">
                <p className="text-[11px] font-medium text-muted uppercase tracking-wider mb-2">Available times</p>
                {slots.map((slot) => {
                  const sel = selectedSlot?.startTime === slot.startTime;
                  return (
                    <button
                      key={slot.startTime}
                      onClick={() => setSelectedSlot(slot)}
                      className={`w-full rounded-md border px-3 py-2 text-xs font-medium transition-all ${
                        sel
                          ? "border-emphasis bg-emphasis text-white"
                          : "border-default text-default hover:border-gray-400"
                      }`}
                    >
                      {fmtTime(slot.startTime)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-default px-5 py-3">
          <button onClick={onClose} className="btn-secondary py-1.5 text-xs">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedDate || !selectedSlot || submitting}
            className="btn-primary py-1.5 text-xs"
          >
            {submitting ? "Rescheduling..." : "Confirm reschedule"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Bookings Page ─── */
export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("upcoming");
  const [cancelling, setCancelling] = useState<number | null>(null);
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null);

  const fetchBookings = useCallback(() => {
    setLoading(true);
    let url = "/api/bookings?";
    if (tab === "upcoming") url += "timeframe=upcoming&status=confirmed";
    else if (tab === "past") url += "timeframe=past&status=confirmed";
    else url += "status=cancelled";
    fetch(url)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setBookings(data); })
      .finally(() => setLoading(false));
  }, [tab]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancel = async (id: number) => {
    if (!confirm("Cancel this booking?")) return;
    setCancelling(id);
    await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
    });
    setBookings((p) => p.filter((b) => b.id !== id));
    setCancelling(null);
  };

  const handleReschedule = async (id: number, date: string, slot: TimeSlot) => {
    const res = await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "rescheduled",
        date,
        startTime: slot.startTime,
        endTime: slot.endTime,
      }),
    });
    if (res.ok) {
      setRescheduleBooking(null);
      fetchBookings();
    }
  };

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "upcoming", label: "Upcoming" },
    { key: "past", label: "Past" },
    { key: "cancelled", label: "Cancelled" },
  ];

  // Group bookings by date
  const groupedBookings: Record<string, Booking[]> = {};
  bookings.forEach((b) => {
    if (!groupedBookings[b.date]) groupedBookings[b.date] = [];
    groupedBookings[b.date].push(b);
  });
  const sortedDates = Object.keys(groupedBookings).sort((a, b) =>
    tab === "upcoming" ? a.localeCompare(b) : b.localeCompare(a)
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Bookings</h1>
          <p className="mt-0.5 text-[14px] text-gray-400">
            See upcoming and past events booked through your event type links.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-0 border-b border-[#2c2c2c]">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t.key
                ? "border-white text-white"
                : "border-transparent text-gray-400 hover:text-white hover:border-gray-500"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2c2c2c] border-t-white" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-[8px] border border-[#2c2c2c] bg-[#111111] flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#1c1c1c]">
            <CalendarDays className="h-6 w-6 text-gray-500" />
          </div>
          <h3 className="text-sm font-semibold text-white">
            No {tab} bookings
          </h3>
          <p className="mt-1 max-w-sm text-[13px] text-gray-400">
            {tab === "upcoming"
              ? "You have no upcoming bookings. Share your booking links to get your first meeting scheduled."
              : tab === "past"
              ? "Your past bookings will appear here once meetings have concluded."
              : "No cancelled bookings yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <div key={date}>
              {/* Date header */}
              <div className="mb-3 flex items-center gap-3">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#898989]">
                  {fmtDateFull(date)}
                </h3>
                <div className="h-px flex-1 bg-[#2c2c2c]" />
              </div>

              {/* Bookings for this date */}
              <div className="space-y-2">
                {groupedBookings[date].map((b) => (
                  <div
                    key={b.id}
                    className={`rounded-[8px] bg-[#111111] text-white border border-[#2c2c2c] border-l-4 ${getColorForTitle(b.eventType.title)} overflow-hidden shadow-sm`}
                  >
                    <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                      {/* Left: Time + Details */}
                      <div className="flex items-start gap-5">
                        {/* Time column */}
                        <div className="flex-shrink-0 w-24 pt-0.5">
                          <p className="text-[14px] font-bold text-white">
                            {fmtTime(b.startTime)}
                          </p>
                          <p className="text-[13px] font-medium text-gray-400">
                            {fmtTime(b.endTime)}
                          </p>
                        </div>

                        {/* Details */}
                        <div className="min-w-0 flex flex-col justify-center gap-1 mt-[-2px]">
                          <p className="text-[14px] font-bold text-white truncate">
                            {b.eventType.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-0.5">
                            <span className="flex items-center gap-1.5 text-[12px] font-medium text-gray-500">
                              <User className="h-3 w-3 flex-shrink-0" />
                              {b.bookerName}
                            </span>
                            <span className="flex items-center gap-1.5 text-[12px] font-medium text-gray-500">
                              <Mail className="h-3 w-3 flex-shrink-0" />
                              {b.bookerEmail}
                            </span>
                            <span className="flex items-center gap-1.5 text-[12px] font-medium text-gray-500">
                              <Video className="h-3 w-3 flex-shrink-0" />
                              Cal Video
                            </span>
                          </div>
                          {b.notes && (
                            <p className="mt-1.5 text-xs text-gray-500 italic truncate max-w-md">
                              &ldquo;{b.notes}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-shrink-0 items-center justify-end gap-2 pl-28 sm:pl-0">
                        {tab === "upcoming" && (
                          <>
                            <button
                              onClick={() => setRescheduleBooking(b)}
                              className="inline-flex items-center gap-1.5 rounded-md border border-[#2c2c2c] bg-transparent px-3 py-1.5 text-[12px] font-semibold text-gray-300 transition-all hover:bg-[#1a1a1a] hover:border-gray-500 hover:text-white shadow-sm"
                            >
                              <RefreshCw className="h-3 w-3" />
                              Reschedule
                            </button>
                            <button
                              onClick={() => handleCancel(b.id)}
                              disabled={cancelling === b.id}
                              className="inline-flex items-center gap-1.5 rounded-md border border-[#2c2c2c] bg-transparent px-3 py-1.5 text-[12px] font-semibold text-gray-300 transition-all hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 shadow-sm disabled:opacity-50"
                            >
                              <X className="h-3 w-3" />
                              {cancelling === b.id ? "..." : "Cancel"}
                            </button>
                          </>
                        )}
                        {tab === "cancelled" && (
                          <span className="badge-danger">Cancelled</span>
                        )}
                        {tab === "past" && (
                          <span className="badge-success">
                            <Check className="h-3 w-3 mr-0.5" /> Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleBooking && (
        <RescheduleModal
          booking={rescheduleBooking}
          onClose={() => setRescheduleBooking(null)}
          onReschedule={handleReschedule}
        />
      )}
    </div>
  );
}
