'use client'
import Link from 'next/link'
import { MapPin, Clock, Flame } from 'lucide-react'
import { cn, formatSalaryShort, timeAgo } from '@/lib/utils'

const FORMAT_RU: Record<string, string> = { remote:'Удалённо', office:'Офис', hybrid:'Гибрид' }
const LEVEL_RU:  Record<string, string> = { junior:'Junior', middle:'Middle', senior:'Senior', lead:'Lead', any:'Любой' }
const LC: Record<string, string> = {
  junior: 'bg-green-50  text-green-700  border-green-100',
  middle: 'bg-blue-50   text-blue-700   border-blue-100',
  senior: 'bg-purple-50 text-purple-700 border-purple-100',
  lead:   'bg-amber-50  text-amber-700  border-amber-100',
}

interface Props { job: any }

export function JobCard({ job }: Props) {
  const salary = formatSalaryShort(job.salary_min, job.salary_max)
  const isHot  = !!job.salary_min

  return (
    <article className="bg-white rounded-[16px] border border-[#E5E7EB] hover:border-[#7C3AED]/30 hover:shadow-md transition-all p-5 flex flex-col gap-3">

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            {isHot && <Flame size={12} className="text-[#F59E0B] shrink-0" />}
            <Link href={`/jobs/${job.id}`}>
              <h3 className="font-bold text-[#0F172A] text-base leading-snug hover:text-[#7C3AED] transition-colors line-clamp-2 cursor-pointer">
                {job.title}
              </h3>
            </Link>
          </div>
          <p className="text-sm text-[#64748B] font-medium">{job.company}</p>
        </div>
        {salary && (
          <div className="shrink-0 text-right">
            <p className="text-sm font-bold text-[#0F172A] whitespace-nowrap">{salary}</p>
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        {job.experience_level && (
          <span className={cn('text-xs px-2.5 py-1 rounded-full border', LC[job.experience_level] || 'bg-gray-50 text-gray-600 border-gray-100')}>
            {LEVEL_RU[job.experience_level] ?? job.experience_level}
          </span>
        )}
        {job.format && (
          <span className="text-xs px-2.5 py-1 rounded-full border border-[#E5E7EB] bg-[#F8FAFC] text-[#64748B]">
            {FORMAT_RU[job.format] ?? job.format}
          </span>
        )}
        {job.job_type && (
          <span className="text-xs px-2.5 py-1 rounded-full border border-[#E5E7EB] bg-[#F8FAFC] text-[#64748B]">
            {job.job_type}
          </span>
        )}
      </div>

      {/* Skills */}
      {job.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {job.skills.slice(0, 5).map((s: string) => (
            <span key={s} className="text-xs px-2 py-0.5 rounded bg-[#F8FAFC] text-[#64748B] border border-[#E5E7EB]">{s}</span>
          ))}
          {job.skills.length > 5 && (
            <span className="text-xs text-[#94A3B8]">+{job.skills.length - 5}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <div className="flex items-center gap-3 text-xs text-[#94A3B8]">
          {job.location && <span className="flex items-center gap-1"><MapPin size={11} />{job.location}</span>}
          <span className="flex items-center gap-1"><Clock size={11} />{timeAgo(job.created_at)}</span>
          {job.views != null && <span>{job.views} просмотров</span>}
        </div>
        <Link href={`/jobs/${job.id}`}
          className="text-xs font-medium text-[#7C3AED] hover:text-[#6D28D9] transition-colors">
          Подробнее →
        </Link>
      </div>
    </article>
  )
}
