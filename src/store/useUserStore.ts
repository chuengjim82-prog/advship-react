import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserState {
  token: string | null
  userInfo: { name: string; avatar?: string } | null
  setToken: (token: string) => void
  setUserInfo: (userInfo: UserState['userInfo']) => void
  logout: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      token: null,
      userInfo: null,

      setToken: (token) => set({ token }),

      setUserInfo: (userInfo) => set({ userInfo }),

      logout: () => set({ token: null, userInfo: null })
    }),
    {
      name: 'user-storage'
    }
  )
)
