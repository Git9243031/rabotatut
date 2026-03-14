'use client'
import { useEffect, useState }    from 'react'
import { useParams, useRouter }   from 'next/navigation'
import Link                       from 'next/link'
import {
  MapPin, Clock, ChevronLeft, User,
  Briefcase, Globe, DollarSign, Share2, Check,
} from 'lucide-react'
import { resumesService }         from '@/services/resumes'
import { Spinner }                from '@/components/ui/Spinner'
import { formatDate, formatSalaryShort, cn } from '@/lib/utils'
import type { Resume }            from '@/types'

const FORMAT_RU: Record<string,string> = {
  remote:'Удалённо', office:'Офис', hybrid:'Гибрид'
}
const SPHERE_RU: Record<string,string> = {
  it:'IT', design:'Дизайн', marketing:'Маркетинг', finance:'Финансы',
  hr:'HR', sales:'Продажи', legal:'Юриспруденция', other:'Другое',
}

export default function ResumePage() {
  const { id }   = useParams<{ id: string }>()
  const router   = useRouter()
  const [resume, setResume]   = useState<Resume | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied]   = useState(false)

  useEffect(() => {
    if (!id) return
    ;(async () => {
      // getDoc(doc(db, 'resumes', id)) через resumesService
      const data = await resumesService.getResume(id)
      if (!data || !data.visible) { router.replace('/resumes'); return }
      setResume(data)
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

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Spinner className="w-8 h-8" />
    </div>
  )
  if (!resume) return null

  const initials = resume.name
    ?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* Назад */}
        <Link href="/resumes"
          className="inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#7C3AED] mb-6 transition-colors">
          <ChevronLeft size={15} />Назад к резюме
        </Link>

        <div className="grid gap-5 lg:grid-cols-[1fr_280px]">

          {/* ── Левая колонка ── */}
          <div className="space-y-5">

            {/* Шапка резюме */}
            <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-6 sm:p-8">
              <div className="flex items-start justify-between gap-3 mb-5">
                <div className="flex items-center gap-4">
                  {/* Аватар-инициалы */}
                  <div className="w-16 h-16 rounded-2xl bg-[#7C3AED] flex items-center justify-center text-white text-xl font-bold shrink-0">
                    {initials}
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] leading-tight">
                      {resume.name}
                    </h1>
                    <p className="text-[#7C3AED] font-semibold text-base mt-0.5">
                      {resume.title}
                    </p>
                  </div>
                </div>
                <button onClick={handleShare}
                  className="shrink-0 w-9 h-9 rounded-[10px] border border-[#E5E7EB] flex items-center justify-center text-[#64748B] hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors">
                  {copied
                    ? <Check size={15} className="text-[#10B981]" />
                    : <Share2 size={15} />}
                </button>
              </div>

              {/* Бейджи */}
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

              {/* Ожидаемая зарплата */}
              {resume.expected_salary && (
                <div className="inline-flex items-center gap-1.5 bg-[#EDE9FE] text-[#7C3AED] text-sm font-bold px-4 py-2 rounded-[10px]">
                  <DollarSign size={13} />
                  от {formatSalaryShort(resume.expected_salary)} ₽ / мес
                </div>
              )}
            </div>

            {/* О себе */}
            {resume.bio && (
              <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-6 sm:p-8">
                <h2 className="text-base font-bold text-[#0F172A] mb-3">О себе</h2>
                <p className="text-sm text-[#374151] leading-relaxed whitespace-pre-wrap">
                  {resume.bio}
                </p>
              </div>
            )}

            {/* Навыки */}
            {resume.skills?.length > 0 && (
              <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-6 sm:p-8">
                <h2 className="text-base font-bold text-[#0F172A] mb-4">Навыки</h2>
                <div className="flex flex-wrap gap-2">
                  {resume.skills.map(s => (
                    <span key={s}
                      className="text-xs px-3 py-1.5 rounded-[8px] bg-[#EDE9FE] text-[#7C3AED] border border-[#DDD6FE] font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Правая колонка — детали ── */}
          <div className="space-y-4">

            <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-5 space-y-4">
              <h3 className="text-sm font-bold text-[#0F172A]">Детали</h3>
              <div className="space-y-3">

                {/* Город */}
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

                {/* Опыт */}
                {resume.experience_years > 0 && (
                  <div className="flex items-center gap-2.5 text-sm">
                    <div className="w-8 h-8 rounded-[8px] bg-[#F8FAFC] border border-[#E5E7EB] flex items-center justify-center shrink-0">
                      <Briefcase size={13} className="text-[#7C3AED]" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#94A3B8] uppercase tracking-wide font-semibold">Опыт</p>
                      <p className="text-[#0F172A] font-medium">
                        {resume.experience_years} {pluralYears(resume.experience_years)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Портфолио */}
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

                {/* Опубликовано */}
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

            {/* Навигация */}
            <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-5">
              <h3 className="text-sm font-bold text-[#0F172A] mb-3">Смотрите также</h3>
              <Link href="/resumes"
                className="flex items-center gap-2 text-sm text-[#7C3AED] hover:underline font-medium">
                <User size={13} />Все резюме
              </Link>
              <Link href="/"
                className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#7C3AED] mt-2 font-medium transition-colors">
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
