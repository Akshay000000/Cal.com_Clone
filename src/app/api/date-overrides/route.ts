import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_USER_ID = 1;

export async function GET() {
  try {
    const schedule = await prisma.availabilitySchedule.findFirst({
      where: { userId: DEFAULT_USER_ID, isDefault: true },
      include: { dateOverrides: { orderBy: { date: "asc" } } },
    });
    return NextResponse.json(schedule?.dateOverrides || []);
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { date, isBlocked, startTime, endTime } = await req.json();
    if (!date) return NextResponse.json({ error: "date is required" }, { status: 400 });

    const schedule = await prisma.availabilitySchedule.findFirst({
      where: { userId: DEFAULT_USER_ID, isDefault: true },
    });
    if (!schedule) return NextResponse.json({ error: "No schedule found" }, { status: 404 });

    // Upsert so editing an existing date override just replaces it
    const override = await prisma.dateOverride.upsert({
      where: { scheduleId_date: { scheduleId: schedule.id, date } },
      update: {
        isBlocked: isBlocked ?? false,
        startTime: isBlocked ? null : (startTime || null),
        endTime: isBlocked ? null : (endTime || null),
      },
      create: {
        scheduleId: schedule.id,
        date,
        isBlocked: isBlocked ?? false,
        startTime: isBlocked ? null : (startTime || null),
        endTime: isBlocked ? null : (endTime || null),
      },
    });
    return NextResponse.json(override, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create override" }, { status: 500 });
  }
}
