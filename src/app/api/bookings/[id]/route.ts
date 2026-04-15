import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasOverlap } from "@/lib/slots";
import { sendCancellationEmail, sendRescheduleEmail } from "@/lib/email";

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const id = parseInt(params.id);
  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        eventType: {
          select: {
            title: true, slug: true, durationMinutes: true, bufferMinutes: true,
          },
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
    const body = await req.json();
    const { status, date, startTime, endTime } = body;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { eventType: { select: { title: true, durationMinutes: true, bufferMinutes: true } } },
    });
    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    // --- Cancel ---
    if (status === "cancelled") {
      const updated = await prisma.booking.update({
        where: { id },
        data: { status: "cancelled" },
        include: { eventType: { select: { title: true } } },
      });

      sendCancellationEmail({
        bookerName: booking.bookerName,
        bookerEmail: booking.bookerEmail,
        eventTitle: booking.eventType.title,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        durationMinutes: booking.eventType.durationMinutes,
      }).catch(console.error);

      return NextResponse.json(updated);
    }

    // --- Reschedule ---
    if (status === "rescheduled" && date && startTime && endTime) {
      // Check for conflicts on the new slot
      const existing = await prisma.booking.findMany({
        where: { eventTypeId: booking.eventTypeId, date, status: "confirmed" },
      });
      const conflict = existing.some((b) => hasOverlap({ startTime, endTime }, b));
      if (conflict)
        return NextResponse.json(
          { error: "The new time slot is no longer available" },
          { status: 409 }
        );

      // Mark old booking as rescheduled
      await prisma.booking.update({
        where: { id },
        data: { status: "rescheduled" },
      });

      // Create the new booking linked to the old one
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

      sendRescheduleEmail({
        bookerName: booking.bookerName,
        bookerEmail: booking.bookerEmail,
        eventTitle: booking.eventType.title,
        date,
        startTime,
        endTime,
        durationMinutes: booking.eventType.durationMinutes,
        oldDate: booking.date,
        oldStartTime: booking.startTime,
      }).catch(console.error);

      return NextResponse.json(newBooking);
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}
