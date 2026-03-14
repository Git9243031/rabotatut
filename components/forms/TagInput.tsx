'use client'
import { useState, type KeyboardEvent } from 'react'
import { X } from 'lucide-react'

interface Props {
  label?: string
  value: string[]
  onChange: (v: string[]) => void
  placeholder?: string
}

export function TagInput({ label, value, onChange, placeholder = 'Добавить...' }: Props) {
  const [input, setInput] = useState('')

  const add = () => {
    const tag = input.trim()
    if (tag && !value.includes(tag)) onChange([...value, tag])
    setInput('')
  }

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add() }
    if (e.key === 'Backspace' && !input && value.length) onChange(value.slice(0, -1))
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-[#0F172A]">{label}</label>}
      <div className="min-h-[42px] w-full rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-2 flex flex-wrap gap-1.5 focus-within:border-[#7C3AED] focus-within:ring-2 focus-within:ring-[#7C3AED]/10 transition-colors">
        {value.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 bg-[#EDE9FE] text-[#7C3AED] text-xs px-2 py-0.5 rounded-full">
            {tag}
            <button type="button" onClick={() => onChange(value.filter(t => t !== tag))}
              className="hover:text-[#6D28D9]"><X size={10} /></button>
          </span>
        ))}
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          onBlur={add}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[80px] text-sm outline-none placeholder:text-[#94A3B8] bg-transparent"
        />
      </div>
      <p className="text-xs text-[#94A3B8]">Enter или запятая для добавления</p>
    </div>
  )
}
