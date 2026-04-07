import { Router, type IRouter, type Request, type Response } from "express";
import { db, classLogsTable, studentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

function requireTeacher(req: Request, res: Response, next: () => void) {
  if ((req.session as any).role !== "teacher") {
    res.status(403).json({ error: "Teacher access required" });
    return;
  }
  next();
}

function requireAuth(req: Request, res: Response, next: () => void) {
  if (!(req.session as any).role) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  next();
}

router.get("/", requireAuth, async (req: Request, res: Response) => {
  const session = req.session as any;
  let logs;

  if (session.role === "student" && session.studentId) {
    logs = await db.select().from(classLogsTable)
      .where(eq(classLogsTable.studentId, session.studentId))
      .orderBy(classLogsTable.createdAt);
  } else {
    const studentId = req.query.studentId ? parseInt(req.query.studentId as string) : null;
    if (studentId) {
      logs = await db.select().from(classLogsTable)
        .where(eq(classLogsTable.studentId, studentId))
        .orderBy(classLogsTable.createdAt);
    } else {
      logs = await db.select().from(classLogsTable).orderBy(classLogsTable.createdAt);
    }
  }

  const studentIds = [...new Set(logs.map(l => l.studentId))];
  const students = studentIds.length > 0
    ? await db.select({ id: studentsTable.id, name: studentsTable.name, studentId: studentsTable.studentId })
        .from(studentsTable)
    : [];

  const studentMap = Object.fromEntries(students.map(s => [s.id, s]));

  res.json(logs.map(l => ({
    ...l,
    createdAt: l.createdAt.toISOString(),
    studentName: studentMap[l.studentId]?.name ?? "Unknown",
    studentCode: studentMap[l.studentId]?.studentId ?? "",
  })));
});

router.post("/", requireTeacher, async (req: Request, res: Response) => {
  const { studentId, classDate, timeStarted, timeEnded, timeTaken, whatTaught, homework } = req.body;

  if (!studentId || !classDate || !timeStarted || !timeEnded || !timeTaken || !whatTaught) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const [log] = await db.insert(classLogsTable).values({
    studentId: parseInt(studentId),
    classDate,
    timeStarted,
    timeEnded,
    timeTaken,
    whatTaught,
    homework: homework ?? "",
  }).returning();

  res.status(201).json({ ...log, createdAt: log.createdAt.toISOString() });
});

router.delete("/:id", requireTeacher, async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  await db.delete(classLogsTable).where(eq(classLogsTable.id, id));
  res.json({ success: true });
});

export default router;
