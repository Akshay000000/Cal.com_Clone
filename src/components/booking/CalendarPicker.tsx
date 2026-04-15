"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  currentMonth: Date;
  onChangeMonth: (date: Date) => void;
}

export default function CalendarPicker({
  selectedDate,
  onSelectDate,
  currentMonth,
  onChangeMonth,
}: Props) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const fmt = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const isPast = (day: number) => fmt(day) < todayStr;
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const prevMonthDisabled =
    new Date(year, month - 1, 1) < new Date(today.getFullYear(), today.getMonth(), 1);

  return (
    <div>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onChangeMonth(new Date(year, month - 1, 1))}
          disabled={prevMonthDisabled}
          className="rounded-md p-1.5 text-subtle transition-colors hover:bg-muted hover:text-emphasis disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h2 className="text-sm font-semibold text-emphasis">
          {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h2>
        <button
          onClick={() => onChangeMonth(new Date(year, month + 1, 1))}
          className="rounded-md p-1.5 text-subtle transition-colors hover:bg-muted hover:text-emphasis"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {dayNames.map((n) => (
          <div key={n} className="py-1.5 text-center text-[11px] font-medium uppercase tracking-wider text-muted">
            {n}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-px">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`e-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = fmt(day);
          const sel = selectedDate === dateStr;
          const isToday = dateStr === todayStr;
          const dis = isPast(day);

          return (
            <button
              key={day}
              onClick={() => !dis && onSelectDate(dateStr)}
              disabled={dis}
              className={`
                relative aspect-square flex items-center justify-center rounded-md text-sm font-medium transition-all duration-150
                ${dis ? "cursor-not-allowed text-gray-200" : "cursor-pointer"}
                ${sel ? "bg-emphasis text-white shadow-sm" : ""}
                ${isToday && !sel ? "font-bold text-emphasis ring-1 ring-inset ring-emphasis" : ""}
                ${!sel && !dis && !isToday ? "text-default hover:bg-muted" : ""}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
