'use client'
import { useState }           from 'react'
import { useRouter }          from 'next/navigation'
import Link                   from 'next/link'
import { useForm }            from 'react-hook-form'
import { zodResolver }        from '@hookform/resolvers/zod'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, serverTimestamp }  from 'firebase/firestore'
import { auth, db }           from '@/lib/firebaseClient'
import { Briefcase, Eye, EyeOff, UserCheck, Building2 } from 'lucide-react'
import { registerSchema, type RegisterFormData } from '@/utils/schemas'
import { FormInput }          from '@/components/forms/FormInput'
import { Button }             from '@/components/ui/Button'
import { cn }                 from '@/lib/utils'

export default function RegisterPage() {
  const router = useRouter()
  const [showPass, setShowPass]       = useState(false)
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } =
    useForm<RegisterFormData>({
      resolver: zodResolver(registerSchema),
      defaultValues: { role: 'candidate' },
    })

  const role = watch('role')

  const onSubmit = async (values: RegisterFormData) => {
    setServerError('')
    try {
      // 1. Создаём пользователя в Firebase Auth
      // Аналог: supabase.auth.signUp({ email, password })
      const { user } = await createUserWithEmailAndPassword(
        auth, values.email, values.password
      )

      // 2. Создаём документ профиля в Firestore
      // Аналог: supabase.from('users').insert({ id, email, role, created_at })
      await setDoc(doc(db, 'users', user.uid), {
        email:      values.email,
        role:       values.role,
        created_at: serverTimestamp(),
      })

      router.push('/')
    } catch (err: any) {
      const code = err?.code ?? ''
      if (code === 'auth/email-already-in-use') {
        setServerError('Этот email уже зарегистрирован')
      } else if (code === 'auth/weak-password') {
        setServerError('Пароль слишком простой')
      } else if (code === 'auth/invalid-email') {
        setServerError('Некорректный email')
      } else {
        setServerError(err?.message ?? 'Ошибка регистрации')
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
          <h1 className="text-2xl font-bold text-[#0F172A]">Регистрация</h1>
          <p className="text-sm text-[#64748B] mt-1">Создайте аккаунт — это бесплатно</p>
        </div>

        <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-7 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Выбор роли */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#0F172A]">Я ищу</label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { value: 'candidate', label: 'Работу', icon: UserCheck,  desc: 'Соискатель' },
                  { value: 'hr',        label: 'Сотрудника', icon: Building2, desc: 'Работодатель' },
                ] as const).map(({ value, label, icon: Icon, desc }) => (
                  <button key={value} type="button"
                    onClick={() => setValue('role', value)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 p-3 rounded-[12px] border-2 transition-all text-center',
                      role === value
                        ? 'border-[#7C3AED] bg-[#EDE9FE]'
                        : 'border-[#E5E7EB] hover:border-[#C4B5FD]'
                    )}>
                    <Icon size={18} className={role === value ? 'text-[#7C3AED]' : 'text-[#64748B]'} />
                    <span className={cn('text-sm font-semibold', role === value ? 'text-[#7C3AED]' : 'text-[#0F172A]')}>
                      {label}
                    </span>
                    <span className="text-[10px] text-[#94A3B8]">{desc}</span>
                  </button>
                ))}
              </div>
              {errors.role && <p className="text-xs text-[#EF4444]">{errors.role.message}</p>}
            </div>

            <FormInput
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#0F172A]">Пароль</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Минимум 6 символов"
                  autoComplete="new-password"
                  className={cn(
                    'h-10 w-full rounded-[10px] border bg-white px-3 pr-10 text-sm text-[#0F172A]',
                    'placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 transition-colors',
                    errors.password ? 'border-[#EF4444]' : 'border-[#E5E7EB] focus:border-[#7C3AED]'
                  )}
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
              Зарегистрироваться
            </Button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-sm text-[#64748B]">
              Уже есть аккаунт?{' '}
              <Link href="/auth/login" className="text-[#7C3AED] font-medium hover:underline">
                Войти
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
