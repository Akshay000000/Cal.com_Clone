import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = Number(session.user.id);

    let schedule = await prisma.availabilitySchedule.findFirst({
      where: { userId, isDefault: true },
      include: { rules: { orderBy: { dayOfWeek: "asc" } }, dateOverrides: { orderBy: { date: "asc" } } },
    });
    if (!schedule) {
      schedule = await prisma.availabilitySchedule.create({
        data: { userId, name: "Working Hours", timezone: "Asia/Kolkata", isDefault: true },
        include: { rules: true, dateOverrides: true },
      });
    }
    return NextResponse.json(schedule);
  } catch { return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 }); }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = Number(session.user.id);

    const { timezone, rules } = await req.json();
    const schedule = await prisma.availabilitySchedule.findFirst({
      where: { userId, isDefault: true },
    });
    if (!schedule) return NextResponse.json({ error: "No schedule found" }, { status: 404 });

    if (timezone) {
      await prisma.availabilitySchedule.update({ where: { id: schedule.id }, data: { timezone } });
    }
    if (rules && Array.isArray(rules)) {
      await prisma.$transaction([
        prisma.availabilityRule.deleteMany({ where: { scheduleId: schedule.id } }),
        ...rules.map((r: { dayOfWeek: number; startTime: string; endTime: string }) =>
          prisma.availabilityRule.create({
            data: { scheduleId: schedule.id, dayOfWeek: r.dayOfWeek, startTime: r.startTime, endTime: r.endTime },
          })
        ),
      ]);
    }

    const updated = await prisma.availabilitySchedule.findFirst({
      where: { id: schedule.id },
      include: { rules: { orderBy: { dayOfWeek: "asc" } }, dateOverrides: { orderBy: { date: "asc" } } },
    });
    return NextResponse.json(updated);
  } catch { return NextResponse.json({ error: "Failed to update availability" }, { status: 500 }); }
}
