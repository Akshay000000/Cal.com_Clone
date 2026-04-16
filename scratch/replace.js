const fs = require('fs');
const files = [
  'd:/cal-clone/src/app/api/event-types/route.ts',
  'd:/cal-clone/src/app/api/schedules/route.ts',
  'd:/cal-clone/src/app/api/schedules/[id]/route.ts',
  'd:/cal-clone/src/app/api/date-overrides/route.ts',
  'd:/cal-clone/src/app/api/availability/route.ts',
  'd:/cal-clone/src/app/api/bookings/route.ts'
];
for (let f of files) {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace('import { getServerSession } from "next-auth/next";', 'import { getAuthSession } from "@/lib/auth";');
  content = content.replace('import { authOptions } from "@/lib/auth";\r\n', '');
  content = content.replace('import { authOptions } from "@/lib/auth";\n', '');
  content = content.replaceAll('getServerSession(authOptions)', 'getAuthSession()');
  fs.writeFileSync(f, content);
  console.log('Updated ' + f);
}
