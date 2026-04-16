import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public endpoint — no auth required. Used by the booking page to load
// an event type by its URL slug regardless of who is visiting.
export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const et = await prisma.eventType.findUnique({
      where: { slug: params.slug },
      include: { questions: { orderBy: { order: "asc" } } },
    });
    if (!et || !et.isActive)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(et);
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
