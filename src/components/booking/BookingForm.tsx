"use client";

import { useState } from "react";
import { ArrowLeft, Calendar, Clock, Globe, Video } from "lucide-react";

interface BookingQuestion {
  id: number;
  label: string;
  required: boolean;
}

interface Props {
  eventTitle: string;
  durationMinutes: number;
  date: string;
  startTime: string;
  endTime: string;
  questions?: BookingQuestion[];
  onBack: () => void;
  onSubmit: (data: {
    name: string;
    email: string;
    notes: string;
    answers?: { questionId: number; answer: string }[];
  }) => Promise<void>;
}

function fmtTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const p = h >= 12 ? "PM" : "AM";
  return `${h === 0 ? 12 : h > 12 ? h - 12 : h}:${m.toString().padStart(2, "0")} ${p}`;
}
function fmtDate(s: string) {
  return new Date(s + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function BookingForm({
  eventTitle,
  durationMinutes,
  date,
  startTime,
  endTime,
  questions = [],
  onBack,
  onSubmit,
}: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const updateAnswer = (qId: number, val: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate required custom questions
    for (const q of questions) {
      if (q.required && !answers[q.id]?.trim()) {
        setError(`Please answer: ${q.label}`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const answerList = Object.entries(answers)
        .filter(([, v]) => v.trim())
        .map(([qId, answer]) => ({ questionId: parseInt(qId), answer }));

      await onSubmit({
        name,
        email,
        notes,
        answers: answerList.length > 0 ? answerList : undefined,
      });
    } catch {
      setError("Failed to book. The slot may no longer be available.");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row">
      {/* Left: event summary */}
      <div className="border-b md:border-b-0 md:border-r border-default p-6 md:w-64 flex-shrink-0">
        <button
          onClick={onBack}
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted hover:text-emphasis transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-semibold text-white mb-3">
          A
        </div>
        <p className="text-xs text-muted">Akshay</p>
        <h2 className="mt-0.5 text-base font-semibold text-emphasis">{eventTitle}</h2>
        <div className="mt-4 space-y-2.5">
          <p className="flex items-center gap-2 text-sm text-subtle">
            <Clock className="h-4 w-4 text-muted" />
            {durationMinutes} min
          </p>
          <p className="flex items-center gap-2 text-sm text-subtle">
            <Video className="h-4 w-4 text-muted" />
            Web conferencing details provided upon confirmation.
          </p>
          <p className="flex items-center gap-2 text-sm text-subtle">
            <Calendar className="h-4 w-4 text-muted" />
            {fmtTime(startTime)} – {fmtTime(endTime)}, {fmtDate(date)}
          </p>
          <p className="flex items-center gap-2 text-sm text-subtle">
            <Globe className="h-4 w-4 text-muted" />
            Asia / Kolkata
          </p>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 p-6">
        <h3 className="mb-5 text-base font-semibold text-emphasis">Enter details</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-emphasis mb-1.5">
              Your name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-emphasis mb-1.5">
              Email address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input-field"
            />
          </div>

          {/* Custom questions */}
          {questions.map((q) => (
            <div key={q.id}>
              <label className="block text-sm font-medium text-emphasis mb-1.5">
                {q.label}
                {q.required && <span className="text-red-500 ml-0.5">*</span>}
              </label>
              <input
                type="text"
                required={q.required}
                value={answers[q.id] || ""}
                onChange={(e) => updateAnswer(q.id, e.target.value)}
                placeholder="Your answer"
                className="input-field"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-emphasis mb-1.5">
              Additional notes
              <span className="ml-1 font-normal text-muted">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Please share anything that will help prepare for our meeting."
              className="input-field resize-none"
            />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full justify-center py-2.5">
            {submitting ? "Confirming..." : "Confirm booking"}
          </button>
        </form>
      </div>
    </div>
  );
}
