'use client'
import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc }        from 'firebase/firestore'
import { auth, db }           from '@/lib/firebaseClient'
import { useAppDispatch }     from '@/hooks/useAppDispatch'
import { setUser, setLoading } from '@/store/slices/authSlice'

// Конвертируем Firestore Timestamp → ISO string для Redux
function toSerializable(data: any) {
  const result: any = {}
  for (const key in data) {
    const val = data[key]
    // Firestore Timestamp имеет метод toDate()
    if (val && typeof val.toDate === 'function') {
      result[key] = val.toDate().toISOString()
    } else {
      result[key] = val
    }
  }
  return result
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(setLoading(true))

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const snap = await getDoc(doc(db, 'users', firebaseUser.uid))
        if (snap.exists()) {
          dispatch(setUser({
            id: snap.id,
            ...toSerializable(snap.data()),
          } as any))
        } else {
          dispatch(setUser({
            id:         firebaseUser.uid,
            email:      firebaseUser.email ?? '',
            role:       'candidate',
            created_at: new Date().toISOString(),
          }))
        }
      } else {
        dispatch(setUser(null))
      }
    })

    return () => unsubscribe()
  }, [dispatch])

  return <>{children}</>
}
