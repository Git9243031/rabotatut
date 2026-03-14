import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebaseClient'
import { settingsFromDoc } from '@/lib/converters'
import type { Settings } from '@/types'

// Аналог supabase.channel('hero-realtime').on('postgres_changes', ...)
// Возвращает unsubscribe-функцию — вызвать в useEffect cleanup
export function subscribeToSettings(callback: (s: Settings) => void): () => void {
  const ref = doc(db, 'settings', 'main')
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) callback(settingsFromDoc(snap))
  })
}
