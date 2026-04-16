"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Clock, Globe, CalendarDays, Calendar, ChevronDown } from "lucide-react";
import CalendarPicker from "@/components/booking/CalendarPicker";
import TimeSlots from "@/components/booking/TimeSlots";
import BookingForm from "@/components/booking/BookingForm";
import Link from "next/link";

const COMMON_TIMEZONES = [
  "Asia/Kolkata",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Moscow",
  "Asia/Dubai",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Australia/Sydney",
  "Pacific/Auckland",
  "UTC",
];

function formatTzLabel(tz: string): string {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    });
    const parts = formatter.formatToParts(now);
    const offset = parts.find((p) => p.type === "timeZoneName")?.value || "";
    return `${tz.replace(/_/g, " ")} (${offset})`;
  } catch {
    return tz;
  }
}

interface BookingQuestion {
  id: number;
  label: string;
  required: boolean;
}

interface EventType {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  durationMinutes: number;
  questions?: BookingQuestion[];
}
interface TimeSlotT { startTime: string; endTime: string; }
type Step = "select-date" | "select-time" | "enter-details";

export default function BookingPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const router = useRouter();

  const [eventType, setEventType] = useState<EventType | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<TimeSlotT[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlotT | null>(null);
  const [step, setStep] = useState<Step>("select-date");
  const [timezone, setTimezone] = useState(() => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone; }
    catch { return "Asia/Kolkata"; }
  });
  const [showTzPicker, setShowTzPicker] = useState(false);

  // Build full list: common + browser tz (deduplicated)
  const timezoneList = useMemo(() => {
    const set = new Set(COMMON_TIMEZONES);
    set.add(timezone);
    return Array.from(set).sort();
  }, [timezone]);

  useEffect(() => {
    fetch(`/api/event-types/public/${slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setEventType(data);
        else setNotFound(true);
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [slug]);

  useEffect(() => {
    if (!selectedDate || !slug) return;
    setSlotsLoading(true);
    setSelectedSlot(null);
    fetch(`/api/slots?slug=${slug}&date=${selectedDate}&timezone=${encodeURIComponent(timezone)}`)
      .then((r) => r.json())
      .then((d) => { setSlots(d.slots || []); setSlotsLoading(false); })
      .catch(() => { setSlots([]); setSlotsLoading(false); });
  }, [selectedDate, slug, timezone]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setStep("select-time");
  };

  const handleBookingSubmit = async (data: {
    name: string;
    email: string;
    notes: string;
    answers?: { questionId: number; answer: string }[];
  }) => {
    if (!eventType || !selectedDate || !selectedSlot) return;
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventTypeId: eventType.id,
        bookerName: data.name,
        bookerEmail: data.email,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        notes: data.notes || null,
        answers: data.answers,
      }),
    });
    if (!res.ok) throw new Error("Booking failed");
    const booking = await res.json();
    const qp = new URLSearchParams({
      id: String(booking.id),
      title: eventType.title,
      date: selectedDate,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      name: data.name,
      duration: String(eventType.durationMinutes),
    });
    router.push(`/book/${slug}/confirmed?${qp.toString()}`);
  };

  const fmtDateLabel = (s: string) =>
    new Date(s + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-subtle">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-emphasis" />
      </div>
    );

  if (notFound || !eventType)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-subtle gap-3 text-center p-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <CalendarDays className="h-6 w-6 text-subtle" />
        </div>
        <h1 className="text-xl font-semibold text-emphasis">Event not found</h1>
        <p className="text-sm text-subtle max-w-xs">
          This event type doesn&apos;t exist or is no longer available.
        </p>
        <Link href="/" className="mt-2 text-sm font-medium text-emphasis hover:underline">
          ← Back to home
        </Link>
      </div>
    );

  return (
    <div className="flex min-h-screen flex-col bg-subtle">
      {/* Top bar */}
      <div className="border-b border-default bg-white px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-[17px] font-bold tracking-tight text-emphasis hover:opacity-80 transition-opacity">
          Cal<span className="text-gray-400">.com</span>
        </Link>
      </div>

      <div className="flex flex-1 items-start justify-center p-4 sm:p-6 lg:items-center">
        <div className="w-full max-w-3xl overflow-hidden rounded-lg border border-default bg-white shadow-sm">
          {step === "enter-details" && selectedDate && selectedSlot ? (
            <BookingForm
              eventTitle={eventType.title}
              durationMinutes={eventType.durationMinutes}
              date={selectedDate}
              startTime={selectedSlot.startTime}
              endTime={selectedSlot.endTime}
              questions={eventType.questions}
              onBack={() => setStep("select-time")}
              onSubmit={handleBookingSubmit}
            />
          ) : (
            <div className="flex flex-col md:flex-row">
              {/* Left: event info */}
              <div className="border-b md:border-b-0 md:border-r border-default p-6 md:w-64 flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#111111] text-sm font-semibold text-white mb-3">
                  D
                </div>
                <p className="text-xs text-muted">Demo User</p>
                <h1 className="mt-0.5 text-xl font-bold text-emphasis">{eventType.title}</h1>
                {eventType.description && (
                  <p className="mt-2 text-sm text-subtle leading-relaxed">
                    {eventType.description}
                  </p>
                )}
                <div className="mt-4 space-y-2.5">
                  <p className="flex items-center gap-2 text-sm text-subtle">
                    <Clock className="h-4 w-4 text-muted" />
                    {eventType.durationMinutes} min
                  </p>
                  <div className="relative">
                    <button
                      onClick={() => setShowTzPicker(!showTzPicker)}
                      className="flex items-center gap-2 text-sm text-subtle hover:text-emphasis transition-colors"
                    >
                      <Globe className="h-4 w-4 text-muted" />
                      <span>{timezone.replace(/_/g, " ")}</span>
                      <ChevronDown className="h-3 w-3 text-muted" />
                    </button>
                    {showTzPicker && (
                      <div className="absolute left-0 top-full mt-1 z-50 w-[calc(100vw-4rem)] sm:w-72 max-h-60 overflow-y-auto rounded-lg border border-default bg-white shadow-lg">
                        {timezoneList.map((tz) => (
                          <button
                            key={tz}
                            onClick={() => { setTimezone(tz); setShowTzPicker(false); }}
                            className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                              tz === timezone
                                ? "bg-emphasis text-white"
                                : "text-default hover:bg-muted"
                            }`}
                          >
                            {formatTzLabel(tz)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {selectedDate && (
                    <p className="flex items-center gap-2 text-sm text-subtle">
                      <Calendar className="h-4 w-4 text-muted" />
                      {fmtDateLabel(selectedDate)}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: calendar + slots */}
              <div className="flex flex-1 flex-col md:flex-row">
                <div className="flex-1 p-6">
                  <p className="mb-4 text-sm font-semibold text-emphasis">Select a date</p>
                  <CalendarPicker
                    selectedDate={selectedDate}
                    onSelectDate={handleDateSelect}
                    currentMonth={currentMonth}
                    onChangeMonth={setCurrentMonth}
                  />
                </div>

                {selectedDate && (
                  <div className="border-t md:border-t-0 md:border-l border-default p-4 sm:p-6 md:w-56 max-h-[50vh] md:max-h-none overflow-y-auto">
                    <TimeSlots
                      slots={slots}
                      loading={slotsLoading}
                      selectedSlot={selectedSlot}
                      onSelectSlot={setSelectedSlot}
                      onConfirmSlot={() => setStep("enter-details")}
                      dateLabel={fmtDateLabel(selectedDate)}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
