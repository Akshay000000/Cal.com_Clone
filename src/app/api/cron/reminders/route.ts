import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReminderEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  // Optional: check a secret key so this can't be spammed publicly
  const authHeader = req.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find upcoming confirmed bookings in the next 24 hours that haven't been reminded
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const todayStr = now.toISOString().split("T")[0];
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const upcomingBookings = await prisma.booking.findMany({
      where: {
        status: "confirmed",
        reminderSent: false,
        OR: [
          { date: todayStr },
          { date: tomorrowStr },
        ]
      },
      include: {
        eventType: { include: { user: true } }
      }
    });

    let sentCount = 0;

    for (const booking of upcomingBookings) {
      const bookingDateTime = new Date(`${booking.date}T${booking.startTime}:00`);
      const hoursUntil = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      // Send reminder if event is strictly within the next 24 hours (and in the future)
      if (hoursUntil > 0 && hoursUntil <= 24) {
        
        const bookingData = {
          bookerName: booking.bookerName,
          bookerEmail: booking.bookerEmail,
          eventTitle: booking.eventType.title,
          date: booking.date,
          startTime: booking.startTime,
          endTime: booking.endTime,
          durationMinutes: booking.eventType.durationMinutes,
          hostName: booking.eventType.user.name,
          hostEmail: booking.eventType.user.email,
        };

        // Remind booker
        await sendReminderEmail(bookingData, false).catch(console.error);
        
        // Remind host
        await sendReminderEmail(bookingData, true).catch(console.error);

        // Mark as sent
        await prisma.booking.update({
          where: { id: booking.id },
          data: { reminderSent: true }
        });
        
        sentCount++;
      }
    }

    return NextResponse.json({ success: true, remindersSent: sentCount });

  } catch (error) {
    console.error("Cron Job Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
