import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_USER_ID = 1;

export async function GET() {
  try {
    const eventTypes = await prisma.eventType.findMany({
      where: { userId: DEFAULT_USER_ID },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { bookings: { where: { status: "confirmed" } } } },
        questions: { orderBy: { order: "asc" } },
      },
    });
    return NextResponse.json(eventTypes);
  } catch (err) {
    console.error("GET /api/event-types error:", err);
    return NextResponse.json({ error: "Failed to fetch event types" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, slug, description, durationMinutes, bufferMinutes, questions } =
      await req.json();

    if (!title || !slug || !durationMinutes)
      return NextResponse.json(
        { error: "title, slug, and durationMinutes are required" },
        { status: 400 }
      );

    const existing = await prisma.eventType.findUnique({ where: { slug } });
    if (existing)
      return NextResponse.json(
        { error: "An event type with this URL slug already exists" },
        { status: 409 }
      );

    const eventType = await prisma.eventType.create({
      data: {
        userId: DEFAULT_USER_ID,
        title,
        slug,
        description: description || null,
        durationMinutes: parseInt(durationMinutes),
        bufferMinutes: parseInt(bufferMinutes || "0"),
        questions: questions?.length
          ? {
              create: questions.map(
                (q: { label: string; required: boolean }, i: number) => ({
                  label: q.label,
                  required: q.required ?? false,
                  order: i,
                })
              ),
            }
          : undefined,
      },
      include: { questions: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json(eventType, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create event type" }, { status: 500 });
  }
}
