import { Resend } from "resend";

function fmtDate(s: string) {
  return new Date(s + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
}
function fmtTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const p = h >= 12 ? "PM" : "AM";
  return `${h === 0 ? 12 : h > 12 ? h - 12 : h}:${m.toString().padStart(2, "0")} ${p}`;
}

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[EMAIL] RESEND_API_KEY is not set — emails will only be logged, not sent");
    return null;
  }
  console.log("[EMAIL] Resend client initialized (key present)");
  return new Resend(apiKey);
}

const FROM = process.env.RESEND_FROM || "Cal Clone <onboarding@resend.dev>";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

interface BookingEmailData {
  bookerName: string;
  bookerEmail: string;
  eventTitle: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  hostName?: string;
  hostEmail?: string;
  notes?: string | null;
}

export async function sendBookingConfirmation(data: BookingEmailData) {
  const resend = getResend();
  const html = `
    <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
      <div style="background:#111827;padding:24px 32px">
        <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800;letter-spacing:0.5px">CAL CLONEEE</h1>
      </div>
      <div style="padding:32px">
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:24px">
          <p style="margin:0;color:#166534;font-weight:600;font-size:15px">✓ This meeting is scheduled</p>
        </div>
        <h2 style="font-size:20px;font-weight:700;color:#111827;margin:0 0 4px">${data.eventTitle}</h2>
        <p style="color:#6b7280;margin:0 0 24px;font-size:14px">with ${data.hostName || "John Doe"}</p>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;width:100px">Name</td><td style="padding:8px 0;color:#111827;font-size:14px;font-weight:500">${data.bookerName}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;font-size:13px">Date</td><td style="padding:8px 0;color:#111827;font-size:14px;font-weight:500">${fmtDate(data.date)}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;font-size:13px">Time</td><td style="padding:8px 0;color:#111827;font-size:14px;font-weight:500">${fmtTime(data.startTime)} – ${fmtTime(data.endTime)} (${data.durationMinutes} min)</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;font-size:13px">Timezone</td><td style="padding:8px 0;color:#111827;font-size:14px;font-weight:500">Asia / Kolkata</td></tr>
          ${data.notes ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:13px;vertical-align:top">Notes</td><td style="padding:8px 0;color:#111827;font-size:14px">${data.notes}</td></tr>` : ""}
        </table>
        <hr style="border:none;border-top:1px solid #f3f4f6;margin:24px 0">
        <p style="color:#9ca3af;font-size:12px;margin:0">This is a confirmation from <a href="${BASE_URL}" style="color:#111827">Cal</a>. If you need to cancel or reschedule, visit the booking page.</p>
      </div>
    </div>`;

  if (!resend) {
    console.log(`[EMAIL] Booking confirmation for ${data.bookerEmail}:\n  Event: ${data.eventTitle}\n  Date: ${fmtDate(data.date)} ${fmtTime(data.startTime)}`);
    return;
  }

  const { error } = await resend.emails.send({
    from: FROM,
    to: data.bookerEmail,
    subject: `Confirmed: ${data.eventTitle} on ${fmtDate(data.date)}`,
    html,
  });
  if (error) console.error("[RESEND ERROR] Booking confirmation:", error);
}

export async function sendCancellationEmail(data: BookingEmailData) {
  const resend = getResend();
  const html = `
    <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
      <div style="background:#111827;padding:24px 32px">
        <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800;letter-spacing:0.5px">CAL CLONEEE</h1>
      </div>
      <div style="padding:32px">
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin-bottom:24px">
          <p style="margin:0;color:#991b1b;font-weight:600;font-size:15px">✕ This meeting has been cancelled</p>
        </div>
        <h2 style="font-size:20px;font-weight:700;color:#111827;margin:0 0 4px">${data.eventTitle}</h2>
        <p style="color:#6b7280;margin:0 0 24px;font-size:14px">with ${data.hostName || "John Doe"}</p>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;width:100px">Date</td><td style="padding:8px 0;color:#9ca3af;font-size:14px;text-decoration:line-through">${fmtDate(data.date)}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;font-size:13px">Time</td><td style="padding:8px 0;color:#9ca3af;font-size:14px;text-decoration:line-through">${fmtTime(data.startTime)} – ${fmtTime(data.endTime)}</td></tr>
        </table>
        <hr style="border:none;border-top:1px solid #f3f4f6;margin:24px 0">
        <p style="color:#9ca3af;font-size:12px;margin:0">Your booking has been cancelled. <a href="${BASE_URL}" style="color:#111827">Book a new time →</a></p>
      </div>
    </div>`;

  if (!resend) {
    console.log(`[EMAIL] Cancellation for ${data.bookerEmail}: ${data.eventTitle} on ${fmtDate(data.date)}`);
    return;
  }

  const { error } = await resend.emails.send({
    from: FROM,
    to: data.bookerEmail,
    subject: `Cancelled: ${data.eventTitle} on ${fmtDate(data.date)}`,
    html,
  });
  if (error) console.error("[RESEND ERROR] Cancellation:", error);
}

export async function sendRescheduleEmail(data: BookingEmailData & { oldDate: string; oldStartTime: string }) {
  const resend = getResend();
  const html = `
    <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
      <div style="background:#111827;padding:24px 32px">
        <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800;letter-spacing:0.5px">CAL CLONEEE</h1>
      </div>
      <div style="padding:32px">
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin-bottom:24px">
          <p style="margin:0;color:#1e40af;font-weight:600;font-size:15px">↻ Your meeting has been rescheduled</p>
        </div>
        <h2 style="font-size:20px;font-weight:700;color:#111827;margin:0 0 4px">${data.eventTitle}</h2>
        <p style="color:#6b7280;margin:0 0 24px;font-size:14px">with ${data.hostName || "John Doe"}</p>
        <p style="color:#6b7280;font-size:13px;margin:0 0 8px;font-weight:600;text-transform:uppercase;letter-spacing:.05em">New time</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
          <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;width:100px">Date</td><td style="padding:8px 0;color:#111827;font-size:14px;font-weight:500">${fmtDate(data.date)}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;font-size:13px">Time</td><td style="padding:8px 0;color:#111827;font-size:14px;font-weight:500">${fmtTime(data.startTime)} – ${fmtTime(data.endTime)}</td></tr>
        </table>
        <p style="color:#6b7280;font-size:13px;margin:0 0 8px;font-weight:600;text-transform:uppercase;letter-spacing:.05em">Previous time</p>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#9ca3af;font-size:13px;width:100px">Date</td><td style="padding:8px 0;color:#9ca3af;font-size:14px;text-decoration:line-through">${fmtDate(data.oldDate)}</td></tr>
          <tr><td style="padding:8px 0;color:#9ca3af;font-size:13px">Time</td><td style="padding:8px 0;color:#9ca3af;font-size:14px;text-decoration:line-through">${fmtTime(data.oldStartTime)}</td></tr>
        </table>
        <hr style="border:none;border-top:1px solid #f3f4f6;margin:24px 0">
        <p style="color:#9ca3af;font-size:12px;margin:0">Updated by <a href="${BASE_URL}" style="color:#111827">Cal</a>.</p>
      </div>
    </div>`;

  if (!resend) {
    console.log(`[EMAIL] Reschedule for ${data.bookerEmail}: ${data.eventTitle} moved to ${fmtDate(data.date)} ${fmtTime(data.startTime)}`);
    return;
  }

  const { error } = await resend.emails.send({
    from: FROM,
    to: data.bookerEmail,
    subject: `Rescheduled: ${data.eventTitle} → ${fmtDate(data.date)}`,
    html,
  });
  if (error) console.error("[RESEND ERROR] Reschedule:", error);
}

export async function sendHostNotification(data: BookingEmailData) {
  const resend = getResend();
  const html = `
    <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
      <div style="background:#111827;padding:24px 32px">
        <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800;letter-spacing:0.5px">CAL CLONEEE</h1>
      </div>
      <div style="padding:32px">
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:24px">
          <p style="margin:0;color:#166534;font-weight:600;font-size:15px">✓ New Booking Received</p>
        </div>
        <h2 style="font-size:20px;font-weight:700;color:#111827;margin:0 0 4px">${data.eventTitle}</h2>
        <p style="color:#6b7280;margin:0 0 24px;font-size:14px">Booked by ${data.bookerName} (${data.bookerEmail})</p>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;width:100px">Date</td><td style="padding:8px 0;color:#111827;font-size:14px;font-weight:500">${fmtDate(data.date)}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;font-size:13px">Time</td><td style="padding:8px 0;color:#111827;font-size:14px;font-weight:500">${fmtTime(data.startTime)} – ${fmtTime(data.endTime)} (${data.durationMinutes} min)</td></tr>
          ${data.notes ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:13px;vertical-align:top">Notes</td><td style="padding:8px 0;color:#111827;font-size:14px">${data.notes}</td></tr>` : ""}
        </table>
      </div>
    </div>`;

  if (!resend) {
    console.log(`[EMAIL] Host notification to ${data.hostEmail}: ${data.bookerName} booked ${data.eventTitle}`);
    return;
  }

  const { error } = await resend.emails.send({
    from: FROM,
    to: data.hostEmail!,
    replyTo: data.bookerEmail,
    subject: `New Event: ${data.eventTitle} with ${data.bookerName}`,
    html,
  });
  if (error) console.error("[RESEND ERROR] Host notification:", error);
}

export async function sendHostCancellationNotification(data: BookingEmailData) {
  const resend = getResend();
  const html = `
    <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
      <div style="background:#111827;padding:24px 32px">
        <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800;letter-spacing:0.5px">Cal</h1>
      </div>
      <div style="padding:32px">
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin-bottom:24px">
          <p style="margin:0;color:#991b1b;font-weight:600;font-size:15px">✕ Booking Cancelled</p>
        </div>
        <h2 style="font-size:20px;font-weight:700;color:#111827;margin:0 0 4px">${data.eventTitle}</h2>
        <p style="color:#6b7280;margin:0 0 24px;font-size:14px">Cancelled by ${data.bookerName} (${data.bookerEmail})</p>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;width:100px">Date</td><td style="padding:8px 0;color:#9ca3af;font-size:14px;text-decoration:line-through">${fmtDate(data.date)}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;font-size:13px">Time</td><td style="padding:8px 0;color:#9ca3af;font-size:14px;text-decoration:line-through">${fmtTime(data.startTime)} – ${fmtTime(data.endTime)}</td></tr>
        </table>
        <hr style="border:none;border-top:1px solid #f3f4f6;margin:24px 0">
        <p style="color:#9ca3af;font-size:12px;margin:0">This slot is now free on your <a href="${BASE_URL}" style="color:#111827">Cal</a> calendar.</p>
      </div>
    </div>`;

  if (!resend) {
    console.log(`[EMAIL] Host cancellation notice to ${data.hostEmail}: ${data.bookerName} cancelled ${data.eventTitle}`);
    return;
  }

  const { error } = await resend.emails.send({
    from: FROM,
    to: data.hostEmail!,
    replyTo: data.bookerEmail,
    subject: `Cancelled: ${data.eventTitle} with ${data.bookerName}`,
    html,
  });
  if (error) console.error("[RESEND ERROR] Host cancellation:", error);
}

export async function sendHostRescheduleNotification(
  data: BookingEmailData & { oldDate: string; oldStartTime: string }
) {
  const resend = getResend();
  const html = `
    <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
      <div style="background:#111827;padding:24px 32px">
        <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800;letter-spacing:0.5px">Cal</h1>
      </div>
      <div style="padding:32px">
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin-bottom:24px">
          <p style="margin:0;color:#1e40af;font-weight:600;font-size:15px">↻ Booking Rescheduled</p>
        </div>
        <h2 style="font-size:20px;font-weight:700;color:#111827;margin:0 0 4px">${data.eventTitle}</h2>
        <p style="color:#6b7280;margin:0 0 24px;font-size:14px">Rescheduled by ${data.bookerName} (${data.bookerEmail})</p>
        <p style="color:#6b7280;font-size:13px;margin:0 0 8px;font-weight:600;text-transform:uppercase;letter-spacing:.05em">New time</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
          <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;width:100px">Date</td><td style="padding:8px 0;color:#111827;font-size:14px;font-weight:500">${fmtDate(data.date)}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;font-size:13px">Time</td><td style="padding:8px 0;color:#111827;font-size:14px;font-weight:500">${fmtTime(data.startTime)} – ${fmtTime(data.endTime)}</td></tr>
        </table>
        <p style="color:#6b7280;font-size:13px;margin:0 0 8px;font-weight:600;text-transform:uppercase;letter-spacing:.05em">Previous time</p>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#9ca3af;font-size:13px;width:100px">Date</td><td style="padding:8px 0;color:#9ca3af;font-size:14px;text-decoration:line-through">${fmtDate(data.oldDate)}</td></tr>
          <tr><td style="padding:8px 0;color:#9ca3af;font-size:13px">Time</td><td style="padding:8px 0;color:#9ca3af;font-size:14px;text-decoration:line-through">${fmtTime(data.oldStartTime)}</td></tr>
        </table>
      </div>
    </div>`;

  if (!resend) {
    console.log(`[EMAIL] Host reschedule notice to ${data.hostEmail}: ${data.bookerName} rescheduled ${data.eventTitle} to ${fmtDate(data.date)}`);
    return;
  }

  const { error } = await resend.emails.send({
    from: FROM,
    to: data.hostEmail!,
    replyTo: data.bookerEmail,
    subject: `Rescheduled: ${data.eventTitle} with ${data.bookerName} → ${fmtDate(data.date)}`,
    html,
  });
  if (error) console.error("[RESEND ERROR] Host reschedule:", error);
}

export async function sendReminderEmail(data: BookingEmailData, isHost: boolean = false) {
  const resend = getResend();
  const recipientEmail = isHost ? data.hostEmail! : data.bookerEmail;
  const recipientName = isHost ? data.hostName : data.bookerName;
  const otherPersonName = isHost ? data.bookerName : data.hostName || "your guest";
  
  const html = `
    <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
      <div style="background:#111827;padding:24px 32px">
        <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800;letter-spacing:0.5px">CAL CLONEEE REMINDER</h1>
      </div>
      <div style="padding:32px">
        <h2 style="font-size:20px;font-weight:700;color:#111827;margin:0 0 4px">Upcoming: ${data.eventTitle}</h2>
        <p style="color:#6b7280;margin:0 0 24px;font-size:14px">Hi ${recipientName}, you have an event with ${otherPersonName} soon.</p>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;width:100px">Date</td><td style="padding:8px 0;color:#111827;font-size:14px;font-weight:500">${fmtDate(data.date)}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;font-size:13px">Time</td><td style="padding:8px 0;color:#111827;font-size:14px;font-weight:500">${fmtTime(data.startTime)} – ${fmtTime(data.endTime)}</td></tr>
        </table>
      </div>
    </div>`;

  if (!resend) {
    console.log(`[EMAIL] Reminder to ${recipientEmail} for ${data.eventTitle}`);
    return;
  }

  const { error } = await resend.emails.send({
    from: FROM,
    to: recipientEmail,
    subject: `Reminder: ${data.eventTitle} is coming up`,
    html,
  });
  if (error) console.error("[RESEND ERROR] Reminder:", error);
}
