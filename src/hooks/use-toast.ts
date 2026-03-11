import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastStore {
    toasts: Toast[];
    show: (message: string, type?: ToastType) => void;
    remove: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],
    show: (message, type = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        set((state) => ({
            toasts: [...state.toasts, { id, message, type }]
        }));

        setTimeout(() => {
            set((state) => ({
                toasts: state.toasts.filter((t) => t.id !== id)
            }));
        }, 3000);
    },
    remove: (id) => set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
    }))
}));

export const axToast = {
    success: (msg: string) => useToastStore.getState().show(msg, 'success'),
    error: (msg: string) => useToastStore.getState().show(msg, 'error'),
    info: (msg: string) => useToastStore.getState().show(msg, 'info'),
};
