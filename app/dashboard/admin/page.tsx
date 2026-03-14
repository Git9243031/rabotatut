'use client'
import { useEffect, useState }  from 'react'
import { useRouter }            from 'next/navigation'
import Link                     from 'next/link'
import {
  ShieldCheck, Download, LogOut, Eye, EyeOff, Trash2,
  Users, Briefcase, FileText, ToggleLeft, ToggleRight,
  TrendingUp, Clock, CheckCircle, XCircle,
} from 'lucide-react'
import { signOut }        from 'firebase/auth'
import { auth }           from '@/lib/firebaseClient'
import { jobsService }    from '@/services/jobs'
import { resumesService } from '@/services/resumes'
import { adminService }   from '@/services/admin'
import { useAppSelector } from '@/hooks/useAppDispatch'
import { formatDate, formatSalaryShort, cn } from '@/lib/utils'
import type { Job, Resume } from '@/types'

type Tab = 'overview' | 'jobs' | 'resumes' | 'users' | 'settings'

const TAB_LABELS: Record<Tab, string> = {
  overview: 'Обзор', jobs: 'Вакансии', resumes: 'Резюме',
  users: 'Пользователи', settings: 'Настройки',
}

const SPHERE_RU: Record<string,string> = {
  it:'IT', design:'Дизайн', marketing:'Маркетинг', finance:'Финансы',
  hr:'HR', sales:'Продажи', legal:'Юриспруденция', other:'Другое',
}

const ROLE_RU: Record<string,string> = {
  admin:'Администратор', hr:'Работодатель', candidate:'Соискатель',
}

// ─── StatCard ─────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color }: any) {
  return (
    <div className="bg-white rounded-[14px] border border-[#E5E7EB] p-5">
      <div className={cn('w-9 h-9 rounded-[10px] flex items-center justify-center mb-3', color)}>
        <Icon size={16} className="text-white" />
      </div>
      <p className="text-2xl font-bold text-[#0F172A]">{value}</p>
      <p className="text-xs text-[#64748B] mt-0.5">{label}</p>
      {sub && <p className="text-[11px] text-[#94A3B8] mt-0.5">{sub}</p>}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, loading: authLoading } = useAppSelector(s => s.auth)
  const router  = useRouter()
  const [tab, setTab]         = useState<Tab>('overview')
  const [jobs, setJobs]       = useState<Job[]>([])
  const [resumes, setResumes] = useState<Resume[]>([])
  const [users, setUsers]     = useState<any[]>([])
  const [settings, setSettings] = useState({
    telegram_autopost_enabled: false,
    header_enabled:            true,
    auto_approve_jobs:         false,
    auto_approve_telegram:     false,
    contact_button_enabled:    true,
  })
  const [loading, setLoading]     = useState(true)
  const [exporting, setExporting] = useState<string | null>(null)
  const [savingSettings, setSavingSettings] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    if (user.role !== 'admin') { router.push('/'); return }

    // Загружаем все данные параллельно
    // Аналог: Promise.all([supabase.from('jobs')..., supabase.from('resumes')...])
    Promise.all([
      jobsService.getAllJobsAdmin(),
      resumesService.getAllResumesAdmin(),
      adminService.getAllUsers(),
      adminService.getSettings(),
    ]).then(([j, r, u, s]) => {
      setJobs(j.data    || [])
      setResumes(r.data || [])
      setUsers(u)
      if (s.data) setSettings({
        telegram_autopost_enabled: s.data.telegram_autopost_enabled,
        header_enabled:            s.data.header_enabled            ?? true,
        auto_approve_jobs:         s.data.auto_approve_jobs         ?? false,
        auto_approve_telegram:     s.data.auto_approve_telegram     ?? false,
      })
      setLoading(false)
    })
  }, [user, authLoading, router])

  const handleLogout = async () => {
    // Firebase signOut вместо supabase.auth.signOut()
    await signOut(auth)
    router.push('/')
  }

  // ── Переключение видимости вакансии ───────────────────────────────
  const toggleJobVisible = async (id: string, current: boolean) => {
    await jobsService.toggleVisible(id, !current)
    setJobs(prev => prev.map(j => j.id === id ? { ...j, visible: !current } : j))
  }

  // ── Удаление вакансии ─────────────────────────────────────────────
  const deleteJob = async (id: string) => {
    if (!confirm('Удалить вакансию?')) return
    await jobsService.deleteJob(id)
    setJobs(prev => prev.filter(j => j.id !== id))
  }

  // ── Переключение видимости резюме ─────────────────────────────────
  const toggleResumeVisible = async (id: string, current: boolean) => {
    await resumesService.toggleVisible(id, !current)
    setResumes(prev => prev.map(r => r.id === id ? { ...r, visible: !current } : r))
  }

  // ── Удаление резюме ───────────────────────────────────────────────
  const deleteResume = async (id: string) => {
    if (!confirm('Удалить резюме?')) return
    await resumesService.deleteResume(id)
    setResumes(prev => prev.filter(r => r.id !== id))
  }

  // ── Изменение роли пользователя ───────────────────────────────────
  // Аналог: supabase.from('users').update({ role }).eq('id', userId)
  const changeUserRole = async (userId: string, role: string) => {
    await adminService.setUserRole(userId, role)
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u))
  }

  // ── Удаление пользователя ─────────────────────────────────────────
  // Firestore doc удаляем через adminService,
  // Firebase Auth запись — через отдельный API route (нужен Admin SDK)
  const deleteUser = async (userId: string) => {
    if (!confirm('Удалить пользователя? Это действие необратимо.')) return
    await adminService.deleteUserDoc(userId)
    // Удаляем Auth-запись через API route (требует firebase-admin)
    await fetch('/api/admin/delete-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    setUsers(prev => prev.filter(u => u.id !== userId))
  }

  // ── Сохранение настроек ───────────────────────────────────────────
  // Аналог: supabase.from('settings').update({...}).eq('id', 1)
  // Стало: adminService.updateSettings() → setDoc(SETTINGS_DOC, data, { merge: true })
  const saveSettings = async () => {
    setSavingSettings(true)
    await adminService.updateSettings(settings)
    setSavingSettings(false)
  }

  // ── Экспорт XLSX ──────────────────────────────────────────────────
  // Вместо supabase service role — данные уже в state (загружены как admin)
  const exportXLSX = async (type: 'jobs' | 'resumes') => {
    setExporting(type + '-xlsx')
    const res = await fetch(`/api/admin/export?type=${type}&format=xlsx`)
    const blob = await res.blob()
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `${type}-${Date.now()}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
    setExporting(null)
  }

  const exportDOCX = async (type: 'jobs' | 'resumes') => {
    setExporting(type + '-docx')
    const res = await fetch(`/api/admin/export?type=${type}&format=docx`)
    const blob = await res.blob()
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `${type}-${Date.now()}.docx`
    a.click()
    URL.revokeObjectURL(url)
    setExporting(null)
  }

  if (authLoading || loading) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#E5E7EB] border-t-[#7C3AED] rounded-full animate-spin" />
    </div>
  )

  // ── Статистика ────────────────────────────────────────────────────
  const totalViews     = jobs.reduce((s, j) => s + (j.views ?? 0), 0)
  const visibleJobs    = jobs.filter(j => j.visible).length
  const visibleResumes = resumes.filter(r => r.visible).length
  const hrCount        = users.filter(u => u.role === 'hr').length
  const candidateCount = users.filter(u => u.role === 'candidate').length

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Шапка */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-[#7C3AED] flex items-center justify-center">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0F172A]">Администратор</h1>
              <p className="text-xs text-[#64748B]">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="inline-flex items-center gap-1.5 h-9 px-3 border border-[#E5E7EB] text-sm text-[#64748B] hover:text-[#EF4444] hover:border-red-200 rounded-[10px] transition-colors">
            <LogOut size={14} />Выйти
          </button>
        </div>

        {/* Табы */}
        <div className="flex gap-1 bg-white border border-[#E5E7EB] rounded-[12px] p-1 mb-8 overflow-x-auto">
          {(Object.keys(TAB_LABELS) as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={cn(
                'px-4 py-2 rounded-[8px] text-sm font-medium whitespace-nowrap transition-colors',
                tab === t
                  ? 'bg-[#7C3AED] text-white'
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
              )}>
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        {/* ── Таб: Обзор ── */}
        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard icon={Briefcase}   label="Вакансий"    value={jobs.length}    sub={`${visibleJobs} активных`}    color="bg-[#7C3AED]" />
              <StatCard icon={FileText}    label="Резюме"      value={resumes.length} sub={`${visibleResumes} активных`} color="bg-[#10B981]" />
              <StatCard icon={Users}       label="Пользователей" value={users.length} sub={`${hrCount} HR / ${candidateCount} соискателей`} color="bg-[#F59E0B]" />
              <StatCard icon={TrendingUp}  label="Просмотров"  value={totalViews}     sub="всего по вакансиям"           color="bg-[#3B82F6]" />
            </div>

            {/* Последние вакансии */}
            <div className="bg-white rounded-[16px] border border-[#E5E7EB]">
              <div className="px-6 py-4 border-b border-[#F1F5F9] flex items-center justify-between">
                <h2 className="font-bold text-[#0F172A]">Последние вакансии</h2>
                <button onClick={() => setTab('jobs')}
                  className="text-xs text-[#7C3AED] hover:underline">Все →</button>
              </div>
              <div className="divide-y divide-[#F1F5F9]">
                {jobs.slice(0, 5).map(job => (
                  <div key={job.id} className="px-6 py-3 flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#0F172A] truncate">{job.title}</p>
                      <p className="text-xs text-[#94A3B8]">{job.company} · {formatDate(job.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      {job.views != null && (
                        <span className="text-xs text-[#94A3B8] flex items-center gap-1">
                          <Eye size={10} />{job.views}
                        </span>
                      )}
                      <span className={cn('w-2 h-2 rounded-full',
                        job.visible ? 'bg-[#10B981]' : 'bg-[#E5E7EB]')} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Последние резюме */}
            <div className="bg-white rounded-[16px] border border-[#E5E7EB]">
              <div className="px-6 py-4 border-b border-[#F1F5F9] flex items-center justify-between">
                <h2 className="font-bold text-[#0F172A]">Последние резюме</h2>
                <button onClick={() => setTab('resumes')}
                  className="text-xs text-[#7C3AED] hover:underline">Все →</button>
              </div>
              <div className="divide-y divide-[#F1F5F9]">
                {resumes.slice(0, 5).map(r => (
                  <div key={r.id} className="px-6 py-3 flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#0F172A] truncate">{r.name}</p>
                      <p className="text-xs text-[#94A3B8]">{r.title} · {formatDate(r.created_at)}</p>
                    </div>
                    <span className={cn('w-2 h-2 rounded-full shrink-0 ml-4',
                      r.visible ? 'bg-[#10B981]' : 'bg-[#E5E7EB]')} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Таб: Вакансии ── */}
        {tab === 'jobs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#64748B]">Всего: <span className="font-semibold text-[#0F172A]">{jobs.length}</span></p>
              <div className="flex gap-2">
                <button onClick={() => exportXLSX('jobs')} disabled={!!exporting}
                  className="inline-flex items-center gap-1.5 h-8 px-3 border border-[#E5E7EB] text-xs text-[#64748B] hover:border-[#7C3AED] hover:text-[#7C3AED] rounded-[8px] transition-colors disabled:opacity-50">
                  <Download size={12} />
                  {exporting === 'jobs-xlsx' ? 'Экспорт...' : 'XLSX'}
                </button>
                <button onClick={() => exportDOCX('jobs')} disabled={!!exporting}
                  className="inline-flex items-center gap-1.5 h-8 px-3 border border-[#E5E7EB] text-xs text-[#64748B] hover:border-[#7C3AED] hover:text-[#7C3AED] rounded-[8px] transition-colors disabled:opacity-50">
                  <Download size={12} />
                  {exporting === 'jobs-docx' ? 'Экспорт...' : 'DOCX'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-[16px] border border-[#E5E7EB]">
              <div className="divide-y divide-[#F1F5F9]">
                {jobs.map(job => (
                  <div key={job.id} className="px-6 py-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn('w-2 h-2 rounded-full shrink-0',
                          job.visible ? 'bg-[#10B981]' : 'bg-[#E5E7EB]')} />
                        <p className="font-semibold text-[#0F172A] truncate text-sm">{job.title}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#94A3B8] ml-4">
                        <span>{job.company}</span>
                        {job.sphere && <span>{SPHERE_RU[job.sphere] ?? job.sphere}</span>}
                        {(job.salary_min || job.salary_max) && (
                          <span>{formatSalaryShort(job.salary_min, job.salary_max)} ₽</span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock size={10} />{formatDate(job.created_at)}
                        </span>
                        {job.views != null && (
                          <span className="flex items-center gap-1">
                            <Eye size={10} />{job.views}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button onClick={() => toggleJobVisible(job.id, job.visible)}
                        className={cn(
                          'w-8 h-8 rounded-[8px] border flex items-center justify-center transition-colors',
                          job.visible
                            ? 'border-[#10B981]/30 text-[#10B981] hover:bg-green-50'
                            : 'border-[#E5E7EB] text-[#94A3B8] hover:border-[#7C3AED] hover:text-[#7C3AED]'
                        )}>
                        {job.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                      </button>
                      <Link href={`/jobs/${job.id}`} target="_blank"
                        className="w-8 h-8 rounded-[8px] border border-[#E5E7EB] flex items-center justify-center text-[#64748B] hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors">
                        <Eye size={13} />
                      </Link>
                      <button onClick={() => deleteJob(job.id)}
                        className="w-8 h-8 rounded-[8px] border border-[#E5E7EB] flex items-center justify-center text-[#64748B] hover:border-red-200 hover:text-[#EF4444] transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Таб: Резюме ── */}
        {tab === 'resumes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#64748B]">Всего: <span className="font-semibold text-[#0F172A]">{resumes.length}</span></p>
              <div className="flex gap-2">
                <button onClick={() => exportXLSX('resumes')} disabled={!!exporting}
                  className="inline-flex items-center gap-1.5 h-8 px-3 border border-[#E5E7EB] text-xs text-[#64748B] hover:border-[#7C3AED] hover:text-[#7C3AED] rounded-[8px] transition-colors disabled:opacity-50">
                  <Download size={12} />
                  {exporting === 'resumes-xlsx' ? 'Экспорт...' : 'XLSX'}
                </button>
                <button onClick={() => exportDOCX('resumes')} disabled={!!exporting}
                  className="inline-flex items-center gap-1.5 h-8 px-3 border border-[#E5E7EB] text-xs text-[#64748B] hover:border-[#7C3AED] hover:text-[#7C3AED] rounded-[8px] transition-colors disabled:opacity-50">
                  <Download size={12} />
                  {exporting === 'resumes-docx' ? 'Экспорт...' : 'DOCX'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-[16px] border border-[#E5E7EB]">
              <div className="divide-y divide-[#F1F5F9]">
                {resumes.map(r => (
                  <div key={r.id} className="px-6 py-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn('w-2 h-2 rounded-full shrink-0',
                          r.visible ? 'bg-[#10B981]' : 'bg-[#E5E7EB]')} />
                        <p className="font-semibold text-[#0F172A] truncate text-sm">{r.name}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#94A3B8] ml-4">
                        <span className="text-[#7C3AED]">{r.title}</span>
                        {r.sphere && <span>{SPHERE_RU[r.sphere] ?? r.sphere}</span>}
                        {r.expected_salary && <span>{formatSalaryShort(r.expected_salary)} ₽</span>}
                        <span className="flex items-center gap-1">
                          <Clock size={10} />{formatDate(r.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button onClick={() => toggleResumeVisible(r.id, r.visible)}
                        className={cn(
                          'w-8 h-8 rounded-[8px] border flex items-center justify-center transition-colors',
                          r.visible
                            ? 'border-[#10B981]/30 text-[#10B981] hover:bg-green-50'
                            : 'border-[#E5E7EB] text-[#94A3B8] hover:border-[#7C3AED] hover:text-[#7C3AED]'
                        )}>
                        {r.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                      </button>
                      <Link href={`/resumes/${r.id}`} target="_blank"
                        className="w-8 h-8 rounded-[8px] border border-[#E5E7EB] flex items-center justify-center text-[#64748B] hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors">
                        <Eye size={13} />
                      </Link>
                      <button onClick={() => deleteResume(r.id)}
                        className="w-8 h-8 rounded-[8px] border border-[#E5E7EB] flex items-center justify-center text-[#64748B] hover:border-red-200 hover:text-[#EF4444] transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Таб: Пользователи ── */}
        {tab === 'users' && (
          <div className="space-y-4">
            <p className="text-sm text-[#64748B]">
              Всего: <span className="font-semibold text-[#0F172A]">{users.length}</span>
            </p>
            <div className="bg-white rounded-[16px] border border-[#E5E7EB]">
              <div className="divide-y divide-[#F1F5F9]">
                {users.map(u => (
                  <div key={u.id} className="px-6 py-4 flex items-center gap-4">
                    <div className="w-9 h-9 rounded-[10px] bg-[#EDE9FE] flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-[#7C3AED]">
                        {u.email?.[0]?.toUpperCase() ?? '?'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0F172A] truncate">
                        {u.name ?? u.email}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                        <span>{u.email}</span>
                        <span>·</span>
                        <span>{formatDate(u.created_at)}</span>
                      </div>
                    </div>

                    {/* Смена роли */}
                    {/* Аналог: supabase.from('users').update({ role }).eq('id', u.id) */}
                    <select
                      value={u.role}
                      onChange={e => changeUserRole(u.id, e.target.value)}
                      className="h-8 px-2 rounded-[8px] border border-[#E5E7EB] text-xs text-[#0F172A] focus:outline-none focus:border-[#7C3AED] bg-white cursor-pointer">
                      <option value="candidate">Соискатель</option>
                      <option value="hr">Работодатель</option>
                      <option value="admin">Администратор</option>
                    </select>

                    <button onClick={() => deleteUser(u.id)}
                      className="w-8 h-8 rounded-[8px] border border-[#E5E7EB] flex items-center justify-center text-[#64748B] hover:border-red-200 hover:text-[#EF4444] transition-colors shrink-0">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Таб: Настройки ── */}
        {tab === 'settings' && (
          <div className="space-y-4 max-w-lg">
            <div className="bg-white rounded-[16px] border border-[#E5E7EB] p-6 space-y-5">
              <h2 className="font-bold text-[#0F172A]">Настройки сайта</h2>

              {/* Аналог: supabase.from('settings').update({...}).eq('id', 1) */}
              {/* Стало: setDoc(doc(db,'settings','main'), data, { merge: true }) */}
              {([
                {
                  key:   'header_enabled' as const,
                  label: 'Hero-секция на главной',
                  desc:  'Показывать баннер с описанием сайта',
                  icon:  settings.header_enabled ? CheckCircle : XCircle,
                },
                {
                  key:   'telegram_autopost_enabled' as const,
                  label: 'Автопостинг в Telegram',
                  desc:  'Отправлять новые вакансии в канал',
                  icon:  settings.telegram_autopost_enabled ? CheckCircle : XCircle,
                },
                {
                  key:   'auto_approve_jobs' as const,
                  label: 'Авто-публикация вакансий',
                  desc:  'Вакансии сразу видны без проверки',
                  icon:  settings.auto_approve_jobs ? CheckCircle : XCircle,
                },
                {
                  key:   'auto_approve_telegram' as const,
                  label: 'Авто-постинг без проверки',
                  desc:  'Постить в Telegram сразу после публикации',
                  icon:  settings.auto_approve_telegram ? CheckCircle : XCircle,
                },
                {
                  key:   'contact_button_enabled' as const,
                  label: 'Кнопка «Связаться»',
                  desc:  'Показывать кнопку связи на страницах вакансий и резюме',
                  icon:  settings.contact_button_enabled ? CheckCircle : XCircle,
                },
              ] as const).map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-[#0F172A]">{label}</p>
                    <p className="text-xs text-[#94A3B8]">{desc}</p>
                  </div>
                  <button
                    onClick={() => setSettings(s => ({ ...s, [key]: !s[key] }))}
                    className={cn(
                      'shrink-0 w-11 h-6 rounded-full transition-colors relative',
                      settings[key] ? 'bg-[#7C3AED]' : 'bg-[#E5E7EB]'
                    )}>
                    <span className={cn(
                      'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all',
                      settings[key] ? 'left-[22px]' : 'left-0.5'
                    )} />
                  </button>
                </div>
              ))}

              <button onClick={saveSettings} disabled={savingSettings}
                className="w-full h-10 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-medium rounded-[10px] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {savingSettings
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : 'Сохранить настройки'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
