import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type AppNotification = {
  id: string;
  studentId: string;
  type: "class_log" | "update" | "announcement" | "class";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export async function getNotifications(studentId: string): Promise<AppNotification[]> {
  const snap = await getDocs(
    query(collection(db, "notifications"), where("studentId", "==", studentId))
  );
  return snap.docs
    .map((d) => {
      const data = d.data();
      return {
        id: d.id,
        studentId: data.studentId,
        type: data.type as AppNotification["type"],
        title: data.title,
        message: data.message,
        read: data.read ?? false,
        createdAt:
          data.createdAt instanceof Timestamp
            ? data.createdAt.toDate().toISOString()
            : data.createdAt ?? "",
      };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createNotification(data: {
  studentId: string;
  type: AppNotification["type"];
  title: string;
  message: string;
}): Promise<void> {
  await addDoc(collection(db, "notifications"), {
    ...data,
    read: false,
    createdAt: Timestamp.now(),
  });
}

export async function markNotificationRead(notifId: string): Promise<void> {
  await updateDoc(doc(db, "notifications", notifId), { read: true });
}

export async function markAllRead(studentId: string): Promise<void> {
  const snap = await getDocs(
    query(
      collection(db, "notifications"),
      where("studentId", "==", studentId),
      where("read", "==", false)
    )
  );
  await Promise.all(snap.docs.map((d) => updateDoc(d.ref, { read: true })));
}
