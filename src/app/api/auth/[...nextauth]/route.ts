// Auth is handled by Clerk — this route is no longer used
import { NextResponse } from "next/server";
export async function GET() { return NextResponse.json({ error: "Not found" }, { status: 404 }); }
export async function POST() { return NextResponse.json({ error: "Not found" }, { status: 404 }); }
