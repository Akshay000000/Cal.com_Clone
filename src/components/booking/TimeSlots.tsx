"use client";

interface TimeSlot { startTime: string; endTime: string; }

interface Props {
  slots: TimeSlot[];
  loading: boolean;
  selectedSlot: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
  onConfirmSlot: () => void;
  dateLabel: string;
}

function fmtTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const p = h >= 12 ? "pm" : "am";
  const dh = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${dh}:${m.toString().padStart(2, "0")}${p}`;
}

export default function TimeSlots({
  slots,
  loading,
  selectedSlot,
  onSelectSlot,
  onConfirmSlot,
  dateLabel,
}: Props) {
  if (loading)
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-emphasis" />
      </div>
    );

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-emphasis">{dateLabel}</h3>
      {slots.length === 0 ? (
        <p className="text-sm text-muted">No available times for this date.</p>
      ) : (
        <div className="max-h-[380px] space-y-1.5 overflow-y-auto pr-1">
          {slots.map((slot) => {
            const sel =
              selectedSlot?.startTime === slot.startTime &&
              selectedSlot?.endTime === slot.endTime;
            return (
              <div key={slot.startTime} className="flex gap-1.5">
                <button
                  onClick={() => onSelectSlot(slot)}
                  className={`flex-1 rounded-md border px-4 py-2.5 text-sm font-medium transition-all duration-150 ${
                    sel
                      ? "border-emphasis bg-emphasis text-white shadow-sm"
                      : "border-default text-default hover:border-emphasis hover:text-emphasis"
                  }`}
                >
                  {fmtTime(slot.startTime)}
                </button>
                {sel && (
                  <button
                    onClick={onConfirmSlot}
                    className="rounded-md bg-emphasis px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-150 hover:bg-gray-800"
                  >
                    Next
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
