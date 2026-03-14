'use client'
import { useState }            from 'react'
import { useRouter }           from 'next/navigation'
import Link                    from 'next/link'
import { useForm }             from 'react-hook-form'
import { zodResolver }         from '@hookform/resolvers/zod'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth }                from '@/lib/firebaseClient'
import { Briefcase, Eye, EyeOff } from 'lucide-react'
import { loginSchema, type LoginFormData } from '@/utils/schemas'
import { FormInput }           from '@/components/forms/FormInput'
import { Button }              from '@/components/ui/Button'

export default function LoginPage() {
  const router = useRouter()
  const [showPass, setShowPass] = useState(false)
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (values: LoginFormData) => {
    setServerError('')
    try {
      // Firebase: signInWithEmailAndPassword вместо supabase.auth.signInWithPassword
      await signInWithEmailAndPassword(auth, values.email, values.password)
      router.push('/')
    } catch (err: any) {
      // Человекочитаемые ошибки Firebase Auth
      const code = err?.code ?? ''
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setServerError('Неверный email или пароль')
      } else if (code === 'auth/too-many-requests') {
        setServerError('Слишком много попыток. Попробуйте позже')
      } else if (code === 'auth/user-disabled') {
        setServerError('Аккаунт заблокирован')
      } else {
        setServerError(err?.message ?? 'Ошибка входа')
      }
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#F8FAFC] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#7C3AED] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Briefcase size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Вход в аккаунт</h1>
          <p className="text-sm text-[#64748B] mt-1">Рады видеть тебя снова</p>
        </div>

        <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-7 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <FormInput
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[#0F172A]">Пароль</label>
                <Link href="/auth/forgot-password"
                  className="text-xs text-[#7C3AED] hover:underline">
                  Забыли пароль?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`h-10 w-full rounded-[10px] border bg-white px-3 pr-10 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 transition-colors ${errors.password ? 'border-[#EF4444]' : 'border-[#E5E7EB] focus:border-[#7C3AED]'}`}
                  {...register('password')}
                />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-[#EF4444]">{errors.password.message}</p>}
            </div>

            {serverError && (
              <div className="bg-red-50 border border-red-100 rounded-[10px] px-3 py-2.5">
                <p className="text-xs text-[#EF4444]">{serverError}</p>
              </div>
            )}

            <Button type="submit" variant="primary" size="md" className="w-full mt-1" loading={isSubmitting}>
              Войти
            </Button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-sm text-[#64748B]">
              Нет аккаунта?{' '}
              <Link href="/auth/register" className="text-[#7C3AED] font-medium hover:underline">
                Зарегистрироваться
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
