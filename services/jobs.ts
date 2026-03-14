import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, getCountFromServer, increment, serverTimestamp,
  type QueryConstraint,
} from 'firebase/firestore'
import { db } from '@/lib/firebaseClient'
import { jobFromDoc } from '@/lib/converters'
import type { Job, JobFilters } from '@/types'

const COL      = 'jobs'
const PER_PAGE = 9

// Убираем undefined и id/created_at перед отправкой в Firestore
function cleanForFirestore(data: Record<string, any>): Record<string, any> {
  return Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== undefined)
  )
}

export const jobsService = {

  async getJobs(filters: JobFilters & { subSphere?: string; salaryMax?: number }, page: number) {
    const constraints: QueryConstraint[] = [
      where('visible', '==', true),
      orderBy('created_at', 'desc'),
    ]

    if (filters.sphere  && filters.sphere  !== 'all') constraints.push(where('sphere',           '==', filters.sphere))
    if (filters.level   && filters.level   !== 'all') constraints.push(where('experience_level', '==', filters.level))
    if (filters.format  && filters.format  !== 'all') constraints.push(where('format',           '==', filters.format))
    if (filters.jobType && filters.jobType !== 'all') constraints.push(where('job_type',         '==', filters.jobType))
    if (filters.salaryMin && filters.salaryMin > 0)   constraints.push(where('salary_max',       '>=', filters.salaryMin))
    if (filters.featured) {
      const week = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      constraints.push(where('created_at', '>=', week))
    }

    const snap = await getDocs(query(collection(db, COL), ...constraints))
    let jobs = snap.docs.map(jobFromDoc)

    if (filters.q) {
      const lq = filters.q.toLowerCase()
      jobs = jobs.filter(j =>
        j.title.toLowerCase().includes(lq)       ||
        j.company.toLowerCase().includes(lq)     ||
        j.description.toLowerCase().includes(lq) ||
        j.skills.some(s => s.toLowerCase().includes(lq))
      )
    }

    if (filters.subSphere && filters.subSphere !== 'all') {
      const subs = filters.subSphere.split(',').filter(Boolean)
      if (subs.length > 0) jobs = jobs.filter(j => j.sub_sphere && subs.includes(j.sub_sphere))
    }

    if (filters.salaryMax && filters.salaryMax < 500000) {
      jobs = jobs.filter(j => !j.salary_min || j.salary_min <= filters.salaryMax!)
    }

    if (filters.hot) jobs = jobs.filter(j => j.salary_min != null)

    const total     = jobs.length
    const paginated = jobs.slice((page - 1) * PER_PAGE, page * PER_PAGE)
    return { data: paginated, count: total }
  },

  async getJob(id: string): Promise<Job | null> {
    const snap = await getDoc(doc(db, COL, id))
    if (!snap.exists()) return null
    return jobFromDoc(snap)
  },

  async getMyJobs(userId: string): Promise<Job[]> {
    const q    = query(collection(db, COL), where('created_by', '==', userId), orderBy('created_at', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map(jobFromDoc)
  },

  async getAllJobsAdmin() {
    const q    = query(collection(db, COL), orderBy('created_at', 'desc'))
    const snap = await getDocs(q)
    return { data: snap.docs.map(jobFromDoc) }
  },

  async createJob(data: Omit<Job, 'id' | 'created_at' | 'views'>, userId: string) {
    const { id: _id, created_at: _ca, ...rest } = data as any
    const clean = cleanForFirestore(rest)
    const ref   = await addDoc(collection(db, COL), {
      ...clean,
      created_by: userId,
      views:      0,
      created_at: serverTimestamp(),
    })
    return { data: { id: ref.id }, error: null }
  },

  async updateJob(id: string, data: Partial<Job>) {
    const { id: _id, created_at: _ca, ...rest } = data as any
    // cleanForFirestore убирает все undefined поля
    const clean = cleanForFirestore(rest)
    await updateDoc(doc(db, COL, id), clean)
    return { error: null }
  },

  async deleteJob(id: string) {
    await deleteDoc(doc(db, COL, id))
    return { error: null }
  },

  async toggleVisible(id: string, visible: boolean) {
    await updateDoc(doc(db, COL, id), { visible })
    return { error: null }
  },

  async incrementViews(id: string) {
    await updateDoc(doc(db, COL, id), { views: increment(1) })
  },

  async getTotalCount(): Promise<number> {
    const q    = query(collection(db, COL), where('visible', '==', true))
    const snap = await getCountFromServer(q)
    return snap.data().count
  },
}
