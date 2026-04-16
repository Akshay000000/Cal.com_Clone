import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = Number(session.user.id);

    const schedules = await prisma.availabilitySchedule.findMany({
      where: { userId },
      include: {
        rules: { orderBy: { dayOfWeek: "asc" } },
        dateOverrides: { orderBy: { date: "asc" } },
      },
      orderBy: { id: "asc" },
    });
    return NextResponse.json(schedules);
  } catch {
    return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = Number(session.user.id);

    const { name, timezone } = await req.json();
    if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

    const schedule = await prisma.availabilitySchedule.create({
      data: {
        userId,
        name,
        timezone: timezone || "Asia/Kolkata",
        isDefault: false,
      },
      include: { rules: true, dateOverrides: true },
    });
    return NextResponse.json(schedule, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create schedule" }, { status: 500 });
  }
}
