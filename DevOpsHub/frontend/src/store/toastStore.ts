import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'info';

interface ToastState {
  message: string | null;
  type: ToastType;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  type: 'info',
  showToast: (message, type = 'info') => {
    set({ message, type });
    // Auto-hide after 3 seconds
    setTimeout(() => {
      set((state) => (state.message === message ? { message: null } : state));
    }, 3000);
  },
  hideToast: () => set({ message: null }),
}));
