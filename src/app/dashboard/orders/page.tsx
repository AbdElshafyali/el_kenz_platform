'use client';

import React, { useEffect, useState } from 'react';
import { Package } from 'lucide-react';
import { AX_DataService } from '@/services/data-service';
import { axToast } from '@/hooks/use-toast';
import { AX_Order, AX_Staff } from '@/features/orders/types';
import { STATUS_MAP } from '@/features/orders/constants';
import { AX_OrderCard } from '@/features/orders/components/AX_OrderCard';
import { AX_OrdersHeader } from '@/features/orders/components/AX_OrdersHeader';
import { AX_OrdersFilters } from '@/features/orders/components/AX_OrdersFilters';
import { AX_OrdersSkeleton } from '@/features/orders/components/AX_OrdersSkeleton';

export default function OrdersPage() {
    const [orders, setOrders] = useState<AX_Order[]>([]);
    const [staff, setStaff] = useState<AX_Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [updating, setUpdating] = useState<string | null>(null);
    const [storeId, setStoreId] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            try {
                const store = await AX_DataService.getStore();
                if (!store?.id) return;
                setStoreId(store.id);
                const [data, staffData] = await Promise.all([
                    AX_DataService.getOrders(store.id),
                    AX_DataService.getStaff(store.id),
                ]);
                setOrders(data);
                setStaff(staffData);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    useEffect(() => {
        if (!storeId) return;
        const sub = AX_DataService.subscribeToOrders(storeId, async () => {
            const data = await AX_DataService.getOrders(storeId);
            setOrders(data);
        });
        return () => {
            sub.unsubscribe();
        };
    }, [storeId]);

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        setUpdating(orderId);
        try {
            await AX_DataService.updateOrderStatus(orderId, newStatus);
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            axToast.success('تم تحديث حالة الطلب');
        } catch {
            axToast.error('فشل تحديث الطلب');
        } finally {
            setUpdating(null);
        }
    };

    const handleAssign = async (orderId: string, field: string, staffId: string | null) => {
        try {
            const ts = field.replace('_by', '_at');
            const updates: any = { [field]: staffId };
            if (staffId) updates[ts] = new Date().toISOString();
            await AX_DataService.updateOrderAssignment(orderId, updates);
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o));
        } catch {
            axToast.error('فشل التعيين');
        }
    };

    const handleUpdateField = async (orderId: string, field: string, value: any) => {
        try {
            await AX_DataService.updateOrderAssignment(orderId, { [field]: value });
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, [field]: value } : o));
            axToast.success('تم الحفظ بنجاح');
        } catch {
            axToast.error('فشل الحفظ');
        }
    };

    const filtered = orders.filter(o => {
        const matchSearch =
            o.id.slice(0, 8).toUpperCase().includes(searchQuery.toUpperCase()) ||
            (o.customer_name || '').includes(searchQuery) ||
            (o.customer_phone || '').includes(searchQuery);
        const matchStatus = filterStatus === 'all' || o.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const counts = Object.keys(STATUS_MAP).reduce((acc, key) => {
        acc[key] = orders.filter(o => o.status === key).length;
        return acc;
    }, {} as Record<string, number>);

    if (loading) return <AX_OrdersSkeleton />;

    return (
        <div className="p-4 md:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500 max-w-[1400px] mx-auto min-h-screen transition-colors duration-300">
            <AX_OrdersHeader 
                total={orders.length} 
                searchQuery={searchQuery} 
                onSearchChange={setSearchQuery} 
            />

            <AX_OrdersFilters 
                currentStatus={filterStatus} 
                onStatusChange={setFilterStatus} 
                counts={counts} 
                total={orders.length} 
            />

            <div className="space-y-4">
                {filtered.length === 0 ? (
                    <div className="py-32 text-center border-2 border-dashed border-border rounded-[2.5rem] bg-secondary/10 flex flex-col items-center justify-center gap-4 group transition-colors hover:border-primary/20">
                        <Package size={64} className="text-muted-foreground/20 group-hover:text-primary/20 transition-colors" />
                        <p className="font-black text-xl text-muted-foreground/40 tracking-tighter uppercase">لا توجد طلبات تطابق بحثك</p>
                    </div>
                ) : (
                    filtered.map(order => (
                        <AX_OrderCard
                            key={order.id}
                            order={order}
                            staff={staff}
                            expanded={expandedId === order.id}
                            onToggle={() => setExpandedId(expandedId === order.id ? null : order.id)}
                            onStatusUpdate={handleStatusUpdate}
                            onAssign={handleAssign}
                            onUpdateField={handleUpdateField}
                            updating={updating === order.id}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
