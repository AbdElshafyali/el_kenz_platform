'use client';

import React, { useState, lazy, Suspense, useEffect, useRef } from 'react';
import {
    X, ShieldCheck, CreditCard, Landmark, Smartphone,
    Copy, Check, Upload, ArrowRight, Loader2, MessageSquare,
    ShoppingBag, MapPin, Phone, User, Navigation, Edit3,
    CheckCircle2, Map
} from 'lucide-react';
import { AX_DataService } from '@/services/data-service';
import { axToast } from '@/hooks/use-toast';
import { AX_ImageUploader } from '@/components/ui/AX_ImageUploader';
import { cn } from '@/lib/utils';

const AX_MapPicker = lazy(() => import('./AX_MapPicker'));

interface Props {
    isOpen: boolean;
    onClose: () => void;
    items: any[];
    totalAmount: number;
    store: any;
    onSuccess: () => void;
}

const PAYMENT_CATS = [
    { id: 'cod', label: 'دفع عند الاستلام', icon: <CreditCard size={18} /> },
    { id: 'wallets', label: 'محفظة إلكترونية', icon: <Smartphone size={18} /> },
    { id: 'instapay', label: 'إنستا باي', icon: <Check size={18} /> },
    { id: 'bank_accounts', label: 'تحويل بنكي', icon: <Landmark size={18} /> },
];

const CONFIRM_METHODS = [
    { id: 'whatsapp', label: 'واتساب', icon: <MessageSquare size={16} />, color: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' },
    { id: 'phone', label: 'مكالمة', icon: <Phone size={16} />, color: 'text-blue-500 border-blue-500/20 bg-blue-500/5' },
    { id: 'both', label: 'الاثنين', icon: <CheckCircle2 size={16} />, color: 'text-primary border-primary/20 bg-primary/5' },
];

const EG_PHONE_REGEX = /^(010|011|012|015)\d{8}$/;

function validatePhone(phone: string): string | null {
    const clean = phone.replace(/\s/g, '');
    if (!clean) return 'رقم التليفون مطلوب';
    if (!EG_PHONE_REGEX.test(clean)) return 'رقم غير صحيح';
    return null;
}

export default function StoreCheckoutModal({ isOpen, onClose, items, totalAmount, store, onSuccess }: Props) {
    const [step, setStep] = useState(1);

    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerPhone2, setCustomerPhone2] = useState('');
    const [customerWhatsapp, setCustomerWhatsapp] = useState('');
    const [confirmMethod, setConfirmMethod] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [district, setDistrict] = useState('');
    const [coordsLat, setCoordsLat] = useState<number | null>(null);
    const [coordsLng, setCoordsLng] = useState<number | null>(null);
    const [orderNotes, setOrderNotes] = useState('');
    const [shippingNotes, setShippingNotes] = useState('');
    const [locLoading, setLocLoading] = useState(false);
    const [locDetected, setLocDetected] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [phoneError, setPhoneError] = useState('');
    const [phone2Error, setPhone2Error] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const [selectedCat, setSelectedCat] = useState('');
    const [selectedOption, setSelectedOption] = useState<any>(null);
    const [proofUrl, setProofUrl] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const nameRef = useRef<HTMLInputElement>(null);
    const phoneRef = useRef<HTMLInputElement>(null);
    const phone2Ref = useRef<HTMLInputElement>(null);
    const addressRef = useRef<HTMLTextAreaElement>(null);
    const confirmRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            const savedName = localStorage.getItem('ax_checkout_name');
            const savedPhone = localStorage.getItem('ax_checkout_phone');
            const savedPhone2 = localStorage.getItem('ax_checkout_phone2');
            const savedWa = localStorage.getItem('ax_checkout_wa');
            const savedAddr = localStorage.getItem('ax_checkout_address');
            const savedCity = localStorage.getItem('ax_checkout_city');
            const savedDist = localStorage.getItem('ax_checkout_district');
            const savedLat = localStorage.getItem('ax_checkout_lat');
            const savedLng = localStorage.getItem('ax_checkout_lng');

            if (!customerName && savedName) setCustomerName(savedName);
            if (!customerPhone && savedPhone) setCustomerPhone(savedPhone);
            if (!customerPhone2 && savedPhone2) setCustomerPhone2(savedPhone2);
            if (!customerWhatsapp && savedWa) setCustomerWhatsapp(savedWa);
            if (!address && savedAddr) setAddress(savedAddr);
            if (!city && savedCity) setCity(savedCity);
            if (!district && savedDist) setDistrict(savedDist);
            if (coordsLat === null && savedLat) setCoordsLat(Number(savedLat));
            if (coordsLng === null && savedLng) setCoordsLng(Number(savedLng));
            if (savedLat && savedLng) setLocDetected(true);

            AX_DataService.getCurrentSession().then(session => {
                if (session?.user) {
                    AX_DataService.getProfile(session.user.id).then(profile => {
                        if (profile) {
                            if (profile.full_name) setCustomerName(profile.full_name);
                            if (profile.phone) setCustomerPhone(profile.phone);
                            if (profile.address) setAddress(profile.address);
                            if (profile.city) setCity(profile.city);
                            if (profile.district) setDistrict(profile.district);
                            if (profile.lat) setCoordsLat(profile.lat);
                            if (profile.lng) setCoordsLng(profile.lng);
                            if (profile.lat && profile.lng) setLocDetected(true);
                        }
                    });
                }
            });
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const paymentConfig = store?.payment_config || { wallets: [], bank_accounts: [], instapay: [] };
    const activeOptions = selectedCat !== 'cod' ? (paymentConfig[selectedCat]?.filter((e: any) => e.active) || []) : [];
    const prepayPercent = store?.pay_prepayment_percent || 0;
    const prepayAmount = (selectedCat !== 'cod' && prepayPercent > 0) ? (totalAmount * prepayPercent / 100) : totalAmount;
    const availableCategories = PAYMENT_CATS.filter((c: any) => {
        if (c.id === 'cod') return store?.pay_cod_enabled;
        return paymentConfig[c.id]?.some((e: any) => e.active);
    });

    if (!isOpen) return null;

    const scrollToRef = (ref: React.RefObject<HTMLElement | null>) => {
        setTimeout(() => {
            ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 50);
    };

    const detectLocation = () => {
        if (!navigator.geolocation) { axToast.error('المتصفح ده مش بيدعم تحديد الموقع.'); return; }
        setLocLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const { latitude, longitude } = pos.coords;
                    setCoordsLat(latitude);
                    setCoordsLng(longitude);
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=ar`,
                        { headers: { 'User-Agent': 'ElKenzStore/1.0' } }
                    );
                    const data = await res.json();
                    const addr = data.address || {};
                    const detCity = addr.city || addr.town || addr.county || addr.state || '';
                    const detDistrict = addr.suburb || addr.neighbourhood || '';
                    const detStreet = addr.road || addr.pedestrian || '';
                    setCity(detCity);
                    setDistrict(detDistrict);
                    setAddress([detStreet, detDistrict, detCity].filter(Boolean).join('، '));
                    setLocDetected(true);
                    axToast.success('تم تحديد موقعك ✓');
                } catch { axToast.error('فشل تحديد العنوان.'); }
                finally { setLocLoading(false); }
            },
            () => { axToast.error('رفضت صلاحية الموقع.'); setLocLoading(false); },
            { timeout: 10000 }
        );
    };

    const handlePhoneBlur = () => setPhoneError(validatePhone(customerPhone) || '');
    const handlePhone2Blur = () => {
        if (customerPhone2 && validatePhone(customerPhone2)) {
            setPhone2Error(validatePhone(customerPhone2) || '');
        } else {
            setPhone2Error('');
        }
    };

    const validateStep1 = (): boolean => {
        const errs: Record<string, string> = {};
        if (customerName.trim().length < 2) errs.name = 'الاسم مطلوب';
        const phoneErr = validatePhone(customerPhone);
        if (phoneErr) errs.phone = phoneErr;
        if (customerPhone2 && validatePhone(customerPhone2)) errs.phone2 = validatePhone(customerPhone2) || '';
        if (!address.trim()) errs.address = 'العنوان مطلوب';
        if (!confirmMethod) errs.confirm = 'اختر طريقة التأكيد';
        setFieldErrors(errs);
        setPhoneError(errs.phone || '');
        setPhone2Error(errs.phone2 || '');
        if (Object.keys(errs).length === 0) return true;
        if (errs.name) { scrollToRef(nameRef); return false; }
        if (errs.phone) { scrollToRef(phoneRef); return false; }
        if (errs.phone2) { scrollToRef(phone2Ref); return false; }
        if (errs.address) { scrollToRef(addressRef); return false; }
        if (errs.confirm) { scrollToRef(confirmRef); return false; }
        return false;
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePlaceOrder = async () => {
        setLoading(true);
        try {
            const session = await AX_DataService.getCurrentSession();
            const hasOutOfStock = items.some(item => item.is_backorder);
            const orderStatus = hasOutOfStock ? 'request' : 'pending';

            const order = {
                store_id: store.id,
                customer_id: session?.user?.id || null,
                total_amount: totalAmount,
                prepayment_amount: selectedCat === 'cod' ? 0 : prepayAmount,
                payment_method: selectedCat === 'cod' ? 'cod' : `${selectedCat}:${selectedOption?.id || 'default'}`,
                payment_proof_url: proofUrl,
                status: orderStatus,
                items,
                customer_name: customerName,
                customer_phone: customerPhone.replace(/\s/g, ''),
                customer_phone2: customerPhone2 || null,
                customer_whatsapp: customerWhatsapp || customerPhone.replace(/\s/g, ''),
                customer_address: address,
                customer_city: city,
                customer_district: district,
                customer_lat: coordsLat,
                customer_lng: coordsLng,
                order_notes: orderNotes || null,
                shipping_notes: shippingNotes || null,
                confirm_method: confirmMethod,
                created_at: new Date().toISOString(),
            };

            await AX_DataService.placeOrder(order);

            localStorage.setItem('ax_checkout_name', customerName);
            localStorage.setItem('ax_checkout_phone', customerPhone.replace(/\s/g, ''));
            if (customerPhone2) localStorage.setItem('ax_checkout_phone2', customerPhone2);
            if (customerWhatsapp) localStorage.setItem('ax_checkout_wa', customerWhatsapp);
            localStorage.setItem('ax_checkout_address', address);
            if (city) localStorage.setItem('ax_checkout_city', city);
            if (district) localStorage.setItem('ax_checkout_district', district);
            if (coordsLat) localStorage.setItem('ax_checkout_lat', coordsLat.toString());
            if (coordsLng) localStorage.setItem('ax_checkout_lng', coordsLng.toString());

            if (session?.user) {
                await AX_DataService.updateProfile(session.user.id, {
                    full_name: customerName,
                    phone: customerPhone.replace(/\s/g, ''),
                    address: address,
                    city: city,
                    district: district,
                    lat: coordsLat,
                    lng: coordsLng
                });
            }

            if (confirmMethod === 'whatsapp' || confirmMethod === 'both') {
                const rawPhone = store.pay_whatsapp_number?.replace(/\D/g, '') || store.social_whatsapp?.replace(/\D/g, '');
                const waPhone = rawPhone
                    ? rawPhone.startsWith('20') ? rawPhone
                        : rawPhone.startsWith('0') ? '20' + rawPhone.slice(1)
                            : '20' + rawPhone
                    : null;
                if (waPhone) {
                    const hour = new Date().getHours();
                    const greeting = hour >= 5 && hour < 12 ? 'صباح الخير ☀️' : hour >= 12 && hour < 18 ? 'مساء الخير 🌤' : 'مساء النور 🌙';
                    const sep = '─────────────────';
                    const itemsText = items.map((item: any) =>
                        `▸ ${item.name_ar || item.name}${item.is_backorder ? ' (طلب توفر)' : ''}\n   ${item.quantity} قطعة × ${item.price} = ${(item.price * item.quantity).toFixed(2)} ج.م`
                    ).join('\n');
                    const mapLine = coordsLat && coordsLng ? `\n📍 الموقع على الخريطة:\nhttps://maps.google.com/?q=${coordsLat},${coordsLng}` : '';

                    const msg = [
                        `${greeting}`,
                        hasOutOfStock ? `حابب أعمل طلب توفر لمنتجاتكم 📦` : `حابب أكد طلبي من متجركم 🛒`,
                        sep,
                        `👤 ${customerName}`,
                        `📞 ${customerPhone}`,
                        `📍 ${address}${mapLine}`,
                        sep,
                        `🛍 تفاصيل ${hasOutOfStock ? 'الطلب' : 'الشراء'}:`,
                        itemsText,
                        sep,
                        `💰 الإجمالي: ${totalAmount} ج.م`,
                        sep + (orderNotes ? `\n\n📝 ملاحظة:\n${orderNotes}` : '') + (shippingNotes ? `\n\n🚚 تعليمات:\n${shippingNotes}` : ''),
                        `برجاء التأكيد 🙏`
                    ].join('\n');

                    window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`, '_blank');
                }
            }

            axToast.success(hasOutOfStock ? 'تم إرسال طلب التوفر بنجاح!' : 'تم استلام طلبك! جاري المراجعة.');
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error(err);
            axToast.error('حصلت مشكلة، جرب تاني.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {showMap && (
                <Suspense fallback={null}>
                    <AX_MapPicker
                        onClose={() => setShowMap(false)}
                        onSelect={(data) => {
                            setAddress(data.address);
                            setCity(data.city);
                            setDistrict(data.district);
                            setCoordsLat(data.lat);
                            setCoordsLng(data.lng);
                            setLocDetected(true);
                        }}
                    />
                </Suspense>
            )}

            <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center sm:p-4" dir="rtl">
                <div className="absolute inset-0 bg-background/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose} />

                <div className="relative w-full sm:max-w-xl bg-background border border-border sm:rounded-[3rem] rounded-t-[3rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-500 flex flex-col max-h-[90vh]">

                    {/* Header */}
                    <div className="p-6 border-b border-border flex items-center justify-between shrink-0 bg-primary/5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-foreground tracking-tighter uppercase">إتمام الطلب</h2>
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-none mt-1">
                                    {step === 1 && 'بياناتك الشخصية'}
                                    {step === 2 && 'وسيلة الدفع'}
                                    {step === 3 && 'تفاصيل الدفع'}
                                    {step === 4 && 'المراجعة النهائية'}
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-3 bg-secondary border border-border rounded-2xl text-muted-foreground hover:text-foreground transition-all shadow-sm active:scale-95">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Progress */}
                    <div className="px-6 py-4 flex items-center gap-2 bg-secondary/30">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-700 shadow-sm ${step >= i ? 'bg-primary' : 'bg-border'}`} />
                        ))}
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">

                        {step === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <h3 className="text-lg font-black text-foreground">بيانات الشحن والتواصل</h3>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                        <User size={12} className="text-primary" /> الاسم الكامل <span className="text-destructive">*</span>
                                    </label>
                                    <input
                                        ref={nameRef}
                                        type="text"
                                        value={customerName}
                                        onChange={e => { setCustomerName(e.target.value); setFieldErrors(p => ({ ...p, name: '' })); }}
                                        placeholder="اكتب اسمك الثلاثي..."
                                        className={cn(
                                            "w-full bg-secondary border rounded-2xl px-5 py-4 text-sm font-bold text-foreground placeholder-muted-foreground/40 outline-none transition-all focus:ring-4 focus:ring-primary/5 shadow-inner",
                                            fieldErrors.name ? "border-destructive/50" : "border-border focus:border-primary/50"
                                        )}
                                    />
                                    {fieldErrors.name && <p className="text-[10px] text-destructive font-bold px-1 flex items-center gap-1"><span>⚠</span>{fieldErrors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                        <Phone size={12} className="text-primary" /> رقم التليفون الرئيسي <span className="text-destructive">*</span>
                                    </label>
                                    <input
                                        ref={phoneRef}
                                        type="tel"
                                        value={customerPhone}
                                        onChange={e => { setCustomerPhone(e.target.value.replace(/\D/g, '')); setPhoneError(''); setFieldErrors(p => ({ ...p, phone: '' })); }}
                                        onBlur={handlePhoneBlur}
                                        placeholder="01XXXXXXXXX"
                                        dir="ltr"
                                        maxLength={11}
                                        className={cn(
                                            "w-full bg-secondary border rounded-2xl px-5 py-4 text-sm font-mono tracking-widest text-foreground outline-none transition-all focus:ring-4 focus:ring-primary/5 shadow-inner",
                                            phoneError ? "border-destructive/50" : "border-border focus:border-primary/50"
                                        )}
                                    />
                                    {phoneError && <p className="text-[10px] text-destructive font-bold px-1 flex items-center gap-1"><span>⚠</span>{phoneError}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">تليفون إضافي</label>
                                        <input
                                            ref={phone2Ref}
                                            type="tel"
                                            value={customerPhone2}
                                            onChange={e => { setCustomerPhone2(e.target.value.replace(/\D/g, '')); setPhone2Error(''); }}
                                            onBlur={handlePhone2Blur}
                                            placeholder="اختياري"
                                            dir="ltr"
                                            maxLength={11}
                                            className={cn(
                                                "w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-mono text-foreground outline-none transition-all focus:border-primary/30 shadow-inner",
                                                phone2Error && "border-destructive/30"
                                            )}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                            <MessageSquare size={12} className="text-emerald-500" /> واتساب
                                        </label>
                                        <input
                                            type="tel"
                                            value={customerWhatsapp}
                                            onChange={e => setCustomerWhatsapp(e.target.value.replace(/\D/g, ''))}
                                            placeholder="لو مختلف"
                                            dir="ltr"
                                            maxLength={11}
                                            className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-mono text-foreground outline-none focus:border-emerald-500/30 transition-all shadow-inner"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                        <MapPin size={12} className="text-primary" /> العنوان المخطط <span className="text-destructive">*</span>
                                    </label>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={detectLocation}
                                            disabled={locLoading}
                                            className={cn(
                                                "flex items-center justify-center gap-2 py-3 rounded-2xl border text-[11px] font-black transition-all active:scale-95 shadow-sm",
                                                locDetected ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" : "bg-secondary border-border text-primary hover:border-primary/30"
                                            )}
                                        >
                                            {locLoading ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
                                            {locLoading ? 'جاري...' : locDetected ? 'موقعك المسجل ✓' : 'تحديد تلقائي'}
                                        </button>

                                        <button
                                            onClick={() => setShowMap(true)}
                                            className="flex items-center justify-center gap-2 py-3 rounded-2xl border bg-secondary border-border text-indigo-500 hover:border-indigo-500/30 text-[11px] font-black transition-all active:scale-95 shadow-sm"
                                        >
                                            <Map size={16} />
                                            الخريطة يدوياً
                                        </button>
                                    </div>

                                    <div className="relative">
                                        <Edit3 size={16} className="absolute left-4 top-4 text-muted-foreground/30 pointer-events-none" />
                                        <textarea
                                            ref={addressRef}
                                            value={address}
                                            onChange={e => { setAddress(e.target.value); setFieldErrors(p => ({ ...p, address: '' })); }}
                                            placeholder="الشارع، الدور، علامة مميزة..."
                                            rows={2}
                                            className={cn(
                                                "w-full bg-secondary border rounded-2xl px-5 py-4 text-sm font-bold text-foreground placeholder-muted-foreground/40 outline-none transition-all focus:ring-4 focus:ring-primary/5 shadow-inner resize-none",
                                                fieldErrors.address ? "border-destructive/50" : "border-border focus:border-primary/50"
                                            )}
                                        />
                                        {fieldErrors.address && <p className="text-[10px] text-destructive font-bold px-1 mt-1"><span>⚠</span>{fieldErrors.address}</p>}
                                    </div>
                                </div>

                                <div className="space-y-3" ref={confirmRef}>
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                        وسيلة تأكيد الطلب <span className="text-destructive">*</span>
                                    </label>
                                    <div className={cn(
                                        "grid grid-cols-3 gap-3 p-1.5 rounded-[2rem] transition-all",
                                        fieldErrors.confirm && "bg-destructive/5 ring-1 ring-destructive/20"
                                    )}>
                                        {CONFIRM_METHODS.map(m => (
                                            <button
                                                key={m.id}
                                                onClick={() => { setConfirmMethod(m.id); setFieldErrors(p => ({ ...p, confirm: '' })); }}
                                                className={cn(
                                                    "flex flex-col items-center gap-2 py-4 px-3 rounded-2xl border text-[10px] font-black transition-all active:scale-95 shadow-sm",
                                                    confirmMethod === m.id ? m.color : "bg-background border-border text-muted-foreground hover:border-primary/20"
                                                )}
                                            >
                                                {m.icon}
                                                <span className="uppercase tracking-widest">{m.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                    {fieldErrors.confirm && <p className="text-[10px] text-destructive font-bold flex items-center gap-1 mt-1"><span>⚠</span>{fieldErrors.confirm}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                        <MessageSquare size={12} className="text-primary" /> ملاحظات خاصة
                                    </label>
                                    <textarea
                                        value={orderNotes}
                                        onChange={e => setOrderNotes(e.target.value)}
                                        placeholder="أي تعليمات للمتجر أو المندوب..."
                                        rows={2}
                                        className="w-full bg-secondary border border-border rounded-2xl px-5 py-4 text-sm font-bold text-foreground placeholder-muted-foreground/40 outline-none focus:border-primary/30 transition-all shadow-inner resize-none"
                                    />
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <h3 className="text-lg font-black text-foreground">طريقة الدفع</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {availableCategories.map(c => (
                                        <button
                                            key={c.id}
                                            onClick={() => {
                                                setSelectedCat(c.id);
                                                const opts = c.id !== 'cod' ? (paymentConfig[c.id]?.filter((e: any) => e.active) || []) : [];
                                                setSelectedOption(opts.length === 1 ? opts[0] : null);
                                            }}
                                            className={cn(
                                                "p-6 rounded-[2rem] border text-right transition-all flex flex-col justify-between h-32 shadow-sm group",
                                                selectedCat === c.id ? "bg-primary/10 border-primary shadow-lg shadow-primary/5" : "bg-secondary/40 border-border hover:border-primary/30"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                                                selectedCat === c.id ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-background text-muted-foreground group-hover:text-primary"
                                            )}>
                                                {c.icon}
                                            </div>
                                            <h4 className="font-black text-foreground text-sm uppercase tracking-tighter">{c.label}</h4>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="bg-secondary rounded-[2.5rem] border border-border overflow-hidden shadow-sm">
                                    <div className="px-6 py-4 border-b border-border flex items-center gap-3 bg-primary/5">
                                        <ShoppingBag size={14} className="text-primary" />
                                        <span className="text-[11px] font-black text-foreground uppercase tracking-widest">محتويات الطلب</span>
                                    </div>
                                    <div className="divide-y divide-border/50 max-h-48 overflow-y-auto custom-scrollbar">
                                        {items.map((item: any) => (
                                            <div key={item.id} className="flex items-center gap-4 px-6 py-4 bg-background/50">
                                                <div className="w-12 h-12 rounded-xl bg-background overflow-hidden shrink-0 border border-border shadow-inner">
                                                    <img src={item.image_url || item.images?.[0]} className="w-full h-full object-cover" alt="" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-black text-foreground truncate uppercase">{item.name_ar || item.name}</p>
                                                    <p className="text-[10px] text-muted-foreground font-bold">{item.price} ج.م × {item.quantity}</p>
                                                </div>
                                                <span className="text-sm font-black text-primary shrink-0 font-mono">{(item.price * item.quantity).toFixed(0)} <span className="text-[9px]">ج.م</span></span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="px-6 py-5 border-t border-border flex items-center justify-between bg-secondary">
                                        <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">الإجمالي النهائي</span>
                                        <span className="text-2xl font-black text-primary tracking-tighter">{totalAmount} <span className="text-xs">ج.م</span></span>
                                    </div>
                                </div>

                                {selectedCat === 'cod' ? (
                                    <div className="p-8 text-center space-y-4 bg-emerald-500/5 border border-emerald-500/10 rounded-[2.5rem]">
                                        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-600 mx-auto shadow-inner">
                                            <CreditCard size={32} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-foreground uppercase">الدفع عند الاستلام</h3>
                                            <p className="text-muted-foreground text-xs font-medium mt-1">سيتم دفع المبلغ كاش للمندوب فور وصول طلبك لباب البيت.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {activeOptions.length > 1 && (
                                            <div className="space-y-3">
                                                <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest px-1">اختر الحساب المفضل:</p>
                                                <div className="space-y-2">
                                                    {activeOptions.map((opt: any) => (
                                                        <button key={opt.id} onClick={() => setSelectedOption(opt)}
                                                            className={cn(
                                                                "w-full p-4 rounded-2xl border text-right transition-all flex items-center justify-between shadow-sm",
                                                                selectedOption?.id === opt.id ? "bg-primary/5 border-primary shadow-lg shadow-primary/5" : "bg-secondary border-border"
                                                            )}>
                                                            <span className="text-base font-black text-foreground font-mono tracking-widest">{opt.value}</span>
                                                            {selectedOption?.id === opt.id && <CheckCircle2 size={20} className="text-primary" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {selectedOption && (
                                            <div className="bg-primary/5 border border-primary/20 rounded-[2.5rem] p-6 space-y-4 shadow-inner">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">انسخ الرقم للتحويل</span>
                                                    <div className="px-3 py-1 bg-primary/10 rounded-full">
                                                        <span className="text-primary font-black text-sm font-mono">{prepayAmount} ج.م</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between p-5 bg-background border border-primary/20 rounded-2xl shadow-xl">
                                                    <p className="text-xl font-black text-foreground font-mono tracking-[0.2em]">{selectedOption.value}</p>
                                                    <button onClick={() => handleCopy(selectedOption.value)}
                                                        className={cn(
                                                            "p-3 rounded-xl transition-all shadow-sm active:scale-90",
                                                            copied ? "bg-emerald-500 text-white" : "bg-secondary text-primary hover:bg-primary hover:text-primary-foreground"
                                                        )}>
                                                        {copied ? <Check size={20} /> : <Copy size={20} />}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        {store?.pay_upload_confirm && (
                                            <div className="space-y-3">
                                                <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2"><Upload size={14} className="text-primary" /> ارفع صورة الإيصال</label>
                                                <div className="bg-secondary p-1 rounded-[2.5rem] border border-border overflow-hidden">
                                                    <AX_ImageUploader
                                                        folder="/orders/proofs"
                                                        label=""
                                                        defaultImage={proofUrl}
                                                        onUploadSuccess={(url: string) => setProofUrl(url)}
                                                        onUploadError={(err: string) => axToast.error(err)}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                                <h3 className="text-xl font-black text-foreground tracking-tighter">مراجعة البيانات النهائية</h3>
                                <div className="bg-secondary border border-border rounded-[2.5rem] overflow-hidden shadow-sm divide-y divide-border/50">
                                    <Row label="اسم العميل" value={customerName} />
                                    <Row label="رقم الهاتف" value={customerPhone} mono />
                                    {customerPhone2 && <Row label="هاتف بديل" value={customerPhone2} mono />}
                                    {customerWhatsapp && <Row label="واتساب" value={customerWhatsapp} mono />}
                                    <Row label="عنوان الشحن" value={address} />
                                    {coordsLat && coordsLng && (
                                        <div className="flex items-center justify-between px-6 py-4 bg-background/50">
                                            <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">إحداثيات GPS</span>
                                            <a
                                                href={`https://maps.google.com/?q=${coordsLat},${coordsLng}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center gap-2 text-xs font-black text-primary hover:underline transition-all"
                                            >
                                                <MapPin size={14} />
                                                عرض على الخريطة
                                            </a>
                                        </div>
                                    )}
                                    <Row label="طريقة التأكيد" value={CONFIRM_METHODS.find(m => m.id === confirmMethod)?.label || ''} />
                                    <Row label="نظام الدفع" value={PAYMENT_CATS.find(c => c.id === selectedCat)?.label || ''} />
                                    <Row label="إجمالي المبلغ" value={`${totalAmount} ج.م`} highlight />
                                </div>
                                <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl">
                                    <p className="text-[10px] text-muted-foreground text-center font-bold leading-relaxed">
                                        بضغطك على "تأكيد الطلب"، سيتم إرسال بياناتك للمتجر وسيتم التواصل معك خلال دقائق. نحن نضمن لك سرية بياناتك وسرعة التوصيل.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-secondary/80 backdrop-blur-md border-t border-border flex items-center justify-between gap-6 shrink-0">
                        <button
                            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
                            className="px-6 py-4 text-[11px] font-black text-muted-foreground hover:text-foreground transition-all uppercase tracking-widest active:scale-95"
                        >
                            {step === 1 ? 'إلغاء العملية' : 'الرجوع'}
                        </button>

                        <button
                            onClick={() => {
                                if (step === 1) {
                                    if (!validateStep1()) return;
                                    setFieldErrors({});
                                    setStep(2);
                                } else if (step === 2) {
                                    if (!selectedCat) { axToast.info('فضلاً اختر وسيلة الدفع أولاً.'); return; }
                                    setStep(3);
                                } else if (step === 3) {
                                    if (selectedCat !== 'cod' && !selectedOption) { axToast.info('فضلاً حدد رقم المحفظة أو الحساب.'); return; }
                                    setStep(4);
                                } else if (step === 4) {
                                    handlePlaceOrder();
                                }
                            }}
                            disabled={loading}
                            className="flex-1 max-w-[220px] h-14 bg-primary text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-primary/20 hover:brightness-110 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>
                                    <span className="uppercase tracking-widest">{step === 4 ? 'تأكيد الطلب' : 'الخطوة التالية'}</span>
                                    <ArrowRight size={20} className="rotate-180" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

function Row({ label, value, mono = false, highlight = false }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
    return (
        <div className="flex items-center justify-between px-6 py-4 bg-background/50">
            <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">{label}</span>
            <span className={cn(
                "text-sm font-bold",
                highlight ? "text-primary font-black text-xl tracking-tighter" : "text-foreground",
                mono && "font-mono tracking-widest"
            )}>{value}</span>
        </div>
    );
}
