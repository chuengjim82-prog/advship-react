// React import removed
import { useLocation, useNavigate } from 'react-router-dom'
import { Breadcrumb, Dropdown, Avatar } from 'antd'
import type { MenuProps } from 'antd'
import { useTranslation } from 'react-i18next'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  GlobalOutlined,
  UserOutlined
} from '@ant-design/icons'
import { useAppStore } from '@/store'
import './Header.css'

interface HeaderProps {
  collapsed: boolean
  onToggleCollapse: () => void
}

export default function Header({ collapsed, onToggleCollapse }: HeaderProps) {
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
      '/basic/feeType': t('menu.feeType'),
      '/basic/feeItem': t('menu.feeItem'),
      '/partner/customer': t('menu.customer'),
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

  const languageMenuItems: MenuProps['items'] = [
    {
      key: 'zh-CN',
      label: t('language.zhCn'),
      onClick: () => setLocale('zh-CN')
    },
    {
      key: 'en-US',
      label: t('language.enUs'),
      onClick: () => setLocale('en-US')
    }
  ]

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: t('user.profile')
    },
    {
      key: 'logout',
      label: t('user.logout'),
      danger: true
    }
  ]

  return (
    <div className="header">
      <div className="header-left">
        <div className="collapse-btn" onClick={onToggleCollapse}>
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </div>
        <Breadcrumb
          items={[
            {
              title: t('menu.home'),
              onClick: () => navigate('/home')
            },
            {
              title: getPageTitle()
            }
          ]}
        />
      </div>
      <div className="header-right">
        <Dropdown menu={{ items: languageMenuItems }} placement="bottomRight">
          <div className="language-btn">
            <GlobalOutlined />
            <span>{currentLanguage}</span>
          </div>
        </Dropdown>
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <div className="user-dropdown">
            <Avatar size={32} icon={<UserOutlined />} />
            <span className="username">{t('user.admin')}</span>
          </div>
        </Dropdown>
      </div>
    </div>
  )
}
