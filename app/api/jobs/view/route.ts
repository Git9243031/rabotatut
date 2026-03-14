import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { FieldValue } from 'firebase-admin/firestore'

export async function POST(req: NextRequest) {
  try {
    const { jobId } = await req.json()
    if (!jobId) return NextResponse.json({ error: 'jobId required' }, { status: 400 })

    // Атомарный инкремент через Firebase Admin SDK
    // Аналог: supabase.rpc('increment_job_views', { job_id: jobId })
    await adminDb.collection('jobs').doc(jobId).update({
      views: FieldValue.increment(1),
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
