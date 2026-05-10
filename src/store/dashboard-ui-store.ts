import { create } from "zustand";

type DashboardUiState = {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
};

/** حالة واجهة لوحة التحكم (قائمة الجوال — يمكن توسيعها لفلاتر أو لوحات أخرى). */
export const useDashboardUiStore = create<DashboardUiState>((set) => ({
  mobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  toggleMobileMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
}));
