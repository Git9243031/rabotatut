cat > lib/firebaseAdmin.ts << 'EOF'
import { getApps, initializeApp, cert, type App } from 'firebase-admin/app'
import { getAuth }      from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0]

  const rawKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
  if (!rawKey) throw new Error('FIREBASE_ADMIN_PRIVATE_KEY is not set')

  // Vercel хранит \n как буквальные два символа — заменяем на реальный перенос
  const privateKey = rawKey.includes('\\n')
    ? rawKey.replace(/\\n/g, '\n')
    : rawKey

  return initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
      privateKey,
    }),
  })
}

export function getAdminAuth() { return getAuth(getAdminApp()) }
export function getAdminDb()   { return getFirestore(getAdminApp()) }

export const adminAuth = new Proxy({} as ReturnType<typeof getAuth>, {
  get: (_, prop) => (getAdminAuth() as any)[prop],
})
export const adminDb = new Proxy({} as ReturnType<typeof getFirestore>, {
  get: (_, prop) => (getAdminDb() as any)[prop],
})
EOF

git add . && git commit -m "fix env vars order + firebaseAdmin" && git push