import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb }        from '@/lib/firebaseAdmin'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    // Удаляем из Firebase Auth (требует Admin SDK)
    // Аналог: supabase admin client → auth.admin.deleteUser(userId)
    await adminAuth.deleteUser(userId)

    // Удаляем Firestore документ
    await adminDb.collection('users').doc(userId).delete()

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
