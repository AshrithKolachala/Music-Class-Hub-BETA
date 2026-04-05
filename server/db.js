import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, "data.json");

const defaultData = {
  users: [
    {
      id: "TEACHER-001",
      password: "password123",
      role: "teacher",
      name: "Dr. Sharma",
      studentId: null,
    },
  ],
  students: [],
  classes: [],
  announcements: [],
};

function load() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
}

function save(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

export { load, save };
