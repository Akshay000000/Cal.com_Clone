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
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-emphasis" />
      </div>
    );

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/event-types"
          className="inline-flex items-center gap-1.5 text-sm text-subtle hover:text-emphasis transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to event types
        </Link>
        <h1 className="page-title">
          {isEditing ? "Edit event type" : "New event type"}
        </h1>
        <p className="page-subtitle">
          {isEditing
            ? "Update this event type's details."
            : "Create a new event type for people to book."}
        </p>
      </div>

      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="px-6 pt-5">
              <div className="rounded-md bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-5 px-6 py-5">
            <div>
              <label className="block text-sm font-medium text-emphasis mb-1.5">
                Title
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Quick Chat"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-emphasis mb-1.5">
                URL slug
              </label>
              <div className="flex items-center rounded-md border border-default bg-white focus-within:border-emphasis focus-within:ring-1 focus-within:ring-emphasis transition-colors overflow-hidden">
                <span className="flex-shrink-0 bg-subtle px-3 py-2 text-sm text-muted border-r border-default select-none">
                  /book/
                </span>
                <input
                  type="text"
                  required
                  value={form.slug}
                  onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                  placeholder="quick-chat"
                  className="flex-1 border-0 bg-transparent px-3 py-2 text-sm text-emphasis placeholder:text-muted focus:outline-none focus:ring-0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-emphasis mb-1.5">
                Description
                <span className="ml-1 font-normal text-muted">(optional)</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="A quick chat to discuss anything."
                rows={3}
                className="input-field resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-emphasis mb-1.5">
                  Duration
                </label>
                <select
                  value={form.durationMinutes}
                  onChange={(e) => setForm((p) => ({ ...p, durationMinutes: e.target.value }))}
                  className="input-field"
                >
                  {[15, 30, 45, 60, 90, 120].map((d) => (
                    <option key={d} value={d}>
                      {d} minutes
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-emphasis mb-1.5">
                  Buffer time
                </label>
                <select
                  value={form.bufferMinutes}
                  onChange={(e) => setForm((p) => ({ ...p, bufferMinutes: e.target.value }))}
                  className="input-field"
                >
                  {[0, 5, 10, 15, 30, 45, 60].map((d) => (
                    <option key={d} value={d}>
                      {d === 0 ? "No buffer" : `${d} min before & after`}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-muted">
                  Buffer between consecutive bookings.
                </p>
              </div>
            </div>
          </div>

          {/* Custom Questions */}
          <div className="border-t border-default px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-emphasis">Custom questions</h3>
                <p className="text-xs text-muted mt-0.5">
                  Add questions to collect info from bookers.
                </p>
              </div>
              <button
                type="button"
                onClick={addQuestion}
                className="btn-minimal text-xs"
              >
                <Plus className="h-3.5 w-3.5" /> Add question
              </button>
            </div>

            {questions.length === 0 ? (
              <div className="rounded-md border border-dashed border-gray-300 py-8 text-center">
                <p className="text-sm text-muted">No custom questions yet.</p>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="mt-2 text-xs font-medium text-emphasis hover:underline"
                >
                  + Add your first question
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((q, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-md border border-default bg-subtle p-3"
                  >
                    <GripVertical className="h-4 w-4 mt-2 text-gray-300 flex-shrink-0 cursor-grab" />
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={q.label}
                        onChange={(e) => updateQuestion(idx, "label", e.target.value)}
                        placeholder="e.g. What's the agenda for this meeting?"
                        className="input-field text-sm"
                      />
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={q.required}
                          onChange={(e) => updateQuestion(idx, "required", e.target.checked)}
                          className="h-3.5 w-3.5 rounded border-gray-300 text-emphasis focus:ring-emphasis"
                        />
                        <span className="text-xs text-subtle">Required</span>
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeQuestion(idx)}
                      className="rounded p-1 text-gray-300 hover:text-red-500 transition-colors mt-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-default px-6 py-4">
            <Link href="/event-types" className="btn-secondary">
              Cancel
            </Link>
            <button type="submit" disabled={saving} className="btn-primary">
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
