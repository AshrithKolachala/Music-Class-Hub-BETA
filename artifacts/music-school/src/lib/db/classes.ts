import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  Timestamp,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type ClassStatus = "scheduled" | "ongoing" | "completed" | "cancelled";

export type ClassRecord = {
  id: string;
  title: string;
  topic: string;
  scheduledAt: string;
  durationMinutes: number;
  description: string;
  status: ClassStatus;
  recurringType: string;
  studentId: string | null;
};

export async function getClasses(): Promise<ClassRecord[]> {
  const snap = await getDocs(query(collection(db, "classes"), orderBy("scheduledAt", "asc")));
  return snap.docs.map((d) => {
    const data = d.data();
    const scheduledAt =
      data.scheduledAt instanceof Timestamp
        ? data.scheduledAt.toDate().toISOString()
        : data.scheduledAt;
    return {
      id: d.id,
      title: data.title,
      topic: data.topic,
      scheduledAt,
      durationMinutes: data.durationMinutes,
      description: data.description || "",
      status: data.status,
      recurringType: data.recurringType || "none",
      studentId: data.studentId || null,
    };
  });
}

export async function createClass(data: {
  title: string;
  topic: string;
  scheduledAt: string;
  durationMinutes: number;
  description?: string;
  status?: ClassStatus;
  recurringType?: string;
  studentId?: string | null;
}): Promise<ClassRecord> {
  const docRef = await addDoc(collection(db, "classes"), {
    title: data.title,
    topic: data.topic,
    scheduledAt: Timestamp.fromDate(new Date(data.scheduledAt)),
    durationMinutes: data.durationMinutes,
    description: data.description || "",
    status: data.status || "scheduled",
    recurringType: data.recurringType || "none",
    studentId: data.studentId || null,
  });
  return { id: docRef.id, ...data, status: data.status || "scheduled", recurringType: data.recurringType || "none", studentId: data.studentId || null, description: data.description || "" };
}

export async function updateClass(
  docId: string,
  data: Partial<Omit<ClassRecord, "id">>
): Promise<void> {
  const updates: Record<string, unknown> = { ...data };
  if (data.scheduledAt) {
    updates.scheduledAt = Timestamp.fromDate(new Date(data.scheduledAt));
  }
  await updateDoc(doc(db, "classes", docId), updates);
}

export async function deleteClass(docId: string): Promise<void> {
  await deleteDoc(doc(db, "classes", docId));
}
