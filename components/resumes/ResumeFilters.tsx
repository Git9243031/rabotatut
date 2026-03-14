'use client'
import { Search, X, ChevronDown, SlidersHorizontal } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { SPHERE_TREE } from '@/components/jobs/JobFilters'

export interface ResumeFilterState {
  q: string; sphere: string; subSphere: string
  level: string; format: string; salaryMax: number
}
export const DEFAULT_RESUME_FILTERS: ResumeFilterState = {
  q:'', sphere:'all', subSphere:'all', level:'all', format:'all', salaryMax:0,
}

// ── Переиспользуем SphereModal из JobFilters ──────────────────────
function SphereModal({
  open, onClose, sphere, subSphere, onChange,
}: {
  open: boolean; onClose: () => void
  sphere: string; subSphere: string
  onChange: (sphere: string, subSphere: string) => void
}) {
  const [activeSphere, setActiveSphere] = useState(sphere === 'all' ? 'it' : sphere)

  useEffect(() => {
    if (open) setActiveSphere(sphere === 'all' ? 'it' : sphere)
  }, [open, sphere])

  if (!open) return null

  const currentNode  = SPHERE_TREE.find(s => s.value === activeSphere)
  const selectedSubs = subSphere !== 'all' ? subSphere.split(',').filter(Boolean) : []

  const toggleSub = (val: string) => {
    const next = selectedSubs.includes(val)
      ? selectedSubs.filter(v => v !== val)
      : [...selectedSubs, val]
    onChange(activeSphere, next.length ? next.join(',') : 'all')
  }

  const selectAll = () => {
    if (!currentNode?.children) return
    onChange(activeSphere, currentNode.children.map(c => c.value).join(','))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative bg-white rounded-[20px] shadow-[0_24px_60px_rgba(0,0,0,0.15)] w-full max-w-[660px] overflow-hidden flex flex-col"
        style={{ maxHeight: '80vh' }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1F5F9]">
          <h2 className="text-base font-semibold text-[#0F172A]">Выбор сферы</h2>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-[#64748B]"><X size={18} /></button>
        </div>

        <div className="flex flex-1 overflow-hidden min-h-0">
          <div className="w-48 border-r border-[#F1F5F9] overflow-y-auto py-2 shrink-0">
            {SPHERE_TREE.map(s => (
              <button key={s.value}
                onClick={() => { setActiveSphere(s.value); onChange(s.value, 'all') }}
                className={cn(
                  'w-full text-left px-5 py-2.5 text-sm transition-colors',
                  activeSphere === s.value
                    ? 'font-semibold text-[#0F172A] bg-[#F8FAFC]'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
                )}>
                {s.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {currentNode?.children ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-[#0F172A]">{currentNode.label}</span>
                  <button onClick={selectAll} className="text-xs font-medium text-[#7C3AED] hover:underline">
                    Выбрать все
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentNode.children.map(child => {
                    const isActive = selectedSubs.includes(child.value)
                    return (
                      <button key={child.value} onClick={() => toggleSub(child.value)}
                        className={cn(
                          'px-3.5 py-1.5 rounded-full border text-sm font-medium transition-all',
                          isActive
                            ? 'bg-[#EDE9FE] text-[#7C3AED] border-[#DDD6FE]'
                            : 'bg-white text-[#374151] border-[#E5E7EB] hover:border-[#DDD6FE] hover:text-[#7C3AED]'
                        )}>
                        {child.label}
                      </button>
                    )
                  })}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-[#94A3B8]">
                Нет подкатегорий
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-[#F1F5F9]">
          <button onClick={() => onChange('all','all')} className="text-sm text-[#64748B] hover:text-[#0F172A]">
            Сбросить всё
          </button>
          <button onClick={onClose}
            className="px-5 py-2 bg-[#7C3AED] text-white text-sm font-semibold rounded-[10px] hover:bg-[#6D28D9] transition-colors">
            Применить
          </button>
        </div>
      </div>
    </div>
  )
}

const LEVEL_OPTIONS  = [{value:'all',label:'Уровень'},{value:'junior',label:'Junior'},{value:'middle',label:'Middle'},{value:'senior',label:'Senior'},{value:'lead',label:'Lead'}]
const FORMAT_OPTIONS = [{value:'all',label:'Формат'},{value:'remote',label:'Удалённо'},{value:'office',label:'Офис'},{value:'hybrid',label:'Гибрид'}]
const SALARY_OPTIONS = [{value:0,label:'Зарплата до'},{value:80000,label:'до 80 000'},{value:100000,label:'до 100 000'},{value:150000,label:'до 150 000'},{value:200000,label:'до 200 000'},{value:300000,label:'до 300 000'}]

function FilterPill({ label, value, options, onChange, active }: {
  label: string; value: string|number
  options: {value:string|number; label:string}[]
  onChange: (v: string|number) => void; active: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = options.find(o => o.value === value)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen(o => !o)}
        className={cn(
          'flex items-center gap-1.5 h-9 px-3.5 rounded-full border text-sm font-medium transition-all whitespace-nowrap',
          active
            ? 'bg-[#EDE9FE] text-[#7C3AED] border-[#DDD6FE]'
            : 'bg-white text-[#374151] border-[#E5E7EB] hover:border-[#7C3AED]/40 hover:text-[#7C3AED]'
        )}>
        {active ? current?.label : label}
        <ChevronDown size={13} className={cn('transition-transform text-[#94A3B8]', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1.5 bg-white border border-[#E5E7EB] rounded-[12px] shadow-[0_8px_24px_rgba(0,0,0,0.1)] z-50 min-w-[160px] py-1.5">
          {options.map(o => (
            <button key={String(o.value)} type="button"
              onClick={() => { onChange(o.value); setOpen(false) }}
              className={cn(
                'w-full text-left px-4 py-2 text-sm transition-colors',
                o.value === value ? 'text-[#7C3AED] font-semibold bg-[#F5F3FF]' : 'text-[#374151] hover:bg-[#F9FAFB]'
              )}>
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

interface Props { filters: ResumeFilterState; onChange: (f: ResumeFilterState) => void; total: number }

export function ResumeFilters({ filters, onChange, total }: Props) {
  const [sphereOpen, setSphereOpen] = useState(false)
  const set = (k: keyof ResumeFilterState, v: any) => onChange({ ...filters, [k]: v })

  const sphereActive = filters.sphere !== 'all'
  const sphereLabel = (() => {
    if (!sphereActive) return 'Сфера'
    const node = SPHERE_TREE.find(s => s.value === filters.sphere)
    const subs = filters.subSphere !== 'all' ? filters.subSphere.split(',') : []
    if (subs.length === 1) return node?.children?.find(c => c.value === subs[0])?.label ?? node?.label ?? 'Сфера'
    if (subs.length > 1) return `${node?.label} (${subs.length})`
    return node?.label ?? 'Сфера'
  })()

  const hasActive = filters.q || sphereActive || filters.level !== 'all' ||
    filters.format !== 'all' || filters.salaryMax > 0

  return (
    <>
      <SphereModal
        open={sphereOpen}
        onClose={() => setSphereOpen(false)}
        sphere={filters.sphere}
        subSphere={filters.subSphere}
        onChange={(sphere, subSphere) => onChange({ ...filters, sphere, subSphere })}
      />

      <div className="space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            value={filters.q}
            onChange={e => set('q', e.target.value)}
            placeholder="Имя, должность, навык..."
            className="w-full h-12 pl-11 pr-4 rounded-[12px] border border-[#E5E7EB] bg-white text-sm placeholder:text-[#94A3B8] text-[#0F172A] focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 shadow-sm"
          />
          {filters.q && (
            <button onClick={() => set('q', '')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]">
              <X size={15} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <button type="button" onClick={() => setSphereOpen(true)}
            className={cn(
              'flex items-center gap-1.5 h-9 px-3.5 rounded-full border text-sm font-medium transition-all whitespace-nowrap',
              sphereActive
                ? 'bg-[#EDE9FE] text-[#7C3AED] border-[#DDD6FE]'
                : 'bg-white text-[#374151] border-[#E5E7EB] hover:border-[#7C3AED]/40 hover:text-[#7C3AED]'
            )}>
            <SlidersHorizontal size={13} />
            {sphereLabel}
          </button>

          <FilterPill label="Уровень"    value={filters.level}     options={LEVEL_OPTIONS}  onChange={v => set('level', String(v))}    active={filters.level !== 'all'} />
          <FilterPill label="Формат"     value={filters.format}    options={FORMAT_OPTIONS} onChange={v => set('format', String(v))}   active={filters.format !== 'all'} />
          <FilterPill label="Зарплата до" value={filters.salaryMax} options={SALARY_OPTIONS} onChange={v => set('salaryMax', Number(v))} active={filters.salaryMax > 0} />

          {hasActive && (
            <button type="button" onClick={() => onChange(DEFAULT_RESUME_FILTERS)}
              className="flex items-center gap-1 text-sm text-[#EF4444] hover:text-[#DC2626] transition-colors ml-auto">
              <X size={13} />Сбросить
            </button>
          )}
        </div>

        <p className="text-xs text-[#94A3B8]">
          Найдено: <span className="font-semibold text-[#0F172A]">{total}</span>
        </p>
      </div>
    </>
  )
}
// ResumeFilters уже содержит FilterPill для зарплаты
// Отдельный патч не нужен — используй RangeSlider напрямую если нужно
