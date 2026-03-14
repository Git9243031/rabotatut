cat > app/auth/reset-password/page.tsx << 'EOF'
'use client'
import { Suspense } from 'react'
import { useState, useEffect }        from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link                           from 'next/link'
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth'
import { auth }                       from '@/lib/firebaseClient'
import { Briefcase, Eye, EyeOff, Check, AlertCircle } from 'lucide-react'

function ResetPasswordForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const oobCode      = searchParams.get('oobCode')

  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [verifying, setVerifying] = useState(true)
  const [done, setDone]           = useState(false)
  const [error, setError]         = useState('')
  const [codeValid, setCodeValid] = useState(false)

  useEffect(() => {
    if (!oobCode) {
      setError('Ссылка недействительна. Запросите сброс пароля заново.')
      setVerifying(false)
      return
    }
    verifyPasswordResetCode(auth, oobCode)
      .then(() => { setCodeValid(true);  setVerifying(false) })
      .catch(() => { setError('Ссылка истекла или уже использована. Запросите новую.'); setVerifying(false) })
  }, [oobCode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) { setError('Минимум 6 символов'); return }
    if (password !== confirm) { setError('Пароли не совпадают'); return }
    setError('')
    setLoading(true)
    try {
      await confirmPasswordReset(auth, oobCode!, password)
      setDone(true)
      setTimeout(() => router.push('/auth/login'), 2500)
    } catch (err: any) {
      const code = err?.code ?? ''
      if (code === 'auth/weak-password')        setError('Пароль слишком простой')
      else if (code === 'auth/expired-action-code') setError('Ссылка истекла. Запросите новую.')
      else setError(err?.message ?? 'Ошибка сброса пароля')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#F8FAFC] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#7C3AED] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Briefcase size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Новый пароль</h1>
          <p className="text-sm text-[#64748B] mt-1">Введите новый пароль для аккаунта</p>
        </div>

        <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-7 shadow-sm">

          {verifying && (
            <div className="flex justify-center py-8">
              <span className="w-6 h-6 border-2 border-[#E5E7EB] border-t-[#7C3AED] rounded-full animate-spin" />
            </div>
          )}

          {!verifying && !codeValid && (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={24} className="text-[#EF4444]" />
              </div>
              <p className="text-sm text-[#EF4444] font-medium mb-1">Ссылка недействительна</p>
              <p className="text-xs text-[#94A3B8] mb-5">{error}</p>
              <Link href="/auth/forgot-password"
                className="text-sm text-[#7C3AED] hover:underline font-medium">
                Запросить новую ссылку →
              </Link>
            </div>
          )}

          {done && (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={28} className="text-[#10B981]" />
              </div>
              <h2 className="font-bold text-[#0F172A] mb-2">Пароль изменён!</h2>
              <p className="text-sm text-[#64748B]">Перенаправляем на страницу входа…</p>
            </div>
          )}

          {!verifying && codeValid && !done && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#0F172A]">Новый пароль</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Минимум 6 символов"
                    autoComplete="new-password"
                    className="h-10 w-full rounded-[10px] border border-[#E5E7EB] bg-white px-3 pr-10 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 transition-colors"
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#0F172A]">Повторите пароль</label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Повторите пароль"
                  autoComplete="new-password"
                  className="h-10 w-full rounded-[10px] border border-[#E5E7EB] bg-white px-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 transition-colors"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-[10px] px-3 py-2.5">
                  <p className="text-xs text-[#EF4444]">{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading || !password || !confirm}
                className="w-full h-10 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-medium rounded-[10px] transition-colors disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2">
                {loading
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : 'Сохранить пароль'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

// Suspense обязателен для useSearchParams при билде
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-[#E5E7EB] border-t-[#7C3AED] rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
EOF
echo "✅ app/auth/reset-password/page.tsx"