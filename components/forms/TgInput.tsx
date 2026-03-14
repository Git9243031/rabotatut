'use client'
import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string; error?: string
}

export const TgInput = forwardRef<HTMLInputElement, Props>(
  ({ label = 'Telegram для связи', error, className, onChange, ...props }, ref) => {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value
      if (val.startsWith('@')) val = val.slice(1)
      val = val.replace(/^https?:\/\/t\.me\//i, '')
      e.target.value = val
      onChange?.(e)
    }

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-[#0F172A]">
            {label}
            <span className="text-[#EF4444] ml-0.5">*</span>
          </label>
        )}
        <div className="relative flex">
          <span className="inline-flex items-center px-3 rounded-l-[10px] border border-r-0 border-[#E5E7EB] bg-[#F8FAFC] text-sm text-[#64748B] select-none">
            @
          </span>
          <input
            ref={ref}
            type="text"
            onChange={handleChange}
            placeholder="username"
            className={cn(
              'h-10 flex-1 rounded-r-[10px] border bg-white px-3 text-sm text-[#0F172A]',
              'placeholder:text-[#94A3B8] focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 transition-colors',
              error ? 'border-[#EF4444]' : 'border-[#E5E7EB]',
              className
            )}
            {...props}
          />
        </div>
        {error
          ? <p className="text-xs text-[#EF4444]">{error}</p>
          : <p className="text-xs text-[#94A3B8]">Соискатели свяжутся с вами напрямую</p>
        }
      </div>
    )
  }
)
TgInput.displayName = 'TgInput'
