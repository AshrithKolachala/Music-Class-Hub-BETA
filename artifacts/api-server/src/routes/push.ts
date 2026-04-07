import { Router, type IRouter, type Request, type Response } from "express";
import webpush from "web-push";
import { db, pushSubscriptionsTable, classesTable, notificationSentTable, studentsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const VAPID_PUBLIC_KEY = "BGz0qt7upfTeISVjBphxs9GOZVNsTBt3xJ1hYDLmfeASelDTmvsWX1O_UVpf59s9AZejcVfD0Z9GLggYD7WDxXk";
const VAPID_PRIVATE_KEY = "dh7q-PFhLQhaogjeRzmdU5t0I2flIKYR1361666O9qo";

webpush.setVapidDetails(
  "mailto:admin@sangeetavarshini.com",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY,
);

const router: IRouter = Router();

function requireAuth(req: Request, res: Response, next: () => void) {
  if (!(req.session as any).role) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  next();
}

router.get("/vapid-public-key", (_req: Request, res: Response) => {
  res.json({ publicKey: VAPID_PUBLIC_KEY });
});

router.post("/subscribe", requireAuth, async (req: Request, res: Response) => {
  const session = req.session as any;
  const { subscription } = req.body;

  if (!subscription) {
    res.status(400).json({ error: "Subscription required" });
    return;
  }

  const userKey = session.role === "teacher" ? "teacher" : `student-${session.studentId}`;

  await db.insert(pushSubscriptionsTable)
    .values({ userKey, subscription: JSON.stringify(subscription) })
    .onConflictDoUpdate({ target: pushSubscriptionsTable.userKey, set: { subscription: JSON.stringify(subscription) } });

  res.json({ success: true });
});

export async function sendPushToKey(userKey: string, title: string, body: string, url?: string) {
  try {
    const [row] = await db.select().from(pushSubscriptionsTable).where(eq(pushSubscriptionsTable.userKey, userKey));
    if (!row) return;
    const sub = JSON.parse(row.subscription);
    await webpush.sendNotification(sub, JSON.stringify({ title, body, url: url || "/" }));
  } catch (err: any) {
    if (err.statusCode === 410) {
      await db.delete(pushSubscriptionsTable).where(eq(pushSubscriptionsTable.userKey, userKey));
    }
  }
}

export async function runNotificationScheduler() {
  try {
    const now = new Date();
    const classes = await db.select().from(classesTable);
    const INTERVALS = [60, 30, 15, 5];

    for (const cls of classes) {
      if (cls.status !== "scheduled") continue;
      const classTime = new Date(cls.scheduledAt).getTime();
      const minutesUntil = (classTime - now.getTime()) / 60000;

      for (const mins of INTERVALS) {
        if (minutesUntil <= mins + 0.5 && minutesUntil > mins - 0.5) {
          const existing = await db.select().from(notificationSentTable)
            .where(and(eq(notificationSentTable.classId, cls.id), eq(notificationSentTable.minutesBefore, mins)));

          if (existing.length > 0) continue;

          await db.insert(notificationSentTable).values({ classId: cls.id, minutesBefore: mins });

          const label = mins === 60 ? "1 hour" : `${mins} minutes`;
          const body = `"${cls.title}" starts in ${label}`;

          await sendPushToKey("teacher", "Upcoming Class", body, `/teacher/classes`);

          if (cls.studentId) {
            const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, cls.studentId));
            if (student) {
              await sendPushToKey(`student-${cls.studentId}`, "Upcoming Class", body, `/student/classes`);
            }
          } else {
            const students = await db.select().from(studentsTable);
            for (const student of students) {
              await sendPushToKey(`student-${student.id}`, "Upcoming Class", body, `/student/classes`);
            }
          }
        }
      }
    }
  } catch (err) {
    console.error("Scheduler error:", err);
  }
}

export default router;
