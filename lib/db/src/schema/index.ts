import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const studentsTable = pgTable("students", {
  id: serial("id").primaryKey(),
  studentId: text("student_id").notNull().unique(),
  name: text("name").notNull(),
  instrument: text("instrument").notNull(),
  password: text("password").notNull().default("password@123"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertStudentSchema = createInsertSchema(studentsTable).omit({ id: true, studentId: true, createdAt: true });
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof studentsTable.$inferSelect;

export const classesTable = pgTable("classes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").default(""),
  scheduledAt: timestamp("scheduled_at").notNull(),
  durationMinutes: integer("duration_minutes").notNull().default(60),
  topic: text("topic").notNull(),
  status: text("status").notNull().default("scheduled"),
  meetingLink: text("meeting_link"),
  studentId: integer("student_id"),
  recurringType: text("recurring_type").notNull().default("none"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertClassSchema = createInsertSchema(classesTable).omit({ id: true, createdAt: true });
export type InsertClass = z.infer<typeof insertClassSchema>;
export type Class = typeof classesTable.$inferSelect;

export const announcementsTable = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isPinned: boolean("is_pinned").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAnnouncementSchema = createInsertSchema(announcementsTable).omit({ id: true, createdAt: true });
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Announcement = typeof announcementsTable.$inferSelect;

export const classLogsTable = pgTable("class_logs", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  classDate: text("class_date").notNull(),
  timeStarted: text("time_started").notNull(),
  timeEnded: text("time_ended").notNull(),
  timeTaken: text("time_taken").notNull(),
  whatTaught: text("what_taught").notNull(),
  homework: text("homework").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ClassLog = typeof classLogsTable.$inferSelect;

export const updatesTable = pgTable("updates", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Update = typeof updatesTable.$inferSelect;

export const pushSubscriptionsTable = pgTable("push_subscriptions", {
  id: serial("id").primaryKey(),
  userKey: text("user_key").notNull().unique(),
  subscription: text("subscription").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notificationSentTable = pgTable("notification_sent", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").notNull(),
  minutesBefore: integer("minutes_before").notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});
