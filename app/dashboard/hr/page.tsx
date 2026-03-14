'use client'
import { useEffect, useState }  from 'react'
import { useRouter }            from 'next/navigation'
import Link                     from 'next/link'
import { Plus, Briefcase, LogOut, Eye, EyeOff, Trash2, PenLine, ExternalLink } from 'lucide-react'
import { signOut }              from 'firebase/auth'
import { auth }                 from '@/lib/firebaseClient'
import { jobsService }          from '@/services/jobs'
import { useAppSelector }       from '@/hooks/useAppDispatch'
import { formatDate, formatSalaryShort, cn } from '@/lib/utils'

const SPHERE_RU: Record<string,string> = {
  it:'IT', design:'Дизайн', marketing:'Маркетинг',
  finance:'Финансы', hr:'HR', sales:'Продажи',
  legal:'Юриспруденция', other:'Другое', management:'Management',
}

export default function HRDashboard() {
  const { user, loading: authLoading } = useAppSelector(s => s.auth)
  const router  = useRouter()
  const [jobs, setJobs]       = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    if (user.role !== 'hr' && user.role !== 'admin') {
      router.push(user.role === 'candidate' ? '/dashboard/candidate' : '/')
      return
    }
    jobsService.getMyJobs(user.id)
      .then(data => { setJobs(data); setLoading(false) })
      .catch(e   => { setError(e.message); setLoading(false) })
  }, [user, authLoading, router])

  const handleLogout = async () => { await signOut(auth); router.push('/') }

  const handleToggleVisible = async (id: string, current: boolean) => {
    await jobsService.toggleVisible(id, !current)
    setJobs(prev => prev.map(j => j.id === id ? { ...j, visible: !current } : j))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить вакансию?')) return
    await jobsService.deleteJob(id)
    setJobs(prev => prev.filter(j => j.id !== id))
  }

  const totalViews   = jobs.reduce((s, j) => s + (j.views ?? 0), 0)
  const visibleCount = jobs.filter(j => j.visible).length

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
        <button onClick={() => window.location.reload()} className="text-sm text-[#7C3AED] hover:underline">Обновить</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">HR Кабинет</h1>
            <p className="text-sm text-[#64748B] mt-0.5">{user?.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/hr/create-job"
              className="inline-flex items-center gap-1.5 h-9 px-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-medium rounded-[10px] transition-colors">
              <Plus size={15} />Новая вакансия
            </Link>
            <button onClick={handleLogout}
              className="inline-flex items-center gap-1.5 h-9 px-3 border border-[#E5E7EB] text-sm text-[#64748B] hover:text-[#EF4444] hover:border-red-200 rounded-[10px] transition-colors">
              <LogOut size={14} />Выйти
            </button>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Всего вакансий',   value: jobs.length },
            { label: 'Активных',         value: visibleCount },
            { label: 'Просмотров всего', value: totalViews },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-[16px] border border-[#E5E7EB] p-5">
              <p className="text-2xl font-bold text-[#0F172A]">{value}</p>
              <p className="text-xs text-[#64748B] mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Список */}
        <div className="bg-white rounded-[20px] border border-[#E5E7EB]">
          <div className="px-6 py-4 border-b border-[#F1F5F9] flex items-center justify-between">
            <h2 className="font-bold text-[#0F172A]">Мои вакансии</h2>
            <span className="text-sm text-[#64748B]">{jobs.length} шт.</span>
          </div>

          {jobs.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Briefcase size={32} className="text-[#E5E7EB] mx-auto mb-3" />
              <p className="text-[#64748B] mb-1">Вакансий пока нет</p>
              <p className="text-sm text-[#94A3B8] mb-5">Создайте первую вакансию</p>
              <Link href="/dashboard/hr/create-job"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#7C3AED] hover:underline">
                <Plus size={13} />Создать вакансию
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#F1F5F9]">
              {jobs.map(job => (
                <div key={job.id} className="px-6 py-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={cn('w-2 h-2 rounded-full shrink-0',
                        job.visible ? 'bg-[#10B981]' : 'bg-[#E5E7EB]')} />
                      {/* Ссылка на публичную страницу вакансии */}
                      <Link href={'/jobs/' + job.id}
                        className="font-semibold text-[#0F172A] truncate hover:text-[#7C3AED] transition-colors">
                        {job.title}
                      </Link>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#94A3B8] ml-4">
                      <span>{job.company}</span>
                      {job.sphere && <span>{SPHERE_RU[job.sphere] ?? job.sphere}</span>}
                      {(job.salary_min || job.salary_max) && (
                        <span>{formatSalaryShort(job.salary_min, job.salary_max)} ₽</span>
                      )}
                      <span>{formatDate(job.created_at)}</span>
                      {job.views != null && (
                        <span className="flex items-center gap-0.5">
                          <Eye size={10} />{job.views}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Открыть публичную страницу */}
                    <Link href={'/jobs/' + job.id} target="_blank"
                      title="Открыть вакансию"
                      className="w-8 h-8 rounded-[8px] border border-[#E5E7EB] flex items-center justify-center text-[#64748B] hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors">
                      <ExternalLink size={13} />
                    </Link>

                    {/* Видимость */}
                    <button onClick={() => handleToggleVisible(job.id, job.visible)}
                      title={job.visible ? 'Скрыть' : 'Показать'}
                      className={cn(
                        'w-8 h-8 rounded-[8px] border flex items-center justify-center transition-colors',
                        job.visible
                          ? 'border-[#10B981]/30 text-[#10B981] hover:bg-green-50'
                          : 'border-[#E5E7EB] text-[#94A3B8] hover:border-[#7C3AED] hover:text-[#7C3AED]'
                      )}>
                      {job.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                    </button>

                    {/* Редактировать */}
                    <Link href={'/dashboard/hr/edit-job/' + job.id}
                      className="w-8 h-8 rounded-[8px] border border-[#E5E7EB] flex items-center justify-center text-[#64748B] hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors">
                      <PenLine size={13} />
                    </Link>

                    {/* Удалить */}
                    <button onClick={() => handleDelete(job.id)}
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
