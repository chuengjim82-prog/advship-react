import { iconMap } from '@/lib/icon-map'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

interface SidebarProps {
  collapsed: boolean
}

interface MenuItem {
  key: string
  icon: string
  label: string
  path?: string
  children?: MenuItem[]
}

export default function Sidebar({ collapsed }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()

  // Expanded submenu state (parent menu keys)
  const [expandedKeys, setExpandedKeys] = useState<string[]>(['basic', 'partner', 'port', 'order', 'system'])

  const menuItems: MenuItem[] = [
    {
      key: '/home',
      icon: 'HomeOutlined',
      label: t('menu.home'),
      path: '/home',
    },
    {
      key: 'basic',
      icon: 'FolderOutlined',
      label: t('menu.basicData'),
      children: [
        { key: '/basic/country', icon: 'EnvironmentOutlined', label: t('menu.country'), path: '/basic/country' },
        { key: '/basic/city', icon: 'BankOutlined', label: t('menu.city'), path: '/basic/city' },
        { key: '/basic/currency', icon: 'DollarOutlined', label: t('menu.currency'), path: '/basic/currency' },
        { key: '/basic/service', icon: 'CustomerServiceOutlined', label: t('menu.service'), path: '/basic/service' },
        { key: '/basic/serviceAttn', icon: 'FileProtectOutlined', label: t('menu.serviceAttn'), path: '/basic/serviceAttn' },
        { key: '/basic/feeType', icon: 'TagsOutlined', label: t('menu.feeType'), path: '/basic/feeType' },
        { key: '/basic/feeItem', icon: 'ReceiptOutlined', label: t('menu.feeItem'), path: '/basic/feeItem' },
        { key: '/basic/bankAccountO', icon: 'LandmarkOutlined', label: t('menu.bankAccountO'), path: '/basic/bankAccountO' },
        { key: '/basic/bankAccountT', icon: 'LandmarkOutlined', label: t('menu.bankAccountT'), path: '/basic/bankAccountT' },
      ],
    },
    {
      key: 'partner',
      icon: 'UserOutlined',
      label: t('menu.partnerManagement'),
      children: [
        { key: '/partner/customer', icon: 'TeamOutlined', label: t('menu.customer'), path: '/partner/customer' },
        { key: '/partner/csReceiver', icon: 'ContactsOutlined', label: t('menu.csReceiver'), path: '/partner/csReceiver' },
        { key: '/partner/csShipper', icon: 'ContactsOutlined', label: t('menu.csShipper'), path: '/partner/csShipper' },
        { key: '/partner/csConsignee', icon: 'BankOutlined', label: t('menu.csConsignee'), path: '/partner/csConsignee' },
        { key: '/partner/supplier', icon: 'ShopOutlined', label: t('menu.supplier'), path: '/partner/supplier' },
        { key: '/partner/shipping', icon: 'RocketOutlined', label: t('menu.shipping'), path: '/partner/shipping' },
        { key: '/partner/cust-agent', icon: 'ContactsOutlined', label: t('menu.custAgent'), path: '/partner/cust-agent' },
      ],
    },
    {
      key: 'port',
      icon: 'GlobalOutlined',
      label: t('menu.portCustoms'),
      children: [
        { key: '/port/customs', icon: 'SafetyOutlined', label: t('menu.customs'), path: '/port/customs' },
        { key: '/port/cust-port', icon: 'CompassOutlined', label: t('menu.custPort'), path: '/port/cust-port' },
      ],
    },
    {
      key: 'order',
      icon: 'FileDoneOutlined',
      label: t('menu.orderManagement'),
      children: [
        { key: '/order/base-info', icon: 'UnorderedListOutlined', label: t('menu.orderList'), path: '/order/base-info' },
        { key: '/clearance/clearance-list', icon: 'UnorderedListOutlined', label: t('menu.clearanceList'), path: '/clearance/clearance-list' },
        { key: '/delivery/delivery-list', icon: 'UnorderedListOutlined', label: t('menu.deliveryList'), path: '/delivery/delivery-list' },
      ],
    },
    {
      key: 'system',
      icon: 'ToolOutlined',
      label: t('menu.systemTools'),
      children: [{ key: '/code-generator', icon: 'SettingOutlined', label: t('menu.codeGenerator'), path: '/code-generator' }],
    },
  ]

  const toggleExpand = (key: string) => {
    if (expandedKeys.includes(key)) {
      setExpandedKeys(expandedKeys.filter((k) => k !== key))
    } else {
      setExpandedKeys([...expandedKeys, key])
    }
  }

  const handleMenuClick = (path: string) => {
    navigate(path)
  }

  const renderMenuItem = (item: MenuItem) => {
    const Icon = iconMap[item.icon]
    const isActive = location.pathname === item.path
    const isExpanded = expandedKeys.includes(item.key)
    const hasChildren = item.children && item.children.length > 0

    if (hasChildren) {
      return (
        <div key={item.key}>
          {/* Parent menu item */}
          <div
            className="flex h-10 cursor-pointer items-center gap-3 px-4 text-[#bfcbd9] transition-colors hover:bg-[#263445]"
            onClick={() => !collapsed && toggleExpand(item.key)}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 text-sm">{item.label}</span>
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </>
            )}
          </div>

          {/* Submenu items */}
          {!collapsed && isExpanded && (
            <div className="bg-[#1f2d3d]">
              {item.children!.map((child) => {
                const ChildIcon = iconMap[child.icon]
                const isChildActive = location.pathname === child.path
                return (
                  <div
                    key={child.key}
                    className={`flex h-10 cursor-pointer items-center gap-3 pl-12 pr-4 text-sm transition-colors hover:bg-[#263445] ${isChildActive ? 'bg-[#263445] text-[#409eff]' : 'text-[#bfcbd9]'
                      }`}
                    onClick={() => child.path && handleMenuClick(child.path)}
                  >
                    <ChildIcon className="h-4 w-4 shrink-0" />
                    <span>{child.label}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )
    }

    // Leaf menu item
    return (
      <div
        key={item.key}
        className={`flex h-10 cursor-pointer items-center gap-3 px-4 transition-colors hover:bg-[#263445] ${isActive ? 'bg-[#263445] text-[#409eff]' : 'text-[#bfcbd9]'
          }`}
        onClick={() => item.path && handleMenuClick(item.path)}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {!collapsed && <span className="text-sm">{item.label}</span>}
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-sidebar">
      {/* Logo */}
      <div className="flex h-[60px] shrink-0 items-center justify-center bg-[#2b3649] px-3">
        <img src="/8459af27e5bd32253f9b7c65dfc069b8.png" alt="logo" className="max-h-[56px] w-full max-w-[230px] object-contain" />
        {/* {!collapsed && <span className="ml-3 text-lg font-bold text-white">AdvShip11</span>} */}
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/15 hover:scrollbar-thumb-white/25">
        {menuItems.map((item) => renderMenuItem(item))}
      </nav>
    </div>
  )
}
