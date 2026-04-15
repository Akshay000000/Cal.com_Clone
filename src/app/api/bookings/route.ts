import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasOverlap } from "@/lib/slots";
import { sendBookingConfirmation } from "@/lib/email";

const DEFAULT_USER_ID = 1;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const timeframe = searchParams.get("timeframe");
    const today = new Date().toISOString().split("T")[0];

    const where: Record<string, unknown> = { eventType: { userId: DEFAULT_USER_ID } };
    if (status) where.status = status;
    if (timeframe === "upcoming") where.date = { gte: today };
    else if (timeframe === "past") where.date = { lt: today };

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        eventType: { select: { title: true, slug: true, durationMinutes: true } },
        answers: { include: { question: true } },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });
    return NextResponse.json(bookings);
  } catch {
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      eventTypeId,
      bookerName,
      bookerEmail,
      date,
      startTime,
      endTime,
      notes,
      answers,
    } = await req.json();

    if (!eventTypeId || !bookerName || !bookerEmail || !date || !startTime || !endTime)
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });

    const eventType = await prisma.eventType.findUnique({ where: { id: eventTypeId } });
    if (!eventType || !eventType.isActive)
      return NextResponse.json({ error: "Event type not found" }, { status: 404 });

    // Double-booking prevention
    const existing = await prisma.booking.findMany({
      where: { eventTypeId, date, status: "confirmed" },
    });
    const conflict = existing.some((b) =>
      hasOverlap({ startTime, endTime }, b)
    );
    if (conflict)
      return NextResponse.json(
        { error: "This time slot is no longer available" },
        { status: 409 }
      );

    const booking = await prisma.booking.create({
      data: {
        eventTypeId,
        bookerName,
        bookerEmail,
        date,
        startTime,
        endTime,
        notes: notes || null,
        status: "confirmed",
        answers:
          answers?.length
            ? {
                create: answers.map((a: { questionId: number; answer: string }) => ({
                  questionId: a.questionId,
                  answer: a.answer,
                })),
              }
            : undefined,
      },
      include: {
        eventType: { select: { title: true, durationMinutes: true } },
        answers: { include: { question: true } },
      },
    });

    // Send confirmation email (non-blocking)
    sendBookingConfirmation({
      bookerName,
      bookerEmail,
      eventTitle: booking.eventType.title,
      date,
      startTime,
      endTime,
      durationMinutes: booking.eventType.durationMinutes,
      notes,
    }).catch(console.error);

    return NextResponse.json(booking, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
