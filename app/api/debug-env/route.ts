import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    apiKey:        process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.slice(0, 10) + '...',
    projectId:     process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    authDomain:    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    hasAdminKey:   !!process.env.FIREBASE_ADMIN_PRIVATE_KEY,
    hasAdminEmail: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  })
}
