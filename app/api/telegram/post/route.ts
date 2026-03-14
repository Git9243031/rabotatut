import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { FieldValue } from 'firebase-admin/firestore'

const BOT_TOKEN  = process.env.TELEGRAM_BOT_TOKEN!
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID!
// Фолбэк если APP_URL не задан
const APP_URL    = process.env.NEXT_PUBLIC_APP_URL || 'https://vacancy-ru.vercel.app'

const SPHERE_RU: Record<string,string> = {
  it:'IT', design:'Дизайн', marketing:'Маркетинг', management:'Management',
  finance:'Финансы', hr:'HR', sales:'Продажи', legal:'Юриспруденция', other:'Другое',
}
const FORMAT_RU: Record<string,string> = {
  remote:'Удалённо 🌐', office:'Офис 🏢', hybrid:'Гибрид 🔄',
}
const LEVEL_RU: Record<string,string> = {
  junior:'Junior', middle:'Middle', senior:'Senior', lead:'Lead', any:'Любой',
}

function fmtSalary(min?: number, max?: number): string {
  if (!min && !max) return ''
  const k = (n: number) => Math.round(n / 1000) + 'к'
  if (min && max) return '💰 ' + k(min) + '–' + k(max) + ' ₽'
  if (min) return '💰 от ' + k(min) + ' ₽'
  return '💰 до ' + k(max!) + ' ₽'
}

// Экранирование для MarkdownV2
function e(str: string): string {
  return String(str).replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, '\\$&')
}

function buildMessage(job: any): string {
  const lines: string[] = []

  lines.push('🚀 *' + e(job.title) + '*')
  lines.push('🏢 ' + e(job.company))
  lines.push('')

  const params: string[] = []
  if (job.experience_level) params.push(LEVEL_RU[job.experience_level] ?? job.experience_level)
  if (job.format)           params.push(FORMAT_RU[job.format] ?? job.format)
  if (params.length)        lines.push('📋 ' + e(params.join(' · ')))
  if (job.location)         lines.push('📍 ' + e(job.location))

  const salary = fmtSalary(job.salary_min, job.salary_max)
  if (salary) lines.push(e(salary).replace('💰', '💰'))

  if (job.sphere) lines.push('🎯 ' + e(SPHERE_RU[job.sphere] ?? job.sphere))

  if (job.description) {
    lines.push('')
    const desc = job.description.slice(0, 280)
    lines.push(e(desc) + (job.description.length > 280 ? '\\.\\.\\.' : ''))
  }

  if (job.skills?.length) {
    lines.push('')
    lines.push(job.skills.slice(0, 8).map((s: string) => '`' + s + '`').join(' '))
  }

  if (job.contact_tg) {
    lines.push('')
    lines.push('📩 Связаться: @' + e(job.contact_tg))
  }

  lines.push('')
  lines.push('[Подробнее →](' + APP_URL + '/jobs/' + job.id + ')')

  return lines.join('\n')
}

async function sendToTelegram(text: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(
      'https://api.telegram.org/bot' + BOT_TOKEN + '/sendMessage',
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id:                  CHANNEL_ID,
          text,
          parse_mode:               'MarkdownV2',
          disable_web_page_preview: false,
        }),
      }
    )
    const data = await res.json()
    if (!data.ok) {
      console.error('Telegram API error:', JSON.stringify(data))
      return { ok: false, error: data.description }
    }
    return { ok: true }
  } catch (err: any) {
    console.error('Telegram fetch error:', err)
    return { ok: false, error: err.message }
  }
}

export async function POST(req: NextRequest) {
  try {
    const { jobId } = await req.json()
    if (!jobId) return NextResponse.json({ error: 'jobId required' }, { status: 400 })

    if (!BOT_TOKEN || !CHANNEL_ID) {
      console.warn('Telegram env vars missing')
      return NextResponse.json({ ok: false, reason: 'telegram not configured' })
    }

    // Проверяем настройку автопостинга
    const settingsSnap = await adminDb.collection('settings').doc('main').get()
    const settings     = settingsSnap.data()

    if (!settings?.telegram_autopost_enabled) {
      return NextResponse.json({ ok: false, reason: 'autopost disabled' })
    }

    const jobSnap = await adminDb.collection('jobs').doc(jobId).get()
    if (!jobSnap.exists) {
      return NextResponse.json({ error: 'job not found' }, { status: 404 })
    }

    const job    = { id: jobSnap.id, ...jobSnap.data() }
    const text   = buildMessage(job)
    const result = await sendToTelegram(text)

    if (result.ok) {
      await adminDb.collection('jobs').doc(jobId).update({
        tg_posted:    true,
        tg_posted_at: FieldValue.serverTimestamp(),
      })
    }

    return NextResponse.json(result)
  } catch (e: any) {
    console.error('Telegram post error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
