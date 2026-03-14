'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { MapPin, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const RUSSIAN_CITIES = [
  'Москва','Санкт-Петербург','Новосибирск','Екатеринбург','Казань',
  'Нижний Новгород','Челябинск','Самара','Уфа','Ростов-на-Дону',
  'Красноярск','Воронеж','Пермь','Волгоград','Краснодар',
  'Саратов','Тюмень','Тольятти','Ижевск','Барнаул',
  'Ульяновск','Иркутск','Хабаровск','Ярославль','Владивосток',
  'Махачкала','Томск','Оренбург','Кемерово','Новокузнецк',
  'Рязань','Астрахань','Набережные Челны','Пенза','Липецк',
  'Тула','Киров','Чебоксары','Калининград','Брянск',
  'Курск','Иваново','Магнитогорск','Тверь','Ставрополь',
  'Белгород','Нижний Тагил','Архангельск','Владимир','Сочи',
  'Чита','Смоленск','Калуга','Орёл','Волжский',
  'Череповец','Вологда','Мурманск','Саранск','Якутск',
  'Владикавказ','Грозный','Улан-Удэ','Тула','Сургут',
  'Нижневартовск','Стерлитамак','Петрозаводск','Кострома','Нальчик',
  'Нижнекамск','Улан-Удэ','Таганрог','Дзержинск','Шахты',
  'Нальчик','Орск','Сыктывкар','Братск','Нижний Тагил',
  'Комсомольск-на-Амуре','Балашиха','Химки','Подольск','Мытищи',
  'Люберцы','Королёв','Одинцово','Красногорск','Электросталь',
  'Коломна','Домодедово','Серпухов','Раменское','Жуковский',
  'Реутов','Долгопрудный','Клин','Ногинск','Пушкино',
  'Удалённо',
].sort((a, b) => {
  // Удалённо всегда первым
  if (a === 'Удалённо') return -1
  if (b === 'Удалённо') return 1
  return a.localeCompare(b, 'ru')
})

interface Props {
  label?:      string
  value:       string
  onChange:    (v: string) => void
  placeholder?: string
  error?:      string
  className?:  string
}

export function CityInput({
  label = 'Город',
  value,
  onChange,
  placeholder = 'Москва',
  error,
  className,
}: Props) {
  const [open, setOpen]       = useState(false)
  const [query, setQuery]     = useState(value)
  const [focused, setFocused] = useState(false)
  const ref    = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Синхронизируем query с value снаружи
  useEffect(() => { setQuery(value) }, [value])

  // Закрываем по клику вне
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setFocused(false)
        // Если ввели текст но не выбрали — оставляем как есть
        if (!RUSSIAN_CITIES.includes(query) && query !== value) {
          setQuery(value)
        }
      }
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [query, value])

  const filtered = query.trim().length === 0
    ? RUSSIAN_CITIES.slice(0, 8)
    : RUSSIAN_CITIES.filter(c =>
        c.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setOpen(true)
    // Если поле очищено — сбрасываем значение
    if (!e.target.value) onChange('')
  }

  const handleSelect = (city: string) => {
    setQuery(city)
    onChange(city)
    setOpen(false)
    inputRef.current?.blur()
  }

  const handleClear = () => {
    setQuery('')
    onChange('')
    inputRef.current?.focus()
    setOpen(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur() }
    if (e.key === 'Enter' && filtered.length > 0) {
      e.preventDefault()
      handleSelect(filtered[0])
    }
  }

  return (
    <div className={cn('flex flex-col gap-1.5', className)} ref={ref}>
      {label && <label className="text-sm font-medium text-[#0F172A]">{label}</label>}

      <div className="relative">
        <MapPin
          size={14}
          className={cn(
            'absolute left-3 top-1/2 -translate-y-1/2 transition-colors pointer-events-none',
            focused ? 'text-[#7C3AED]' : 'text-[#94A3B8]'
          )}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInput}
          onFocus={() => { setFocused(true); setOpen(true) }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className={cn(
            'h-10 w-full rounded-[10px] border bg-white pl-9 pr-8 text-sm text-[#0F172A]',
            'placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 transition-colors',
            error
              ? 'border-[#EF4444]'
              : focused
              ? 'border-[#7C3AED]'
              : 'border-[#E5E7EB]'
          )}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B] transition-colors"
          >
            <X size={14} />
          </button>
        )}

        {/* Дропдаун */}
        {open && filtered.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#E5E7EB] rounded-[12px] shadow-[0_8px_24px_rgba(0,0,0,0.1)] z-50 py-1.5 max-h-52 overflow-y-auto">
            {filtered.map(city => (
              <button
                key={city}
                type="button"
                onMouseDown={e => e.preventDefault()} // не убираем фокус с input
                onClick={() => handleSelect(city)}
                className={cn(
                  'w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2',
                  city === value
                    ? 'text-[#7C3AED] font-semibold bg-[#F5F3FF]'
                    : 'text-[#374151] hover:bg-[#F9FAFB]'
                )}
              >
                <MapPin size={12} className={city === value ? 'text-[#7C3AED]' : 'text-[#94A3B8]'} />
                {/* Подсвечиваем совпадение */}
                {highlightMatch(city, query)}
              </button>
            ))}
          </div>
        )}

        {/* Ничего не найдено */}
        {open && query.length > 0 && filtered.length === 0 && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#E5E7EB] rounded-[12px] shadow-[0_8px_24px_rgba(0,0,0,0.1)] z-50 px-4 py-3">
            <p className="text-sm text-[#94A3B8]">Город не найден</p>
            <button
              type="button"
              onClick={() => { onChange(query); setOpen(false) }}
              className="text-xs text-[#7C3AED] hover:underline mt-1"
            >
              Использовать «{query}»
            </button>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-[#EF4444]">{error}</p>}
    </div>
  )
}

// Подсвечивает совпадающую часть строки
function highlightMatch(city: string, query: string) {
  if (!query.trim()) return <span>{city}</span>
  const idx = city.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <span>{city}</span>
  return (
    <span>
      {city.slice(0, idx)}
      <span className="font-semibold text-[#7C3AED]">{city.slice(idx, idx + query.length)}</span>
      {city.slice(idx + query.length)}
    </span>
  )
}
