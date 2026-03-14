'use client'
import { useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  label?:    string
  min:       number
  max:       number
  valueMin:  number
  valueMax:  number
  step?:     number
  format?:   (v: number) => string
  onChangeMin: (v: number) => void
  onChangeMax: (v: number) => void
  className?: string
}

const defaultFormat = (v: number) =>
  v >= 1_000_000
    ? `${(v / 1_000_000).toFixed(1)} млн`
    : v >= 1000
    ? `${Math.round(v / 1000)}к`
    : String(v)

export function RangeSlider({
  label,
  min, max,
  valueMin, valueMax,
  step = 1000,
  format = defaultFormat,
  onChangeMin, onChangeMax,
  className,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null)

  // Проценты для позиционирования трека
  const pctMin = ((valueMin - min) / (max - min)) * 100
  const pctMax = ((valueMax - min) / (max - min)) * 100

  const handleMin = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.min(Number(e.target.value), valueMax - step)
    onChangeMin(v)
  }, [valueMax, step, onChangeMin])

  const handleMax = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.max(Number(e.target.value), valueMin + step)
    onChangeMax(v)
  }, [valueMin, step, onChangeMax])

  return (
    <div className={cn('w-full', className)}>
      {/* Лейбл + значения */}
      <div className="flex items-center h-12 bg-[#F8FAFC] rounded-[12px] border border-[#E5E7EB] px-4 gap-3 mb-4">
        {label && (
          <>
            <span className="text-sm text-[#64748B] whitespace-nowrap font-medium">{label}</span>
            <div className="w-px h-5 bg-[#E5E7EB] shrink-0" />
          </>
        )}
        <div className="flex items-center justify-between flex-1 gap-2">
          <span className="text-sm font-bold text-[#0F172A]">{format(valueMin)}</span>
          <span className="text-sm font-bold text-[#0F172A]">{format(valueMax)}</span>
        </div>
      </div>

      {/* Слайдер */}
      <div className="relative h-5 flex items-center px-2" ref={trackRef}>
        {/* Серый трек */}
        <div className="absolute inset-x-2 h-[3px] bg-[#E5E7EB] rounded-full" />

        {/* Красный активный участок */}
        <div
          className="absolute h-[3px] bg-[#EF4444] rounded-full pointer-events-none"
          style={{ left: `calc(${pctMin}% + 8px * ${1 - pctMin/100})`, right: `calc(${100 - pctMax}% + 8px * ${pctMax/100})` }}
        />

        {/* Левый ползунок (min) */}
        <input
          type="range"
          min={min} max={max} step={step}
          value={valueMin}
          onChange={handleMin}
          className="absolute inset-x-0 w-full appearance-none bg-transparent pointer-events-none
            [&::-webkit-slider-thumb]:pointer-events-auto
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-[#EF4444]
            [&::-webkit-slider-thumb]:border-[3px]
            [&::-webkit-slider-thumb]:border-white
            [&::-webkit-slider-thumb]:shadow-[0_1px_6px_rgba(239,68,68,0.5)]
            [&::-webkit-slider-thumb]:cursor-grab
            [&::-webkit-slider-thumb]:active:cursor-grabbing
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:pointer-events-auto
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-[#EF4444]
            [&::-moz-range-thumb]:border-[3px]
            [&::-moz-range-thumb]:border-white
            [&::-moz-range-thumb]:cursor-grab"
          style={{ zIndex: valueMin > max - step ? 5 : 3 }}
        />

        {/* Правый ползунок (max) */}
        <input
          type="range"
          min={min} max={max} step={step}
          value={valueMax}
          onChange={handleMax}
          className="absolute inset-x-0 w-full appearance-none bg-transparent pointer-events-none
            [&::-webkit-slider-thumb]:pointer-events-auto
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-[#EF4444]
            [&::-webkit-slider-thumb]:border-[3px]
            [&::-webkit-slider-thumb]:border-white
            [&::-webkit-slider-thumb]:shadow-[0_1px_6px_rgba(239,68,68,0.5)]
            [&::-webkit-slider-thumb]:cursor-grab
            [&::-webkit-slider-thumb]:active:cursor-grabbing
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:pointer-events-auto
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-[#EF4444]
            [&::-moz-range-thumb]:border-[3px]
            [&::-moz-range-thumb]:border-white
            [&::-moz-range-thumb]:cursor-grab"
          style={{ zIndex: 4 }}
        />
      </div>

      {/* Подписи min/max */}
      <div className="flex justify-between px-2 mt-1">
        <span className="text-[11px] text-[#94A3B8]">{format(min)}</span>
        <span className="text-[11px] text-[#94A3B8]">{format(max)}</span>
      </div>
    </div>
  )
}
