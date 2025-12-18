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

const loginSchema = z.object({
  username: z.string().min(1, '请输入用户名'),
  password: z.string().min(1, '请输入密码'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function Login() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

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
          <CardDescription>请输入您的账号密码登录</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>用户名</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入用户名" {...field} />
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
                      <Input type="password" placeholder="请输入密码" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '登录中...' : '登录'}
              </Button>
            </form>
          </Form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">或</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleDemoLogin}
            disabled={loading}
          >
            {loading ? "登录中..." : "一键演示登录（admin）"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
