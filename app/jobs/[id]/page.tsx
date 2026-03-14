'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter }             from 'next/navigation'
import Link                                 from 'next/link'
import {
  MapPin, Clock, Briefcase, ChevronLeft, Eye,
  Building2, Flame, Share2, Check, Send, X,
  Lock, FileText, AlertCircle,
} from 'lucide-react'
import { jobsService }     from '@/services/jobs'
import { getSettings }     from '@/services/settings'
import { resumesService }  from '@/services/resumes'
import { Spinner }         from '@/components/ui/Spinner'
import { formatSalary, formatDate, cn } from '@/lib/utils'
import { useAppSelector }  from '@/hooks/useAppDispatch'
import type { Job }        from '@/types'

const FORMAT_RU: Record<string,string> = { remote:'Удалённо', office:'Офис', hybrid:'Гибрид' }
const LEVEL_RU:  Record<string,string> = { junior:'Junior', middle:'Middle', senior:'Senior', lead:'Lead', any:'Любой' }
const TYPE_RU:   Record<string,string> = {
  'full-time':'Полная занятость', 'part-time':'Частичная',
  contract:'Контракт', freelance:'Фриланс', internship:'Стажировка',
}
const SPHERE_RU: Record<string,string> = {
  it:'IT', design:'Дизайн', marketing:'Маркетинг', finance:'Финансы',
  hr:'HR', sales:'Продажи', legal:'Юриспруденция', other:'Другое', management:'Management',
}

const TG_CHANNEL = 'https://t.me/joba_box'

// ── Типы модалки ──────────────────────────────────────────────────
type ModalType = 'auth' | 'no_resume' | 'no_jobs' | null

interface ModalProps {
  type: ModalType
  onClose: () => void
  jobId: string
}

function ContactModal({ type, onClose, jobId }: ModalProps) {
  if (!type) return null

  const config = {
    auth: {
      icon:    <Lock size={28} className="text-[#7C3AED]" />,
      bg:      'bg-[#EDE9FE]',
      title:   'Войдите, чтобы продолжить',
      text:    'Для просмотра контактов работодателя необходимо войти в аккаунт или зарегистрироваться.',
      actions: (
        <div className="flex flex-col gap-2 w-full">
          <Link href={'/auth/login?redirect=/jobs/' + jobId}
            className="w-full h-11 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-semibold rounded-[12px] transition-colors flex items-center justify-center">
            Войти в аккаунт
          </Link>
          <Link href={'/auth/register?redirect=/jobs/' + jobId}
            className="w-full h-11 border border-[#E5E7EB] text-[#64748B] hover:border-[#7C3AED] hover:text-[#7C3AED] text-sm font-medium rounded-[12px] transition-colors flex items-center justify-center">
            Зарегистрироваться
          </Link>
        </div>
      ),
    },
    no_resume: {
      icon:    <FileText size={28} className="text-[#10B981]" />,
      bg:      'bg-[#D1FAE5]',
      title:   'Сначала создайте резюме',
      text:    'Чтобы откликнуться на вакансию и увидеть контакты работодателя, заполните резюме — это займёт пару минут.',
      actions: (
        <div className="flex flex-col gap-2 w-full">
          <Link href="/dashboard/candidate/create-resume"
            className="w-full h-11 bg-[#10B981] hover:bg-[#059669] text-white text-sm font-semibold rounded-[12px] transition-colors flex items-center justify-center gap-2">
            <FileText size={15} />Создать резюме
          </Link>
          <button onClick={onClose}
            className="w-full h-11 border border-[#E5E7EB] text-[#64748B] text-sm font-medium rounded-[12px] transition-colors hover:bg-[#F8FAFC]">
            Позже
          </button>
        </div>
      ),
    },
    no_jobs: {
      icon:    <AlertCircle size={28} className="text-[#F59E0B]" />,
      bg:      'bg-[#FEF3C7]',
      title:   'Создайте хотя бы 1 вакансию',
      text:    'Просматривать контакты соискателей и работодателей могут только активные участники платформы. Создайте минимум 1 вакансию.',
      actions: (
        <div className="flex flex-col gap-2 w-full">
          <Link href="/dashboard/hr/create-job"
            className="w-full h-11 bg-[#F59E0B] hover:bg-[#D97706] text-white text-sm font-semibold rounded-[12px] transition-colors flex items-center justify-center gap-2">
            <Briefcase size={15} />Создать вакансию
          </Link>
          <button onClick={onClose}
            className="w-full h-11 border border-[#E5E7EB] text-[#64748B] text-sm font-medium rounded-[12px] transition-colors hover:bg-[#F8FAFC]">
            Позже
          </button>
        </div>
      ),
    },
  }

  const c = config[type]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[24px] shadow-[0_24px_60px_rgba(0,0,0,0.2)] w-full max-w-sm p-6 flex flex-col items-center text-center">
        <button onClick={onClose}
          className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#64748B] transition-colors">
          <X size={18} />
        </button>

        <div className={'w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ' + c.bg}>
          {c.icon}
        </div>

        <h2 className="text-lg font-bold text-[#0F172A] mb-2">{c.title}</h2>
        <p className="text-sm text-[#64748B] leading-relaxed mb-6">{c.text}</p>

        {c.actions}
      </div>
    </div>
  )
}

// ── Главная страница вакансии ─────────────────────────────────────
export default function JobPage() {
  const { id }  = useParams<{ id: string }>()
  const router  = useRouter()
  const { user, loading: authLoading } = useAppSelector(s => s.auth)

  const [job, setJob]           = useState<Job | null>(null)
  const [loading, setLoading]   = useState(true)
  const [copied, setCopied]     = useState(false)
  const [modal, setModal]       = useState<ModalType>(null)
  const [checking, setChecking]       = useState(false)
  const [contactEnabled, setContactEnabled] = useState(true)

  useEffect(() => {
    if (!id) return
    ;(async () => {
      const [data, settings] = await Promise.all([
        jobsService.getJob(id),
        getSettings(),
      ])
      setContactEnabled(settings?.contact_button_enabled ?? true)
      if (!data || !data.visible) { router.replace('/'); return }
      setJob(data)
      setLoading(false)
      jobsService.incrementViews(id).catch(() => {})
    })()
  }, [id, router])

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  // Проверка доступа к контакту
  const handleContactClick = useCallback(async () => {
    if (authLoading) return

    // 1. Не залогинен
    if (!user) { setModal('auth'); return }

    setChecking(true)

    // 2. Кандидат — проверяем есть ли резюме
    if (user.role === 'candidate') {
      const resumes = await resumesService.getMyResumes(user.id)
      setChecking(false)
      if (resumes.length === 0) { setModal('no_resume'); return }
      // Есть резюме — открываем TG
      if (job?.contact_tg) {
        window.open('https://t.me/' + job.contact_tg, '_blank')
      }
      return
    }

    // 3. HR — проверяем есть ли хотя бы 1 вакансия
    if (user.role === 'hr') {
      const jobs = await jobsService.getMyJobs(user.id)
      setChecking(false)
      if (jobs.length === 0) { setModal('no_jobs'); return }
      // Есть вакансии — открываем TG
      if (job?.contact_tg) {
        window.open('https://t.me/' + job.contact_tg, '_blank')
      }
      return
    }

    // 4. Admin — всегда может
    setChecking(false)
    if (job?.contact_tg) {
      window.open('https://t.me/' + job.contact_tg, '_blank')
    }
  }, [user, authLoading, job])

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Spinner className="w-8 h-8" />
    </div>
  )
  if (!job) return null

  const isHot  = !!job.salary_min
  const salary = formatSalary(job.salary_min, job.salary_max)

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-8">
      <ContactModal type={modal} onClose={() => setModal(null)} jobId={id ?? ''} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link href="/"
          className="inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#7C3AED] mb-6 transition-colors">
          <ChevronLeft size={15} />Назад к вакансиям
        </Link>

        <div className="grid gap-5 lg:grid-cols-[1fr_280px]">

          {/* ── Левая колонка ── */}
          <div className="space-y-5">

            {/* Заголовок */}
            <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-6 sm:p-8">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {isHot && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full">
                        <Flame size={10} />Горячая
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] leading-tight mb-1">
                    {job.title}
                  </h1>
                  <div className="flex items-center gap-2 text-[#64748B]">
                    <Building2 size={15} />
                    <span className="font-medium text-base">{job.company}</span>
                  </div>
                </div>
                <button onClick={handleShare}
                  className="shrink-0 w-9 h-9 rounded-[10px] border border-[#E5E7EB] flex items-center justify-center text-[#64748B] hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors">
                  {copied ? <Check size={15} className="text-[#10B981]" /> : <Share2 size={15} />}
                </button>
              </div>

              {(job.salary_min || job.salary_max) && (
                <div className="inline-flex items-center bg-[#EDE9FE] text-[#7C3AED] text-sm font-bold px-4 py-2 rounded-[10px] mb-4">
                  {salary}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {job.experience_level && (
                  <span className={cn('text-xs px-3 py-1.5 rounded-full border font-medium',
                    job.experience_level === 'junior' ? 'bg-green-50  text-green-700  border-green-100'  :
                    job.experience_level === 'middle' ? 'bg-blue-50   text-blue-700   border-blue-100'   :
                    job.experience_level === 'senior' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                                        'bg-amber-50  text-amber-700  border-amber-100'
                  )}>
                    {LEVEL_RU[job.experience_level] ?? job.experience_level}
                  </span>
                )}
                {job.format && (
                  <span className="text-xs px-3 py-1.5 rounded-full border border-[#E5E7EB] bg-[#F8FAFC] text-[#64748B] font-medium">
                    {FORMAT_RU[job.format] ?? job.format}
                  </span>
                )}
                {job.job_type && (
                  <span className="text-xs px-3 py-1.5 rounded-full border border-[#E5E7EB] bg-[#F8FAFC] text-[#64748B] font-medium">
                    {TYPE_RU[job.job_type] ?? job.job_type}
                  </span>
                )}
                {job.sphere && (
                  <span className="text-xs px-3 py-1.5 rounded-full border border-[#E5E7EB] bg-[#F8FAFC] text-[#64748B] font-medium">
                    {SPHERE_RU[job.sphere] ?? job.sphere}
                  </span>
                )}
              </div>
            </div>

            {/* Описание */}
            <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-6 sm:p-8">
              <h2 className="text-base font-bold text-[#0F172A] mb-4">О вакансии</h2>
              <p className="text-sm text-[#374151] leading-relaxed whitespace-pre-wrap">
                {job.description}
              </p>
            </div>

            {/* Обязанности */}
            {job.responsibilities && (
              <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-6 sm:p-8">
                <h2 className="text-base font-bold text-[#0F172A] mb-4">Обязанности</h2>
                <p className="text-sm text-[#374151] leading-relaxed whitespace-pre-wrap">
                  {job.responsibilities}
                </p>
              </div>
            )}

            {/* Требования */}
            {job.requirements && (
              <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-6 sm:p-8">
                <h2 className="text-base font-bold text-[#0F172A] mb-4">Требования</h2>
                <p className="text-sm text-[#374151] leading-relaxed whitespace-pre-wrap">
                  {job.requirements}
                </p>
              </div>
            )}

            {/* Навыки */}
            {job.skills?.length > 0 && (
              <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-6 sm:p-8">
                <h2 className="text-base font-bold text-[#0F172A] mb-4">Требуемые навыки</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map(s => (
                    <span key={s}
                      className="text-xs px-3 py-1.5 rounded-[8px] bg-[#EDE9FE] text-[#7C3AED] border border-[#DDD6FE] font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Правая колонка ── */}
          <div className="space-y-4">

            {/* CTA */}
            <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-5 space-y-3">

              {/* Кнопка связаться — скрыта если contact_button_enabled = false */}
              {contactEnabled && <button
                onClick={handleContactClick}
                disabled={checking || authLoading}
                className="w-full h-11 bg-[#229ED9] hover:bg-[#1a8bbf] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-[12px] transition-colors flex items-center justify-center gap-2"
              >
                {checking
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Send size={15} />
                }
                Связаться в Telegram
              </button>}

              {/* Все вакансии в канале */}
              <a href={TG_CHANNEL} target="_blank" rel="noopener noreferrer"
                className="w-full h-11 border border-[#E5E7EB] hover:border-[#229ED9] hover:text-[#229ED9] text-[#64748B] text-sm font-medium rounded-[12px] transition-colors flex items-center justify-center gap-2">
                <Send size={14} />Все вакансии в канале
              </a>
            </div>

            {/* Детали */}
            <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-5 space-y-4">
              <h3 className="text-sm font-bold text-[#0F172A]">Детали вакансии</h3>
              <div className="space-y-3">
                {job.location && (
                  <div className="flex items-center gap-2.5 text-sm">
                    <div className="w-8 h-8 rounded-[8px] bg-[#F8FAFC] border border-[#E5E7EB] flex items-center justify-center shrink-0">
                      <MapPin size={13} className="text-[#7C3AED]" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#94A3B8] uppercase tracking-wide font-semibold">Город</p>
                      <p className="text-[#0F172A] font-medium">{job.location}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2.5 text-sm">
                  <div className="w-8 h-8 rounded-[8px] bg-[#F8FAFC] border border-[#E5E7EB] flex items-center justify-center shrink-0">
                    <Clock size={13} className="text-[#7C3AED]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#94A3B8] uppercase tracking-wide font-semibold">Опубликовано</p>
                    <p className="text-[#0F172A] font-medium">{formatDate(job.created_at)}</p>
                  </div>
                </div>
                {job.views != null && (
                  <div className="flex items-center gap-2.5 text-sm">
                    <div className="w-8 h-8 rounded-[8px] bg-[#F8FAFC] border border-[#E5E7EB] flex items-center justify-center shrink-0">
                      <Eye size={13} className="text-[#7C3AED]" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#94A3B8] uppercase tracking-wide font-semibold">Просмотры</p>
                      <p className="text-[#0F172A] font-medium">{job.views}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Навигация */}
            <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-5">
              <h3 className="text-sm font-bold text-[#0F172A] mb-3">Смотрите также</h3>
              <Link href="/" className="flex items-center gap-2 text-sm text-[#7C3AED] hover:underline font-medium">
                <Briefcase size={13} />Все вакансии на сайте
              </Link>
              <Link href="/resumes"
                className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#7C3AED] mt-2 font-medium transition-colors">
                <Briefcase size={13} />База резюме
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
