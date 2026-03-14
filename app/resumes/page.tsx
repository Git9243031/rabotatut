'use client'
import { useState, useEffect, useCallback } from 'react'
import { Users } from 'lucide-react'
import { ResumeCard }    from '@/components/resumes/ResumeCard'
import { ResumeFilters, DEFAULT_RESUME_FILTERS, type ResumeFilterState } from '@/components/resumes/ResumeFilters'
import { Pagination }    from '@/components/ui/Pagination'
import { Spinner }       from '@/components/ui/Spinner'
import { resumesService } from '@/services/resumes'
import Link from 'next/link'

const PER_PAGE = 9

export default function ResumesPage() {
  const [filters, setFilters] = useState<ResumeFilterState>(DEFAULT_RESUME_FILTERS)
  const [resumes, setResumes] = useState<any[]>([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (f: ResumeFilterState, p: number) => {
    setLoading(true)
    const { data, count } = await resumesService.getResumes({
      q:         f.q,
      sphere:    f.sphere,
      subSphere: f.subSphere,   // ← новое поле
      level:     f.level,
      format:    f.format,
      salaryMax: f.salaryMax,
    })
    setTotal(count)
    setResumes(data.slice((p - 1) * PER_PAGE, p * PER_PAGE))
    setLoading(false)
  }, [])

  useEffect(() => { load(filters, page) }, [filters, page, load])

  const onFilter = (f: ResumeFilterState) => { setFilters(f); setPage(1) }
  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <div className="bg-[#F8FAFC] min-h-screen">

      <section className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#EDE9FE] text-[#7C3AED] text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
                <Users size={12} />База резюме
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">Резюме соискателей</h1>
              <p className="text-sm text-[#64748B] mt-1">
                Найдите кандидата среди <span className="font-semibold text-[#0F172A]">{total}</span> резюме
              </p>
            </div>
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#7C3AED] hover:underline shrink-0">
              Смотреть вакансии →
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Фильтры — горизонтальная полоса */}
        <div className="mb-6">
          <ResumeFilters filters={filters} onChange={onFilter} total={total} />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Spinner className="w-8 h-8" />
          </div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-[#64748B] text-lg mb-2">Резюме не найдены</p>
            <p className="text-[#94A3B8] text-sm mb-6">Попробуйте изменить фильтры</p>
            <button onClick={() => onFilter(DEFAULT_RESUME_FILTERS)}
              className="text-sm text-[#7C3AED] hover:underline">
              Сбросить фильтры
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {resumes.map(r => <ResumeCard key={r.id} resume={r} />)}
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={p => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
          </>
        )}
      </div>
    </div>
  )
}
