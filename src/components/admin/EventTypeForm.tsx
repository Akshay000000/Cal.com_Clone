"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, GripVertical } from "lucide-react";
import Link from "next/link";

interface Question {
  label: string;
  required: boolean;
}

interface Props { eventTypeId?: number; }

export default function EventTypeForm({ eventTypeId }: Props) {
  const router = useRouter();
  const isEditing = !!eventTypeId;

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    durationMinutes: "30",
    bufferMinutes: "0",
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    if (!isEditing) return;
    fetch(`/api/event-types/${eventTypeId}`)
      .then((r) => r.json())
      .then((d) => {
        setForm({
          title: d.title,
          slug: d.slug,
          description: d.description || "",
          durationMinutes: String(d.durationMinutes),
          bufferMinutes: String(d.bufferMinutes || 0),
        });
        if (d.questions?.length) {
          setQuestions(d.questions.map((q: { label: string; required: boolean }) => ({
            label: q.label,
            required: q.required,
          })));
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load");
        setLoading(false);
      });
  }, [eventTypeId, isEditing]);

  const handleTitleChange = (v: string) => {
    setForm((p) => ({
      ...p,
      title: v,
      ...(!isEditing && {
        slug: v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      }),
    }));
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, { label: "", required: false }]);
  };

  const updateQuestion = (idx: number, field: keyof Question, value: string | boolean) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, [field]: value } : q))
    );
  };

  const removeQuestion = (idx: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const url = isEditing ? `/api/event-types/${eventTypeId}` : "/api/event-types";
      const validQuestions = questions.filter((q) => q.label.trim());
      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          questions: validQuestions.length > 0 ? validQuestions : undefined,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Something went wrong");
        setSaving(false);
        return;
      }
      router.push("/event-types");
      router.refresh();
    } catch {
      setError("Failed to save");
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2c2c2c] border-t-white" />
      </div>
    );

  return (
    <div>
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/event-types"
            className="inline-flex items-center gap-1.5 text-[13px] text-gray-400 font-medium hover:text-white transition-colors mb-3"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to event types
          </Link>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            {isEditing ? "Edit event type" : "New event type"}
          </h1>
          <p className="mt-0.5 text-[14px] text-gray-400">
            {isEditing
              ? "Update this event type's details."
              : "Create a new event type for people to book."}
          </p>
        </div>
      </div>

      <div className="rounded-[8px] bg-[#111111] border border-[#2c2c2c] max-w-2xl overflow-hidden">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="px-6 pt-5">
              <div className="rounded-md bg-red-500/10 border border-red-500/20 px-4 py-3 text-[13px] text-red-500 font-medium">
                {error}
              </div>
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-5 px-6 py-5">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Title
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Quick Chat"
                className="block w-full rounded-md border border-[#2c2c2c] bg-transparent px-3 py-2 text-[13px] text-white placeholder:text-gray-500 focus:border-gray-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                URL slug
              </label>
              <div className="flex items-center rounded-md border border-[#2c2c2c] bg-transparent focus-within:border-gray-500 focus-within:ring-1 focus-within:ring-gray-500 transition-colors overflow-hidden">
                <span className="flex-shrink-0 bg-[#1a1a1a] px-3 py-2 text-[13px] text-gray-500 border-r border-[#2c2c2c] select-none font-medium">
                  /book/
                </span>
                <input
                  type="text"
                  required
                  value={form.slug}
                  onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                  placeholder="quick-chat"
                  className="flex-1 border-0 bg-transparent px-3 py-2 text-[13px] text-white placeholder:text-gray-500 focus:outline-none focus:ring-0"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Description
                <span className="ml-1 font-normal text-gray-500">(optional)</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="A quick chat to discuss anything."
                rows={3}
                className="block w-full rounded-md border border-[#2c2c2c] bg-transparent px-3 py-2 text-[13px] text-white placeholder:text-gray-500 focus:border-gray-500 focus:outline-none transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Duration
                </label>
                <select
                  value={form.durationMinutes}
                  onChange={(e) => setForm((p) => ({ ...p, durationMinutes: e.target.value }))}
                  className="block w-full rounded-md border border-[#2c2c2c] bg-[#111111] px-3 py-2 text-[13px] text-white focus:border-gray-500 focus:outline-none transition-colors"
                >
                  {[15, 30, 45, 60, 90, 120].map((d) => (
                    <option key={d} value={d}>
                      {d} minutes
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Buffer time
                </label>
                <select
                  value={form.bufferMinutes}
                  onChange={(e) => setForm((p) => ({ ...p, bufferMinutes: e.target.value }))}
                  className="block w-full rounded-md border border-[#2c2c2c] bg-[#111111] px-3 py-2 text-[13px] text-white focus:border-gray-500 focus:outline-none transition-colors"
                >
                  {[0, 5, 10, 15, 30, 45, 60].map((d) => (
                    <option key={d} value={d}>
                      {d === 0 ? "No buffer" : `${d} min before & after`}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500 font-medium">
                  Buffer between consecutive bookings.
                </p>
              </div>
            </div>
          </div>

          {/* Custom Questions */}
          <div className="border-t border-[#2c2c2c] px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[14px] font-semibold text-white">Custom questions</h3>
                <p className="text-xs text-gray-400 mt-0.5 font-medium">
                  Add questions to collect info from bookers.
                </p>
              </div>
              <button
                type="button"
                onClick={addQuestion}
                className="inline-flex items-center gap-2 rounded-md border border-[#2c2c2c] bg-transparent px-3 py-1.5 text-xs font-semibold text-gray-300 transition-all hover:bg-[#1a1a1a] hover:text-white"
              >
                <Plus className="h-3.5 w-3.5" /> Add question
              </button>
            </div>

            {questions.length === 0 ? (
              <div className="rounded-md border border-dashed border-[#2c2c2c] py-8 text-center bg-[#141414]">
                <p className="text-[13px] text-gray-500 font-medium">No custom questions yet.</p>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="mt-2 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
                >
                  + Add your first question
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((q, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-md border border-[#2c2c2c] bg-[#1a1a1a] p-3"
                  >
                    <GripVertical className="h-4 w-4 mt-2 text-gray-500 flex-shrink-0 cursor-grab" />
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={q.label}
                        onChange={(e) => updateQuestion(idx, "label", e.target.value)}
                        placeholder="e.g. What's the agenda for this meeting?"
                        className="block w-full rounded-md border border-[#2c2c2c] bg-[#111111] px-3 py-2 text-[13px] text-white placeholder:text-gray-500 focus:border-gray-500 focus:outline-none transition-colors"
                      />
                      <label className="inline-flex items-center gap-2 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={q.required}
                          onChange={(e) => updateQuestion(idx, "required", e.target.checked)}
                          className="h-3.5 w-3.5 rounded border-[#2c2c2c] bg-transparent text-white focus:ring-gray-500 focus:ring-offset-0"
                        />
                        <span className="text-xs text-gray-400 font-medium">Required</span>
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeQuestion(idx)}
                      className="rounded p-1 text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors mt-0.5"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-[#2c2c2c] bg-[#111111] px-6 py-4 rounded-b-[8px]">
            <Link href="/event-types" className="inline-flex items-center justify-center gap-2 rounded-md border border-[#2c2c2c] bg-transparent px-4 py-2 text-[13px] font-semibold text-gray-300 hover:bg-[#1a1a1a] hover:text-white transition-all">
              Cancel
            </Link>
            <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-2 text-[13px] font-semibold text-black hover:bg-gray-200 transition-all">
              {saving
                ? "Saving..."
                : isEditing
                ? "Save changes"
                : "Create event type"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
