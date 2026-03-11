'use client';

import React, { useState } from 'react';
import { 
    ChevronDown, User, Phone, MessageSquare, MapPin, FileText, 
    Navigation, ShoppingBag, CreditCard, ClipboardCheck, Package, 
    Truck, UserCheck, Loader2, Clock, CheckCircle2, XCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AX_ImageUploader } from '@/components/ui/AX_ImageUploader';
import { axToast } from '@/hooks/use-toast';
import { AX_Order, AX_Staff } from '../types';
import { STATUS_MAP, NEXT_STATUSES } from '../constants';

interface AX_OrderCardProps {
    order: AX_Order;
    staff: AX_Staff[];
    expanded: boolean;
    onToggle: () => void;
    onStatusUpdate: (orderId: string, newStatus: string) => void;
    onAssign: (orderId: string, field: string, staffId: string | null) => void;
    onUpdateField: (orderId: string, field: string, value: any) => void;
    updating: boolean;
}

export const AX_OrderCard = ({ 
    order, staff, expanded, onToggle, onStatusUpdate, onAssign, onUpdateField, updating 
}: AX_OrderCardProps) => {
    const status = STATUS_MAP[order.status] || STATUS_MAP.pending;
    const nextStatuses = NEXT_STATUSES[order.status] || [];
    const items = order.items || [];

    const cm = order.confirm_method;
    const showCall = cm === 'phone' || cm === 'both' || !cm;
    const showWA = cm === 'whatsapp' || cm === 'both';

    const phone = order.customer_phone;
    const waPhone = (order.customer_whatsapp || phone || '').replace(/\D/g, '');
    const waIntl = waPhone.startsWith('20') ? waPhone : waPhone.startsWith('0') ? '20' + waPhone.slice(1) : '20' + waPhone;

    const staffByRole = (role: string) => staff.filter((s: AX_Staff) => s.roles?.includes(role) && s.is_active);

    return (
        <div className={cn(
            "bg-secondary/20 border rounded-[2rem] overflow-hidden transition-all duration-500",
            expanded ? "border-primary/50 bg-secondary/30 shadow-2xl shadow-primary/5" : "border-border hover:border-primary/40"
        )}>
            <div className="flex items-center gap-5 px-6 py-5 cursor-pointer select-none group" onClick={onToggle}>
                <div className={cn(
                    "w-3 h-3 rounded-full shrink-0 shadow-lg",
                    order.status === 'pending' ? 'bg-amber-500 animate-pulse' : 
                    order.status === 'delivered' ? 'bg-emerald-500' : 
                    order.status === 'cancelled' ? 'bg-destructive' : 'bg-primary'
                )} />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 flex-wrap">
                        <span className="text-base font-black text-foreground tracking-tighter uppercase">#{order.id.slice(0, 8)}</span>
                        {order.customer_name && <span className="text-xs text-foreground font-black opacity-80">{order.customer_name}</span>}
                        {order.customer_phone && <span className="text-xs text-muted-foreground font-mono tracking-widest">{order.customer_phone}</span>}
                    </div>
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                        <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-none bg-background/50 px-2 py-1 rounded-md border border-border/50">
                            {new Date(order.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })} • {new Date(order.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[10px] text-primary/70 font-black uppercase tracking-widest">{items.length} منتجات</span>
                        {order.customer_address && (
                            <span className="text-[10px] text-muted-foreground/60 truncate max-w-[200px] flex items-center gap-1">
                                <MapPin size={10} /> {order.customer_address}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                    <span className="text-lg font-black text-primary tracking-tighter">{order.total_amount} <span className="text-[10px]">ج.م</span></span>
                    <div className={cn(
                        "hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black border uppercase tracking-widest shadow-sm",
                        status.bg, status.color
                    )}>
                        {status.icon}
                        {status.label}
                    </div>
                    <div className="p-2 bg-background border border-border rounded-xl text-muted-foreground/50 group-hover:text-primary transition-all duration-300">
                        <ChevronDown size={18} className={cn("transition-transform duration-500", expanded && "rotate-180")} />
                    </div>
                </div>
            </div>

            {expanded && (
                <div className="border-t border-border px-6 py-6 space-y-8 animate-in slide-in-from-top-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Customer Info */}
                        <div className="bg-secondary/40 border border-border rounded-[1.5rem] p-6 space-y-4 shadow-inner">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black text-primary uppercase tracking-tighter flex items-center gap-2">
                                    <User size={12} /> الملف التعريفي للعميل
                                </p>
                            </div>
                            <div className="space-y-4">
                                {order.customer_name && (
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">الاسم الكامل</span>
                                        <span className="text-sm font-black text-foreground">{order.customer_name}</span>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none">التواصل</span>
                                        <span className="text-xs font-black text-foreground font-mono tracking-widest">{phone}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none">تأكيد عبر</span>
                                        <span className="text-xs font-black text-primary uppercase tracking-widest">
                                            {order.confirm_method === 'whatsapp' ? 'الواتساب' : order.confirm_method === 'phone' ? 'المكالمة' : 'الإثنين'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                {showCall && phone && (
                                    <a href={`tel:${phone}`} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground hover:brightness-110 transition-all text-[11px] font-black shadow-lg shadow-primary/20">
                                        <Phone size={14} /> اتصال الآن
                                    </a>
                                )}
                                {showWA && waIntl && (
                                    <a href={`https://wa.me/${waIntl}`} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-500 text-white hover:brightness-110 transition-all text-[11px] font-black shadow-lg shadow-emerald-500/20">
                                        <MessageSquare size={14} /> واتساب سريع
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Location Details */}
                        <div className="bg-secondary/40 border border-border rounded-[1.5rem] p-6 space-y-4 shadow-inner">
                            <p className="text-[10px] font-black text-primary uppercase tracking-tighter flex items-center gap-2">
                                <MapPin size={12} /> تفاصيل الشحن والموقع
                            </p>
                            <div className="space-y-3">
                                {order.customer_address && <p className="text-sm font-black text-foreground leading-relaxed tracking-tight">{order.customer_address}</p>}
                                <div className="flex items-center gap-2">
                                    <div className="px-2 py-1 bg-background border border-border rounded-lg text-[10px] font-black text-muted-foreground uppercase">{order.customer_city || 'غير محدد'}</div>
                                    <div className="px-2 py-1 bg-background border border-border rounded-lg text-[10px] font-black text-muted-foreground uppercase">{order.customer_district || 'عام'}</div>
                                </div>
                                {order.customer_lat && order.customer_lng && (
                                    <a href={`https://maps.google.com/?q=${order.customer_lat},${order.customer_lng}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-secondary border border-border text-foreground hover:bg-primary/5 hover:border-primary/40 transition-all text-[11px] font-black shadow-sm group/map">
                                        <Navigation size={14} className="text-primary group-hover:scale-110 transition-transform" />
                                        توجيه عبر الخريطة
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Products List */}
                    {items.length > 0 && (
                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2"><ShoppingBag size={12} /> ملخص محتويات الشحنة</p>
                            <div className="rounded-[1.5rem] overflow-hidden border border-border bg-background shadow-sm divide-y divide-border/30">
                                {items.map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-secondary/5 transition-colors">
                                        <div className="w-12 h-12 rounded-xl bg-secondary/30 overflow-hidden shrink-0 border border-border p-1">
                                            {(item.image_url || item.images?.[0]) ? (
                                                <img src={item.image_url || item.images?.[0]} className="w-full h-full object-cover rounded-lg" alt="" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground/30"><Package size={20} /></div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-black text-foreground truncate uppercase">{item.name_ar || item.name}</p>
                                            <p className="text-[10px] text-muted-foreground font-black tracking-widest mt-0.5">{item.price} ج.م × {item.quantity}</p>
                                        </div>
                                        <span className="text-sm font-black text-primary shrink-0 tracking-tighter">{(item.price * item.quantity).toFixed(0)} <span className="text-[10px]">ج.م</span></span>
                                    </div>
                                ))}
                                <div className="flex items-center justify-between px-6 py-5 bg-secondary/30 border-t border-border/50">
                                    <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">إجمالي الطلب</span>
                                    <span className="text-2xl font-black text-primary tracking-tighter">{order.total_amount} <span className="text-xs">ج.م</span></span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Additional Notes */}
                    {(order.order_notes || order.shipping_notes) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {order.order_notes && (
                                <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl space-y-2">
                                    <p className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5"><FileText size={12} /> ملاحظات المتجر</p>
                                    <p className="text-xs text-foreground/80 font-medium leading-relaxed">{order.order_notes}</p>
                                </div>
                            )}
                            {order.shipping_notes && (
                                <div className="p-4 bg-sky-500/5 border border-sky-500/10 rounded-2xl space-y-2">
                                    <p className="text-[9px] font-black text-sky-600 uppercase tracking-widest flex items-center gap-1.5"><Navigation size={12} /> تعليمات التوصيل</p>
                                    <p className="text-xs text-foreground/80 font-medium leading-relaxed">{order.shipping_notes}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Proofs/Photos Section */}
                    <div className="space-y-3">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">الإثباتات والصور المرفقة</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <ProofBox label="إيصال التحويل" url={order.payment_proof_url} onUpload={(url) => onUpdateField(order.id, 'payment_proof_url', url)} />
                            <ProofBox label="صورة التجهيز" url={order.pickup_photo_url} onUpload={(url) => onUpdateField(order.id, 'pickup_photo_url', url)} />
                            <ProofBox label="صورة التسليم" url={order.delivery_photo_url} onUpload={(url) => onUpdateField(order.id, 'delivery_photo_url', url)} />
                        </div>
                    </div>

                    {/* Assignment/Staff Section */}
                    {staff.length > 0 && (
                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2"><UserCheck size={12} /> المسؤولين عن التنفيذ</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {[
                                    { field: 'confirmed_by', label: 'المؤكد', role: 'confirm', icon: <ClipboardCheck size={11} />, color: 'text-amber-500', bg: 'bg-amber-500/5 border-amber-500/10' },
                                    { field: 'prepared_by', label: 'المجهز', role: 'prepare', icon: <Package size={11} />, color: 'text-blue-500', bg: 'bg-blue-500/5 border-blue-500/10' },
                                    { field: 'delivered_by', label: 'المندوب', role: 'deliver', icon: <Truck size={11} />, color: 'text-emerald-500', bg: 'bg-emerald-500/5 border-emerald-500/10' },
                                ].map(({ field, label, role, icon, color, bg }) => {
                                    const eligible = staffByRole(role);
                                    if (eligible.length === 0) return null;
                                    const current = order[field];
                                    return (
                                        <div key={field} className={cn("rounded-2xl p-4 space-y-3 border shadow-inner", bg)}>
                                            <div className="flex items-center gap-2">
                                                <span className={cn(color)}>{icon}</span>
                                                <span className={cn("text-[10px] font-black uppercase tracking-widest", color)}>{label}</span>
                                            </div>
                                            <select
                                                value={current || ''}
                                                onChange={e => onAssign(order.id, field, e.target.value || null)}
                                                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-[11px] font-black text-foreground outline-none focus:border-primary/50 transition-all shadow-sm"
                                            >
                                                <option value="">— اختر شخص —</option>
                                                {eligible.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* State Transitions */}
                    <div className="pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex gap-3 flex-wrap items-center">
                            {nextStatuses.length > 0 ? (
                                nextStatuses.map((s) => {
                                    const ns = STATUS_MAP[s];
                                    const isCancelled = s === 'cancelled';
                                    return (
                                        <button
                                            key={s}
                                            onClick={() => onStatusUpdate(order.id, s)}
                                            disabled={updating}
                                            className={cn(
                                                "group flex items-center gap-3 px-6 py-3.5 rounded-2xl text-[11px] font-black tracking-widest uppercase transition-all active:scale-95 disabled:opacity-50 shadow-lg",
                                                isCancelled 
                                                ? "bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive hover:text-white" 
                                                : "bg-primary text-primary-foreground hover:brightness-110 shadow-primary/20"
                                            )}
                                        >
                                            {updating ? <Loader2 size={16} className="animate-spin" /> : ns.icon}
                                            {ns.label}
                                        </button>
                                    );
                                })
                            ) : (
                                <div className={cn("px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-3 border shadow-inner shadow-primary/5", status.bg, status.color)}>
                                    {status.icon}
                                    {order.status === 'delivered' ? 'هذا الطلب مكتمل' : 'تم إلغاء الطلب'}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-4 bg-secondary/50 px-4 py-2 rounded-2xl border border-border/50">
                            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">طريقة الدفع:</span>
                            <span className="text-xs font-black text-foreground flex items-center gap-2">
                                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[9px] border border-primary/20">
                                    {order.payment_method === 'cod' ? 'كاش' : 'إلكتروني'}
                                </span>
                                {order.payment_method === 'cod' ? 'عند الاستلام' : order.payment_method.split(':')[0]}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const ProofBox = ({ label, url, onUpload }: { label: string, url?: string, onUpload: (url: string) => void }) => (
    <div className="bg-secondary/40 border border-border p-4 rounded-3xl space-y-4 shadow-sm hover:border-primary/20 transition-all flex flex-col">
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">{label}</p>
        <div className="bg-background rounded-2xl p-1 border border-border shadow-inner flex-1 overflow-hidden">
            <AX_ImageUploader
                defaultImage={url}
                folder="/orders/proofs"
                label=""
                onUploadSuccess={onUpload}
                onUploadError={(err) => axToast.error(err)}
            />
        </div>
    </div>
);
