'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter }             from 'next/navigation'
import Link                                 from 'next/link'
import {
  MapPin, Clock, ChevronLeft, User,
  Briefcase, Globe, DollarSign, Share2, Check,
  Send, X, Lock, FileText, AlertCircle,
} from 'lucide-react'
import { resumesService }  from '@/services/resumes'
import { jobsService }     from '@/services/jobs'
import { getSettings }     from '@/services/settings'
import { Spinner }         from '@/components/ui/Spinner'
import { formatDate, formatSalaryShort } from '@/lib/utils'
import { useAppSelector }  from '@/hooks/useAppDispatch'
import type { Resume }     from '@/types'

const FORMAT_RU: Record<string,string> = { remote:'Удалённо', office:'Офис', hybrid:'Гибрид' }
const SPHERE_RU: Record<string,string> = {
  it:'IT', design:'Дизайн', marketing:'Маркетинг', finance:'Финансы',
  hr:'HR', sales:'Продажи', legal:'Юриспруденция', other:'Другое', management:'Management',
}

type ModalType = 'auth' | 'no_resume' | 'no_jobs' | null

function ContactModal({ type, onClose, resumeId }: { type: ModalType; onClose: () => void; resumeId: string }) {
  if (!type) return null
  const config = {
    auth: {
      icon:  <Lock size={28} className="text-[#7C3AED]" />,
      bg:    'bg-[#EDE9FE]',
      title: 'Войдите, чтобы продолжить',
      text:  'Для просмотра контактов соискателя необходимо войти в аккаунт.',
      actions: (
        <div className="flex flex-col gap-2 w-full">
          <Link href={'/auth/login?redirect=/resumes/' + resumeId}
            className="w-full h-11 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-semibold rounded-[12px] transition-colors flex items-center justify-center">
            Войти в аккаунт
          </Link>
          <Link href={'/auth/register?redirect=/resumes/' + resumeId}
            className="w-full h-11 border border-[#E5E7EB] text-[#64748B] hover:border-[#7C3AED] hover:text-[#7C3AED] text-sm font-medium rounded-[12px] transition-colors flex items-center justify-center">
            Зарегистрироваться
          </Link>
        </div>
      ),
    },
    no_resume: {
      icon:  <FileText size={28} className="text-[#10B981]" />,
      bg:    'bg-[#D1FAE5]',
      title: 'Сначала создайте резюме',
      text:  'Чтобы связаться с соискателем, сначала заполните собственное резюме.',
      actions: (
        <div className="flex flex-col gap-2 w-full">
          <Link href="/dashboard/candidate/create-resume"
            className="w-full h-11 bg-[#10B981] hover:bg-[#059669] text-white text-sm font-semibold rounded-[12px] transition-colors flex items-center justify-center gap-2">
            <FileText size={15} />Создать резюме
          </Link>
          <button onClick={onClose} className="w-full h-11 border border-[#E5E7EB] text-[#64748B] text-sm font-medium rounded-[12px] hover:bg-[#F8FAFC]">Позже</button>
        </div>
      ),
    },
    no_jobs: {
      icon:  <AlertCircle size={28} className="text-[#F59E0B]" />,
      bg:    'bg-[#FEF3C7]',
      title: 'Создайте хотя бы 1 вакансию',
      text:  'Чтобы связаться с соискателями, создайте минимум 1 вакансию.',
      actions: (
        <div className="flex flex-col gap-2 w-full">
          <Link href="/dashboard/hr/create-job"
            className="w-full h-11 bg-[#F59E0B] hover:bg-[#D97706] text-white text-sm font-semibold rounded-[12px] transition-colors flex items-center justify-center gap-2">
            <Briefcase size={15} />Создать вакансию
          </Link>
          <button onClick={onClose} className="w-full h-11 border border-[#E5E7EB] text-[#64748B] text-sm font-medium rounded-[12px] hover:bg-[#F8FAFC]">Позже</button>
        </div>
      ),
    },
  }
  const c = config[type]
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[24px] shadow-[0_24px_60px_rgba(0,0,0,0.2)] w-full max-w-sm p-6 flex flex-col items-center text-center">
        <button onClick={onClose} className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#64748B]"><X size={18} /></button>
        <div className={'w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ' + c.bg}>{c.icon}</div>
        <h2 className="text-lg font-bold text-[#0F172A] mb-2">{c.title}</h2>
        <p className="text-sm text-[#64748B] leading-relaxed mb-6">{c.text}</p>
        {c.actions}
      </div>
    </div>
  )
}

export default function ResumePage() {
  const { id }   = useParams<{ id: string }>()
  const router   = useRouter()
  const { user, loading: authLoading } = useAppSelector(s => s.auth)

  const [resume, setResume]               = useState<Resume | null>(null)
  const [loading, setLoading]             = useState(true)
  const [copied, setCopied]               = useState(false)
  const [modal, setModal]                 = useState<ModalType>(null)
  const [checking, setChecking]           = useState(false)
  const [contactEnabled, setContactEnabled] = useState(true)

  useEffect(() => {
    if (!id) return
    ;(async () => {
      const [data, settings] = await Promise.all([
        resumesService.getResume(id),
        getSettings(),
      ])
      if (!data || !data.visible) { router.replace('/resumes'); return }
      setResume(data)
      setContactEnabled(settings?.contact_button_enabled ?? true)
      setLoading(false)
    })()
  }, [id, router])

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const handleContactClick = useCallback(async () => {
    if (authLoading) return
    if (!user) { setModal('auth'); return }
    setChecking(true)

    if (user.role === 'candidate') {
      const resumes = await resumesService.getMyResumes(user.id)
      setChecking(false)
      if (resumes.length === 0) { setModal('no_resume'); return }
      if (resume?.contact_tg) window.open('https://t.me/' + resume.contact_tg, '_blank')
      return
    }

    if (user.role === 'hr') {
      const jobs = await jobsService.getMyJobs(user.id)
      setChecking(false)
      if (jobs.length === 0) { setModal('no_jobs'); return }
      if (resume?.contact_tg) window.open('https://t.me/' + resume.contact_tg, '_blank')
      return
    }

    setChecking(false)
    if (resume?.contact_tg) window.open('https://t.me/' + resume.contact_tg, '_blank')
  }, [user, authLoading, resume])

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]"><Spinner className="w-8 h-8" /></div>
  )
  if (!resume) return null

  const initials = resume.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-8">
      <ContactModal type={modal} onClose={() => setModal(null)} resumeId={id ?? ''} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link href="/resumes"
          className="inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#7C3AED] mb-6 transition-colors">
          <ChevronLeft size={15} />Назад к резюме
        </Link>

        <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
          <div className="space-y-5">

            {/* Шапка */}
            <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-6 sm:p-8">
              <div className="flex items-start justify-between gap-3 mb-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#7C3AED] flex items-center justify-center text-white text-xl font-bold shrink-0">
                    {initials}
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] leading-tight">{resume.name}</h1>
                    <p className="text-[#7C3AED] font-semibold text-base mt-0.5">{resume.title}</p>
                  </div>
                </div>
                <button onClick={handleShare}
                  className="shrink-0 w-9 h-9 rounded-[10px] border border-[#E5E7EB] flex items-center justify-center text-[#64748B] hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors">
                  {copied ? <Check size={15} className="text-[#10B981]" /> : <Share2 size={15} />}
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {resume.experience_years > 0 && (
                  <span className="text-xs px-3 py-1.5 rounded-full border border-[#E5E7EB] bg-[#F8FAFC] text-[#64748B] font-medium">
                    {resume.experience_years} {pluralYears(resume.experience_years)} опыта
                  </span>
                )}
                {resume.format && (
                  <span className="text-xs px-3 py-1.5 rounded-full border border-[#E5E7EB] bg-[#F8FAFC] text-[#64748B] font-medium">
                    {FORMAT_RU[resume.format] ?? resume.format}
                  </span>
                )}
                {resume.sphere && (
                  <span className="text-xs px-3 py-1.5 rounded-full border border-[#E5E7EB] bg-[#F8FAFC] text-[#64748B] font-medium">
                    {SPHERE_RU[resume.sphere] ?? resume.sphere}
                  </span>
                )}
              </div>

              {resume.expected_salary && (
                <div className="inline-flex items-center gap-1.5 bg-[#EDE9FE] text-[#7C3AED] text-sm font-bold px-4 py-2 rounded-[10px]">
                  <DollarSign size={13} />от {formatSalaryShort(resume.expected_salary)} ₽ / мес
                </div>
              )}
            </div>

            {/* О себе */}
            {resume.bio && (
              <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-6 sm:p-8">
                <h2 className="text-base font-bold text-[#0F172A] mb-3">О себе</h2>
                <p className="text-sm text-[#374151] leading-relaxed whitespace-pre-wrap">{resume.bio}</p>
              </div>
            )}

            {/* Навыки */}
            {resume.skills?.length > 0 && (
              <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-6 sm:p-8">
                <h2 className="text-base font-bold text-[#0F172A] mb-4">Навыки</h2>
                <div className="flex flex-wrap gap-2">
                  {resume.skills.map(s => (
                    <span key={s} className="text-xs px-3 py-1.5 rounded-[8px] bg-[#EDE9FE] text-[#7C3AED] border border-[#DDD6FE] font-medium">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Правая колонка */}
          <div className="space-y-4">

            {/* CTA */}
            {contactEnabled && (
              <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-5">
                <button
                  onClick={handleContactClick}
                  disabled={checking || authLoading}
                  className="w-full h-11 bg-[#229ED9] hover:bg-[#1a8bbf] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-[12px] transition-colors flex items-center justify-center gap-2"
                >
                  {checking
                    ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <Send size={15} />
                  }
                  Связаться в Telegram
                </button>
              </div>
            )}

            {/* Детали */}
            <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-5 space-y-4">
              <h3 className="text-sm font-bold text-[#0F172A]">Детали</h3>
              <div className="space-y-3">
                {resume.location && (
                  <div className="flex items-center gap-2.5 text-sm">
                    <div className="w-8 h-8 rounded-[8px] bg-[#F8FAFC] border border-[#E5E7EB] flex items-center justify-center shrink-0">
                      <MapPin size={13} className="text-[#7C3AED]" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#94A3B8] uppercase tracking-wide font-semibold">Город</p>
                      <p className="text-[#0F172A] font-medium">{resume.location}</p>
                    </div>
                  </div>
                )}
                {resume.experience_years > 0 && (
                  <div className="flex items-center gap-2.5 text-sm">
                    <div className="w-8 h-8 rounded-[8px] bg-[#F8FAFC] border border-[#E5E7EB] flex items-center justify-center shrink-0">
                      <Briefcase size={13} className="text-[#7C3AED]" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#94A3B8] uppercase tracking-wide font-semibold">Опыт</p>
                      <p className="text-[#0F172A] font-medium">{resume.experience_years} {pluralYears(resume.experience_years)}</p>
                    </div>
                  </div>
                )}
                {resume.portfolio && (
                  <div className="flex items-center gap-2.5 text-sm">
                    <div className="w-8 h-8 rounded-[8px] bg-[#F8FAFC] border border-[#E5E7EB] flex items-center justify-center shrink-0">
                      <Globe size={13} className="text-[#7C3AED]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-[#94A3B8] uppercase tracking-wide font-semibold">Портфолио</p>
                      <a href={resume.portfolio} target="_blank" rel="noopener noreferrer"
                        className="text-[#7C3AED] font-medium hover:underline truncate block text-xs">
                        {resume.portfolio.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2.5 text-sm">
                  <div className="w-8 h-8 rounded-[8px] bg-[#F8FAFC] border border-[#E5E7EB] flex items-center justify-center shrink-0">
                    <Clock size={13} className="text-[#7C3AED]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#94A3B8] uppercase tracking-wide font-semibold">Опубликовано</p>
                    <p className="text-[#0F172A] font-medium">{formatDate(resume.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-5">
              <h3 className="text-sm font-bold text-[#0F172A] mb-3">Смотрите также</h3>
              <Link href="/resumes" className="flex items-center gap-2 text-sm text-[#7C3AED] hover:underline font-medium">
                <User size={13} />Все резюме
              </Link>
              <Link href="/" className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#7C3AED] mt-2 font-medium transition-colors">
                <Briefcase size={13} />Все вакансии
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function pluralYears(n: number): string {
  const mod10 = n % 10, mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'год'
  if ([2,3,4].includes(mod10) && ![12,13,14].includes(mod100)) return 'года'
  return 'лет'
}
