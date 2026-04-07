import { Router, type IRouter, type Request, type Response } from "express";
import { db, announcementsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { CreateAnnouncementBody } from "@workspace/api-zod";

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


router.get("/", requireAuth, async (_req: Request, res: Response) => {
  const announcements = await db.select().from(announcementsTable).orderBy(desc(announcementsTable.isPinned), desc(announcementsTable.createdAt));
  res.json(announcements.map(a => ({
    ...a,
    createdAt: a.createdAt.toISOString(),
  })));
});

router.post("/", requireTeacher, async (req: Request, res: Response) => {
  const parsed = CreateAnnouncementBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const [announcement] = await db.insert(announcementsTable).values({
    title: parsed.data.title,
    content: parsed.data.content,
    isPinned: parsed.data.isPinned ?? false,
  }).returning();

  res.status(201).json({
    ...announcement,
    createdAt: announcement.createdAt.toISOString(),
  });
});

router.delete("/:announcementId", requireTeacher, async (req: Request, res: Response) => {
  const id = parseInt(req.params.announcementId);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid announcement ID" });
    return;
  }
  await db.delete(announcementsTable).where(eq(announcementsTable.id, id));
  res.json({ success: true, message: "Announcement deleted" });
});

export default router;
