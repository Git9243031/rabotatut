import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp, type QueryConstraint,
} from 'firebase/firestore'
import { db } from '@/lib/firebaseClient'
import { resumeFromDoc } from '@/lib/converters'
import type { Resume, ResumeFilters } from '@/types'

const COL = 'resumes'

export const resumesService = {

  async getResumes(filters: ResumeFilters & { subSphere?: string }) {
    const constraints: QueryConstraint[] = [
      where('visible', '==', true),
      orderBy('created_at', 'desc'),
    ]

    if (filters.sphere    && filters.sphere    !== 'all') constraints.push(where('sphere',          '==', filters.sphere))
    if (filters.level     && filters.level     !== 'all') constraints.push(where('experience_level','==', filters.level))
    if (filters.format    && filters.format    !== 'all') constraints.push(where('format',          '==', filters.format))
    if (filters.salaryMax && filters.salaryMax  > 0)      constraints.push(where('expected_salary', '<=', filters.salaryMax))

    const snap = await getDocs(query(collection(db, COL), ...constraints))
    let resumes = snap.docs.map(resumeFromDoc)

    // Текстовый поиск
    if (filters.q) {
      const lq = filters.q.toLowerCase()
      resumes = resumes.filter(r =>
        r.name.toLowerCase().includes(lq)        ||
        r.title.toLowerCase().includes(lq)       ||
        (r.bio ?? '').toLowerCase().includes(lq) ||
        r.skills.some(s => s.toLowerCase().includes(lq))
      )
    }

    // Фильтр по subSphere
    if (filters.subSphere && filters.subSphere !== 'all') {
      const subs = filters.subSphere.split(',').filter(Boolean)
      if (subs.length > 0) {
        resumes = resumes.filter(r => r.sub_sphere && subs.includes(r.sub_sphere))
      }
    }

    return { data: resumes, count: resumes.length }
  },

  async getResume(id: string): Promise<Resume | null> {
    const snap = await getDoc(doc(db, COL, id))
    if (!snap.exists()) return null
    return resumeFromDoc(snap)
  },

  async getMyResumes(userId: string): Promise<Resume[]> {
    const q    = query(collection(db, COL), where('user_id', '==', userId), orderBy('created_at', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map(resumeFromDoc)
  },

  async getAllResumesAdmin() {
    const q    = query(collection(db, COL), orderBy('created_at', 'desc'))
    const snap = await getDocs(q)
    return { data: snap.docs.map(resumeFromDoc) }
  },

  async createResume(data: Omit<Resume, 'id' | 'created_at'>, userId: string) {
    const ref = await addDoc(collection(db, COL), {
      ...data,
      user_id:    userId,
      created_at: serverTimestamp(),
    })
    return { data: { id: ref.id }, error: null }
  },

  async updateResume(id: string, data: Partial<Resume>) {
    const { id: _id, created_at: _ca, ...rest } = data as any
    await updateDoc(doc(db, COL, id), rest)
    return { error: null }
  },

  async deleteResume(id: string) {
    await deleteDoc(doc(db, COL, id))
    return { error: null }
  },

  async toggleVisible(id: string, visible: boolean) {
    await updateDoc(doc(db, COL, id), { visible })
    return { error: null }
  },
}
