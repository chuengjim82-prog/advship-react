import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from '@/components/ui/form'
import request from '@/utils/request'
import { toast } from 'sonner'
import { ssoApi } from '@/api/sso'

const loginSchema = z.object({
  username: z.string().min(1, '请输入用户名'),
  password: z.string().min(1, '请输入密码'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function Login() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [ssoLoading, setSsoLoading] = useState(false)

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const onSubmit = async (values: LoginFormData) => {
    setLoading(true)
    try {
      const result = await request.post<{
        userId: number
        username: string
        accessToken: string
        expiresAt: string
      }>('/sso/api/Auth/login', values)

      // 保存 token 到 localStorage
      localStorage.setItem('token', result.data.accessToken)
      localStorage.setItem('userInfo', JSON.stringify(result.data))

      toast.success('登录成功')
      navigate('/home')
    } catch (error: any) {
      toast.error(error.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  // SSO 单点登录
  const handleSsoLogin = async () => {
    setSsoLoading(true)
    try {
      // 获取 SSO 登录 URL
      const result = await ssoApi.getLoginUrl(window.location.origin + '/sso-callback')

      if (result.data?.authorizationUrl) {
        // 保存 state 到 sessionStorage 用于验证
        sessionStorage.setItem('sso_state', result.data.state)
        // 跳转到 SSO 服务器登录页
        window.location.href = result.data.authorizationUrl
      } else {
        throw new Error('获取 SSO 登录地址失败')
      }
    } catch (error: any) {
      toast.error(error.message || 'SSO 登录失败')
      setSsoLoading(false)
    }
  }

  // 演示模式登录（使用默认管理员账户）
  const handleDemoLogin = async () => {
    setLoading(true)
    try {
      const result = await request.post<{
        userId: number
        username: string
        accessToken: string
        expiresAt: string
      }>('/sso/api/Auth/login', {
        username: 'admin',
        password: 'Admin@123',
      })

      localStorage.setItem('token', result.data.accessToken)
      localStorage.setItem('userInfo', JSON.stringify(result.data))

      toast.success('演示登录成功')
      navigate('/home')
    } catch (error: any) {
      toast.error(error.message || '演示登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">AdvShip 管理系统</CardTitle>
        </CardHeader>
        <CardContent>

          <div className="space-y-2">
            <Button
              type="button"
              variant="default"
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={handleSsoLogin}
              disabled={loading || ssoLoading}
            >
              {ssoLoading ? '跳转中...' : 'SSO 单点登录'}
            </Button>

          </div>
        </CardContent>
      </Card>
    </div>
  )
}
