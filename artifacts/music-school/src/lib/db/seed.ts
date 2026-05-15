import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const TEACHER_DOC_ID = "teacher-usha";

export async function seedIfEmpty(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, "users"));
    const docs = snap.docs;

    // Remove any stale teacher accounts that don't match
    for (const d of docs) {
      if (d.data().role === "teacher" && d.id !== TEACHER_DOC_ID) {
        await deleteDoc(doc(db, "users", d.id));
      }
    }

    // Check if the correct teacher already exists
    const hasCorrect = docs.some(d => d.id === TEACHER_DOC_ID);
    if (hasCorrect) return;

    // Create teacher with fixed document ID so this is idempotent
    await setDoc(doc(db, "users", TEACHER_DOC_ID), {
      loginId: "UshaVangara181011",
      password: "SaiAshrith@2011",
      name: "Usha Vangara",
      role: "teacher",
    });
    console.log("Seeded teacher account: UshaVangara181011");
  } catch (err) {
    console.error("Seed failed:", err);
  }
}
