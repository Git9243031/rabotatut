'use client'
import { useRouter, useParams } from 'next/navigation'
import { useForm }              from 'react-hook-form'
import { zodResolver }          from '@hookform/resolvers/zod'
import { useState, useEffect }  from 'react'
import { resumesService }       from '@/services/resumes'
import { useAppSelector }       from '@/hooks/useAppDispatch'
import { resumeSchema, type ResumeFormData } from '@/utils/schemas'
import { FormInput }            from '@/components/forms/FormInput'
import { FormSelect }           from '@/components/forms/FormSelect'
import { TagInput }             from '@/components/forms/TagInput'
import { SphereSelect }         from '@/components/forms/SphereSelect'
import { CityInput }            from '@/components/forms/CityInput'
import { Button }               from '@/components/ui/Button'
import { Spinner }              from '@/components/ui/Spinner'
import { ChevronLeft, Send }    from 'lucide-react'
import Link                     from 'next/link'
import { cn }                   from '@/lib/utils'

const FORMAT_OPTS = [{value:'',label:'— Формат работы —'},{value:'remote',label:'Удалённо'},{value:'office',label:'Офис'},{value:'hybrid',label:'Гибрид'}]

export default function EditResumePage() {
  const router   = useRouter()
  const { id }   = useParams<{ id: string }>()
  const { user } = useAppSelector(s => s.auth)

  const [sphere,      setSphere]      = useState('')
  const [subSphere,   setSubSphere]   = useState('')
  const [city,        setCity]        = useState('Удалённо')
  const [loading,     setLoading]     = useState(true)
  const [serverError, setServerError] = useState('')

  const {
    register, handleSubmit, watch, setValue, reset,
    formState: { errors, isSubmitting },
  } = useForm<ResumeFormData>({
    resolver: zodResolver(resumeSchema),
    defaultValues: { skills: [], contact_tg: '' },
  })

  const skills    = watch('skills')     ?? []
  const contactTg = watch('contact_tg') ?? ''

  useEffect(() => {
    if (!id) return
    resumesService.getResume(id).then(resume => {
      if (!resume) { router.push('/dashboard/candidate'); return }
      reset({
        name:             resume.name,
        title:            resume.title,
        bio:              resume.bio              ?? '',
        experience_years: resume.experience_years ?? 0,
        portfolio:        resume.portfolio        ?? '',
        expected_salary:  resume.expected_salary,
        format:           resume.format           ?? '',
        skills:           resume.skills           ?? [],
        contact_tg:       resume.contact_tg       ?? '',
      })
      setSphere(resume.sphere       ?? '')
      setSubSphere(resume.sub_sphere ?? '')
      setCity(resume.location       ?? 'Удалённо')
      setLoading(false)
    })
  }, [id, reset, router])

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value
    if (val.startsWith('@')) val = val.slice(1)
    val = val.replace(/^https?:\/\/t\.me\//i, '')
    setValue('contact_tg', val, { shouldValidate: true })
  }

  const onSubmit = async (values: ResumeFormData) => {
    if (!user || !id) return
    setServerError('')
    try {
      await resumesService.updateResume(id, {
        name:             values.name,
        title:            values.title,
        bio:              values.bio,
        sphere:           sphere as any   || undefined,
        sub_sphere:       subSphere       || undefined,
        location:         city            || 'Удалённо',
        format:           values.format,
        experience_years: values.experience_years ?? 0,
        portfolio:        values.portfolio,
        expected_salary:  values.expected_salary,
        skills:           values.skills,
        contact_tg:       values.contact_tg,
      })
      router.push('/dashboard/candidate')
    } catch (e: any) {
      setServerError(e?.message ?? 'Ошибка сохранения')
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <Spinner className="w-8 h-8" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <Link href="/dashboard/candidate"
          className="inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#7C3AED] mb-6 transition-colors">
          <ChevronLeft size={15} />Назад
        </Link>

        <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-6 sm:p-8">
          <h1 className="text-xl font-bold text-[#0F172A] mb-6">Редактировать резюме</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            <div className="grid sm:grid-cols-2 gap-4">
              <FormInput label="Имя и фамилия *" placeholder="Иван Иванов"
                error={errors.name?.message} {...register('name')} />
              <FormInput label="Желаемая должность *" placeholder="Frontend Developer"
                error={errors.title?.message} {...register('title')} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#0F172A]">О себе</label>
              <textarea rows={4} placeholder="Расскажите о своём опыте и целях..."
                className="w-full rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 resize-none transition-colors"
                {...register('bio')} />
            </div>

            <SphereSelect
              sphere={sphere} subSphere={subSphere}
              onChangeSphere={setSphere} onChangeSubSphere={setSubSphere}
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <FormSelect label="Формат работы" options={FORMAT_OPTS} {...register('format')} />
              <CityInput label="Город" value={city} onChange={setCity} />
              <FormInput label="Опыт (лет)" type="number" placeholder="3"
                error={errors.experience_years?.message} {...register('experience_years')} />
              <FormInput label="Ожидаемая зарплата (₽)" type="number" placeholder="150000"
                error={errors.expected_salary?.message} {...register('expected_salary')} />
            </div>

            <FormInput label="Портфолио / GitHub" type="url"
              placeholder="https://github.com/username"
              error={errors.portfolio?.message} {...register('portfolio')} />

            <TagInput label="Навыки" value={skills}
              onChange={v => setValue('skills', v)} placeholder="React, TypeScript..." />

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
                Сохранить изменения
              </Button>
              <Link href="/dashboard/candidate">
                <Button type="button" variant="outline">Отмена</Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
