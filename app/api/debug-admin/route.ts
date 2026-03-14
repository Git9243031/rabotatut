import { NextResponse } from 'next/server'

export async function GET() {
  const results: any = {}

  // Проверяем env vars
  results.projectId    = process.env.FIREBASE_ADMIN_PROJECT_ID ?? 'MISSING'
  results.clientEmail  = process.env.FIREBASE_ADMIN_CLIENT_EMAIL ?? 'MISSING'
  results.hasKey       = !!process.env.FIREBASE_ADMIN_PRIVATE_KEY
  results.keyStart     = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.slice(0, 30) ?? 'MISSING'
  results.keyHasRealNL = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.includes('\n') ?? false
  results.keyHasEscNL  = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.includes('\\n') ?? false
  results.botToken     = process.env.TELEGRAM_BOT_TOKEN ? process.env.TELEGRAM_BOT_TOKEN.slice(0, 10) + '...' : 'MISSING'
  results.channelId    = process.env.TELEGRAM_CHANNEL_ID ?? 'MISSING'

  // Пробуем инициализировать Admin SDK
  try {
    const { getAdminDb } = await import('@/lib/firebaseAdmin')
    const db = getAdminDb()
    const snap = await db.collection('settings').doc('main').get()
    results.firestoreOk       = true
    results.settingsExists    = snap.exists
    results.telegramAutopost  = snap.data()?.telegram_autopost_enabled ?? false
  } catch (e: any) {
    results.firestoreOk    = false
    results.firestoreError = e.message
  }

  // Пробуем Telegram
  try {
    const res  = await fetch('https://api.telegram.org/bot' + process.env.TELEGRAM_BOT_TOKEN + '/getMe')
    const data = await res.json()
    results.telegramBotOk   = data.ok
    results.telegramBotName = data.result?.username ?? 'unknown'
  } catch (e: any) {
    results.telegramBotOk    = false
    results.telegramBotError = e.message
  }

  return NextResponse.json(results, { status: 200 })
}
