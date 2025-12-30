import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'

interface AuthGuardProps {
  children: ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const location = useLocation()
  const token = localStorage.getItem('token')

  // 未登录则跳转到登录页，保存当前路径用于登录后跳转
  if (!token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return <>{children}</>
}
