import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu, Globe, User } from 'lucide-react'
import { useAppStore } from '@/store'
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface HeaderProps {
  collapsed: boolean
  onToggleCollapse: () => void
}

export default function Header({ collapsed: _, onToggleCollapse }: HeaderProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { locale, setLocale } = useAppStore()

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
              <span className="text-sm">{t('user.admin')}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>{t('user.profile')}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              {t('user.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
