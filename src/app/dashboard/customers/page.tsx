'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Users } from 'lucide-react';
import { AX_DataService } from '@/services/data-service';
import { axToast } from '@/hooks/use-toast';
import { AX_Customer, AX_CustomerOrder } from '@/features/customers/types';
import { AX_CustomerList } from '@/features/customers/components/AX_CustomerList';
import { AX_CustomerProfile } from '@/features/customers/components/AX_CustomerProfile';

export default function CustomersPage() {
    const [customers, setCustomers] = useState<AX_Customer[]>([]);
    const [filtered, setFiltered] = useState<AX_Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<AX_Customer | null>(null);
    const [orders, setOrders] = useState<AX_CustomerOrder[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [blockReason, setBlockReason] = useState('');
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);
    const [filter, setFilter] = useState<'all' | 'blocked'>('all');

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const store = await AX_DataService.getMyStore();
            if (!store) return;
            const data = await AX_DataService.getCustomers(store.id);
            setCustomers(data);
            setFiltered(data);
        } catch (e) {
            axToast.error('فشل تحميل العملاء');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    useEffect(() => {
        let list = customers;
        if (filter === 'blocked') list = list.filter(c => c.is_blocked);
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(c =>
                c.name?.toLowerCase().includes(q) ||
                c.phone?.includes(q) ||
                c.city?.toLowerCase().includes(q)
            );
        }
        setFiltered(list);
    }, [search, filter, customers]);

    const openProfile = async (c: AX_Customer) => {
        setSelected(c);
        setBlockReason(c.block_reason || '');
        setNotes(c.admin_notes || '');
        setOrdersLoading(true);
        try {
            const store = await AX_DataService.getMyStore();
            if (!store) return;
            const data = await AX_DataService.getCustomerOrders(store.id, c.phone);
            setOrders(data);
        } catch {
            axToast.error('فشل تحميل سجل الطلبات');
        } finally { setOrdersLoading(false); }
    };

    const handleToggleBlock = async () => {
        if (!selected) return;
        if (!selected.is_blocked && !blockReason.trim()) {
            axToast.error('يرجى كتابة سبب الحظر');
            return;
        }
        setSaving(true);
        try {
            await AX_DataService.updateCustomer(selected.id, {
                is_blocked: !selected.is_blocked,
                block_reason: !selected.is_blocked ? blockReason : null,
            });
            axToast.success(selected.is_blocked ? 'تم رفع الحظر بنجاح' : 'تم حظر العميل بنجاح');
            const updated = { ...selected, is_blocked: !selected.is_blocked, block_reason: !selected.is_blocked ? blockReason : undefined };
            setSelected(updated);
            setCustomers(prev => prev.map(c => c.id === updated.id ? updated : c));
        } catch { axToast.error('فشل التحديث'); }
        finally { setSaving(false); }
    };

    const handleSaveNotes = async () => {
        if (!selected) return;
        setSaving(true);
        try {
            await AX_DataService.updateCustomer(selected.id, { admin_notes: notes });
            axToast.success('تم حفظ الملاحظات السرية بنجاح');
            const updated = { ...selected, admin_notes: notes };
            setSelected(updated);
            setCustomers(prev => prev.map(c => c.id === updated.id ? updated : c));
        } catch { axToast.error('فشل حفظ الملاحظات'); }
        finally { setSaving(false); }
    };

    return (
        <div className="p-4 md:p-10 space-y-10 max-w-[1600px] mx-auto min-h-screen transition-colors duration-300" dir="rtl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
                <div className="space-y-1">
                    <h1 className="text-3xl md:text-4xl font-black text-foreground flex items-center gap-4 transition-colors tracking-tighter uppercase">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
                            <Users size={24} className="text-primary" />
                        </div>
                        إدارة عملاء الكنز
                    </h1>
                    <p className="text-muted-foreground text-[11px] md:text-sm font-black uppercase tracking-widest italic opacity-60">تتبع، حظر، وملاحظات — السيطرة الكاملة على العملاء.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-4 space-y-6">
                    <AX_CustomerList 
                        customers={customers} 
                        loading={loading} 
                        search={search} 
                        onSearchChange={setSearch} 
                        filter={filter} 
                        onFilterChange={setFilter} 
                        selectedId={selected?.id} 
                        onSelect={openProfile} 
                    />
                </div>

                <div className="lg:col-span-8">
                    <AX_CustomerProfile 
                        customer={selected} 
                        orders={orders} 
                        ordersLoading={ordersLoading} 
                        onClose={() => setSelected(null)} 
                        blockReason={blockReason} 
                        onBlockReasonChange={setBlockReason} 
                        notes={notes} 
                        onNotesChange={setNotes} 
                        onToggleBlock={handleToggleBlock} 
                        onSaveNotes={handleSaveNotes} 
                        saving={saving} 
                    />
                </div>
            </div>
        </div>
    );
}
