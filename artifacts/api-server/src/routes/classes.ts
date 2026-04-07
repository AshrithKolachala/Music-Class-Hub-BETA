import { Router, type IRouter, type Request, type Response } from "express";
import { db, classesTable } from "@workspace/db";
import { eq, or, isNull } from "drizzle-orm";
import { CreateClassBody, UpdateClassBody } from "@workspace/api-zod";

const router: IRouter = Router();

function requireTeacher(req: Request, res: Response, next: () => void) {
  const session = req.session as any;
  if (session.role !== "teacher") {
    res.status(403).json({ error: "Teacher access required" });
    return;
  }
  next();
}

function requireAuth(req: Request, res: Response, next: () => void) {
  const session = req.session as any;
  if (!session.role) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  next();
}

router.get("/", requireAuth, async (req: Request, res: Response) => {
  const session = req.session as any;
  let classes;

  if (session.role === "student" && session.studentId) {
    classes = await db.select().from(classesTable)
      .where(or(isNull(classesTable.studentId), eq(classesTable.studentId, session.studentId)))
      .orderBy(classesTable.scheduledAt);
  } else {
    classes = await db.select().from(classesTable).orderBy(classesTable.scheduledAt);
  }

  res.json(classes.map(c => ({
    ...c,
    scheduledAt: c.scheduledAt.toISOString(),
    createdAt: c.createdAt.toISOString(),
    meetingLink: c.meetingLink ?? `https://meet.jit.si/MusicLesson-${c.id}`,
  })));
});

router.post("/", requireTeacher, async (req: Request, res: Response) => {
  const parsed = CreateClassBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const [cls] = await db.insert(classesTable).values({
    title: parsed.data.title,
    description: parsed.data.description ?? "",
    scheduledAt: new Date(parsed.data.scheduledAt),
    durationMinutes: parsed.data.durationMinutes,
    topic: parsed.data.topic,
    status: "scheduled",
    studentId: (parsed.data as any).studentId ?? null,
    recurringType: (parsed.data as any).recurringType ?? "none",
  }).returning();

  const meetingLink = `https://meet.jit.si/MusicLesson-${cls.id}`;
  const [updated] = await db.update(classesTable).set({ meetingLink }).where(eq(classesTable.id, cls.id)).returning();

  res.status(201).json({
    ...updated,
    scheduledAt: updated.scheduledAt.toISOString(),
    createdAt: updated.createdAt.toISOString(),
    meetingLink,
  });
});

router.put("/:classId", requireTeacher, async (req: Request, res: Response) => {
  const id = parseInt(req.params.classId);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid class ID" });
    return;
  }

  const parsed = UpdateClassBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
  if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
  if (parsed.data.scheduledAt !== undefined) updateData.scheduledAt = new Date(parsed.data.scheduledAt);
  if (parsed.data.durationMinutes !== undefined) updateData.durationMinutes = parsed.data.durationMinutes;
  if (parsed.data.topic !== undefined) updateData.topic = parsed.data.topic;
  if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
  if ((parsed.data as any).studentId !== undefined) updateData.studentId = (parsed.data as any).studentId;
  if ((parsed.data as any).recurringType !== undefined) updateData.recurringType = (parsed.data as any).recurringType;

  const [updated] = await db.update(classesTable).set(updateData).where(eq(classesTable.id, id)).returning();

  if (!updated) {
    res.status(404).json({ error: "Class not found" });
    return;
  }

  res.json({
    ...updated,
    scheduledAt: updated.scheduledAt.toISOString(),
    createdAt: updated.createdAt.toISOString(),
    meetingLink: updated.meetingLink ?? `https://meet.jit.si/MusicLesson-${updated.id}`,
  });
});

router.delete("/:classId", requireTeacher, async (req: Request, res: Response) => {
  const id = parseInt(req.params.classId);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid class ID" });
    return;
  }
  await db.delete(classesTable).where(eq(classesTable.id, id));
  res.json({ success: true, message: "Class deleted" });
});

export default router;
