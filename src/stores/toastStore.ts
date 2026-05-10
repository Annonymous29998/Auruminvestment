import { create } from 'zustand'

export type ToastTone = 'neutral' | 'success' | 'warning' | 'danger'

export type ToastItem = {
  id: string
  title: string
  message?: string
  tone: ToastTone
  createdAt: number
}

type ToastState = {
  items: ToastItem[]
  push: (item: Omit<ToastItem, 'id' | 'createdAt'>) => void
  remove: (id: string) => void
  clear: () => void
}

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16)
}

export const useToastStore = create<ToastState>((set) => ({
  items: [],
  /** Replaces any visible toast so only one shows at a time (no stacking). */
  push: (item) =>
    set(() => ({
      items: [{ ...item, id: uid(), createdAt: Date.now() }],
    })),
  remove: (id) => set((s) => ({ items: s.items.filter((t) => t.id !== id) })),
  clear: () => set({ items: [] }),
}))

