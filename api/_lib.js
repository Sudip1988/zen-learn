import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// ─── Firebase Admin singleton ─────────────────────────────────────────────────
function getAdminApp() {
  if (getApps().length) return getApps()[0];

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON env var is missing");

  const sa = JSON.parse(raw);
  return initializeApp({
    credential: cert({
      projectId: sa.project_id,
      clientEmail: sa.client_email,
      // Vercel stores newlines as literal \n in env vars
      privateKey: sa.private_key.replace(/\\n/g, "\n"),
    }),
  });
}

// ─── Verify Firebase ID token + approved invite ───────────────────────────────
export async function verifyToken(req) {
  const header = req.headers["authorization"] || "";
  const token = header.replace("Bearer ", "").trim();
  if (!token) throw Object.assign(new Error("Missing auth token"), { status: 401 });

  const app = getAdminApp();
  const decoded = await getAuth(app).verifyIdToken(token);

  // Check invite status in Firestore
  const db = getFirestore(app);
  const inviteSnap = await db.collection("invitations").doc(decoded.email).get();
  if (!inviteSnap.exists || inviteSnap.data().status !== "approved") {
    throw Object.assign(new Error("Not invited"), { status: 403 });
  }

  return { uid: decoded.uid, email: decoded.email };
}

// ─── Rate limiting — discovery counter per user per UTC day ───────────────────
export async function checkRateLimit(uid) {
  const daily = parseInt(process.env.DAILY_DISCOVERY_LIMIT ?? "5", 10);
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const docId = `${uid}_${today}`;

  const db = getFirestore(getAdminApp());
  const ref = db.collection("usage").doc(docId);

  const snap = await ref.get();
  const count = snap.exists ? (snap.data().count ?? 0) : 0;

  if (count >= daily) {
    throw Object.assign(
      new Error(`Daily limit of ${daily} discoveries reached. Try again tomorrow.`),
      { status: 429 }
    );
  }

  await ref.set({ uid, date: today, count: count + 1 }, { merge: true });
  return count + 1;
}

// ─── JSON response helpers ────────────────────────────────────────────────────
export function ok(res, data) {
  res.setHeader("Content-Type", "application/json");
  res.status(200).json(data);
}

export function err(res, error) {
  const status = error.status ?? 500;
  const message = error.message ?? "Internal server error";
  res.setHeader("Content-Type", "application/json");
  res.status(status).json({ error: message });
}
