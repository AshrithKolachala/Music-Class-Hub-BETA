import { Router, type IRouter, type Request, type Response } from "express";
import { db, updatesTable, studentsTable } from "@workspace/db";
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
  let updates;

  if (session.role === "student" && session.studentId) {
    updates = await db.select().from(updatesTable)
      .where(eq(updatesTable.studentId, session.studentId))
      .orderBy(updatesTable.createdAt);
  } else {
    const studentId = req.query.studentId ? parseInt(req.query.studentId as string) : null;
    if (studentId) {
      updates = await db.select().from(updatesTable)
        .where(eq(updatesTable.studentId, studentId))
        .orderBy(updatesTable.createdAt);
    } else {
      updates = await db.select().from(updatesTable).orderBy(updatesTable.createdAt);
    }
  }

  const studentIds = [...new Set(updates.map(u => u.studentId))];
  const students = studentIds.length > 0
    ? await db.select({ id: studentsTable.id, name: studentsTable.name })
        .from(studentsTable)
    : [];

  const studentMap = Object.fromEntries(students.map(s => [s.id, s.name]));

  res.json(updates.map(u => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
    studentName: studentMap[u.studentId] ?? "Unknown",
  })));
});

router.post("/", requireTeacher, async (req: Request, res: Response) => {
  const { studentId, title, content } = req.body;

  if (!studentId || !title || !content) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const [update] = await db.insert(updatesTable).values({
    studentId: parseInt(studentId),
    title,
    content,
  }).returning();

  res.status(201).json({ ...update, createdAt: update.createdAt.toISOString() });
});

router.delete("/:id", requireTeacher, async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  await db.delete(updatesTable).where(eq(updatesTable.id, id));
  res.json({ success: true });
});

export default router;
