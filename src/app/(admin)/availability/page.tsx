"use client";

import { useEffect, useState } from "react";
import { Check, Plus, Trash2, X, Star, CalendarX, Clock4, Globe, MoreHorizontal, ArrowLeft, Pencil, Copy, Trash } from "lucide-react";

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

function formatTime(t: string | null) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const p = h >= 12 ? "PM" : "AM";
  return `${h === 0 ? 12 : h > 12 ? h - 12 : h}:${m.toString().padStart(2, "0")} ${p}`;
}

function getScheduleSummary(rules: { dayOfWeek: number; startTime: string; endTime: string }[]) {
  if (!rules || rules.length === 0) return "No working hours set";
  const dRules = [...rules].sort((a,b) => a.dayOfWeek - b.dayOfWeek);
  const startDay = DAYS.find(d => d.value === dRules[0].dayOfWeek)?.short;
  const endDay = DAYS.find(d => d.value === dRules[dRules.length-1].dayOfWeek)?.short;
  const sTime = formatTime(dRules[0].startTime);
  const eTime = formatTime(dRules[0].endTime);
  if (dRules.length === 1) return `${startDay}, ${sTime} - ${eTime}`;
  return `${startDay} - ${endDay}, ${sTime} - ${eTime}`;
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
  const [viewState, setViewState] = useState<"list" | "edit">("list");
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [activeScheduleId, setActiveScheduleId] = useState<number | null>(null);
  
  const [days, setDays] = useState<DayRule[]>(
    DAYS.map((d) => ({ dayOfWeek: d.value, startTime: "09:00", endTime: "17:00", enabled: false }))
  );
  const [tz, setTz] = useState("Asia/Kolkata");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // New schedule
  const [showNewSchedule, setShowNewSchedule] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  // Overrides
  const [overrides, setOverrides] = useState<DateOverride[]>([]);
  const [showOverrideForm, setShowOverrideForm] = useState(false);
  const [overrideDate, setOverrideDate] = useState("");
  const [overrideType, setOverrideType] = useState<"blocked" | "custom">("blocked");
  const [overrideStart, setOverrideStart] = useState("09:00");
  const [overrideEnd, setOverrideEnd] = useState("17:00");
  const [savingOverride, setSavingOverride] = useState(false);

  // Menu
  const [menuOpen, setMenuOpen] = useState<number | null>(null);

  const fetchSchedules = async () => {
    try {
      const res = await fetch("/api/schedules");
      const data = await res.json();
      if (Array.isArray(data)) {
        setSchedules(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSchedules(); }, []);

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
    setViewState("edit");
  };

  const activeSchedule = schedules.find((s) => s.id === activeScheduleId);

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
    await fetchSchedules();
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSetDefault = async (id: number) => {
    await fetch(`/api/schedules/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setDefault: true }),
    });
    await fetchSchedules();
    setMenuOpen(null);
  };

  const handleDeleteSchedule = async (id: number) => {
    if (!confirm("Delete this schedule?")) return;
    await fetch(`/api/schedules/${id}`, { method: "DELETE" });
    await fetchSchedules();
    if (activeScheduleId === id) setViewState("list");
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
    setNewName(""); setShowNewSchedule(false); setCreating(false);
    loadSchedule(s);
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
    await fetchSchedules();
    setOverrideDate(""); setShowOverrideForm(false); setSavingOverride(false);
  };

  const handleDeleteOverride = async (id: number) => {
    await fetch(`/api/date-overrides/${id}`, { method: "DELETE" });
    setOverrides((prev) => prev.filter((o) => o.id !== id));
    await fetchSchedules();
  };

  const toggle = (dow: number) => setDays((p) => p.map((d) => (d.dayOfWeek === dow ? { ...d, enabled: !d.enabled } : d)));
  const updateTime = (dow: number, field: "startTime" | "endTime", val: string) =>
    setDays((p) => p.map((d) => (d.dayOfWeek === dow ? { ...d, [field]: val } : d)));

  if (loading)
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-[#292929]" />
      </div>
    );

  if (viewState === "list") {
    return (
      <div className="px-1 max-w-4xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-[20px] font-bold text-white tracking-tight">Availability</h1>
            <p className="mt-0.5 text-[14px] text-gray-400">Configure times when you are available for bookings.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex border border-[#2c2c2c] rounded-md overflow-hidden text-[13px] font-medium bg-[#1a1a1a]">
              <button className="px-3 py-1.5 text-white bg-white/[0.06]">My availability</button>
              <button className="px-3 py-1.5 text-gray-400 hover:text-white hover:bg-white/[0.04]">Team availability</button>
            </div>
            <button
              onClick={() => setShowNewSchedule(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-black hover:bg-gray-200 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" /> New
            </button>
          </div>
        </div>

        {showNewSchedule && (
          <div className="mb-6 rounded-[8px] bg-[#111111] border border-[#2c2c2c] p-5 animate-in fade-in slide-in-from-top-2">
            <h3 className="text-[14px] font-semibold text-white mb-3">Create new schedule</h3>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Schedule name…"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateSchedule()}
                autoFocus
                className="block flex-1 max-w-xs rounded-md border border-[#2c2c2c] bg-transparent px-3 py-2 text-[13px] text-white placeholder:text-gray-500 focus:border-gray-500 focus:outline-none"
              />
              <button onClick={handleCreateSchedule} disabled={creating} className="inline-flex items-center justify-center rounded-md bg-white px-4 py-2 text-[13px] font-semibold text-black hover:bg-gray-200 transition-all">
                {creating ? "Creating…" : "Create"}
              </button>
              <button onClick={() => setShowNewSchedule(false)} className="inline-flex items-center justify-center rounded-md border border-[#2c2c2c] bg-transparent px-4 py-2 text-[13px] font-semibold text-gray-300 hover:bg-[#1a1a1a] hover:text-white transition-all">
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {schedules.map((s) => (
            <div
              key={s.id}
              onClick={() => loadSchedule(s)}
              className="group relative cursor-pointer rounded-[8px] border border-[#2c2c2c] bg-[#111111] p-5 shadow-sm transition-all hover:border-[#444] hover:bg-[#151515]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <h3 className="text-[15px] font-bold text-white group-hover:underline underline-offset-2">{s.name}</h3>
                    {s.isDefault && (
                      <span className="rounded-md bg-white/[0.08] px-1.5 py-0.5 text-[11px] font-semibold text-white">Default</span>
                    )}
                  </div>
                  <p className="text-[13px] text-gray-400 mb-2">
                    {getScheduleSummary(s.rules)}
                  </p>
                  <p className="flex items-center gap-1.5 text-[12px] font-medium text-gray-500">
                    <Globe className="h-3.5 w-3.5" />
                    {s.timezone.replace(/_/g, " ")}
                  </p>
                </div>
                
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setMenuOpen(menuOpen === s.id ? null : s.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-[#2c2c2c] text-gray-400 hover:bg-[#1a1a1a] hover:text-white transition-colors"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                  {menuOpen === s.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)}></div>
                      <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-lg border border-[#2c2c2c] bg-[#1a1a1a] p-1 shadow-2xl">
                        {!s.isDefault && (
                          <button
                            onClick={() => handleSetDefault(s.id)}
                            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-white hover:bg-white/[0.06] transition-colors"
                          >
                            <Star className="h-3.5 w-3.5" /> Set as default
                          </button>
                        )}
                        <button
                          onClick={() => { setMenuOpen(null); handleDeleteSchedule(s.id); }}
                          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center pb-8 border-t border-[#2c2c2c] pt-5">
          <p className="text-[14px] text-gray-400">
            Temporarily out-of-office? <a href="#" className="text-white decoration-gray-500 underline underline-offset-4 hover:text-gray-300 transition-colors">Add a redirect</a>
          </p>
        </div>
      </div>
    );
  }

  // EDIT VIEW
  return (
    <div className="px-1 max-w-5xl mx-auto pb-10">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#2c2c2c] pb-4 mb-6 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setViewState("list")}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#1a1a1a] border border-transparent hover:border-[#2c2c2c] transition-colors text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 group">
              <h1 className="text-[18px] font-bold text-white tracking-tight cursor-pointer">{activeSchedule?.name || "Working hours"}</h1>
              <Pencil className="h-3.5 w-3.5 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-white" />
            </div>
            <p className="text-[13px] text-gray-400 mt-0.5">{getScheduleSummary(activeSchedule?.rules || [])}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 ml-[48px] md:ml-0">
          <div className="flex items-center gap-3">
             <span className="text-[13px] font-semibold text-white">Set as default</span>
             <button
               disabled={activeSchedule?.isDefault}
               onClick={() => activeSchedule && handleSetDefault(activeSchedule.id)}
               className={`relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                 activeSchedule?.isDefault ? "bg-white" : "bg-[#2c2c2c]"
               }`}
             >
               <span className={`inline-block h-[20px] w-[20px] transform rounded-full transition duration-200 ease-in-out ${
                 activeSchedule?.isDefault ? "translate-x-[20px] bg-black" : "translate-x-0 bg-gray-500"
               }`} />
             </button>
          </div>
          <div className="h-5 w-px bg-[#2c2c2c]"></div>
          <button
            onClick={() => activeSchedule && handleDeleteSchedule(activeSchedule.id)}
            disabled={activeSchedule?.isDefault}
            className={`flex h-9 w-9 items-center justify-center rounded-md border transition-colors ${
              activeSchedule?.isDefault 
                ? "border-[#2c2c2c] bg-transparent text-[#444] cursor-not-allowed" 
                : "border-[#2c2c2c] bg-transparent text-gray-400 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30"
            }`}
          >
            <Trash className="h-4 w-4" />
          </button>
          <div className="h-5 w-px bg-[#2c2c2c]"></div>
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-[13px] font-semibold transition-all ${
              saved 
                ? "bg-[#1a1a1a] border border-[#2c2c2c] text-white" 
                : "bg-[#2c2c2c] text-white hover:bg-[#3d3d3d] border border-transparent"
            }`}
          >
            {saved ? "Saved" : saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column (Main hours & overrides) */}
        <div className="flex-1 space-y-6">
          {/* Weekly Hours Box */}
          <div className="rounded-[8px] bg-[#111111] border border-[#2c2c2c] shadow-sm overflow-hidden">
            <div className="divide-y divide-[#1a1a1a]">
              {days.map((day) => (
                <div key={day.dayOfWeek} className="flex flex-col p-4 sm:flex-row sm:items-center sm:gap-6 hover:bg-white/[0.01] transition-colors">
                  <div className="flex items-center gap-4 sm:w-40">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={day.enabled}
                      onClick={() => toggle(day.dayOfWeek)}
                      className={`relative inline-flex h-[24px] w-[44px] flex-shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${day.enabled ? "bg-white" : "bg-[#1a1a1a]"}`}
                    >
                      <span className={`pointer-events-none inline-block h-[20px] w-[20px] transform rounded-full transition duration-200 ease-in-out ${day.enabled ? "translate-x-[20px] bg-black" : "translate-x-0 bg-gray-500"}`} />
                    </button>
                    <span className={`text-[14px] font-medium ${day.enabled ? "text-white" : "text-gray-500"}`}>
                      {DAYS.find((d) => d.value === day.dayOfWeek)!.label}
                    </span>
                  </div>
                  {day.enabled ? (
                    <div className="flex items-center gap-3 mt-3 sm:mt-0 flex-1">
                      <select value={day.startTime} onChange={(e) => updateTime(day.dayOfWeek, "startTime", e.target.value)} className="rounded-md border border-[#2c2c2c] bg-transparent text-gray-300 focus:border-gray-500 outline-none w-[100px] text-[13px] font-medium py-2 pl-3">
                        {TIME_OPTIONS.map((t) => <option key={t} value={t} className="bg-[#111]">{formatTime(t)}</option>)}
                      </select>
                      <span className="text-gray-600 text-sm">-</span>
                      <select value={day.endTime} onChange={(e) => updateTime(day.dayOfWeek, "endTime", e.target.value)} className="rounded-md border border-[#2c2c2c] bg-transparent text-gray-300 focus:border-gray-500 outline-none w-[100px] text-[13px] font-medium py-2 pl-3">
                        {TIME_OPTIONS.map((t) => <option key={t} value={t} className="bg-[#111]">{formatTime(t)}</option>)}
                      </select>
                      
                      <button className="p-2 ml-auto text-gray-500 hover:text-white rounded-md hover:bg-white/[0.04]">
                        <Plus className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-white rounded-md hover:bg-white/[0.04]">
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[13px] font-medium text-gray-500 mt-2 sm:mt-0"></span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Date Overrides Box */}
          <div className="rounded-[8px] bg-[#111111] border border-[#2c2c2c] p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-[14px] font-bold text-white flex items-center gap-1.5">
                Date overrides <span className="flex items-center justify-center h-3.5 w-3.5 rounded-full border border-gray-500 text-gray-500 text-[10px] cursor-help" title="Add dates when your availability changes from your daily hours.">i</span>
              </h3>
              <p className="text-[14px] text-gray-400 mt-0.5">Add dates when your availability changes from your daily hours.</p>
            </div>

            {showOverrideForm && (
              <div className="mb-5 rounded-[8px] border border-[#2c2c2c] bg-[#1a1a1a] p-4">
                <div className="flex flex-col sm:flex-row gap-3 items-end">
                  <div className="w-full sm:w-auto">
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Date</label>
                    <input
                      type="date"
                      value={overrideDate}
                      onChange={(e) => setOverrideDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      style={{ colorScheme: "dark" }}
                      className="block w-full rounded-md border border-[#2c2c2c] bg-[#111111] px-3 py-2 text-[13px] text-white focus:outline-none focus:border-gray-500"
                    />
                  </div>
                  <div className="w-full sm:w-auto">
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Type</label>
                    <select
                      value={overrideType}
                      onChange={(e) => setOverrideType(e.target.value as "blocked" | "custom")}
                      className="block w-full rounded-md border border-[#2c2c2c] bg-[#111111] px-3 py-2 text-[13px] text-white focus:outline-none focus:border-gray-500"
                    >
                      <option value="blocked">Unavailable</option>
                      <option value="custom">Specific hours</option>
                    </select>
                  </div>
                  {overrideType === "custom" && (
                     <div className="flex items-center gap-2">
                       <div>
                         <label className="block text-xs font-semibold text-gray-300 mb-1.5 opacity-0">Start</label>
                         <select value={overrideStart} onChange={(e) => setOverrideStart(e.target.value)} className="rounded-md border border-[#2c2c2c] bg-[#111111] text-gray-300 outline-none w-28 text-[13px] py-2 pl-2 focus:border-gray-500">
                           {TIME_OPTIONS.map((t) => <option key={t} value={t}>{formatTime(t)}</option>)}
                         </select>
                       </div>
                       <span className="text-gray-500 pb-2">-</span>
                       <div>
                         <label className="block text-xs font-semibold text-gray-300 mb-1.5 opacity-0">End</label>
                         <select value={overrideEnd} onChange={(e) => setOverrideEnd(e.target.value)} className="rounded-md border border-[#2c2c2c] bg-[#111111] text-gray-300 outline-none w-28 text-[13px] py-2 pl-2 focus:border-gray-500">
                           {TIME_OPTIONS.map((t) => <option key={t} value={t}>{formatTime(t)}</option>)}
                         </select>
                       </div>
                     </div>
                  )}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button onClick={handleAddOverride} disabled={savingOverride || !overrideDate} className="rounded-md bg-white px-4 py-2 text-[13px] font-semibold text-black hover:bg-gray-200 w-full sm:w-auto">Add</button>
                    <button onClick={() => setShowOverrideForm(false)} className="rounded-md px-3 py-2 text-[13px] text-gray-400 hover:bg-[#2c2c2c] w-full sm:w-auto">Cancel</button>
                  </div>
                </div>
              </div>
            )}

            {overrides.length > 0 && (
              <ul className="mb-5 divide-y divide-[#2c2c2c] border border-[#2c2c2c] rounded-[8px] overflow-hidden">
                {overrides.map((o) => (
                  <li key={o.id} className="flex items-center justify-between px-4 py-3 bg-[#111111] hover:bg-white/[0.02] transition-colors">
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
                           {new Date(o.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                         </p>
                         <p className="text-[12px] font-medium text-gray-500">
                           {o.isBlocked ? "Blocked — no meetings" : `${formatTime(o.startTime!)} – ${formatTime(o.endTime!)}`}
                         </p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteOverride(o.id)} className="p-1.5 text-gray-500 hover:text-red-500 rounded-md hover:bg-red-500/10 hover:border hover:border-red-500/20 transition-all border border-transparent">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {!showOverrideForm && (
              <button
                onClick={() => setShowOverrideForm(true)}
                className="inline-flex items-center gap-2 rounded-md border border-[#2c2c2c] bg-transparent px-4 py-2 text-[13px] font-semibold text-white hover:bg-white/[0.04] transition-colors"
              >
                <Plus className="h-4 w-4" /> Add an override
              </button>
            )}
          </div>
        </div>

        {/* Right Column (Timezone & Troubleshoot) */}
        <div className="lg:w-[300px] space-y-6">
          <div className="space-y-1.5">
            <label className="text-[14px] font-medium text-white">Timezone</label>
            <select
              value={tz}
              onChange={(e) => setTz(e.target.value)}
              className="w-full rounded-[8px] border border-[#2c2c2c] bg-[#111111] text-[14px] text-white py-2.5 pl-3 pr-8 outline-none focus:border-gray-500"
            >
              {TIMEZONES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
            </select>
          </div>

          <div className="rounded-[8px] bg-[#111111] border border-[#2c2c2c] p-6 shadow-sm flex flex-col items-center">
            <h3 className="text-[14px] font-medium text-white mb-4">Something doesn&apos;t look right?</h3>
            <button className="inline-flex w-full items-center justify-center rounded-[8px] border border-[#2c2c2c] bg-transparent px-4 py-2 text-[14px] font-medium text-white hover:bg-[#1a1a1a] transition-all">
              Launch troubleshooter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
