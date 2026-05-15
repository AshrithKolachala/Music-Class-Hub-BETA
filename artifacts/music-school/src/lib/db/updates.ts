import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  Timestamp,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type Update = {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  content: string;
  createdAt: string;
};

export async function getUpdates(filterStudentId?: string): Promise<Update[]> {
  let q;
  if (filterStudentId && filterStudentId !== "all") {
    // Only filter by studentId — sort client-side to avoid needing a composite index
    q = query(
      collection(db, "updates"),
      where("studentId", "==", filterStudentId)
    );
  } else {
    q = query(collection(db, "updates"), orderBy("createdAt", "desc"));
  }
  const snap = await getDocs(q);
  const updates = snap.docs.map((d) => {
    const data = d.data();
    const createdAt =
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : data.createdAt ?? "";
    return {
      id: d.id,
      studentId: data.studentId,
      studentName: data.studentName,
      title: data.title,
      content: data.content,
      createdAt,
    };
  });
  // Sort client-side newest first
  return updates.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createUpdate(data: {
  studentId: string;
  studentName: string;
  title: string;
  content: string;
}): Promise<void> {
  await addDoc(collection(db, "updates"), {
    ...data,
    createdAt: Timestamp.now(),
  });
}

export async function deleteUpdate(docId: string): Promise<void> {
  await deleteDoc(doc(db, "updates", docId));
}
