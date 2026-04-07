import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import studentsRouter from "./students";
import classesRouter from "./classes";
import announcementsRouter from "./announcements";
import classLogsRouter from "./class-logs";
import updatesRouter from "./updates";
import pushRouter from "./push";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/students", studentsRouter);
router.use("/classes", classesRouter);
router.use("/announcements", announcementsRouter);
router.use("/class-logs", classLogsRouter);
router.use("/updates", updatesRouter);
router.use("/push", pushRouter);

export default router;
