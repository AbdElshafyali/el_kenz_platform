import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    id: string;
    product_id: string;
    name: string;
    price: number;
    image_url: string;
    quantity: number;
    is_backorder?: boolean;
    selected_color?: any;
    selected_size?: any;
}

interface CartState {
    items: CartItem[];
    addItem: (product: any, price: number, selectedColor?: any, selectedSize?: any) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    totalCount: () => number;
    totalAmount: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (product: any, price: number, selectedColor?: any, selectedSize?: any, isBackorder?: boolean) => set((state) => {
                const existingItem = state.items.find(item => item.product_id === product.id && item.is_backorder === isBackorder);
                if (existingItem) {
                    return {
                        items: state.items.map(item =>
                            (item.product_id === product.id && item.is_backorder === isBackorder)
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                        )
                    };
                }
                return {
                    items: [...state.items, {
                        id: Math.random().toString(36).substr(2, 9),
                        product_id: product.id,
                        name: product.name_ar,
                        price: price,
                        image_url: product.image_url,
                        quantity: 1,
                        is_backorder: isBackorder,
                        selected_color: selectedColor,
                        selected_size: selectedSize,
                    }]
                };
            }),
            removeItem: (productId) => set((state) => ({
                items: state.items.filter(item => item.product_id !== productId)
            })),
            updateQuantity: (productId, quantity) => set((state) => ({
                items: state.items.map(item =>
                    item.product_id === productId
                        ? { ...item, quantity: Math.max(0, quantity) }
                        : item
                ).filter(item => item.quantity > 0)
            })),
            clearCart: () => set({ items: [] }),
            totalCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
            totalAmount: () => get().items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        }),
        { name: 'ax_cart_storage' }
    )
);
