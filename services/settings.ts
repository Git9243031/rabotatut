import { doc, onSnapshot, getDoc } from 'firebase/firestore'
import { db }               from '@/lib/firebaseClient'
import { settingsFromDoc }  from '@/lib/converters'
import type { Settings }    from '@/types'

export function subscribeToSettings(callback: (s: Settings) => void): () => void {
  const ref = doc(db, 'settings', 'main')
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) callback(settingsFromDoc(snap))
  })
}

export async function getSettings(): Promise<Settings | null> {
  const snap = await getDoc(doc(db, 'settings', 'main'))
  if (!snap.exists()) return null
  return settingsFromDoc(snap)
}
