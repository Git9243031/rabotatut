export type Role    = 'admin' | 'hr' | 'candidate'
export type Sphere  = 'it' | 'design' | 'marketing' | 'management' | 'finance' | 'hr' | 'sales' | 'legal' | 'other'
export type Level   = 'junior' | 'middle' | 'senior' | 'lead' | 'any'
export type Format  = 'remote' | 'office' | 'hybrid'
export type JobType = 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship'

export interface User {
  id: string; email: string; name?: string
  role: Role; avatar_url?: string; created_at: string
}
export interface Job {
  id: string; title: string; company: string; description: string
  responsibilities?: string; requirements?: string
  salary_min?: number; salary_max?: number; location?: string
  sphere?: Sphere; sub_sphere?: string
  experience_level?: Level; job_type?: JobType; format?: Format
  skills: string[]; created_by?: string; visible: boolean
  created_at: string; views?: number; contact_tg?: string
}
export interface Resume {
  id: string; user_id: string; name: string; title: string; bio?: string
  sphere?: Sphere; sub_sphere?: string
  skills: string[]; experience_years: number
  portfolio?: string; location?: string; expected_salary?: number
  format?: string; visible: boolean; created_at: string; contact_tg?: string
}
export interface Settings {
  id: string
  telegram_autopost_enabled: boolean
  header_enabled:            boolean
  auto_approve_jobs:         boolean
  auto_approve_telegram:     boolean
  // Новая настройка — показывать кнопку Связаться (по умолчанию true)
  contact_button_enabled:    boolean
}
export interface JobFilters {
  q?: string; sphere?: string; subSphere?: string; level?: string
  format?: string; jobType?: string; salaryMin?: number; salaryMax?: number
  hot?: boolean; featured?: boolean
}
export interface ResumeFilters {
  q?: string; sphere?: string; subSphere?: string; level?: string
  format?: string; salaryMax?: number
}
