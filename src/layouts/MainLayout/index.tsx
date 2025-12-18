import { Outlet } from 'react-router-dom'
import { useAppStore } from '@/store'
import Sidebar from './Sidebar'
import Header from './Header'

export default function MainLayout() {
  const { sidebarCollapsed, toggleSidebar } = useAppStore()

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`bg-sidebar shrink-0 overflow-hidden transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-[220px]'
        }`}
      >
        <Sidebar collapsed={sidebarCollapsed} />
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="h-[60px] shrink-0 leading-[60px]">
          <Header collapsed={sidebarCollapsed} onToggleCollapse={toggleSidebar} />
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-[#f0f2f5] p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
