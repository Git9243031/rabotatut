import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { User } from '@/types'

interface AuthState { user: User | null; loading: boolean }
const initialState: AuthState = { user: null, loading: true }

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser:    (s, a: PayloadAction<User | null>) => { s.user = a.payload; s.loading = false },
    setLoading: (s, a: PayloadAction<boolean>)    => { s.loading = a.payload },
  },
})
export const { setUser, setLoading } = authSlice.actions
export default authSlice.reducer
