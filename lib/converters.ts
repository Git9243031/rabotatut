import type { DocumentSnapshot, DocumentData } from 'firebase/firestore'
import type { Job, Resume, User, Settings } from '@/types'

export function jobFromDoc(doc: DocumentSnapshot<DocumentData>): Job {
  const d = doc.data()!
  return {
    id:               doc.id,
    title:            d.title            ?? '',
    company:          d.company          ?? '',
    description:      d.description      ?? '',
    responsibilities: d.responsibilities,
    requirements:     d.requirements,
    salary_min:       d.salary_min,
    salary_max:       d.salary_max,
    location:         d.location,
    sphere:           d.sphere,
    sub_sphere:       d.sub_sphere,
    experience_level: d.experience_level,
    job_type:         d.job_type,
    format:           d.format,
    skills:           d.skills           ?? [],
    created_by:       d.created_by,
    visible:          d.visible          ?? true,
    views:            d.views            ?? 0,
    contact_tg:       d.contact_tg,
    created_at:       d.created_at?.toDate?.()?.toISOString() ?? new Date().toISOString(),
  }
}

export function resumeFromDoc(doc: DocumentSnapshot<DocumentData>): Resume {
  const d = doc.data()!
  return {
    id:               doc.id,
    user_id:          d.user_id          ?? '',
    name:             d.name             ?? '',
    title:            d.title            ?? '',
    bio:              d.bio,
    sphere:           d.sphere,
    sub_sphere:       d.sub_sphere,
    skills:           d.skills           ?? [],
    experience_years: d.experience_years ?? 0,
    portfolio:        d.portfolio,
    location:         d.location,
    expected_salary:  d.expected_salary,
    format:           d.format,
    visible:          d.visible          ?? true,
    contact_tg:       d.contact_tg,
    created_at:       d.created_at?.toDate?.()?.toISOString() ?? new Date().toISOString(),
  }
}

export function userFromDoc(doc: DocumentSnapshot<DocumentData>): User {
  const d = doc.data()!
  return {
    id:         doc.id,
    email:      d.email      ?? '',
    name:       d.name,
    role:       d.role       ?? 'candidate',
    avatar_url: d.avatar_url,
    created_at: d.created_at?.toDate?.()?.toISOString() ?? new Date().toISOString(),
  }
}

export function settingsFromDoc(doc: DocumentSnapshot<DocumentData>): Settings {
  const d = doc.data()!
  return {
    id:                        doc.id,
    telegram_autopost_enabled: d.telegram_autopost_enabled ?? false,
    header_enabled:            d.header_enabled            ?? true,
    auto_approve_jobs:         d.auto_approve_jobs         ?? false,
    auto_approve_telegram:     d.auto_approve_telegram     ?? false,
  }
}
