import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type UserInfo = {
  role: "teacher" | "student";
  userId: string;
  name: string;
  studentId: string | null;
  docId: string;
};

const AUTH_KEY = "sv_auth_user";

export async function login(
  loginId: string,
  password: string,
  role: "teacher" | "student"
): Promise<UserInfo> {
  const q = query(
    collection(db, "users"),
    where("loginId", "==", loginId),
    where("role", "==", role)
  );
  const snap = await getDocs(q);
  if (snap.empty) throw new Error("Invalid ID or role.");

  const docSnap = snap.docs[0];
  const data = docSnap.data();
  if (data.password !== password) throw new Error("Incorrect password.");

  const user: UserInfo = {
    role: data.role,
    userId: data.loginId,
    name: data.name,
    studentId: role === "student" ? docSnap.id : null,
    docId: docSnap.id,
  };
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  return user;
}

export function getCurrentUser(): UserInfo | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY);
}

export async function changeOwnPassword(docId: string, newPassword: string): Promise<void> {
  await updateDoc(doc(db, "users", docId), { password: newPassword });
}
