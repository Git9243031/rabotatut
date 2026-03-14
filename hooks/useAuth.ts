import { useAppSelector } from './useAppDispatch'
export function useAuth() {
  const { user, loading } = useAppSelector(s => s.auth)
  return { user, loading, isAdmin: user?.role === 'admin', isHR: user?.role === 'hr', isCandidate: user?.role === 'candidate' }
}
