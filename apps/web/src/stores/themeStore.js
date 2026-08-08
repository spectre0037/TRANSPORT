import { create } from 'zustand';

const useThemeStore = create((set) => ({
  darkMode: localStorage.getItem('darkMode') === 'true',
  toggleDarkMode: () => set((s) => {
    const next = !s.darkMode;
    localStorage.setItem('darkMode', next);
    return { darkMode: next };
  }),
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));

export default useThemeStore;
