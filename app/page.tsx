'use client'
import { useState, useEffect, useCallback } from 'react'
import { Briefcase, Users, MapPin, TrendingUp } from 'lucide-react'
import { JobCard }       from '@/components/jobs/JobCard'
import { JobFilters, DEFAULT_FILTERS, type Filters } from '@/components/jobs/JobFilters'
import { Pagination }    from '@/components/ui/Pagination'
import { Spinner }       from '@/components/ui/Spinner'
import { jobsService }   from '@/services/jobs'
import { subscribeToSettings } from '@/services/settings'
import Link from 'next/link'

const PER_PAGE = 9

export default function HomePage() {
  const [filters, setFilters]       = useState<Filters>(DEFAULT_FILTERS)
  const [jobs, setJobs]             = useState<any[]>([])
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const [loading, setLoading]       = useState(true)
  const [totalJobs, setTotalJobs]   = useState(0)
  const [heroVisible, setHeroVisible] = useState(true)

  useEffect(() => {
    const unsub = subscribeToSettings(s => setHeroVisible(s.header_enabled))
    return () => unsub()
  }, [])

  useEffect(() => {
    jobsService.getTotalCount().then(setTotalJobs)
  }, [])

  const load = useCallback(async (f: Filters, p: number) => {
    setLoading(true)
    const { data, count } = await jobsService.getJobs({
      q:         f.q,
      sphere:    f.sphere,
      subSphere: f.subSphere,   // ← новое поле
      level:     f.level,
      format:    f.format,
      jobType:   f.jobType,
      salaryMin: f.salaryMin,
      salaryMax: f.salaryMax,
      hot:       f.hot,
      featured:  f.featured,
    }, p)
    setJobs(data)
    setTotal(count)
    setLoading(false)
  }, [])

  useEffect(() => { load(filters, page) }, [filters, page, load])

  const onFilter = (f: Filters) => { setFilters(f); setPage(1) }
  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <div className="bg-[#F8FAFC] min-h-screen">

      {heroVisible && (
        <section className="bg-white border-b border-[#E5E7EB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center">
            <div className="inline-flex items-center gap-2 bg-[#EDE9FE] text-[#7C3AED] text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
              <TrendingUp size={12} />
              {totalJobs > 0 ? `${totalJobs.toLocaleString('ru')} вакансий` : 'Тысячи вакансий'}
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold text-[#0F172A] leading-tight mb-4">
              Найди работу мечты<br />
              <span className="text-[#7C3AED]">в России</span>
            </h1>
            <p className="text-base sm:text-lg text-[#64748B] mb-8 max-w-xl mx-auto">
              Вакансии от лучших компаний — IT, дизайн, маркетинг и не только
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[#64748B]">
              {[
                { icon: Briefcase, label: 'Вакансий', value: totalJobs > 0 ? totalJobs.toLocaleString('ru') : '…' },
                { icon: Users,     label: 'Компаний', value: '500+' },
                { icon: MapPin,    label: 'Городов',  value: '80+' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <Icon size={15} className="text-[#7C3AED]" />
                  <span className="font-semibold text-[#0F172A]">{value}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Фильтры — теперь горизонтальная полоса над сеткой */}
        <div className="mb-6">
          <JobFilters filters={filters} onChange={onFilter} total={total} />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Spinner className="w-8 h-8" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-[#64748B] text-lg mb-2">Вакансии не найдены</p>
            <p className="text-[#94A3B8] text-sm mb-6">Попробуйте изменить фильтры</p>
            <button onClick={() => onFilter(DEFAULT_FILTERS)}
              className="text-sm text-[#7C3AED] hover:underline">
              Сбросить фильтры
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {jobs.map(job => <JobCard key={job.id} job={job} />)}
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={p => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
          </>
        )}
      </div>
    </div>
  )
}
