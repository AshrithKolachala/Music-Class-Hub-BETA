import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  Timestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type Announcement = {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
};

export async function getAnnouncements(): Promise<Announcement[]> {
  const snap = await getDocs(query(collection(db, "announcements"), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => {
    const data = d.data();
    const createdAt =
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : data.createdAt;
    return {
      id: d.id,
      title: data.title,
      content: data.content,
      isPinned: data.isPinned ?? false,
      createdAt,
    };
  });
}

export async function createAnnouncement(data: {
  title: string;
  content: string;
  isPinned: boolean;
}): Promise<void> {
  await addDoc(collection(db, "announcements"), {
    ...data,
    createdAt: Timestamp.now(),
  });
}

export async function deleteAnnouncement(docId: string): Promise<void> {
  await deleteDoc(doc(db, "announcements", docId));
}
