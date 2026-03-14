'use client'
import { useState } from 'react'
import { X, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SPHERE_TREE } from '@/components/jobs/JobFilters'

interface Props {
  sphere:    string
  subSphere: string
  onChangeSphere:    (v: string) => void
  onChangeSubSphere: (v: string) => void
}

export function SphereSelect({ sphere, subSphere, onChangeSphere, onChangeSubSphere }: Props) {
  const [open, setOpen]               = useState(false)
  const [activeSphere, setActiveSphere] = useState(sphere || 'it')

  const currentNode  = SPHERE_TREE.find(s => s.value === activeSphere)
  const selectedSubs = subSphere ? subSphere.split(',').filter(Boolean) : []

  const toggleSub = (val: string) => {
    const next = selectedSubs.includes(val)
      ? selectedSubs.filter(v => v !== val)
      : [...selectedSubs, val]
    onChangeSphere(activeSphere)
    onChangeSubSphere(next.join(','))
  }

  const selectAllSubs = () => {
    if (!currentNode?.children) return
    onChangeSphere(activeSphere)
    onChangeSubSphere(currentNode.children.map(c => c.value).join(','))
  }

  const label = (() => {
    if (!sphere) return null
    const node = SPHERE_TREE.find(s => s.value === sphere)
    if (selectedSubs.length === 1) return node?.children?.find(c => c.value === selectedSubs[0])?.label ?? node?.label
    if (selectedSubs.length > 1) return `${node?.label} (${selectedSubs.length})`
    return node?.label
  })()

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[#0F172A]">Сфера деятельности</label>

      {/* type="button" — чтобы не сабмитить форму */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'h-10 w-full rounded-[10px] border px-3 text-sm text-left flex items-center justify-between transition-colors',
          sphere
            ? 'border-[#7C3AED] bg-[#F5F3FF] text-[#7C3AED]'
            : 'border-[#E5E7EB] bg-white text-[#94A3B8]'
        )}
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal size={14} />
          {label ?? 'Выберите сферу'}
        </span>
        {sphere && (
          <span
            role="button"
            onClick={e => {
              e.stopPropagation()
              onChangeSphere('')
              onChangeSubSphere('')
            }}
            className="text-[#94A3B8] hover:text-[#EF4444] transition-colors"
          >
            <X size={14} />
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div
            className="relative bg-white rounded-[20px] shadow-[0_24px_60px_rgba(0,0,0,0.15)] w-full max-w-[660px] flex flex-col overflow-hidden"
            style={{ maxHeight: '80vh' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1F5F9]">
              <h2 className="text-base font-semibold text-[#0F172A]">Выбор сферы</h2>
              <button type="button" onClick={() => setOpen(false)} className="text-[#94A3B8] hover:text-[#64748B]">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex flex-1 overflow-hidden min-h-0">
              {/* Левый список */}
              <div className="w-48 border-r border-[#F1F5F9] overflow-y-auto py-2 shrink-0">
                {SPHERE_TREE.map(s => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => {
                      setActiveSphere(s.value)
                      onChangeSphere(s.value)
                      onChangeSubSphere('')
                    }}
                    className={cn(
                      'w-full text-left px-5 py-2.5 text-sm transition-colors',
                      activeSphere === s.value
                        ? 'font-semibold text-[#0F172A] bg-[#F8FAFC]'
                        : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Правая панель */}
              <div className="flex-1 overflow-y-auto p-5">
                {currentNode?.children ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-semibold text-[#0F172A]">{currentNode.label}</span>
                      <button
                        type="button"
                        onClick={selectAllSubs}
                        className="text-xs font-medium text-[#7C3AED] hover:underline"
                      >
                        Выбрать все
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {currentNode.children.map(child => {
                        const isActive = selectedSubs.includes(child.value)
                        return (
                          <button
                            key={child.value}
                            type="button"
                            onClick={() => toggleSub(child.value)}
                            className={cn(
                              'px-3.5 py-1.5 rounded-full border text-sm font-medium transition-all',
                              isActive
                                ? 'bg-[#EDE9FE] text-[#7C3AED] border-[#DDD6FE]'
                                : 'bg-white text-[#374151] border-[#E5E7EB] hover:border-[#DDD6FE] hover:text-[#7C3AED]'
                            )}
                          >
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

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-[#F1F5F9]">
              <button
                type="button"
                onClick={() => { onChangeSphere(''); onChangeSubSphere(''); setOpen(false) }}
                className="text-sm text-[#64748B] hover:text-[#0F172A] transition-colors"
              >
                Сбросить
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-5 py-2 bg-[#7C3AED] text-white text-sm font-semibold rounded-[10px] hover:bg-[#6D28D9] transition-colors"
              >
                Применить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
