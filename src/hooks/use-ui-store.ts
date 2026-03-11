import { create } from 'zustand';

interface UIStore {
    isModalOpen: boolean;
    activeModals: number;
    openModal: () => void;
    closeModal: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
    isModalOpen: false,
    activeModals: 0,
    openModal: () => set((state) => ({ 
        activeModals: state.activeModals + 1,
        isModalOpen: true 
    })),
    closeModal: () => set((state) => ({ 
        activeModals: Math.max(0, state.activeModals - 1),
        isModalOpen: Math.max(0, state.activeModals - 1) > 0 
    })),
}));
