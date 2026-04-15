export interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface AvailabilityWindow {
  startTime: string;
  endTime: string;
}

// "09:30" → 570
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

// 570 → "09:30"
export function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

// Generate slots within a window at duration-sized intervals
export function generateSlots(
  window: AvailabilityWindow,
  durationMinutes: number
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const start = timeToMinutes(window.startTime);
  const end = timeToMinutes(window.endTime);
  for (let cur = start; cur + durationMinutes <= end; cur += durationMinutes) {
    slots.push({
      startTime: minutesToTime(cur),
      endTime: minutesToTime(cur + durationMinutes),
    });
  }
  return slots;
}

// Half-open interval overlap: [A_start, A_end) ∩ [B_start, B_end) ≠ ∅
export function hasOverlap(
  a: { startTime: string; endTime: string },
  b: { startTime: string; endTime: string }
): boolean {
  return (
    timeToMinutes(a.startTime) < timeToMinutes(b.endTime) &&
    timeToMinutes(b.startTime) < timeToMinutes(a.endTime)
  );
}

// Determine availability window for a date:
// 1. Date override → blocked (null) or custom hours
// 2. Day-of-week rule → standard hours
// 3. No rule → null (unavailable)
export function getWindowForDate(
  date: string,
  dayOfWeek: number,
  rules: { dayOfWeek: number; startTime: string; endTime: string }[],
  overrides: {
    date: string;
    startTime: string | null;
    endTime: string | null;
    isBlocked: boolean;
  }[]
): AvailabilityWindow | null {
  const override = overrides.find((o) => o.date === date);
  if (override) {
    if (override.isBlocked) return null;
    if (override.startTime && override.endTime)
      return { startTime: override.startTime, endTime: override.endTime };
  }
  const rule = rules.find((r) => r.dayOfWeek === dayOfWeek);
  return rule ? { startTime: rule.startTime, endTime: rule.endTime } : null;
}

// Main: compute available slots = all possible slots minus booked ones.
// bufferMinutes extends each existing booking's end time so the next slot
// cannot start until bufferMinutes after the booking ends.
export function getAvailableSlots(
  date: string,
  durationMinutes: number,
  window: AvailabilityWindow | null,
  existingBookings: { startTime: string; endTime: string }[],
  bufferMinutes: number = 0
): TimeSlot[] {
  if (!window) return [];
  const all = generateSlots(window, durationMinutes);
  return all.filter(
    (slot) =>
      !existingBookings.some((b) => {
        // Extend the booked block by bufferMinutes so that the buffer
        // period after a meeting is also treated as unavailable.
        const bufferedEnd = minutesToTime(
          timeToMinutes(b.endTime) + bufferMinutes
        );
        return hasOverlap(slot, { startTime: b.startTime, endTime: bufferedEnd });
      })
  );
}
