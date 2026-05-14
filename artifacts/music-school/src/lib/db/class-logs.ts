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

export type ClassLog = {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  classDate: string;
  timeStarted: string;
  timeEnded: string;
  timeTaken: string;
  whatTaught: string;
  homework: string;
  createdAt: string;
};

export async function getClassLogs(filterStudentId?: string): Promise<ClassLog[]> {
  let q;
  if (filterStudentId && filterStudentId !== "all") {
    q = query(
      collection(db, "classLogs"),
      where("studentId", "==", filterStudentId),
      orderBy("createdAt", "desc")
    );
  } else {
    q = query(collection(db, "classLogs"), orderBy("createdAt", "desc"));
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
      studentCode: data.studentCode,
      classDate: data.classDate,
      timeStarted: data.timeStarted,
      timeEnded: data.timeEnded,
      timeTaken: data.timeTaken,
      whatTaught: data.whatTaught,
      homework: data.homework || "",
      createdAt,
    };
  });
}

export async function createClassLog(data: {
  studentId: string;
  studentName: string;
  studentCode: string;
  classDate: string;
  timeStarted: string;
  timeEnded: string;
  timeTaken: string;
  whatTaught: string;
  homework?: string;
}): Promise<void> {
  await addDoc(collection(db, "classLogs"), {
    ...data,
    homework: data.homework || "",
    createdAt: Timestamp.now(),
  });
}

export async function deleteClassLog(docId: string): Promise<void> {
  await deleteDoc(doc(db, "classLogs", docId));
}
