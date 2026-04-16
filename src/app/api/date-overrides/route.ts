import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = Number(session.user.id);

    const schedule = await prisma.availabilitySchedule.findFirst({
      where: { userId, isDefault: true },
      include: { dateOverrides: { orderBy: { date: "asc" } } },
    });
    return NextResponse.json(schedule?.dateOverrides || []);
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = Number(session.user.id);

    const { date, isBlocked, startTime, endTime } = await req.json();
    if (!date) return NextResponse.json({ error: "date is required" }, { status: 400 });

    const schedule = await prisma.availabilitySchedule.findFirst({
      where: { userId, isDefault: true },
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
