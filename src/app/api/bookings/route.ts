import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasOverlap } from "@/lib/slots";
import { sendBookingConfirmation, sendHostNotification } from "@/lib/email";
import { getAuthSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = Number(session.user.id);

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const timeframe = searchParams.get("timeframe");
    const today = new Date().toISOString().split("T")[0];

    const where: Record<string, unknown> = { eventType: { userId } };
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

    const eventType = await prisma.eventType.findUnique({ 
      where: { id: eventTypeId },
      include: { user: true }
    });
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

    // Send emails BEFORE returning response (Vercel kills pending promises after response)
    const emailData = {
      bookerName,
      bookerEmail,
      eventTitle: booking.eventType.title,
      date,
      startTime,
      endTime,
      durationMinutes: booking.eventType.durationMinutes,
      notes,
      hostName: eventType.user.name,
      hostEmail: eventType.user.email,
    };

    // Send both emails in parallel, but await them
    const emailPromises: Promise<void>[] = [sendBookingConfirmation(emailData)];
    if (eventType.user.email && eventType.user.email !== "demo@cal.app") {
      emailPromises.push(sendHostNotification(emailData));
    }
    await Promise.allSettled(emailPromises);

    return NextResponse.json(booking, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
