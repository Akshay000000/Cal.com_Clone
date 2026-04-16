import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const DEMO_EMAIL = "demo@cal.app";

// Returns YYYY-MM-DD offset from today
function relDate(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split("T")[0];
}

async function seedDemoData(userId: number) {
  // ── Event types ────────────────────────────────────────────────────────────
  const existingETs = await prisma.eventType.findMany({ where: { userId } });

  let et30Id: number, et60Id: number, et15Id: number, et90Id: number;

  if (existingETs.length === 0) {
    const [et15, et30, et60, et90] = await Promise.all([
      prisma.eventType.create({
        data: {
          userId,
          title: "Quick Chat",
          slug: `demo-15min-${userId}`,
          description: "A short 15-minute catch-up call.",
          durationMinutes: 15,
          bufferMinutes: 5,
          isActive: true,
        },
      }),
      prisma.eventType.create({
        data: {
          userId,
          title: "30 Min Meeting",
          slug: `demo-30min-${userId}`,
          description: "A focused 30-minute meeting.",
          durationMinutes: 30,
          bufferMinutes: 10,
          isActive: true,
          questions: {
            create: [
              { label: "What would you like to discuss?", required: true, order: 0 },
              { label: "Any materials to share beforehand?", required: false, order: 1 },
            ],
          },
        },
      }),
      prisma.eventType.create({
        data: {
          userId,
          title: "1 Hour Strategy Session",
          slug: `demo-60min-${userId}`,
          description: "Deep dive into strategy and planning.",
          durationMinutes: 60,
          bufferMinutes: 15,
          isActive: true,
          questions: {
            create: [
              { label: "Company name", required: true, order: 0 },
              { label: "What are your main goals?", required: true, order: 1 },
              { label: "Current challenges?", required: false, order: 2 },
            ],
          },
        },
      }),
      prisma.eventType.create({
        data: {
          userId,
          title: "90 Min Deep Dive",
          slug: `demo-90min-${userId}`,
          description: "Extended session for complex topics.",
          durationMinutes: 90,
          bufferMinutes: 15,
          isActive: false, // intentionally inactive to show the toggle
        },
      }),
    ]);
    et15Id = et15.id;
    et30Id = et30.id;
    et60Id = et60.id;
    et90Id = et90.id;
  } else {
    et15Id = existingETs[0]?.id;
    et30Id = existingETs[1]?.id ?? existingETs[0].id;
    et60Id = existingETs[2]?.id ?? existingETs[0].id;
    et90Id = existingETs[3]?.id ?? existingETs[0].id;
  }

  // ── Bookings (only seed if none exist yet) ─────────────────────────────────
  const existingBookings = await prisma.booking.count({
    where: { eventType: { userId } },
  });

  if (existingBookings === 0) {
    const bookings = [
      // ── upcoming confirmed ────────────────────────────────────────────────
      { eventTypeId: et30Id, bookerName: "Alice Johnson", bookerEmail: "alice@acmecorp.com",   date: relDate(1),  startTime: "09:00", endTime: "09:30", status: "confirmed" as const },
      { eventTypeId: et60Id, bookerName: "Bob Martinez",  bookerEmail: "bob@techco.io",         date: relDate(2),  startTime: "11:00", endTime: "12:00", status: "confirmed" as const },
      { eventTypeId: et15Id, bookerName: "Carol White",   bookerEmail: "carol@startup.dev",     date: relDate(3),  startTime: "14:30", endTime: "14:45", status: "confirmed" as const },
      { eventTypeId: et30Id, bookerName: "David Kim",     bookerEmail: "david@bigco.com",       date: relDate(5),  startTime: "10:00", endTime: "10:30", status: "confirmed" as const },
      { eventTypeId: et60Id, bookerName: "Emma Davis",    bookerEmail: "emma@ventures.vc",      date: relDate(7),  startTime: "15:00", endTime: "16:00", status: "confirmed" as const },
      { eventTypeId: et15Id, bookerName: "Frank Lee",     bookerEmail: "frank@design.co",       date: relDate(10), startTime: "09:30", endTime: "09:45", status: "confirmed" as const },
      { eventTypeId: et30Id, bookerName: "Grace Chen",    bookerEmail: "grace@agency.io",       date: relDate(12), startTime: "13:00", endTime: "13:30", status: "confirmed" as const },
      // ── past confirmed ────────────────────────────────────────────────────
      { eventTypeId: et30Id, bookerName: "Henry Brown",   bookerEmail: "henry@corp.com",        date: relDate(-1), startTime: "10:00", endTime: "10:30", status: "confirmed" as const },
      { eventTypeId: et60Id, bookerName: "Irene Park",    bookerEmail: "irene@media.com",       date: relDate(-3), startTime: "14:00", endTime: "15:00", status: "confirmed" as const },
      { eventTypeId: et15Id, bookerName: "James Wilson",  bookerEmail: "james@freelance.dev",   date: relDate(-5), startTime: "11:00", endTime: "11:15", status: "confirmed" as const },
      { eventTypeId: et30Id, bookerName: "Karen Taylor",  bookerEmail: "karen@consulting.biz",  date: relDate(-7), startTime: "09:00", endTime: "09:30", status: "confirmed" as const },
      { eventTypeId: et60Id, bookerName: "Leo Singh",     bookerEmail: "leo@fintech.io",        date: relDate(-10),startTime: "16:00", endTime: "17:00", status: "confirmed" as const },
      // ── cancelled ────────────────────────────────────────────────────────
      { eventTypeId: et30Id, bookerName: "Mia Roberts",   bookerEmail: "mia@client.co",         date: relDate(4),  startTime: "11:00", endTime: "11:30", status: "cancelled" as const },
      { eventTypeId: et15Id, bookerName: "Noah Clark",    bookerEmail: "noah@example.com",      date: relDate(-2), startTime: "15:00", endTime: "15:15", status: "cancelled" as const },
      { eventTypeId: et60Id, bookerName: "Olivia Moore",  bookerEmail: "olivia@bigco.com",      date: relDate(-8), startTime: "10:00", endTime: "11:00", status: "cancelled" as const },
    ];

    await prisma.booking.createMany({ data: bookings });
  }

  // ── Availability schedule ─────────────────────────────────────────────────
  const schedule = await prisma.availabilitySchedule.findFirst({
    where: { userId, isDefault: true },
    include: { dateOverrides: true },
  });

  if (!schedule) {
    await prisma.availabilitySchedule.create({
      data: {
        userId,
        name: "Working Hours",
        timezone: "Asia/Kolkata",
        isDefault: true,
        rules: {
          create: [1, 2, 3, 4, 5].map((day) => ({
            dayOfWeek: day,
            startTime: "09:00",
            endTime: "17:00",
          })),
        },
        dateOverrides: {
          create: [
            // blocked day next week
            { date: relDate(8),  isBlocked: true },
            // custom hours day after that
            { date: relDate(9),  isBlocked: false, startTime: "13:00", endTime: "18:00" },
          ],
        },
      },
    });
  } else if (schedule.dateOverrides.length === 0) {
    await prisma.dateOverride.createMany({
      data: [
        { scheduleId: schedule.id, date: relDate(8),  isBlocked: true },
        { scheduleId: schedule.id, date: relDate(9),  isBlocked: false, startTime: "13:00", endTime: "18:00" },
      ],
    });
  }
}

async function getOrCreateDemoUser() {
  let demo = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (!demo) {
    demo = await prisma.user.create({
      data: { name: "Demo User", email: DEMO_EMAIL, timezone: "Asia/Kolkata" },
    });
  }
  // Always ensure rich seed data exists (idempotent checks inside)
  await seedDemoData(demo.id);
  return demo;
}

export async function getAuthSession() {
  const { userId: clerkId } = await auth();

  // ── Authenticated via Clerk ──────────────────────────────────────────────
  if (clerkId) {
    let dbUser = await prisma.user.findUnique({ where: { clerkId } });

    if (!dbUser) {
      const clerkUser = await currentUser();
      if (!clerkUser) return null;

      const email =
        clerkUser.emailAddresses[0]?.emailAddress || `${clerkId}@cal.app`;
      const name =
        `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
        email.split("@")[0];

      dbUser = await prisma.user.upsert({
        where: { email },
        update: { clerkId },
        create: { clerkId, name, email, timezone: "Asia/Kolkata" },
      });

      // Seed default schedule on first login
      const existing = await prisma.availabilitySchedule.findFirst({
        where: { userId: dbUser.id },
      });
      if (!existing) {
        await prisma.availabilitySchedule.create({
          data: {
            userId: dbUser.id,
            name: "Working Hours",
            timezone: "Asia/Kolkata",
            isDefault: true,
            rules: {
              create: [1, 2, 3, 4, 5].map((day) => ({
                dayOfWeek: day,
                startTime: "09:00",
                endTime: "17:00",
              })),
            },
          },
        });
      }
    }

    return { user: { id: dbUser.id, clerkId, name: dbUser.name, email: dbUser.email } };
  }

  // ── Not signed in → demo mode ─────────────────────────────────────────────
  const demo = await getOrCreateDemoUser();
  return { user: { id: demo.id, clerkId: null as null, name: demo.name, email: demo.email } };
}
