import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function seedIfEmpty(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, "users"));
    if (!snap.empty) return;
    await addDoc(collection(db, "users"), {
      loginId: "TEACHER-001",
      password: "password@123",
      name: "Teacher",
      role: "teacher",
    });
    console.log("Seeded teacher account: TEACHER-001 / password@123");
  } catch (err) {
    console.error("Seed failed:", err);
  }
}
