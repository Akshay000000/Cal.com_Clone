import { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID || "",
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || "",
      tenantId: process.env.AZURE_AD_TENANT_ID || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // Ensure user exists and has a password
        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        // Check password
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        // Return user object for session
        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
        };
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "azure-ad") {
        if (!user.email) return false;
        
        let dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || "User",
            },
          });
        }
        user.id = dbUser.id.toString();
        return true;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = Number(token.id);
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_local_dev",
};

export async function getAuthSession() {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    return session;
  }
  
  // Demo mode: fall back to a guest user if no session
  const guestEmail = "demo@cal-clone.com";
  let guestUser = await prisma.user.findUnique({
    where: { email: guestEmail },
  });

  if (!guestUser) {
    guestUser = await prisma.user.create({
      data: {
        name: "Demo User",
        email: guestEmail,
        eventTypes: {
          create: [
            {
              title: "30 Min Meeting",
              slug: "30-min-meeting",
              durationMinutes: 30,
              bookings: {
                create: [
                  // Past Bookings
                  {
                    bookerName: "Alice Smith",
                    bookerEmail: "alice@example.com",
                    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    startTime: "09:30",
                    endTime: "10:00",
                    status: "confirmed",
                  },
                  {
                    bookerName: "John Doe",
                    bookerEmail: "john.doe@example.com",
                    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    startTime: "11:00",
                    endTime: "11:30",
                    status: "confirmed",
                  },
                  // Upcoming Bookings
                  {
                    bookerName: "Bob Jones",
                    bookerEmail: "bob@example.com",
                    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    startTime: "14:00",
                    endTime: "14:30",
                    status: "confirmed",
                  },
                  {
                    bookerName: "Sarah Connor",
                    bookerEmail: "sarahc@example.com",
                    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    startTime: "10:00",
                    endTime: "10:30",
                    status: "confirmed",
                  },
                  // Cancelled Bookings
                  {
                    bookerName: "Charlie Brown",
                    bookerEmail: "charlie@example.com",
                    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    startTime: "11:00",
                    endTime: "11:30",
                    status: "cancelled",
                  },
                  {
                    bookerName: "Diana Prince",
                    bookerEmail: "diana@example.com",
                    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    startTime: "16:00",
                    endTime: "16:30",
                    status: "cancelled",
                  }
                ]
              }
            },
            {
              title: "1 Hour Meeting",
              slug: "1-hour-meeting",
              durationMinutes: 60,
            }
          ]
        },
        availabilitySchedules: {
          create: [
            {
              name: "Working Hours",
              isDefault: true,
              rules: {
                create: [
                  { dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
                  { dayOfWeek: 2, startTime: "09:00", endTime: "17:00" },
                  { dayOfWeek: 3, startTime: "09:00", endTime: "17:00" },
                  { dayOfWeek: 4, startTime: "09:00", endTime: "17:00" },
                  { dayOfWeek: 5, startTime: "09:00", endTime: "17:00" },
                ]
              }
            }
          ]
        }
      }
    });
  }

  return {
    user: {
      id: guestUser.id.toString(),
      name: guestUser.name,
      email: guestUser.email
    }
  };
}
