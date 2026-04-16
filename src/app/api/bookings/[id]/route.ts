import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasOverlap } from "@/lib/slots";
import {
  sendCancellationEmail,
  sendRescheduleEmail,
  sendHostCancellationNotification,
  sendHostRescheduleNotification,
} from "@/lib/email";
import { getAuthSession } from "@/lib/auth";

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const id = parseInt(params.id);
  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        eventType: {
          select: { title: true, slug: true, durationMinutes: true, bufferMinutes: true },
        },
        answers: { include: { question: true } },
      },
    });
    if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(booking);
  } catch {
    return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const id = parseInt(params.id);
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { status, date, startTime, endTime } = body;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        eventType: {
          select: {
            title: true,
            durationMinutes: true,
            bufferMinutes: true,
            userId: true,
            user: { select: { name: true, email: true } },
          },
        },
      },
    });
    if (!booking || booking.eventType.userId !== session.user.id)
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    const hostName  = booking.eventType.user.name;
    const hostEmail = booking.eventType.user.email;

    // ── Cancel ──────────────────────────────────────────────────────────────
    if (status === "cancelled") {
      const updated = await prisma.booking.update({
        where: { id },
        data: { status: "cancelled" },
        include: { eventType: { select: { title: true } } },
      });

      const emailBase = {
        bookerName: booking.bookerName,
        bookerEmail: booking.bookerEmail,
        eventTitle: booking.eventType.title,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        durationMinutes: booking.eventType.durationMinutes,
        hostName,
        hostEmail,
      };

      // Notify booker
      sendCancellationEmail(emailBase).catch(console.error);
      // Notify host (only for real accounts, skip demo@cal.app)
      if (hostEmail !== "demo@cal.app") {
        sendHostCancellationNotification(emailBase).catch(console.error);
      }

      return NextResponse.json(updated);
    }

    // ── Reschedule ───────────────────────────────────────────────────────────
    if (status === "rescheduled" && date && startTime && endTime) {
      const existing = await prisma.booking.findMany({
        where: { eventTypeId: booking.eventTypeId, date, status: "confirmed" },
      });
      const conflict = existing.some((b) => hasOverlap({ startTime, endTime }, b));
      if (conflict)
        return NextResponse.json(
          { error: "The new time slot is no longer available" },
          { status: 409 }
        );

      await prisma.booking.update({ where: { id }, data: { status: "rescheduled" } });

      const newBooking = await prisma.booking.create({
        data: {
          eventTypeId: booking.eventTypeId,
          bookerName: booking.bookerName,
          bookerEmail: booking.bookerEmail,
          date,
          startTime,
          endTime,
          notes: booking.notes,
          status: "confirmed",
          rescheduledFromId: id,
        },
        include: { eventType: { select: { title: true, durationMinutes: true } } },
      });

      const rescheduleBase = {
        bookerName: booking.bookerName,
        bookerEmail: booking.bookerEmail,
        eventTitle: booking.eventType.title,
        date,
        startTime,
        endTime,
        durationMinutes: booking.eventType.durationMinutes,
        hostName,
        hostEmail,
        oldDate: booking.date,
        oldStartTime: booking.startTime,
      };

      // Notify booker
      sendRescheduleEmail(rescheduleBase).catch(console.error);
      // Notify host
      if (hostEmail !== "demo@cal.app") {
        sendHostRescheduleNotification(rescheduleBase).catch(console.error);
      }

      return NextResponse.json(newBooking);
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}
