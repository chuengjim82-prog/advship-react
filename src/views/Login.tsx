import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
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
      const result = await ssoApi.getLoginUrl(window.location.origin + '/sso-callback')

      if (result.data?.authorizationUrl) {
        sessionStorage.setItem('sso_state', result.data.state)
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

  const disableAll = loading || ssoLoading

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-6">
      <section className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">AdvShip 管理系统</CardTitle>
            <CardDescription>使用账号密码登录或通过 SSO 单点登录</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>用户名</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入用户名" autoComplete="username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>密码</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="请输入密码"
                          autoComplete="current-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={disableAll}>
                  {loading ? '登录中...' : '登录'}
                </Button>
              </form>
            </Form>

            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="secondary" onClick={handleDemoLogin} disabled={disableAll}>
                演示登录
              </Button>
              <Button type="button" variant="outline" onClick={handleSsoLogin} disabled={disableAll}>
                {ssoLoading ? '跳转中...' : 'SSO 单点登录'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
