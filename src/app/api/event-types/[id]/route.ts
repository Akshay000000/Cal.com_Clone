import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const id = parseInt(params.id);
  try {
    const et = await prisma.eventType.findUnique({
      where: { id },
      include: { questions: { orderBy: { order: "asc" } } },
    });
    if (!et) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(et);
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  const id = parseInt(params.id);
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const et = await prisma.eventType.findUnique({ where: { id } });
    if (!et || et.userId !== session.user.id)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();

    if (body.slug) {
      const dup = await prisma.eventType.findFirst({
        where: { slug: body.slug, NOT: { id } },
      });
      if (dup)
        return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
    }

    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.durationMinutes !== undefined)
      updateData.durationMinutes = parseInt(body.durationMinutes);
    if (body.bufferMinutes !== undefined)
      updateData.bufferMinutes = parseInt(body.bufferMinutes);
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    if (Array.isArray(body.questions)) {
      await prisma.bookingQuestion.deleteMany({ where: { eventTypeId: id } });
      updateData.questions = {
        create: body.questions.map(
          (q: { label: string; required: boolean }, i: number) => ({
            label: q.label,
            required: q.required ?? false,
            order: i,
          })
        ),
      };
    }

    const updated = await prisma.eventType.update({
      where: { id },
      data: updateData,
      include: { questions: { orderBy: { order: "asc" } } },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const id = parseInt(params.id);
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const et = await prisma.eventType.findUnique({ where: { id } });
    if (!et || et.userId !== session.user.id)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.eventType.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
