'use client'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import { Briefcase, Menu, X, LogOut, LayoutDashboard, User } from 'lucide-react'
import { signOut } from 'firebase/auth'
import { auth }    from '@/lib/firebaseClient'
import { useAppSelector } from '@/hooks/useAppDispatch'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/',        label: 'Вакансии' },
  { href: '/resumes', label: 'Резюме'   },
]

function getDashboardHref(role?: string) {
  if (role === 'admin')     return '/dashboard/admin'
  if (role === 'hr')        return '/dashboard/hr'
  if (role === 'candidate') return '/dashboard/candidate'
  return '/'
}

export function Navbar() {
  const { user, loading } = useAppSelector(s => s.auth)
  const router   = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    // Firebase signOut — аналог supabase.auth.signOut()
    await signOut(auth)
    router.push('/')
    setOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E5E7EB] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-[#0F172A]">
          <div className="w-7 h-7 bg-[#7C3AED] rounded-lg flex items-center justify-center">
            <Briefcase size={14} className="text-white" />
          </div>
          <span className="text-sm">ВакансияРФ</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href}
              className={cn(
                'px-3 py-1.5 rounded-[8px] text-sm font-medium transition-colors',
                pathname === l.href
                  ? 'bg-[#EDE9FE] text-[#7C3AED]'
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
              )}>
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-2">
          {loading ? (
            <div className="w-20 h-8 bg-[#F1F5F9] rounded-[8px] animate-pulse" />
          ) : user ? (
            <>
              <Link href={getDashboardHref(user.role)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-sm font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors">
                <LayoutDashboard size={14} />
                Кабинет
              </Link>
              <button onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-sm font-medium text-[#64748B] hover:text-[#EF4444] hover:bg-red-50 transition-colors">
                <LogOut size={14} />
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login"
                className="px-3 py-1.5 rounded-[8px] text-sm font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors">
                Войти
              </Link>
              <Link href="/auth/register"
                className="px-3 py-1.5 rounded-[8px] text-sm font-medium bg-[#7C3AED] text-white hover:bg-[#6D28D9] transition-colors">
                Регистрация
              </Link>
            </>
          )}
        </div>

        {/* Mobile burger */}
        <button onClick={() => setOpen(o => !o)}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-[8px] text-[#64748B] hover:bg-[#F8FAFC] transition-colors">
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-[#E5E7EB] bg-white px-4 py-3 space-y-1">
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className={cn(
                'block px-3 py-2 rounded-[8px] text-sm font-medium transition-colors',
                pathname === l.href
                  ? 'bg-[#EDE9FE] text-[#7C3AED]'
                  : 'text-[#64748B] hover:bg-[#F8FAFC]'
              )}>
              {l.label}
            </Link>
          ))}
          <div className="border-t border-[#F1F5F9] pt-2 mt-2 space-y-1">
            {user ? (
              <>
                <Link href={getDashboardHref(user.role)} onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-[8px] text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC]">
                  <LayoutDashboard size={14} />Кабинет
                </Link>
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-[8px] text-sm font-medium text-[#EF4444] hover:bg-red-50">
                  <LogOut size={14} />Выйти
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setOpen(false)}
                  className="block px-3 py-2 rounded-[8px] text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC]">
                  Войти
                </Link>
                <Link href="/auth/register" onClick={() => setOpen(false)}
                  className="block px-3 py-2 rounded-[8px] text-sm font-medium bg-[#7C3AED] text-white text-center">
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
