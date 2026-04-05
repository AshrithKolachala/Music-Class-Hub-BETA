import express from "express";
import cors from "cors";
import { load, save } from "./db.js";

const app = express();
const PORT = process.env.API_PORT || 4000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const sessions = {};

function getSession(req) {
  const token = req.headers["x-session-token"];
  return token ? sessions[token] : null;
}

function requireAuth(req, res, next) {
  const user = getSession(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  req.user = user;
  next();
}

function requireTeacher(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== "teacher") return res.status(403).json({ error: "Forbidden" });
    next();
  });
}

// Auth
app.post("/api/auth/login", (req, res) => {
  const { userId, password, role } = req.body;
  const db = load();
  const user = db.users.find(u => u.id === userId && u.password === password && u.role === role);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const token = Math.random().toString(36).slice(2) + Date.now();
  sessions[token] = { userId: user.id, role: user.role, name: user.name, studentId: user.studentId };
  res.json({ token, userId: user.id, role: user.role, name: user.name, studentId: user.studentId });
});

app.get("/api/auth/me", (req, res) => {
  const user = getSession(req);
  if (!user) return res.status(401).json({ error: "Not authenticated" });
  res.json(user);
});

app.post("/api/auth/logout", (req, res) => {
  const token = req.headers["x-session-token"];
  if (token) delete sessions[token];
  res.json({ success: true });
});

// Students
app.get("/api/students", requireTeacher, (req, res) => {
  const db = load();
  res.json(db.students);
});

app.post("/api/students", requireTeacher, (req, res) => {
  const db = load();
  const { name, userId, password } = req.body;
  if (!name || !userId || !password) return res.status(400).json({ error: "name, userId, password required" });
  if (db.users.find(u => u.id === userId)) return res.status(400).json({ error: "User ID already exists" });
  const studentId = db.students.length + 1;
  const newStudent = { id: studentId, name, userId, createdAt: new Date().toISOString() };
  db.students.push(newStudent);
  db.users.push({ id: userId, password, role: "student", name, studentId });
  save(db);
  res.status(201).json(newStudent);
});

app.delete("/api/students/:id", requireTeacher, (req, res) => {
  const db = load();
  const id = parseInt(req.params.id);
  const student = db.students.find(s => s.id === id);
  if (!student) return res.status(404).json({ error: "Not found" });
  db.students = db.students.filter(s => s.id !== id);
  db.users = db.users.filter(u => u.id !== student.userId);
  save(db);
  res.json({ success: true });
});

app.patch("/api/students/:id/password", requireTeacher, (req, res) => {
  const db = load();
  const id = parseInt(req.params.id);
  const student = db.students.find(s => s.id === id);
  if (!student) return res.status(404).json({ error: "Not found" });
  const userIndex = db.users.findIndex(u => u.id === student.userId);
  if (userIndex !== -1) db.users[userIndex].password = req.body.newPassword;
  save(db);
  res.json({ success: true });
});

// Classes
app.get("/api/classes", requireAuth, (req, res) => {
  const db = load();
  res.json(db.classes);
});

app.post("/api/classes", requireTeacher, (req, res) => {
  const db = load();
  const newClass = { id: Date.now(), ...req.body, status: "scheduled", createdAt: new Date().toISOString() };
  db.classes.push(newClass);
  save(db);
  res.status(201).json(newClass);
});

app.put("/api/classes/:id", requireTeacher, (req, res) => {
  const db = load();
  const id = parseInt(req.params.id);
  const idx = db.classes.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  db.classes[idx] = { ...db.classes[idx], ...req.body };
  save(db);
  res.json(db.classes[idx]);
});

app.delete("/api/classes/:id", requireTeacher, (req, res) => {
  const db = load();
  const id = parseInt(req.params.id);
  db.classes = db.classes.filter(c => c.id !== id);
  save(db);
  res.json({ success: true });
});

// Announcements
app.get("/api/announcements", requireAuth, (req, res) => {
  const db = load();
  res.json(db.announcements);
});

app.post("/api/announcements", requireTeacher, (req, res) => {
  const db = load();
  const newAnnouncement = { id: Date.now(), ...req.body, createdAt: new Date().toISOString(), createdBy: req.user.name };
  db.announcements.push(newAnnouncement);
  save(db);
  res.status(201).json(newAnnouncement);
});

app.delete("/api/announcements/:id", requireTeacher, (req, res) => {
  const db = load();
  const id = parseInt(req.params.id);
  db.announcements = db.announcements.filter(a => a.id !== id);
  save(db);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
