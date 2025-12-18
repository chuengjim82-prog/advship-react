import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import i18n from '@/locales'

interface AppState {
  locale: string
  sidebarCollapsed: boolean
  setLocale: (locale: string) => void
  toggleSidebar: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      locale: 'zh-CN',
      sidebarCollapsed: false,

      setLocale: (locale: string) => {
        i18n.changeLanguage(locale)
        set({ locale })
      },

      toggleSidebar: () => set((state) => ({
        sidebarCollapsed: !state.sidebarCollapsed
      }))
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        locale: state.locale,
        sidebarCollapsed: state.sidebarCollapsed
      })
    }
  )
)
