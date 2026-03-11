'use client';

import React from 'react';
import { 
    X, Ban, Phone, MessageSquare, MapPin, ShoppingBag, 
    AlertTriangle, StickyNote, Save, Loader2, CheckCircle2 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AX_Customer, AX_CustomerOrder } from '../types';

interface AX_CustomerProfileProps {
    customer: AX_Customer | null;
    orders: AX_CustomerOrder[];
    ordersLoading: boolean;
    onClose: () => void;
    blockReason: string;
    onBlockReasonChange: (val: string) => void;
    notes: string;
    onNotesChange: (val: string) => void;
    onToggleBlock: () => void;
    onSaveNotes: () => void;
    saving: boolean;
}

export const AX_CustomerProfile = ({ 
    customer, orders, ordersLoading, onClose, blockReason, onBlockReasonChange, 
    notes, onNotesChange, onToggleBlock, onSaveNotes, saving 
}: AX_CustomerProfileProps) => {
    if (!customer) {
        return (
            <div className="h-full flex items-center justify-center py-24 bg-secondary/10 border-2 border-dashed border-border rounded-3xl group transition-all duration-500">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto border border-border group-hover:scale-110 transition-transform">
                        <ShoppingBag size={28} className="text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-muted-foreground/40 text-xs font-black uppercase tracking-widest italic tracking-[0.2em]">اختر عميل لعرض بروفايل الكنز</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-in slide-in-from-left-3 duration-500 transition-colors duration-300">
            <div className={cn(
                "p-5 rounded-2xl border transition-all duration-500",
                customer.is_blocked ? "bg-destructive/5 border-destructive/20" : "bg-primary/5 border-primary shadow-sm"
            )}>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg",
                            customer.is_blocked 
                            ? "bg-destructive/10 text-destructive border border-destructive/20" 
                            : "bg-primary text-primary-foreground border border-primary"
                        )}>
                            {customer.is_blocked ? <Ban size={24} /> : (customer.name?.[0] || '?').toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-foreground tracking-tighter uppercase">{customer.name || 'بدون اسم'}</h2>
                            {customer.is_blocked && (
                                <span className="text-[10px] text-destructive font-black bg-destructive/10 px-2 py-0.5 rounded-full border border-destructive/10 mt-1 inline-block">محظور من الكنز</span>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-muted-foreground/30 hover:text-foreground hover:bg-secondary rounded-xl transition-all active:scale-90">
                        <X size={20} />
                    </button>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <InfoChip icon={<Phone size={14} />} label={customer.phone} color="primary" />
                    {customer.phone2 && <InfoChip icon={<Phone size={14} />} label={customer.phone2} />}
                    {customer.whatsapp && <InfoChip icon={<MessageSquare size={14} className="text-emerald-500" />} label={customer.whatsapp} color="emerald" />}
                    {customer.address && <InfoChip icon={<MapPin size={14} />} label={customer.address} className="col-span-2 border-primary/20 bg-primary/5" />}
                    <InfoChip icon={<ShoppingBag size={14} />} label={`${customer.total_orders} طلب`} color="amber" />
                </div>
            </div>

            <div className="bg-secondary/20 border border-border rounded-2xl p-4 space-y-4 shadow-sm">
                <h3 className="text-[10px] font-black text-foreground flex items-center gap-2 uppercase tracking-widest">
                    <Ban size={14} className="text-destructive" /> إدارة الحظر
                </h3>
                {!customer.is_blocked && (
                    <input
                        value={blockReason}
                        onChange={e => onBlockReasonChange(e.target.value)}
                        placeholder="سبب حظر هذا العميل (إجباري في حال الحظر)..."
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder-muted-foreground/40 outline-none focus:border-destructive/40 transition-all font-bold shadow-inner"
                    />
                )}
                {customer.is_blocked && customer.block_reason && (
                    <div className="flex items-start gap-2 p-3 bg-destructive/5 border border-destructive/10 rounded-xl animate-pulse shadow-inner">
                        <AlertTriangle size={14} className="text-destructive mt-0.5 shrink-0" />
                        <p className="text-xs text-destructive font-black leading-tight italic">السبب: {customer.block_reason}</p>
                    </div>
                )}
                <button
                    onClick={onToggleBlock}
                    disabled={saving}
                    className={cn(
                        "w-full py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-md",
                        customer.is_blocked
                        ? "bg-emerald-500 text-white hover:bg-emerald-600"
                        : "bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive/20"
                    )}
                >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : customer.is_blocked ? <><CheckCircle2 size={16} /> رفع حظر العميل</> : <><Ban size={16} /> تأكيد الحظر</>}
                </button>
            </div>

            <div className="bg-secondary/20 border border-border rounded-3xl p-5 space-y-4 shadow-sm">
                <h3 className="text-[10px] font-black text-foreground flex items-center gap-2 uppercase tracking-widest">
                    <StickyNote size={14} className="text-primary" /> ملاحظات الإدارة الخاصة
                </h3>
                <textarea
                    value={notes}
                    onChange={e => onNotesChange(e.target.value)}
                    placeholder="اكتب أي ملاحظات سرية عن هذا العميل — لن تظهر إلا لفريق العمل..."
                    rows={4}
                    className="w-full bg-background border border-border rounded-2xl px-4 py-4 text-sm text-foreground placeholder-muted-foreground/30 outline-none focus:border-primary/50 transition-all font-bold shadow-inner resize-none"
                />
                <button
                    onClick={onSaveNotes}
                    disabled={saving}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-2xl text-xs font-black flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-95 shadow-md"
                >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <><Save size={14} /> حفظ الملاحظات السرية</>}
                </button>
            </div>

            <div className="bg-secondary/40 border border-border rounded-3xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-secondary/30">
                    <div className="flex items-center gap-2">
                        <ShoppingBag size={14} className="text-primary" />
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] italic">سجل تاريخ الطلبات</span>
                    </div>
                </div>
                {ordersLoading ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                        <span className="text-[10px] font-black text-muted-foreground/50">جاري تحميل السجل...</span>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground/30 text-xs font-black uppercase tracking-widest italic">لا توجد طلبات سابقة لهذا العميل</div>
                ) : (
                    <div className="divide-y divide-border/50 max-h-80 overflow-y-auto custom-scrollbar">
                        {orders.map((o) => (
                            <div key={o.id} className="flex items-center justify-between px-5 py-4 hover:bg-primary/5 transition-colors group">
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-foreground group-hover:text-primary transition-colors">
                                        {new Date(o.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground/50 font-black uppercase tracking-widest">{o.payment_method}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-black text-primary bg-primary/5 px-2 py-1 rounded-lg border border-primary/10 shadow-sm">{o.total_amount} ج.م</span>
                                    <span className={cn(
                                        "text-[9px] font-black px-2.5 py-1 rounded-full border shadow-sm",
                                        o.status === 'delivered' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : 
                                        o.status === 'pending' ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : 
                                        "bg-secondary text-muted-foreground/50 border-border"
                                    )}>
                                        {o.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const InfoChip = ({ icon, label, full = false, color = "secondary", className }: { icon: React.ReactNode; label: string; full?: boolean; color?: string; className?: string }) => {
    const colors: Record<string, string> = {
        primary: "bg-primary/5 text-primary border-primary/20",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
        amber: "bg-amber-50 text-amber-600 border-amber-200",
        secondary: "bg-secondary/40 text-foreground border-border",
    };
    return (
        <div className={cn(
            "flex items-center gap-3 border rounded-xl px-4 py-2.5 shadow-sm transition-all hover:scale-[1.02] active:scale-95",
            colors[color] || colors.secondary,
            full && "sm:col-span-2",
            className
        )}>
            <span className="shrink-0 transition-transform group-hover:scale-110">{icon}</span>
            <span className="text-xs font-black truncate tracking-tighter">{label}</span>
        </div>
    );
};
