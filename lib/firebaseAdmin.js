import admin from 'firebase-admin';

if (!admin.apps.length) {
  const projectId =
    process.env.FIREBASE_ADMIN_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    'farexo-3ac88';

  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });
  } else {
    // Fallback for local dev — requires GOOGLE_APPLICATION_CREDENTIALS env var
    // or Firebase Emulator Suite
    try {
      admin.initializeApp({ projectId });
    } catch (_) {
      // Already initialized
    }
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export default admin;
