"use client";

import { useEffect, useState } from "react";
import { Check, Plus, Trash2, X, Star, CalendarX, Clock4, Globe } from "lucide-react";

const DAYS = [
  { value: 0, label: "Sunday", short: "Sun" },
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
  { value: 6, label: "Saturday", short: "Sat" },
];

const TIMEZONES = [
  "Asia/Kolkata", "America/New_York", "America/Chicago", "America/Denver",
  "America/Los_Angeles", "Europe/London", "Europe/Berlin", "Asia/Tokyo",
  "Asia/Shanghai", "Australia/Sydney", "Pacific/Auckland",
];

function genTimeOptions() {
  const opts: string[] = [];
  for (let h = 0; h < 24; h++)
    for (let m = 0; m < 60; m += 30)
      opts.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
  return opts;
}
const TIME_OPTIONS = genTimeOptions();

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const p = h >= 12 ? "PM" : "AM";
  return `${h === 0 ? 12 : h > 12 ? h - 12 : h}:${m.toString().padStart(2, "0")} ${p}`;
}

interface DayRule { dayOfWeek: number; startTime: string; endTime: string; enabled: boolean; }
interface Schedule {
  id: number; name: string; timezone: string; isDefault: boolean;
  rules: { dayOfWeek: number; startTime: string; endTime: string }[];
  dateOverrides: DateOverride[];
}
interface DateOverride {
  id: number; date: string; isBlocked: boolean;
  startTime: string | null; endTime: string | null;
}

export default function AvailabilityPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [activeScheduleId, setActiveScheduleId] = useState<number | null>(null);
  const [days, setDays] = useState<DayRule[]>(
    DAYS.map((d) => ({ dayOfWeek: d.value, startTime: "09:00", endTime: "17:00", enabled: false }))
  );
  const [tz, setTz] = useState("Asia/Kolkata");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // New schedule form
  const [showNewSchedule, setShowNewSchedule] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  // Date overrides
  const [overrides, setOverrides] = useState<DateOverride[]>([]);
  const [showOverrideForm, setShowOverrideForm] = useState(false);
  const [overrideDate, setOverrideDate] = useState("");
  const [overrideType, setOverrideType] = useState<"blocked" | "custom">("blocked");
  const [overrideStart, setOverrideStart] = useState("09:00");
  const [overrideEnd, setOverrideEnd] = useState("17:00");
  const [savingOverride, setSavingOverride] = useState(false);

  const fetchSchedules = async () => {
    const res = await fetch("/api/schedules");
    const data: Schedule[] = await res.json();
    setSchedules(data);
    if (data.length > 0) {
      const def = data.find((s) => s.isDefault) || data[0];
      loadSchedule(def);
    }
    setLoading(false);
  };

  const loadSchedule = (s: Schedule) => {
    setActiveScheduleId(s.id);
    setTz(s.timezone);
    setDays(
      DAYS.map((d) => {
        const rule = s.rules.find((r) => r.dayOfWeek === d.value);
        return rule
          ? { dayOfWeek: d.value, startTime: rule.startTime, endTime: rule.endTime, enabled: true }
          : { dayOfWeek: d.value, startTime: "09:00", endTime: "17:00", enabled: false };
      })
    );
    setOverrides(s.dateOverrides);
  };

  useEffect(() => { fetchSchedules(); }, []);

  const handleSave = async () => {
    if (!activeScheduleId) return;
    setSaving(true); setSaved(false);
    const rules = days.filter((d) => d.enabled).map((d) => ({
      dayOfWeek: d.dayOfWeek, startTime: d.startTime, endTime: d.endTime,
    }));
    await fetch(`/api/schedules/${activeScheduleId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timezone: tz, rules }),
    });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSetDefault = async (id: number) => {
    await fetch(`/api/schedules/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setDefault: true }),
    });
    setSchedules((prev) => prev.map((s) => ({ ...s, isDefault: s.id === id })));
  };

  const handleDeleteSchedule = async (id: number) => {
    if (!confirm("Delete this schedule?")) return;
    await fetch(`/api/schedules/${id}`, { method: "DELETE" });
    const remaining = schedules.filter((s) => s.id !== id);
    setSchedules(remaining);
    if (activeScheduleId === id && remaining.length > 0) loadSchedule(remaining[0]);
  };

  const handleCreateSchedule = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    const res = await fetch("/api/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), timezone: tz }),
    });
    const s: Schedule = await res.json();
    setSchedules((prev) => [...prev, s]);
    loadSchedule(s);
    setNewName(""); setShowNewSchedule(false); setCreating(false);
  };

  const handleAddOverride = async () => {
    if (!overrideDate) return;
    setSavingOverride(true);
    const res = await fetch("/api/date-overrides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: overrideDate,
        isBlocked: overrideType === "blocked",
        startTime: overrideType === "custom" ? overrideStart : null,
        endTime: overrideType === "custom" ? overrideEnd : null,
      }),
    });
    const override: DateOverride = await res.json();
    setOverrides((prev) => {
      const existing = prev.findIndex((o) => o.date === override.date);
      if (existing >= 0) { const next = [...prev]; next[existing] = override; return next; }
      return [...prev, override].sort((a, b) => a.date.localeCompare(b.date));
    });
    setOverrideDate(""); setShowOverrideForm(false); setSavingOverride(false);
  };

  const handleDeleteOverride = async (id: number) => {
    await fetch(`/api/date-overrides/${id}`, { method: "DELETE" });
    setOverrides((prev) => prev.filter((o) => o.id !== id));
  };

  const toggle = (dow: number) =>
    setDays((p) => p.map((d) => (d.dayOfWeek === dow ? { ...d, enabled: !d.enabled } : d)));
  const updateTime = (dow: number, field: "startTime" | "endTime", val: string) =>
    setDays((p) => p.map((d) => (d.dayOfWeek === dow ? { ...d, [field]: val } : d)));

  const activeSchedule = schedules.find((s) => s.id === activeScheduleId);

  if (loading)
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-emphasis" />
      </div>
    );

  return (
    <div>
      {/* Header */}
      {/* Header */}
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Availability</h1>
          <p className="mt-0.5 text-[14px] text-gray-400">Configure when you are available for bookings.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-gray-200 transition-all self-start ${saved ? "!bg-green-600 !text-white hover:!bg-green-700" : ""}`}
        >
          {saved ? <><Check className="h-4 w-4" /> Saved</> : saving ? "Saving..." : "Save changes"}
        </button>
      </div>

      {/* ─── Schedules ─── */}
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-white">Schedules</h2>
          <button
            onClick={() => setShowNewSchedule((v) => !v)}
            className="inline-flex items-center gap-2 rounded-md border border-[#2c2c2c] px-3 py-1.5 text-xs font-semibold text-gray-300 transition-all hover:bg-[#1a1a1a] hover:text-white"
          >
            <Plus className="h-3.5 w-3.5" /> New schedule
          </button>
        </div>

        {showNewSchedule && (
          <div className="mb-3 flex items-center gap-2">
            <input
              type="text"
              placeholder="Schedule name…"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateSchedule()}
              className="block flex-1 max-w-xs rounded-md border border-[#2c2c2c] bg-transparent px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-gray-500 focus:outline-none"
            />
            <button onClick={handleCreateSchedule} disabled={creating} className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-semibold text-black hover:bg-gray-200 transition-all">
              {creating ? "Creating…" : "Create"}
            </button>
            <button onClick={() => setShowNewSchedule(false)} className="inline-flex items-center justify-center gap-2 rounded-md border border-[#2c2c2c] bg-transparent px-3 py-2 text-xs font-semibold text-gray-300 hover:bg-[#1a1a1a] hover:text-white transition-all">
              Cancel
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {schedules.map((s) => (
            <div
              key={s.id}
              className={`group flex items-center gap-2 rounded-md border px-3 py-2 text-[13px] font-medium cursor-pointer transition-all ${
                activeScheduleId === s.id
                  ? "border-[2px] border-white text-white shadow-sm"
                  : "border border-[#2c2c2c] bg-transparent text-gray-400 hover:border-gray-500 hover:text-gray-200"
              }`}
              onClick={() => { const sc = schedules.find((x) => x.id === s.id); if (sc) loadSchedule(sc); }}
            >
              {s.isDefault && <Star className="h-3 w-3 fill-current" />}
              {s.name}
              {!s.isDefault && activeScheduleId === s.id && (
                <div className="flex items-center gap-1 ml-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleSetDefault(s.id)}
                    title="Set as default"
                    className="text-white/50 hover:text-yellow-300 transition-colors"
                  >
                    <Star className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteSchedule(s.id)}
                    title="Delete"
                    className="text-white/50 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ─── Weekly hours ─── */}
      <div className="rounded-[8px] bg-[#111111] border border-[#2c2c2c] max-w-2xl overflow-hidden mb-6">
        <div className="border-b border-[#2c2c2c] px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-[14px] font-semibold text-white">{activeSchedule?.name || "Working Hours"}</p>
            <p className="text-xs text-gray-400 mt-0.5">Set your weekly recurring schedule</p>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5 text-gray-500" />
            <select
              value={tz}
              onChange={(e) => setTz(e.target.value)}
              className="rounded-md border border-[#2c2c2c] bg-[#1a1a1a] text-white focus:border-gray-500 outline-none !w-auto text-[11px] font-medium py-1.5 pl-2 pr-7"
            >
              {TIMEZONES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
            </select>
          </div>
        </div>

        <div className="divide-y divide-[#2c2c2c]">
          {days.map((day) => (
            <div key={day.dayOfWeek} className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:gap-6">
              <div className="flex items-center gap-3 sm:w-36">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={day.enabled}
                    onClick={() => toggle(day.dayOfWeek)}
                    className={`relative inline-flex h-[20px] w-[36px] flex-shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${day.enabled ? "bg-white" : "bg-[#2c2c2c]"}`}
                  >
                    <span className={`pointer-events-none inline-block h-[14px] w-[14px] transform rounded-full transition duration-200 ease-in-out ${day.enabled ? "translate-x-4 bg-black" : "translate-x-0.5 bg-gray-500"}`} />
                  </button>
                <span className={`text-[13px] font-semibold ${day.enabled ? "text-white" : "text-gray-500"}`}>
                  {DAYS.find((d) => d.value === day.dayOfWeek)!.label}
                </span>
              </div>
              {day.enabled ? (
                <div className="flex items-center gap-2 pl-12 sm:pl-0">
                  <select value={day.startTime} onChange={(e) => updateTime(day.dayOfWeek, "startTime", e.target.value)} className="rounded-md border border-[#2c2c2c] bg-transparent text-gray-300 focus:border-gray-500 outline-none w-24 text-[12px] font-medium py-1.5 pl-2">
                    {TIME_OPTIONS.map((t) => <option key={t} value={t}>{formatTime(t)}</option>)}
                  </select>
                  <span className="text-gray-500 text-xs">–</span>
                  <select value={day.endTime} onChange={(e) => updateTime(day.dayOfWeek, "endTime", e.target.value)} className="rounded-md border border-[#2c2c2c] bg-transparent text-gray-300 focus:border-gray-500 outline-none w-24 text-[12px] font-medium py-1.5 pl-2">
                    {TIME_OPTIONS.map((t) => <option key={t} value={t}>{formatTime(t)}</option>)}
                  </select>
                </div>
              ) : (
                <span className="pl-12 text-[12px] font-medium text-gray-500 sm:pl-0">Unavailable</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ─── Date Overrides ─── */}
      <div className="rounded-[8px] bg-[#111111] border border-[#2c2c2c] max-w-2xl overflow-hidden">
        <div className="border-b border-[#2c2c2c] px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-[14px] font-semibold text-white">Date overrides</p>
            <p className="text-xs text-gray-400 mt-0.5">Block specific dates or set custom hours.</p>
          </div>
          <button
            onClick={() => setShowOverrideForm((v) => !v)}
            className="inline-flex items-center gap-2 rounded-md border border-[#2c2c2c] bg-transparent px-3 py-1.5 text-xs font-semibold text-gray-300 transition-all hover:bg-[#1a1a1a] hover:text-white"
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>

        {showOverrideForm && (
          <div className="border-b border-[#2c2c2c] px-5 py-4 bg-[#1a1a1a] space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Date</label>
                <input
                  type="date"
                  value={overrideDate}
                  onChange={(e) => setOverrideDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  style={{ colorScheme: "dark" }}
                  className="block w-full rounded-md border border-[#2c2c2c] bg-[#111111] px-3 py-2 text-[13px] text-white focus:border-gray-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Type</label>
                <select
                  value={overrideType}
                  onChange={(e) => setOverrideType(e.target.value as "blocked" | "custom")}
                  className="block w-full rounded-md border border-[#2c2c2c] bg-[#111111] px-3 py-2 text-[13px] text-white focus:border-gray-500 focus:outline-none"
                >
                  <option value="blocked">Block entire day</option>
                  <option value="custom">Custom hours</option>
                </select>
              </div>
            </div>

            {overrideType === "custom" && (
              <div className="flex items-center gap-2">
                <select value={overrideStart} onChange={(e) => setOverrideStart(e.target.value)} className="rounded-md border border-[#2c2c2c] bg-[#111111] text-gray-300 focus:border-gray-500 outline-none w-28 text-xs py-1.5 pl-2">
                  {TIME_OPTIONS.map((t) => <option key={t} value={t}>{formatTime(t)}</option>)}
                </select>
                <span className="text-gray-500 text-xs">–</span>
                <select value={overrideEnd} onChange={(e) => setOverrideEnd(e.target.value)} className="rounded-md border border-[#2c2c2c] bg-[#111111] text-gray-300 focus:border-gray-500 outline-none w-28 text-xs py-1.5 pl-2">
                  {TIME_OPTIONS.map((t) => <option key={t} value={t}>{formatTime(t)}</option>)}
                </select>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button onClick={handleAddOverride} disabled={savingOverride || !overrideDate} className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-2 text-[13px] font-semibold text-black hover:bg-gray-200 transition-all">
                {savingOverride ? "Saving…" : "Add override"}
              </button>
              <button onClick={() => setShowOverrideForm(false)} className="inline-flex items-center justify-center gap-2 rounded-md border border-[#2c2c2c] bg-transparent px-4 py-2 text-[13px] font-semibold text-gray-300 hover:bg-[#2c2c2c] hover:text-white transition-all">
                Cancel
              </button>
            </div>
          </div>
        )}

        {overrides.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center px-5">
            <CalendarX className="h-8 w-8 text-[#2c2c2c] mb-2" />
            <p className="text-[13px] font-medium text-gray-500">No date overrides yet.</p>
            <p className="text-[12px] text-gray-600 mt-0.5">Add overrides to block days or set custom hours.</p>
          </div>
        ) : (
          <ul className="divide-y divide-[#2c2c2c]">
            {overrides.map((o) => (
              <li key={o.id} className="flex items-center justify-between px-5 py-3 hover:bg-[#1a1a1a] transition-colors">
                <div className="flex items-center gap-3">
                  {o.isBlocked ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-red-500/10 border border-red-500/20">
                      <CalendarX className="h-4 w-4 text-red-500" />
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500/10 border border-blue-500/20">
                      <Clock4 className="h-4 w-4 text-blue-500" />
                    </div>
                  )}
                  <div>
                    <p className="text-[13px] font-semibold text-white">
                      {new Date(o.date + "T00:00:00").toLocaleDateString("en-US", {
                        weekday: "short", month: "short", day: "numeric", year: "numeric",
                      })}
                    </p>
                    <p className="text-[12px] font-medium text-gray-500">
                      {o.isBlocked ? "Blocked — no meetings" : `${formatTime(o.startTime!)} – ${formatTime(o.endTime!)}`}
                    </p>
                  </div>
                </div>
                <button onClick={() => handleDeleteOverride(o.id)} className="rounded-md border border-[#2c2c2c] bg-transparent p-1.5 text-gray-500 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
