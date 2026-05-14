import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type Student = {
  id: string;
  name: string;
  instrument: string;
  studentId: string;
  password: string;
};

export async function getStudents(): Promise<Student[]> {
  const q = query(collection(db, "users"), where("role", "==", "student"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    name: d.data().name,
    instrument: d.data().instrument || "",
    studentId: d.data().loginId,
    password: d.data().password,
  }));
}

export async function createStudent(
  name: string,
  instrument: string
): Promise<Student> {
  const existing = await getStudents();
  const nextNum = existing.length + 1;
  const loginId = `STU-${String(nextNum).padStart(3, "0")}`;
  const docRef = await addDoc(collection(db, "users"), {
    loginId,
    name,
    instrument,
    role: "student",
    password: "password@123",
  });
  return { id: docRef.id, name, instrument, studentId: loginId, password: "password@123" };
}

export async function deleteStudent(docId: string): Promise<void> {
  await deleteDoc(doc(db, "users", docId));
}

export async function changeStudentPassword(
  docId: string,
  newPassword: string
): Promise<void> {
  await updateDoc(doc(db, "users", docId), { password: newPassword });
}
