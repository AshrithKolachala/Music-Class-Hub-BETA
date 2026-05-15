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
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "@/lib/firebase";

export type Recording = {
  id: string;
  classId: string;
  classTitle: string;
  studentId: string | null;
  url: string;
  filename: string;
  durationSeconds: number;
  sizeBytes: number;
  recordedAt: string;
  recordedBy: string;
};

export async function uploadRecordingBlob(
  blob: Blob,
  filename: string
): Promise<string> {
  const storageRef = ref(storage, `recordings/${filename}`);
  await uploadBytes(storageRef, blob, { contentType: blob.type || "video/webm" });
  return getDownloadURL(storageRef);
}

export async function createRecordingDoc(data: {
  classId: string;
  classTitle: string;
  studentId: string | null;
  url: string;
  filename: string;
  durationSeconds: number;
  sizeBytes: number;
  recordedBy: string;
}): Promise<void> {
  await addDoc(collection(db, "recordings"), {
    ...data,
    recordedAt: Timestamp.now(),
  });
}

function docToRecording(d: any): Recording {
  const data = d.data();
  return {
    id: d.id,
    classId: data.classId ?? "",
    classTitle: data.classTitle ?? "",
    studentId: data.studentId ?? null,
    url: data.url ?? "",
    filename: data.filename ?? "",
    durationSeconds: data.durationSeconds ?? 0,
    sizeBytes: data.sizeBytes ?? 0,
    recordedAt:
      data.recordedAt instanceof Timestamp
        ? data.recordedAt.toDate().toISOString()
        : data.recordedAt ?? "",
    recordedBy: data.recordedBy ?? "",
  };
}

export async function getAllRecordings(): Promise<Recording[]> {
  const snap = await getDocs(
    query(collection(db, "recordings"), orderBy("recordedAt", "desc"))
  );
  return snap.docs.map(docToRecording);
}

export async function getStudentRecordings(
  studentId: string
): Promise<Recording[]> {
  // Two queries: recordings specifically for this student, and recordings for all (null)
  const [specificSnap, allSnap] = await Promise.all([
    getDocs(
      query(
        collection(db, "recordings"),
        where("studentId", "==", studentId)
      )
    ),
    getDocs(
      query(
        collection(db, "recordings"),
        where("studentId", "==", null)
      )
    ),
  ]);

  const seen = new Set<string>();
  const combined = [...specificSnap.docs, ...allSnap.docs]
    .map(docToRecording)
    .filter((r) => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });

  return combined.sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
}

export async function deleteRecording(
  recordingId: string,
  filename: string
): Promise<void> {
  await deleteDoc(doc(db, "recordings", recordingId));
  try {
    await deleteObject(ref(storage, `recordings/${filename}`));
  } catch {
    // File may already be removed
  }
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatSize(bytes: number): string {
  if (bytes === 0) return "—";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
