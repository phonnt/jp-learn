'use client'

import { create } from 'zustand'

interface SidebarState {
  desktopOpen: boolean
  mobileOpen: boolean
  toggleDesktop: () => void
  toggleMobile: () => void
  setMobileOpen: (open: boolean) => void
}

export const useSidebar = create<SidebarState>((set) => ({
  desktopOpen: true,
  mobileOpen: false,
  toggleDesktop: () => set((s) => ({ desktopOpen: !s.desktopOpen })),
  toggleMobile: () => set((s) => ({ mobileOpen: !s.mobileOpen })),
  setMobileOpen: (mobileOpen) => set({ mobileOpen }),
}))
