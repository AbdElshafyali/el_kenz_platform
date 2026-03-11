import React from 'react';
import { Clock, Package, Truck, CheckCircle2, XCircle } from 'lucide-react';

export const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    pending: { label: 'قيد الانتظار', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20', icon: <Clock size={12} /> },
    processing: { label: 'جاري التجهيز', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', icon: <Package size={12} /> },
    shipped: { label: 'تم الشحن', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20', icon: <Truck size={12} /> },
    delivered: { label: 'تم التوصيل', color: 'text-green-500', bg: 'bg-green-500/10 border-green-500/20', icon: <CheckCircle2 size={12} /> },
    cancelled: { label: 'ملغي', color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20', icon: <XCircle size={12} /> },
};

export const NEXT_STATUSES: Record<string, string[]> = {
    pending: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered', 'cancelled'],
    delivered: [],
    cancelled: [],
};
