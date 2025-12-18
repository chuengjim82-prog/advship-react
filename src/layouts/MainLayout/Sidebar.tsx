// React import removed
import { useNavigate, useLocation } from 'react-router-dom'
import { Menu } from 'antd'
import type { MenuProps } from 'antd'
import { useTranslation } from 'react-i18next'
import {
  HomeOutlined,
  FolderOutlined,
  EnvironmentOutlined,
  BankOutlined,
  DollarOutlined,
  CustomerServiceOutlined,
  UserOutlined,
  TeamOutlined,
  ShopOutlined,
  RocketOutlined,
  ContactsOutlined,
  GlobalOutlined,
  CompassOutlined,
  SafetyOutlined,
  FileDoneOutlined,
  UnorderedListOutlined,
  ToolOutlined,
  SettingOutlined,
  FileTextOutlined,
  PercentageOutlined
} from '@ant-design/icons'
import './Sidebar.css'

interface SidebarProps {
  collapsed: boolean
}

export default function Sidebar({ collapsed }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()

  const menuItems: MenuProps['items'] = [
    {
      key: '/home',
      icon: <HomeOutlined />,
      label: t('menu.home'),
      onClick: () => navigate('/home')
    },
    {
      key: 'basic',
      icon: <FolderOutlined />,
      label: t('menu.basicData'),
      children: [
        {
          key: '/basic/country',
          icon: <EnvironmentOutlined />,
          label: t('menu.country'),
          onClick: () => navigate('/basic/country')
        },
        {
          key: '/basic/city',
          icon: <BankOutlined />,
          label: t('menu.city'),
          onClick: () => navigate('/basic/city')
        },
        {
          key: '/basic/currency',
          icon: <DollarOutlined />,
          label: t('menu.currency'),
          onClick: () => navigate('/basic/currency')
        },
        {
          key: '/basic/service',
          icon: <CustomerServiceOutlined />,
          label: t('menu.service'),
          onClick: () => navigate('/basic/service')
        },
        {
          key: '/basic/feeType',
          icon: <PercentageOutlined />,
          label: t('menu.feeType'),
          onClick: () => navigate('/basic/feeType')
        },
        {
          key: '/basic/feeItem',
          icon: <FileTextOutlined />,
          label: t('menu.feeItem'),
          onClick: () => navigate('/basic/feeItem')
        }
      ]
    },
    {
      key: 'partner',
      icon: <UserOutlined />,
      label: t('menu.partnerManagement'),
      children: [
        {
          key: '/partner/customer',
          icon: <TeamOutlined />,
          label: t('menu.customer'),
          onClick: () => navigate('/partner/customer')
        },
        {
          key: '/partner/supplier',
          icon: <ShopOutlined />,
          label: t('menu.supplier'),
          onClick: () => navigate('/partner/supplier')
        },
        {
          key: '/partner/shipping',
          icon: <RocketOutlined />,
          label: t('menu.shipping'),
          onClick: () => navigate('/partner/shipping')
        },
        {
          key: '/partner/cust-agent',
          icon: <ContactsOutlined />,
          label: t('menu.custAgent'),
          onClick: () => navigate('/partner/cust-agent')
        }
      ]
    },
    {
      key: 'port',
      icon: <GlobalOutlined />,
      label: t('menu.portCustoms'),
      children: [
        {
          key: '/port/customs',
          icon: <SafetyOutlined />,
          label: t('menu.customs'),
          onClick: () => navigate('/port/customs')
        },
        {
          key: '/port/cust-port',
          icon: <CompassOutlined />,
          label: t('menu.custPort'),
          onClick: () => navigate('/port/cust-port')
        }
      ]
    },
    {
      key: 'order',
      icon: <FileDoneOutlined />,
      label: t('menu.orderManagement'),
      children: [
        {
          key: '/order/base-info',
          icon: <UnorderedListOutlined />,
          label: t('menu.orderList'),
          onClick: () => navigate('/order/base-info')
        }
      ]
    },
    {
      key: 'system',
      icon: <ToolOutlined />,
      label: t('menu.systemTools'),
      children: [
        {
          key: '/code-generator',
          icon: <SettingOutlined />,
          label: t('menu.codeGenerator'),
          onClick: () => navigate('/code-generator')
        }
      ]
    }
  ]

  return (
    <div className="sidebar">
      <div className="logo">
        <img src="/vite.svg" alt="logo" className="logo-img" />
        {!collapsed && <span className="logo-text">AdvShip</span>}
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        defaultOpenKeys={['basic', 'partner', 'port', 'order', 'system']}
        items={menuItems}
        inlineCollapsed={collapsed}
        theme="dark"
        className="sidebar-menu"
      />
    </div>
  )
}
