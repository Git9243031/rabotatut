import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore }        from 'firebase-admin/firestore'
import * as dotenv             from 'dotenv'

dotenv.config({ path: '.env.local' })

const app = initializeApp({
  credential: cert({
    projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
    privateKey:  process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  }),
})

const db = getFirestore(app)

async function seed() {
  console.log('🌱 Сидируем Firestore...')
  await db.collection('settings').doc('main').set({
    telegram_autopost_enabled: false,
    header_enabled:            true,
    auto_approve_jobs:         false,
    auto_approve_telegram:     false,
  }, { merge: true })
  console.log('✅ settings/main — создан')
  console.log('🎉 Готово!')
  process.exit(0)
}

seed().catch(e => { console.error(e); process.exit(1) })
