'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, Save, Trash2, Plus, Minus, Star, ScanBarcode } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AX_DataService } from '@/services/data-service';
import { axToast } from '@/hooks/use-toast';
import { AX_ImageUploader } from '@/components/ui/AX_ImageUploader';
import { AX_ColorSizePicker } from '@/components/ui/AX_ColorSizePicker';
import { useBodyScrollLock } from '@/hooks/use-body-scroll-lock';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    product: any | null;
    stores: any[];
    categories: any[];
}

export default function ProductModal({ isOpen, onClose, onSave, product, stores, categories }: ProductModalProps) {
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<string[]>(['']);
    const [colors, setColors] = useState<any[]>([]);
    const [sizes, setSizes] = useState<any[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    useBodyScrollLock(isOpen);
    const [formData, setFormData] = useState({
        name_ar: '',
        description: '',
        price: '',
        discount_price: '',
        barcode: '',
        category_id: '',
        store_id: '',
        is_available: true,
        is_best_seller: false,
        display_order: 0
    });

    useEffect(() => {
        if (product) {
            setFormData({
                name_ar: product.name_ar || '',
                description: product.description || '',
                price: product.price?.toString() || '',
                discount_price: product.discount_price?.toString() || '',
                barcode: product.barcode || '',
                category_id: product.category_id || '',
                store_id: product.store_id || '',
                is_available: product.is_available ?? true,
                is_best_seller: product.is_best_seller ?? false,
                display_order: product.display_order ?? 0
            });
            setImages(product.images && product.images.length > 0 ? [...product.images] : (product.image_url ? [product.image_url] : ['']));
            setColors(Array.isArray(product.colors) ? product.colors : []);
            setSizes(Array.isArray(product.sizes) ? product.sizes : []);
        } else {
            setFormData({
                name_ar: '',
                description: '',
                price: '',
                discount_price: '',
                barcode: '',
                category_id: categories[0]?.id || '',
                store_id: stores[0]?.id || '',
                is_available: true,
                is_best_seller: false,
                display_order: 0
            });
            setImages(['']);
            setColors([]);
            setSizes([]);
        }
    }, [product, stores, categories, isOpen]);

    if (!isOpen) return null;

    const handleAddImage = () => setImages([...images, '']);
    const handleRemoveImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages.length > 0 ? newImages : ['']);
    };
    const handleImageChange = (index: number, val: string) => {
        const newImages = [...images];
        newImages[index] = val;
        setImages(newImages);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const filteredImages = images.filter(img => img.trim() !== '');

            const payload: any = {
                name_ar: formData.name_ar,
                description: formData.description,
                price: parseFloat(formData.price as string) || 0,
                discount_price: formData.discount_price ? parseFloat(formData.discount_price as string) : null,
                barcode: formData.barcode || null,
                is_available: formData.is_available,
                is_best_seller: formData.is_best_seller,
                display_order: formData.display_order,
                images: filteredImages,
                image_url: filteredImages[0] || '',
                colors: colors,
                sizes: sizes
            };

            if (formData.category_id && formData.category_id.trim() !== '') {
                payload.category_id = formData.category_id;
            } else {
                payload.category_id = null;
            }

            if (formData.store_id && formData.store_id.trim() !== '') {
                payload.store_id = formData.store_id;
            } else {
                payload.store_id = null;
            }

            if (product) {
                await AX_DataService.updateProduct(product.id, payload);
                axToast.success('تم تحديث المنتج بنجاح');
            } else {
                await AX_DataService.addProduct(payload);
                axToast.success('تم إضافة المنتج بنجاح');
            }
            onSave();
            onClose();
        } catch (err: any) {
            axToast.error(err.message || 'حدث خطأ أثناء حفظ المنتج');
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!product) return;

        setLoading(true);
        try {
            await AX_DataService.deleteProduct(product.id);
            axToast.success('تم حذف المنتج بنجاح');
            setIsDeleteModalOpen(false);
            onSave();
            onClose();
        } catch (err: any) {
            axToast.error('حدث خطأ أثناء الحذف');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 transition-all duration-300" dir="rtl">
            <div className="absolute inset-0 bg-background/60 backdrop-blur-xl" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-background border border-border rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500 flex flex-col max-h-[90vh]">
                <div className="p-6 md:p-8 border-b border-border flex items-center justify-between bg-primary/5">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tighter uppercase">
                            {product ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد'}
                        </h2>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-primary text-[10px] font-black uppercase tracking-widest">تنسيق محرك الكنز</span>
                            {formData.is_best_seller && (
                                <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse shadow-sm shadow-primary/10">
                                    <Star size={10} fill="currentColor" />
                                    الأكثر مبيعاً
                                </span>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-2xl transition-all shadow-sm">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
                    <div className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto custom-scrollbar scroll-smooth">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest px-2">القسم / القسم</label>
                                <div className="relative group">
                                    <select
                                        required
                                        value={formData.category_id}
                                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                        className="w-full bg-secondary border border-border rounded-2xl px-5 py-4 outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 text-sm font-black text-foreground appearance-none transition-all shadow-inner"
                                    >
                                        <option value="" disabled>اختر القسم</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
                                    </select>
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                                        <Plus size={16} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <InputField
                                label="اسم المنتج (بالعربي)"
                                required
                                value={formData.name_ar}
                                onChange={(val: string) => setFormData({ ...formData, name_ar: val })}
                            />
                            <InputField
                                label="السعر الأصلي (ج.م)"
                                type="number"
                                required
                                value={formData.price}
                                onChange={(val: string) => setFormData({ ...formData, price: val })}
                            />
                            <InputField
                                label="سعر الخصم (اختياري)"
                                type="number"
                                value={formData.discount_price}
                                onChange={(val: string) => setFormData({ ...formData, discount_price: val })}
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest px-2">الباركود المسجل</label>
                            <div className="relative group">
                                <ScanBarcode className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                                <input
                                    type="text"
                                    value={formData.barcode}
                                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                                    placeholder="رقم الباركود أو امسحه بالسكانر"
                                    className="w-full bg-secondary border border-border rounded-2xl pr-14 pl-6 py-4 outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 text-sm font-black text-foreground tracking-widest transition-all shadow-inner placeholder:text-muted-foreground/30"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest px-2">خيارات التميز</label>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, is_best_seller: !formData.is_best_seller })}
                                    className={cn(
                                        "w-full py-4 rounded-2xl border transition-all flex items-center justify-center gap-3 font-black text-xs shadow-sm",
                                        formData.is_best_seller
                                            ? 'bg-primary/10 border-primary text-primary'
                                            : 'bg-secondary border-border text-muted-foreground hover:border-primary/30'
                                    )}
                                >
                                    <Star size={18} fill={formData.is_best_seller ? "currentColor" : "none"} className={cn(formData.is_best_seller && "animate-spin-slow")} />
                                    وضع في قائمة "الأكثر مبيعاً"
                                </button>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest px-2">حالة التوفر</label>
                                <div className="flex bg-secondary p-1.5 rounded-2xl border border-border shadow-inner">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, is_available: true })}
                                        className={cn(
                                            "flex-1 py-3 rounded-xl text-xs font-black transition-all",
                                            formData.is_available ? 'bg-emerald-500 text-white shadow-lg' : 'text-muted-foreground'
                                        )}
                                    >متاح للبيع</button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, is_available: false })}
                                        className={cn(
                                            "flex-1 py-3 rounded-xl text-xs font-black transition-all",
                                            !formData.is_available ? 'bg-destructive text-white shadow-lg' : 'text-muted-foreground'
                                        )}
                                    >غير متاح حالياً</button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest px-2">صور المنتج الاحترافية</label>
                            <div className="space-y-4">
                                {images.map((url, idx) => (
                                    <div key={idx} className="flex gap-3 items-center group/img">
                                        <div className="flex-1">
                                            <AX_ImageUploader
                                                defaultImage={url}
                                                label={`الصورة الرئيسية # ${idx + 1}`}
                                                folder="/products"
                                                onUploadSuccess={(newUrl: string) => handleImageChange(idx, newUrl)}
                                                onUploadError={(err: string) => axToast.error(err)}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(idx)}
                                            className="p-4 bg-secondary border border-border text-destructive hover:bg-destructive/10 rounded-2xl transition-all shadow-sm group-hover/img:border-destructive/30"
                                        >
                                            <Minus size={20} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={handleAddImage}
                                    className="w-full py-4 border-2 border-dashed border-border rounded-[2rem] text-muted-foreground hover:text-primary hover:border-primary/50 transition-all flex items-center justify-center gap-2 text-xs font-black bg-secondary/10 hover:bg-primary/5"
                                >
                                    <Plus size={18} />
                                    إضافة صورة بديلة
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest px-2">وصف المنتج التفصيلي</label>
                            <textarea
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="اكتب تفاصيل المنتج المميزة هنا..."
                                className="w-full bg-secondary border border-border rounded-[2rem] px-6 py-5 outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 text-sm font-black text-foreground resize-none transition-all shadow-inner placeholder:text-muted-foreground/30"
                            />
                        </div>

                        <AX_ColorSizePicker
                            colors={colors}
                            sizes={sizes}
                            onColorsChange={setColors}
                            onSizesChange={setSizes}
                        />
                    </div>

                    <div className="p-6 md:p-8 border-t border-border flex items-center justify-between gap-6 bg-secondary/30">
                        {product && (
                            <button
                                type="button"
                                onClick={() => setIsDeleteModalOpen(true)}
                                disabled={loading}
                                className="px-5 py-3.5 text-destructive hover:bg-destructive/10 rounded-2xl transition-all flex items-center gap-2.5 font-black text-xs disabled:opacity-50"
                            >
                                <Trash2 size={18} />
                                حذف المنتج نهائياً
                            </button>
                        )}
                        <div className="flex-1 flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-8 py-3.5 text-muted-foreground hover:text-foreground font-black text-xs transition-colors rounded-2xl hover:bg-secondary"
                            >
                                تراجع
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-10 py-3.5 bg-primary hover:bg-primary/90 disabled:bg-secondary disabled:text-muted-foreground text-primary-foreground font-black rounded-2xl text-xs transition-all flex items-center gap-3 shadow-xl shadow-primary/20 active:scale-95 group"
                            >
                                {loading
                                    ? <Loader2 className="animate-spin" size={18} />
                                    : <Save size={18} className="group-hover:rotate-12 transition-transform" />
                                }
                                {product ? 'تحديث البيانات' : 'اعتماد المنتج'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-background/90 backdrop-blur-md" onClick={() => setIsDeleteModalOpen(false)} />
                    <div className="relative w-full max-w-sm bg-background border border-border rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95 fade-in duration-300">
                        <div className="flex justify-center mb-8">
                            <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center border border-destructive/20 shadow-inner">
                                <Trash2 size={36} className="text-destructive animate-pulse" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-center text-foreground mb-3 tracking-tighter uppercase">تأكيد عملية الحذف</h3>
                        <p className="text-muted-foreground text-sm text-center font-black italic leading-relaxed mb-10 opacity-70">
                            سيتم إزالة المنتج وكافة بياناته من قاعدة البيانات فوراً.
                        </p>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setIsDeleteModalOpen(false)}
                                disabled={loading}
                                className="flex-1 py-4 text-foreground font-black text-xs bg-secondary border border-border hover:bg-secondary/80 rounded-2xl transition-all active:scale-95"
                            >
                                تراجع
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                disabled={loading}
                                className="flex-1 py-4 bg-destructive hover:bg-destructive/90 text-white font-black text-xs rounded-2xl transition-all flex justify-center items-center gap-3 active:scale-95 shadow-xl shadow-destructive/20"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : 'نعم، إزالة'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function InputField({ label, onChange, ...props }: any) {
    return (
        <div className="space-y-3">
            <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest px-2">{label}</label>
            <input
                {...props}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-secondary border border-border rounded-2xl px-6 py-4 outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 text-sm font-black text-foreground transition-all shadow-inner placeholder:text-muted-foreground/30"
            />
        </div>
    );
}
