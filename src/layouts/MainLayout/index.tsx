// React import removed
import { Outlet } from 'react-router-dom'
import { Layout } from 'antd'
import { useAppStore } from '@/store'
import Sidebar from './Sidebar'
import Header from './Header'
import './index.css'

const { Content } = Layout

export default function MainLayout() {
  const { sidebarCollapsed, toggleSidebar } = useAppStore()

  return (
    <Layout className="main-layout">
      <Layout.Sider
        width={220}
        collapsedWidth={64}
        collapsed={sidebarCollapsed}
        trigger={null}
        className="main-sider"
      >
        <Sidebar collapsed={sidebarCollapsed} />
      </Layout.Sider>
      <Layout>
        <Layout.Header className="main-header">
          <Header collapsed={sidebarCollapsed} onToggleCollapse={toggleSidebar} />
        </Layout.Header>
        <Content className="main-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
