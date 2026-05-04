const BASE = import.meta.env.BASE_URL;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerPushNotifications() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    throw new Error("Push notifications are not supported in this browser.");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Notification permission was not granted.");
  }

  const reg = await navigator.serviceWorker.register(`${BASE}sw.js`);
  await navigator.serviceWorker.ready;

  const existing = await reg.pushManager.getSubscription();
  if (existing) {
    await saveSub(existing);
    return;
  }

  const res = await fetch(`${BASE}api/push/vapid-public-key`, { credentials: "include" });
  if (!res.ok) {
    throw new Error("Could not load push key from server.");
  }

  const { publicKey } = await res.json();
  if (!publicKey) {
    throw new Error("Push key is missing from server response.");
  }

  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });

  await saveSub(sub);
}

async function saveSub(sub: PushSubscription) {
  const res = await fetch(`${BASE}api/push/subscribe`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscription: sub.toJSON() }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || "Could not save push subscription.");
  }
}
