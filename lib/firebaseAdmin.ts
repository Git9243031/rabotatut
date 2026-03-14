import { getApps, initializeApp, cert, type App } from 'firebase-admin/app'
import { getAuth }      from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0]

  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
  if (!privateKey) throw new Error('FIREBASE_ADMIN_PRIVATE_KEY is not set')

  return initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
      privateKey:  privateKey.replace(/\\n/g, '\n'),
    }),
  })
}

// Геттеры — инициализация происходит только при первом вызове
export function getAdminAuth() {
  return getAuth(getAdminApp())
}

export function getAdminDb() {
  return getFirestore(getAdminApp())
}

// Обратная совместимость со старым кодом
export const adminAuth = new Proxy({} as ReturnType<typeof getAuth>, {
  get: (_, prop) => (getAdminAuth() as any)[prop],
})

export const adminDb = new Proxy({} as ReturnType<typeof getFirestore>, {
  get: (_, prop) => (getAdminDb() as any)[prop],
})
