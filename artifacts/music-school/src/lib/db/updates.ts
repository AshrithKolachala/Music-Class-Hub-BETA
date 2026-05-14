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
    q = query(
      collection(db, "updates"),
      where("studentId", "==", filterStudentId),
      orderBy("createdAt", "desc")
    );
  } else {
    q = query(collection(db, "updates"), orderBy("createdAt", "desc"));
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    const createdAt =
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : data.createdAt;
    return {
      id: d.id,
      studentId: data.studentId,
      studentName: data.studentName,
      title: data.title,
      content: data.content,
      createdAt,
    };
  });
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
