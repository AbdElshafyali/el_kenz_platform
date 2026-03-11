'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, ShoppingBag, Loader2, CheckCircle2 } from 'lucide-react';
import { AX_DataService } from '@/services/data-service';
import { axToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    product: any;
    store: any;
}

const EG_PHONE_REGEX = /^(010|011|012|015)\d{8}$/;

function validatePhone(phone: string): string | null {
    const clean = phone.replace(/\s/g, '');
    if (!clean) return 'رقم التليفون مطلوب';
    if (!EG_PHONE_REGEX.test(clean)) return 'رقم غير صحيح';
    return null;
}

export default function AX_RequestModal({ isOpen, onClose, product, store }: Props) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [nameErr, setNameErr] = useState('');
    const [phoneErr, setPhoneErr] = useState('');

    const nameRef = useRef<HTMLInputElement>(null);
    const phoneRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setSuccess(false);

            const savedName = localStorage.getItem('ax_guest_name');
            const savedPhone = localStorage.getItem('ax_guest_phone');
            if (savedName) setName(savedName);
            if (savedPhone) setPhone(savedPhone);

            AX_DataService.getCurrentSession().then(session => {
                if (session?.user) {
                    AX_DataService.getProfile(session.user.id).then(profile => {
                        if (profile) {
                            if (profile.full_name) setName(profile.full_name);
                            if (profile.phone) setPhone(profile.phone);
                        }
                    });
                }
            });
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen || !product) return null;

    const handleSubmit = async () => {
        let valid = true;
        if (name.trim().length < 2) {
            setNameErr('الاسم مطلوب يا بطل');
            valid = false;
        } else {
            setNameErr('');
        }
        const pErr = validatePhone(phone);
        if (pErr) {
            setPhoneErr(pErr);
            valid = false;
        } else {
            setPhoneErr('');
        }
        if (!valid) return;

        setLoading(true);
        try {
            localStorage.setItem('ax_guest_name', name);
            localStorage.setItem('ax_guest_phone', phone);
            const session = await AX_DataService.getCurrentSession();
            const order = {
                store_id: store.id,
                customer_id: session?.user?.id || null,
                total_amount: 0,
                prepayment_amount: 0,
                payment_method: 'request_only',
                status: 'request',
                items: [{
                    product_id: product.id,
                    name_ar: product.name_ar,
                    name_en: product.name_en,
                    description: product.description,
                    quantity: 1,
                    price: product.price,
                    image_url: product.image_url || product.images?.[0] || '',
                    is_backorder: true
                }],
                customer_name: name,
                customer_phone: phone.replace(/\s/g, ''),
                created_at: new Date().toISOString()
            };
            await AX_DataService.placeOrder(order);
            setSuccess(true);
            setTimeout(() => { onClose(); }, 3000);
        } catch (err) {
            console.error('Request err:', err);
            axToast.error('حصلت مشكلة، جرب تاني');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 sm:p-6" dir="rtl">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />

            <div className="relative w-full max-w-sm bg-background border border-border rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
                <div className="p-6 border-b border-border flex justify-between items-center bg-primary/5">
                    <div className="flex items-center gap-3 text-primary font-black">
                        <ShoppingBag size={20} />
                        <h3 className="tracking-tighter uppercase">طلب توفر المنتج</h3>
                    </div>
                    <button onClick={onClose} className="p-2 bg-secondary border border-border rounded-xl text-muted-foreground hover:text-foreground transition-all shadow-sm">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6">
                    {success ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center animate-in zoom-in duration-500">
                            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 shadow-inner">
                                <CheckCircle2 size={40} />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-foreground tracking-tighter">تم استلام طلبك!</h4>
                                <p className="text-muted-foreground text-xs font-bold mt-2">أول ما المنتج يتوفر هنتواصل معاك على <span className="text-primary font-mono">{phone}</span></p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 p-4 bg-secondary border border-border rounded-2xl shadow-inner">
                                <div className="w-14 h-14 rounded-xl bg-background overflow-hidden shrink-0 border border-border shadow-sm">
                                    <img src={product.image_url || product.images?.[0]} className="w-full h-full object-cover" alt="" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-black text-foreground truncate uppercase">{product.name_ar}</h4>
                                    <p className="text-[10px] text-destructive font-black tracking-widest leading-none mt-1">نفذ من المخزن 😔</p>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">الاسم الكامل</label>
                                    <input
                                        ref={nameRef}
                                        type="text"
                                        value={name}
                                        onChange={e => { setName(e.target.value); setNameErr(''); }}
                                        placeholder="اكتب اسمك هنا"
                                        className={cn(
                                            "w-full bg-secondary border rounded-2xl px-5 py-4 text-sm font-bold text-foreground outline-none transition-all shadow-inner",
                                            nameErr ? "border-destructive/50 focus:ring-4 focus:ring-destructive/5" : "border-border focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
                                        )}
                                    />
                                    {nameErr && <p className="text-destructive text-[10px] px-1 font-bold">{nameErr}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">رقم الموبايل</label>
                                    <input
                                        ref={phoneRef}
                                        type="tel"
                                        value={phone}
                                        onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); setPhoneErr(''); }}
                                        placeholder="01XXXXXXXXX"
                                        dir="ltr"
                                        maxLength={11}
                                        className={cn(
                                            "w-full bg-secondary border rounded-2xl px-5 py-4 text-sm font-mono tracking-widest text-foreground outline-none transition-all shadow-inner",
                                            phoneErr ? "border-destructive/50 focus:ring-4 focus:ring-destructive/5" : "border-border focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
                                        )}
                                    />
                                    {phoneErr && <p className="text-destructive text-[10px] px-1 font-bold">{phoneErr}</p>}
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black py-5 rounded-2xl flex justify-center items-center gap-3 transition-all active:scale-95 shadow-xl shadow-primary/20 disabled:opacity-50"
                            >
                                {loading ? <Loader2 size={20} className="animate-spin" /> : <><ShoppingBag size={20} /> تأكيد طلب التوفر</>}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
