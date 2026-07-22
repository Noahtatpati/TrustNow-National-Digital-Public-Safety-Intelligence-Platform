import { create } from 'zustand'

type AlertStore = {
  activeRegion: string
  setActiveRegion: (region: string) => void
}

export const useAlertStore = create<AlertStore>((set) => ({
  activeRegion: 'All regions',
  setActiveRegion: (region) => set({ activeRegion: region }),
}))
