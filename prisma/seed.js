const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.bookingAnswer.deleteMany();
  await prisma.bookingQuestion.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.dateOverride.deleteMany();
  await prisma.availabilityRule.deleteMany();
  await prisma.availabilitySchedule.deleteMany();
  await prisma.eventType.deleteMany();
  await prisma.user.deleteMany();

  // Reset auto-increment sequences so IDs start at 1
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE users_id_seq RESTART WITH 1`);
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE event_types_id_seq RESTART WITH 1`);
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE availability_schedules_id_seq RESTART WITH 1`);
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE availability_rules_id_seq RESTART WITH 1`);
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE date_overrides_id_seq RESTART WITH 1`);
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE bookings_id_seq RESTART WITH 1`);
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE booking_questions_id_seq RESTART WITH 1`);
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE booking_answers_id_seq RESTART WITH 1`);

  const user = await prisma.user.create({
    data: { name: "Akshay", email: "akshay@example.com", timezone: "Asia/Kolkata" },
  });

  const schedule = await prisma.availabilitySchedule.create({
    data: {
      userId: user.id,
      name: "Working Hours",
      timezone: "Asia/Kolkata",
      isDefault: true,
      rules: {
        create: [
          { dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
          { dayOfWeek: 2, startTime: "09:00", endTime: "17:00" },
          { dayOfWeek: 3, startTime: "09:00", endTime: "17:00" },
          { dayOfWeek: 4, startTime: "09:00", endTime: "17:00" },
          { dayOfWeek: 5, startTime: "09:00", endTime: "13:00" },
        ],
      },
      dateOverrides: {
        create: [
          { date: "2026-04-20", isBlocked: true },
          { date: "2026-04-22", startTime: "10:00", endTime: "14:00", isBlocked: false },
        ],
      },
    },
  });

  const events = await Promise.all([
    prisma.eventType.create({
      data: {
        userId: user.id, title: "15 Minute Meeting", slug: "15min",
        description: "A quick 15-minute call.", durationMinutes: 15,
      },
    }),
    prisma.eventType.create({
      data: {
        userId: user.id, title: "30 Minute Meeting", slug: "30min",
        description: "Standard 30-minute meeting for intros or follow-ups.", durationMinutes: 30,
      },
    }),
    prisma.eventType.create({
      data: {
        userId: user.id, title: "60 Minute Consultation", slug: "60min-consultation",
        description: "In-depth 60-minute consultation.", durationMinutes: 60,
      },
    }),
    prisma.eventType.create({
      data: {
        userId: user.id, title: "Technical Interview", slug: "tech-interview",
        description: "45-minute technical interview.", durationMinutes: 45, isActive: false,
      },
    }),
  ]);

  await Promise.all([
    prisma.booking.create({
      data: {
        eventTypeId: events[1].id, bookerName: "Alice Johnson", bookerEmail: "alice@example.com",
        date: "2026-04-15", startTime: "10:00", endTime: "10:30", status: "confirmed",
      },
    }),
    prisma.booking.create({
      data: {
        eventTypeId: events[0].id, bookerName: "Bob Smith", bookerEmail: "bob@example.com",
        date: "2026-04-16", startTime: "14:00", endTime: "14:15", status: "confirmed",
      },
    }),
    prisma.booking.create({
      data: {
        eventTypeId: events[2].id, bookerName: "Carol Williams", bookerEmail: "carol@example.com",
        date: "2026-04-17", startTime: "09:00", endTime: "10:00", status: "confirmed",
      },
    }),
    prisma.booking.create({
      data: {
        eventTypeId: events[1].id, bookerName: "Dave Brown", bookerEmail: "dave@example.com",
        date: "2026-04-10", startTime: "11:00", endTime: "11:30", status: "confirmed",
      },
    }),
    prisma.booking.create({
      data: {
        eventTypeId: events[0].id, bookerName: "Eve Davis", bookerEmail: "eve@example.com",
        date: "2026-04-11", startTime: "15:00", endTime: "15:15", status: "cancelled",
      },
    }),
  ]);

  console.log("Seed completed: 1 user, 1 schedule, 4 event types, 5 bookings");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
