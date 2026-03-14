import { z } from 'zod'

export const loginSchema = z.object({
  email:    z.string().email('Введите корректный email'),
  password: z.string().min(6, 'Минимум 6 символов'),
})

export const registerSchema = z.object({
  email:    z.string().email('Введите корректный email'),
  password: z.string().min(6, 'Минимум 6 символов'),
  role:     z.enum(['candidate','hr']),
})

export const jobSchema = z.object({
  title:            z.string().min(3, 'Минимум 3 символа'),
  company:          z.string().min(2, 'Укажите компанию'),
  description:      z.string().min(30, 'Минимум 30 символов'),
  responsibilities: z.string().optional(),
  requirements:     z.string().optional(),
  sphere:           z.string().optional(),
  sub_sphere:       z.string().optional(),
  location:         z.string().optional(),
  format:           z.string().optional(),
  experience_level: z.string().optional(),
  job_type:         z.string().optional(),
  salary_min:       z.coerce.number().optional(),
  salary_max:       z.coerce.number().optional(),
  skills:           z.array(z.string()).default([]),
  contact_tg:       z.string()
    .min(2, 'Укажите Telegram username')
    .regex(/^[a-zA-Z0-9_]+$/, 'Только латиница, цифры и _'),
})

export const resumeSchema = z.object({
  name:             z.string().min(2, 'Укажите имя'),
  title:            z.string().min(3, 'Укажите должность'),
  bio:              z.string().optional(),
  sphere:           z.string().optional(),
  sub_sphere:       z.string().optional(),
  location:         z.string().optional(),
  format:           z.string().optional(),
  experience_years: z.coerce.number().min(0).max(50).default(0),
  portfolio:        z.string().url('Введите корректный URL').optional().or(z.literal('')),
  expected_salary:  z.coerce.number().optional(),
  skills:           z.array(z.string()).default([]),
  contact_tg:       z.string()
    .min(2, 'Укажите Telegram username')
    .regex(/^[a-zA-Z0-9_]+$/, 'Только латиница, цифры и _'),
})

export type LoginFormData    = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type JobFormData      = z.infer<typeof jobSchema>
export type ResumeFormData   = z.infer<typeof resumeSchema>
