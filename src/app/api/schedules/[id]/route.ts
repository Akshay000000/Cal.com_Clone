import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_USER_ID = 1;
type Params = { params: { id: string } };

export async function PUT(req: NextRequest, { params }: Params) {
  const id = parseInt(params.id);
  try {
    const { name, timezone, rules, setDefault } = await req.json();

    if (setDefault) {
      // Unset all other defaults for this user first
      await prisma.availabilitySchedule.updateMany({
        where: { userId: DEFAULT_USER_ID },
        data: { isDefault: false },
      });
      await prisma.availabilitySchedule.update({
        where: { id },
        data: { isDefault: true },
      });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (timezone !== undefined) updateData.timezone = timezone;

    if (Array.isArray(rules)) {
      await prisma.$transaction([
        prisma.availabilityRule.deleteMany({ where: { scheduleId: id } }),
        ...rules.map((r: { dayOfWeek: number; startTime: string; endTime: string }) =>
          prisma.availabilityRule.create({
            data: { scheduleId: id, dayOfWeek: r.dayOfWeek, startTime: r.startTime, endTime: r.endTime },
          })
        ),
      ]);
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.availabilitySchedule.update({ where: { id }, data: updateData });
    }

    const updated = await prisma.availabilitySchedule.findUnique({
      where: { id },
      include: { rules: { orderBy: { dayOfWeek: "asc" } }, dateOverrides: { orderBy: { date: "asc" } } },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update schedule" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const id = parseInt(params.id);
  try {
    const schedule = await prisma.availabilitySchedule.findUnique({ where: { id } });
    if (schedule?.isDefault)
      return NextResponse.json({ error: "Cannot delete the default schedule" }, { status: 400 });
    await prisma.availabilitySchedule.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete schedule" }, { status: 500 });
  }
}
