'use client'
import { useRouter }      from 'next/navigation'
import { useForm }        from 'react-hook-form'
import { zodResolver }    from '@hookform/resolvers/zod'
import { useState }       from 'react'
import { jobsService }    from '@/services/jobs'
import { useAppSelector } from '@/hooks/useAppDispatch'
import { jobSchema, type JobFormData } from '@/utils/schemas'
import { FormInput }      from '@/components/forms/FormInput'
import { FormSelect }     from '@/components/forms/FormSelect'
import { TagInput }       from '@/components/forms/TagInput'
import { SphereSelect }   from '@/components/forms/SphereSelect'
import { CityInput }      from '@/components/forms/CityInput'
import { Button }         from '@/components/ui/Button'
import { ChevronLeft, Send } from 'lucide-react'
import Link               from 'next/link'
import { cn }             from '@/lib/utils'

const LEVEL_OPTS    = [{value:'',label:'— Уровень —'},{value:'junior',label:'Junior'},{value:'middle',label:'Middle'},{value:'senior',label:'Senior'},{value:'lead',label:'Lead'},{value:'any',label:'Любой'}]
const FORMAT_OPTS   = [{value:'',label:'— Формат —'},{value:'remote',label:'Удалённо'},{value:'office',label:'Офис'},{value:'hybrid',label:'Гибрид'}]
const JOB_TYPE_OPTS = [{value:'',label:'— Тип занятости —'},{value:'full-time',label:'Полная занятость'},{value:'part-time',label:'Частичная'},{value:'contract',label:'Контракт'},{value:'freelance',label:'Фриланс'},{value:'internship',label:'Стажировка'}]

export default function CreateJobPage() {
  const router = useRouter()
  const { user } = useAppSelector(s => s.auth)
  const [sphere,      setSphere]      = useState('')
  const [subSphere,   setSubSphere]   = useState('')
  const [city,        setCity]        = useState('Удалённо')
  const [serverError, setServerError] = useState('')

  const {
    register, handleSubmit, watch, setValue,
    formState: { errors, isSubmitting },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: { skills: [], contact_tg: '' },
  })

  const skills    = watch('skills')     ?? []
  const contactTg = watch('contact_tg') ?? ''

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value
    if (val.startsWith('@')) val = val.slice(1)
    val = val.replace(/^https?:\/\/t\.me\//i, '')
    setValue('contact_tg', val, { shouldValidate: true })
  }

  const onSubmit = async (values: JobFormData) => {
    if (!user) return
    setServerError('')
    try {
      const { data, error } = await jobsService.createJob({
        title:            values.title,
        company:          values.company,
        description:      values.description,
        responsibilities: values.responsibilities || undefined,
        requirements:     values.requirements     || undefined,
        sphere:           sphere as any            || undefined,
        sub_sphere:       subSphere                || undefined,
        location:         city                     || 'Удалённо',
        format:           values.format            as any,
        experience_level: values.experience_level  as any,
        job_type:         values.job_type          as any,
        salary_min:       values.salary_min,
        salary_max:       values.salary_max,
        skills:           values.skills,
        contact_tg:       values.contact_tg,
        visible:          true,
      }, user.id)

      if (error) throw error

      if (data?.id) {
        fetch('/api/telegram/post', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ jobId: data.id }),
        }).catch(e => console.warn('TG post failed:', e))
      }

      router.push('/dashboard/hr')
    } catch (e: any) {
      setServerError(e?.message ?? 'Ошибка создания вакансии')
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <Link href="/dashboard/hr"
          className="inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#7C3AED] mb-6 transition-colors">
          <ChevronLeft size={15} />Назад
        </Link>

        <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-6 sm:p-8">
          <h1 className="text-xl font-bold text-[#0F172A] mb-6">Новая вакансия</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            <div className="grid sm:grid-cols-2 gap-4">
              <FormInput label="Название вакансии *" placeholder="Senior Frontend Developer"
                error={errors.title?.message} {...register('title')} />
              <FormInput label="Компания *" placeholder="ООО Ромашка"
                error={errors.company?.message} {...register('company')} />
            </div>

            {/* Описание — обязательное */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#0F172A]">
                Описание вакансии <span className="text-[#EF4444]">*</span>
              </label>
              <textarea rows={4} placeholder="Краткое описание вакансии и компании..."
                className={`w-full rounded-[10px] border bg-white px-3 py-2.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 resize-none transition-colors ${errors.description ? 'border-[#EF4444]' : 'border-[#E5E7EB] focus:border-[#7C3AED]'}`}
                {...register('description')} />
              {errors.description && <p className="text-xs text-[#EF4444]">{errors.description.message}</p>}
            </div>

            {/* Обязанности — опциональное */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#0F172A]">
                Обязанности
                <span className="text-[#94A3B8] text-xs font-normal ml-1.5">(необязательно)</span>
              </label>
              <textarea rows={4} placeholder="— Разработка новых фич&#10;— Код-ревью&#10;— Участие в архитектурных решениях..."
                className="w-full rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 resize-none transition-colors"
                {...register('responsibilities')} />
            </div>

            {/* Требования — опциональное */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#0F172A]">
                Требования
                <span className="text-[#94A3B8] text-xs font-normal ml-1.5">(необязательно)</span>
              </label>
              <textarea rows={4} placeholder="— Опыт от 3 лет&#10;— Знание React, TypeScript&#10;— Умение работать в команде..."
                className="w-full rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 resize-none transition-colors"
                {...register('requirements')} />
            </div>

            <SphereSelect
              sphere={sphere} subSphere={subSphere}
              onChangeSphere={setSphere} onChangeSubSphere={setSubSphere}
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <FormSelect label="Уровень"   options={LEVEL_OPTS}    {...register('experience_level')} />
              <FormSelect label="Формат"    options={FORMAT_OPTS}   {...register('format')} />
              <FormSelect label="Занятость" options={JOB_TYPE_OPTS} {...register('job_type')} />
              <CityInput label="Город" value={city} onChange={setCity} />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <FormInput label="Зарплата от (₽)" type="number" placeholder="100000"
                error={errors.salary_min?.message} {...register('salary_min')} />
              <FormInput label="Зарплата до (₽)" type="number" placeholder="200000"
                error={errors.salary_max?.message} {...register('salary_max')} />
            </div>

            <TagInput label="Навыки / теги" value={skills}
              onChange={v => setValue('skills', v)} placeholder="React, TypeScript..." />

            {/* contact_tg */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#0F172A]">
                Telegram для связи <span className="text-[#EF4444]">*</span>
              </label>
              <div className="relative flex">
                <span className="inline-flex items-center px-3 rounded-l-[10px] border border-r-0 border-[#E5E7EB] bg-[#F8FAFC] text-sm text-[#64748B] select-none">@</span>
                <input type="text" value={contactTg} onChange={handleContactChange}
                  placeholder="username"
                  className={cn(
                    'h-10 flex-1 rounded-r-[10px] border bg-white px-3 text-sm text-[#0F172A]',
                    'placeholder:text-[#94A3B8] focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 transition-colors',
                    errors.contact_tg ? 'border-[#EF4444]' : 'border-[#E5E7EB]'
                  )} />
              </div>
              {errors.contact_tg
                ? <p className="text-xs text-[#EF4444]">{errors.contact_tg.message}</p>
                : contactTg && (
                  <a href={'https://t.me/' + contactTg} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#229ED9] hover:underline w-fit">
                    <Send size={11} />t.me/{contactTg}
                  </a>
                )
              }
            </div>

            {serverError && (
              <div className="bg-red-50 border border-red-100 rounded-[10px] px-3 py-2.5">
                <p className="text-xs text-[#EF4444]">{serverError}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="primary" loading={isSubmitting} className="flex-1">
                Опубликовать вакансию
              </Button>
              <Link href="/dashboard/hr">
                <Button type="button" variant="outline">Отмена</Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
