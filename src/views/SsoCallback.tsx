import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Loading } from '@/components/ui/spinner'
import { ssoApi } from '@/api/sso'

export default function SsoCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const isProcessing = useRef(false)

  useEffect(() => {
    const handleCallback = async () => {
      // 防止 React StrictMode 下重复调用
      if (isProcessing.current) {
        return
      }
      isProcessing.current = true

      const code = searchParams.get('code')
      const state = searchParams.get('state')

      if (!code || !state) {
        setError('缺少授权码或状态参数')
        toast.error('SSO 登录失败：缺少必要参数')
        setTimeout(() => navigate('/login'), 2000)
        return
      }

      try {
        // 用授权码换取 Token
        const result = await ssoApi.callback({ code, state })

        if (result.data?.accessToken) {
          // 保存 Token 和用户信息到 localStorage
          localStorage.setItem('token', result.data.accessToken)

          if (result.data.userInfo) {
            localStorage.setItem('userInfo', JSON.stringify(result.data.userInfo))
          }

          toast.success('SSO 登录成功')
          navigate('/home')
        } else {
          throw new Error('获取令牌失败')
        }
      } catch (err: any) {
        const errorMsg = err.message || 'SSO 登录失败'
        setError(errorMsg)
        toast.error(errorMsg)
        setTimeout(() => navigate('/login'), 2000)
      }
    }

    handleCallback()
  }, [searchParams, navigate])

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="mb-4 text-6xl">:(</div>
          <h2 className="mb-2 text-xl font-semibold text-red-600">登录失败</h2>
          <p className="text-gray-600">{error}</p>
          <p className="mt-4 text-sm text-gray-500">正在跳转到登录页面...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Loading tip="正在处理 SSO 登录..." />
    </div>
  )
}
