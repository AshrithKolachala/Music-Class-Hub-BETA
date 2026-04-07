import express, { type Express } from "express";
import cors from "cors";
import session from "express-session";
import router from "./routes";
import { runNotificationScheduler } from "./routes/push";

const app: Express = express();

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || "sangeetavarshini-secret-2024",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}));

app.use("/api", router);

setInterval(runNotificationScheduler, 30 * 1000);
runNotificationScheduler();

export default app;
