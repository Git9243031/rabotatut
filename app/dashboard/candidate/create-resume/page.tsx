'use client'
import { useRouter }      from 'next/navigation'
import { useForm }        from 'react-hook-form'
import { zodResolver }    from '@hookform/resolvers/zod'
import { useState }       from 'react'
import { resumesService } from '@/services/resumes'
import { useAppSelector } from '@/hooks/useAppDispatch'
import { resumeSchema, type ResumeFormData } from '@/utils/schemas'
import { FormInput }      from '@/components/forms/FormInput'
import { FormSelect }     from '@/components/forms/FormSelect'
import { TagInput }       from '@/components/forms/TagInput'
import { SphereSelect }   from '@/components/forms/SphereSelect'
import { CityInput }      from '@/components/forms/CityInput'
import { TgInput }        from '@/components/forms/TgInput'
import { Button }         from '@/components/ui/Button'
import { ChevronLeft }    from 'lucide-react'
import Link               from 'next/link'

const FORMAT_OPTS = [{value:'',label:'— Формат работы —'},{value:'remote',label:'Удалённо'},{value:'office',label:'Офис'},{value:'hybrid',label:'Гибрид'}]

export default function CreateResumePage() {
  const router = useRouter()
  const { user } = useAppSelector(s => s.auth)
  const [sphere,      setSphere]      = useState('')
  const [subSphere,   setSubSphere]   = useState('')
  // По умолчанию — Удалённо
  const [city,        setCity]        = useState('Удалённо')
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } =
    useForm<ResumeFormData>({
      resolver: zodResolver(resumeSchema),
      defaultValues: { skills: [], experience_years: 0 },
    })

  const skills = watch('skills') ?? []

  const onSubmit = async (values: ResumeFormData) => {
    if (!user) return
    setServerError('')
    try {
      const { error } = await resumesService.createResume({
        name:             values.name,
        title:            values.title,
        bio:              values.bio,
        sphere:           sphere as any || undefined,
        sub_sphere:       subSphere || undefined,
        location:         city || 'Удалённо',
        format:           values.format,
        experience_years: values.experience_years ?? 0,
        portfolio:        values.portfolio,
        expected_salary:  values.expected_salary,
        skills:           values.skills,
        contact_tg:       values.contact_tg || undefined,
        user_id:          user.id,
        visible:          true,
      }, user.id)
      if (error) throw error
      router.push('/dashboard/candidate')
    } catch (e: any) {
      setServerError(e?.message ?? 'Ошибка создания резюме')
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <Link href="/dashboard/candidate"
          className="inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#7C3AED] mb-6 transition-colors">
          <ChevronLeft size={15} />Назад
        </Link>

        <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-6 sm:p-8">
          <h1 className="text-xl font-bold text-[#0F172A] mb-6">Новое резюме</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            <div className="grid sm:grid-cols-2 gap-4">
              <FormInput
                label="Имя и фамилия *"
                placeholder="Иван Иванов"
                error={errors.name?.message}
                {...register('name')}
              />
              <FormInput
                label="Желаемая должность *"
                placeholder="Frontend Developer"
                error={errors.title?.message}
                {...register('title')}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#0F172A]">О себе</label>
              <textarea rows={4}
                placeholder="Расскажите о своём опыте и целях..."
                className="w-full rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 resize-none transition-colors"
                {...register('bio')}
              />
            </div>

            <SphereSelect
              sphere={sphere}
              subSphere={subSphere}
              onChangeSphere={setSphere}
              onChangeSubSphere={setSubSphere}
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <FormSelect label="Формат работы" options={FORMAT_OPTS} {...register('format')} />
              <CityInput
                label="Город"
                value={city}
                onChange={setCity}
              />
              <FormInput
                label="Опыт (лет)"
                type="number"
                placeholder="3"
                error={errors.experience_years?.message}
                {...register('experience_years')}
              />
              <FormInput
                label="Ожидаемая зарплата (₽)"
                type="number"
                placeholder="150000"
                error={errors.expected_salary?.message}
                {...register('expected_salary')}
              />
            </div>

            <FormInput
              label="Портфолио / GitHub"
              type="url"
              placeholder="https://github.com/username"
              error={errors.portfolio?.message}
              {...register('portfolio')}
            />

            <TagInput
              label="Навыки"
              value={skills}
              onChange={v => setValue('skills', v)}
              placeholder="React, TypeScript, Node.js..."
            />

            {/* Контакт TG */}
            <TgInput
              label="Telegram для связи"
              error={errors.contact_tg?.message}
              {...register('contact_tg')}
            />

            {serverError && (
              <div className="bg-red-50 border border-red-100 rounded-[10px] px-3 py-2.5">
                <p className="text-xs text-[#EF4444]">{serverError}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="primary" loading={isSubmitting} className="flex-1">
                Опубликовать резюме
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
