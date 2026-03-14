import {
  doc, getDoc, setDoc, updateDoc,
  collection, getDocs, orderBy, query,
} from 'firebase/firestore'
import { db } from '@/lib/firebaseClient'
import { settingsFromDoc, userFromDoc } from '@/lib/converters'
import type { Settings, User } from '@/types'

// Настройки хранятся в одном документе settings/main
const SETTINGS_DOC = doc(db, 'settings', 'main')

export const adminService = {

  // ── Читать настройки ─────────────────────────────────────────────
  async getSettings(): Promise<{ data: Settings | null }> {
    const snap = await getDoc(SETTINGS_DOC)
    if (!snap.exists()) return { data: null }
    return { data: settingsFromDoc(snap) }
  },

  // ── Обновить настройки ───────────────────────────────────────────
  async updateSettings(data: Partial<Settings>) {
    const { id: _id, ...rest } = data as any
    await setDoc(SETTINGS_DOC, rest, { merge: true })
    return { error: null }
  },

  // ── Все пользователи ─────────────────────────────────────────────
  async getAllUsers(): Promise<User[]> {
    const q = query(collection(db, 'users'), orderBy('created_at', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map(userFromDoc)
  },

  // ── Изменить роль пользователя ───────────────────────────────────
  async setUserRole(userId: string, role: string) {
    await updateDoc(doc(db, 'users', userId), { role })
    return { error: null }
  },

  // ── Удалить пользователя из Firestore ───────────────────────────
  // Удаление из Firebase Auth — только через Admin SDK (API route)
  async deleteUserDoc(userId: string) {
    const { deleteDoc } = await import('firebase/firestore')
    await deleteDoc(doc(db, 'users', userId))
    return { error: null }
  },
}
