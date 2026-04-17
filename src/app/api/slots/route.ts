import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAvailableSlots, getWindowForDate } from "@/lib/slots";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const date = searchParams.get("date");
    const timezone = searchParams.get("timezone") || undefined;

    if (!slug || !date)
      return NextResponse.json({ error: "slug and date are required" }, { status: 400 });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
      return NextResponse.json({ error: "date must be YYYY-MM-DD" }, { status: 400 });

    const eventType = await prisma.eventType.findUnique({ where: { slug } });
    if (!eventType || !eventType.isActive)
      return NextResponse.json({ error: "Event type not found" }, { status: 404 });

    const schedule = await prisma.availabilitySchedule.findFirst({
      where: { userId: eventType.userId, isDefault: true },
      include: { rules: true, dateOverrides: true },
    });
    if (!schedule) return NextResponse.json({ slots: [] });

    const dayOfWeek = new Date(date + "T00:00:00").getUTCDay();
    const window = getWindowForDate(date, dayOfWeek, schedule.rules, schedule.dateOverrides);

    // Check ALL bookings for this host (across all event types) to prevent double-booking
    const existingBookings = await prisma.booking.findMany({
      where: {
        eventType: { userId: eventType.userId },
        date,
        status: "confirmed",
      },
      select: { startTime: true, endTime: true },
    });

    const slots = getAvailableSlots(
      date,
      eventType.durationMinutes,
      window,
      existingBookings,
      eventType.bufferMinutes,
      timezone
    );

    return NextResponse.json({
      slots,
      eventType: {
        id: eventType.id,
        title: eventType.title,
        durationMinutes: eventType.durationMinutes,
        bufferMinutes: eventType.bufferMinutes,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to compute slots" }, { status: 500 });
  }
}
