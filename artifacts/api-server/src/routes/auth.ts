import { Router, type IRouter, type Request, type Response } from "express";
import { LoginBody } from "@workspace/api-zod";

const router: IRouter = Router();

const TEACHER_ID = "UshaVangara181011";
const PASSWORD = "SaiAshrith@2011";

declare module "express-session" {
  interface SessionData {
    role?: "teacher" | "student";
    userId?: string;
    name?: string;
    studentId?: number | null;
  }
}

router.post("/login", async (req: Request, res: Response) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { userId, password, role } = parsed.data;

  if (role === "teacher") {
    if (userId !== TEACHER_ID || password !== PASSWORD) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    (req.session as any).role = "teacher";
    (req.session as any).userId = TEACHER_ID;
    (req.session as any).name = "Music Teacher";
    (req.session as any).studentId = null;

    res.json({
      success: true,
      role: "teacher",
      userId: TEACHER_ID,
      name: "Music Teacher",
      studentId: null,
    });
    return;
  }

  if (role === "student") {
    const { db, studentsTable } = await import("@workspace/db");
    const { eq } = await import("drizzle-orm");
    const students = await db.select().from(studentsTable).where(eq(studentsTable.studentId, userId));

    if (students.length === 0) {
      res.status(401).json({ error: "Invalid student ID" });
      return;
    }

    const student = students[0];
    if (student.password !== password) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    (req.session as any).role = "student";
    (req.session as any).userId = userId;
    (req.session as any).name = student.name;
    (req.session as any).studentId = student.id;

    res.json({
      success: true,
      role: "student",
      userId,
      name: student.name,
      studentId: student.id,
    });
    return;
  }

  res.status(400).json({ error: "Invalid role" });
});

router.get("/me", (req: Request, res: Response) => {
  const session = req.session as any;
  if (!session.role) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json({
    role: session.role,
    userId: session.userId,
    name: session.name,
    studentId: session.studentId ?? null,
  });
});

router.post("/logout", (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.json({ success: true, message: "Logged out" });
  });
});

export default router;
