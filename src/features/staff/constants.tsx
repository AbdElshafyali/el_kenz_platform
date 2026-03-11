import React from 'react';
import { ClipboardCheck, Package, Truck } from 'lucide-react';

export const ROLES = [
    { id: 'confirm', label: 'مؤكد طلبات', icon: <ClipboardCheck size={13} />, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' },
    { id: 'prepare', label: 'مجهز طلبات', icon: <Package size={13} />, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' },
    { id: 'deliver', label: 'مستلم/مندوب', icon: <Truck size={13} />, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' },
];
