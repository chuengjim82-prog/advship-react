import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu, Globe, User } from 'lucide-react'
import { useAppStore } from '@/store'
import { toast } from 'sonner'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useState, useEffect } from 'react'

interface HeaderProps {
  collapsed: boolean
  onToggleCollapse: () => void
}

export default function Header({ collapsed: _, onToggleCollapse }: HeaderProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { locale, setLocale } = useAppStore()
  const [showProfile, setShowProfile] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)

  useEffect(() => {
    // 从 localStorage 读取用户信息
    const storedUserInfo = localStorage.getItem('userInfo')
    if (storedUserInfo) {
      try {
        setUserInfo(JSON.parse(storedUserInfo))
      } catch (e) {
        console.error('Failed to parse userInfo', e)
      }
    }
  }, [])

  // 获取显示的用户名
  const displayName = userInfo?.nickName || userInfo?.userName || userInfo?.username || 'admin'

  // 退出登录
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    sessionStorage.removeItem('sso_state')
    toast.success('已退出登录')
    navigate('/login')
  }

  // Get current page title from route
  const getPageTitle = () => {
    const path = location.pathname
    const routeMap: Record<string, string> = {
      '/home': t('menu.home'),
      '/basic/country': t('menu.country'),
      '/basic/city': t('menu.city'),
      '/basic/currency': t('menu.currency'),
      '/basic/service': t('menu.service'),
      '/basic/serviceAttn': t('menu.serviceAttn'),
      '/basic/feeType': t('menu.feeType'),
      '/basic/feeItem': t('menu.feeItem'),
      '/basic/bankAccountO': t('menu.bankAccountO'),
      '/basic/bankAccountT': t('menu.bankAccountT'),
      '/partner/customer': t('menu.customer'),
      '/partner/csReceiver': t('menu.csReceiver'),
      '/partner/shipper': t('menu.csShipper'),
      '/partner/consignee': t('menu.csConsignee'),
      '/partner/supplier': t('menu.supplier'),
      '/partner/shipping': t('menu.shipping'),
      '/partner/cust-agent': t('menu.custAgent'),
      '/partner/trans-agent': t('menu.transAgent'),
      '/port/customs': t('menu.customs'),
      '/port/cust-port': t('menu.custPort'),
      '/order/base-info': t('menu.orderList'),
      '/code-generator': t('menu.codeGenerator')
    }
    return routeMap[path] || ''
  }

  const currentLanguage = locale === 'zh-CN' ? '中文' : 'EN'

  return (
    <div className="flex h-full items-center justify-between bg-white px-4 shadow-sm">
      {/* Left side */}
      <div className="flex items-center gap-4">
        {/* Collapse button */}
        <button
          onClick={onToggleCollapse}
          className="flex items-center justify-center p-1 text-xl transition-colors hover:text-primary"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                asChild
                className="cursor-pointer"
                onClick={() => navigate('/home')}
              >
                <span>{t('menu.home')}</span>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{getPageTitle()}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Language selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1 rounded px-2 py-1 transition-colors hover:bg-muted">
              <Globe className="h-4 w-4" />
              <span className="text-sm">{currentLanguage}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setLocale('zh-CN')}>
              {t('language.zhCn')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLocale('en-US')}>
              {t('language.enUs')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded px-2 py-1 transition-colors hover:bg-muted">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{displayName}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowProfile(true)}>
              {t('user.profile')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
              {t('user.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 个人中心对话框 */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('user.profile')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{displayName}</h3>
                {userInfo?.email && (
                  <p className="text-sm text-muted-foreground">{userInfo.email}</p>
                )}
              </div>
            </div>
            <div className="space-y-2 text-sm">
              {userInfo?.userId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">用户ID:</span>
                  <span>{userInfo.userId}</span>
                </div>
              )}
              {userInfo?.userName && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">用户名:</span>
                  <span>{userInfo.userName}</span>
                </div>
              )}
              {userInfo?.phone && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">手机号:</span>
                  <span>{userInfo.phone}</span>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
