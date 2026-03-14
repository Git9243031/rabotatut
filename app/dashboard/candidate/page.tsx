'use client'
import { useEffect, useState }  from 'react'
import { useRouter }            from 'next/navigation'
import Link                     from 'next/link'
import { Plus, FileText, LogOut, Eye, EyeOff, Trash2, PenLine, User } from 'lucide-react'
import { signOut }              from 'firebase/auth'
import { auth }                 from '@/lib/firebaseClient'
import { resumesService }       from '@/services/resumes'
import { useAppSelector }       from '@/hooks/useAppDispatch'
import { formatDate, formatSalaryShort, cn } from '@/lib/utils'

const SPHERE_RU: Record<string,string> = {
  it:'IT', design:'Дизайн', marketing:'Маркетинг',
  finance:'Финансы', hr:'HR', sales:'Продажи',
  legal:'Юриспруденция', other:'Другое',
}

const FORMAT_RU: Record<string,string> = {
  remote:'Удалённо', office:'Офис', hybrid:'Гибрид',
}

export default function CandidateDashboard() {
  const { user, loading: authLoading } = useAppSelector(s => s.auth)
  const router = useRouter()
  const [resumes, setResumes]   = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    if (user.role !== 'candidate') {
      router.push(
        user.role === 'hr'    ? '/dashboard/hr'    :
        user.role === 'admin' ? '/dashboard/admin' : '/'
      )
      return
    }

    // Загружаем резюме кандидата
    // Аналог: supabase.from('resumes').select().eq('user_id', user.id)
    resumesService.getMyResumes(user.id)
      .then(data => { setResumes(data); setLoading(false) })
      .catch(e   => { setError(e.message); setLoading(false) })
  }, [user, authLoading, router])

  const handleLogout = async () => {
    await signOut(auth)
    router.push('/')
  }

  const handleToggleVisible = async (id: string, current: boolean) => {
    await resumesService.toggleVisible(id, !current)
    setResumes(prev => prev.map(r => r.id === id ? { ...r, visible: !current } : r))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить резюме? Это действие необратимо.')) return
    await resumesService.deleteResume(id)
    setResumes(prev => prev.filter(r => r.id !== id))
  }

  const visibleCount = resumes.filter(r => r.visible).length

  if (authLoading || loading) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#E5E7EB] border-t-[#7C3AED] rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
      <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-8 max-w-sm w-full text-center">
        <p className="text-[#EF4444] font-medium mb-2">Ошибка загрузки</p>
        <p className="text-sm text-[#64748B] mb-4">{error}</p>
        <button onClick={() => window.location.reload()}
          className="text-sm text-[#7C3AED] hover:underline">Обновить</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Шапка */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Личный кабинет</h1>
            <p className="text-sm text-[#64748B] mt-0.5">{user?.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/candidate/create-resume"
              className="inline-flex items-center gap-1.5 h-9 px-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-medium rounded-[10px] transition-colors">
              <Plus size={15} />Новое резюме
            </Link>
            <button onClick={handleLogout}
              className="inline-flex items-center gap-1.5 h-9 px-3 border border-[#E5E7EB] text-sm text-[#64748B] hover:text-[#EF4444] hover:border-red-200 rounded-[10px] transition-colors">
              <LogOut size={14} />Выйти
            </button>
          </div>
        </div>

        {/* Профиль */}
        <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#7C3AED] flex items-center justify-center text-white text-xl font-bold shrink-0">
              {user?.name
                ? user.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
                : <User size={22} />}
            </div>
            <div>
              <p className="font-bold text-[#0F172A] text-lg">{user?.name ?? 'Соискатель'}</p>
              <p className="text-sm text-[#64748B]">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[
            { label: 'Всего резюме',   value: resumes.length },
            { label: 'Активных',       value: visibleCount   },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-[16px] border border-[#E5E7EB] p-5">
              <p className="text-2xl font-bold text-[#0F172A]">{value}</p>
              <p className="text-xs text-[#64748B] mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Список резюме */}
        <div className="bg-white rounded-[20px] border border-[#E5E7EB]">
          <div className="px-6 py-4 border-b border-[#F1F5F9] flex items-center justify-between">
            <h2 className="font-bold text-[#0F172A]">Мои резюме</h2>
            <span className="text-sm text-[#64748B]">{resumes.length} шт.</span>
          </div>

          {resumes.length === 0 ? (
            <div className="text-center py-16 px-4">
              <FileText size={32} className="text-[#E5E7EB] mx-auto mb-3" />
              <p className="text-[#64748B] mb-1">Резюме пока нет</p>
              <p className="text-sm text-[#94A3B8] mb-5">Создайте первое резюме чтобы работодатели могли вас найти</p>
              <Link href="/dashboard/candidate/create-resume"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#7C3AED] hover:underline">
                <Plus size={13} />Создать резюме
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#F1F5F9]">
              {resumes.map(resume => (
                <div key={resume.id} className="px-6 py-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={cn('w-2 h-2 rounded-full shrink-0',
                        resume.visible ? 'bg-[#10B981]' : 'bg-[#E5E7EB]')} />
                      <p className="font-semibold text-[#0F172A] truncate">{resume.name}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#94A3B8] ml-4 flex-wrap">
                      <span className="text-[#7C3AED] font-medium">{resume.title}</span>
                      {resume.sphere  && <span>{SPHERE_RU[resume.sphere]  ?? resume.sphere}</span>}
                      {resume.format  && <span>{FORMAT_RU[resume.format]  ?? resume.format}</span>}
                      {resume.expected_salary && (
                        <span>{formatSalaryShort(resume.expected_salary)} ₽</span>
                      )}
                      {resume.experience_years > 0 && (
                        <span>{resume.experience_years} лет опыта</span>
                      )}
                      <span>{formatDate(resume.created_at)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Просмотр публичной страницы */}
                    <Link href={`/resumes/${resume.id}`} target="_blank"
                      className="w-8 h-8 rounded-[8px] border border-[#E5E7EB] flex items-center justify-center text-[#64748B] hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors">
                      <Eye size={13} />
                    </Link>

                    {/* Видимость */}
                    <button
                      onClick={() => handleToggleVisible(resume.id, resume.visible)}
                      title={resume.visible ? 'Скрыть' : 'Показать'}
                      className={cn(
                        'w-8 h-8 rounded-[8px] border flex items-center justify-center transition-colors',
                        resume.visible
                          ? 'border-[#10B981]/30 text-[#10B981] hover:bg-green-50'
                          : 'border-[#E5E7EB] text-[#94A3B8] hover:border-[#7C3AED] hover:text-[#7C3AED]'
                      )}>
                      {resume.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                    </button>

                    {/* Редактировать */}
                    <Link href={`/dashboard/candidate/edit-resume/${resume.id}`}
                      className="w-8 h-8 rounded-[8px] border border-[#E5E7EB] flex items-center justify-center text-[#64748B] hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors">
                      <PenLine size={13} />
                    </Link>

                    {/* Удалить */}
                    <button onClick={() => handleDelete(resume.id)}
                      className="w-8 h-8 rounded-[8px] border border-[#E5E7EB] flex items-center justify-center text-[#64748B] hover:border-red-200 hover:text-[#EF4444] transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
