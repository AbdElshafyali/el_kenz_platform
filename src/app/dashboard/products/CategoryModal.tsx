'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, Save, Trash2, Tag } from 'lucide-react';
import { AX_DataService } from '@/services/data-service';
import { axToast } from '@/hooks/use-toast';
import { AX_ConfirmDialog } from '@/components/ui/AX_ConfirmDialog';
import { useBodyScrollLock } from '@/hooks/use-body-scroll-lock';

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    category: any | null;
    allCategories: any[];
}

export default function CategoryModal({ isOpen, onClose, category, allCategories }: CategoryModalProps) {
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    useBodyScrollLock(isOpen);
    const [formData, setFormData] = useState({
        name_ar: '',
        slug: '',
        parent_id: null as string | null,
        display_order: 0
    });

    useEffect(() => {
        if (category) {
            setFormData({
                name_ar: category.name_ar || '',
                slug: category.slug || '',
                parent_id: category.parent_id || null,
                display_order: category.display_order || 0
            });
        } else {
            setFormData({
                name_ar: '',
                slug: '',
                parent_id: null,
                display_order: allCategories.length
            });
        }
    }, [category, isOpen, allCategories]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...formData,
                parent_id: formData.parent_id || null,
                slug: formData.slug || formData.name_ar.toLowerCase().replace(/\s+/g, '-')
            };
            if (category) {
                await AX_DataService.updateCategory(category.id, payload);
                axToast.success('تم تحديث القسم بنجاح');
            } else {
                await AX_DataService.addCategory(payload);
                axToast.success('تم إضافة القسم بنجاح');
            }
            onClose();
        } catch (err: any) {
            axToast.error(err.message || 'حدث خطأ أثناء حفظ القسم');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!category) return;
        setLoading(true);
        try {
            await AX_DataService.deleteCategory(category.id);
            axToast.success('تم حذف القسم بنجاح');
            setShowConfirm(false);
            onClose();
        } catch (err: any) {
            axToast.error('حدث خطأ أثناء الحذف');
        } finally {
            setLoading(false);
        }
    };

    const possibleParents = allCategories.filter(c => c.id !== category?.id);

    return (
        <>
            <AX_ConfirmDialog
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleDelete}
                loading={loading}
                title="حذف هذا القسم؟"
                description="هل أنت متأكد من حذف هذا القسم؟ قد يؤثر ذلك على المنتجات المرتبطة به بشكل دائم."
                confirmLabel="تأكيد الحذف النهائي"
                variant="danger"
            />

            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6" dir="rtl">
                <div className="absolute inset-0 bg-background/60 backdrop-blur-xl" onClick={onClose} />

                <div className="relative w-full max-w-lg bg-background border border-border rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                    <div className="p-6 md:p-8 border-b border-border flex items-center justify-between bg-primary/5">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tighter uppercase">
                                {category ? 'تعديل القسم' : 'قسم جديد'}
                            </h2>
                            <p className="text-primary text-[10px] font-black uppercase tracking-widest mt-1">إدارة هيكل المتجر الاحترافي</p>
                        </div>
                        <button onClick={onClose} className="p-3 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-2xl transition-all shadow-sm">
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col">
                        <div className="p-6 md:p-8 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">

                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest px-2">اسم القسم (بالعربي)</label>
                                <div className="relative group">
                                    <Tag className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                                    <input
                                        required
                                        value={formData.name_ar}
                                        onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                                        className="w-full bg-secondary border border-border rounded-2xl pr-14 pl-6 py-4 outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 text-sm font-black text-foreground transition-all shadow-inner placeholder:text-muted-foreground/30"
                                        placeholder="مثلاً: المشروبات الباردة"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest px-2">القسم الرئيسي (اختياري)</label>
                                <div className="relative group">
                                    <select
                                        value={formData.parent_id || ''}
                                        onChange={(e) => setFormData({ ...formData, parent_id: e.target.value || null })}
                                        className="w-full bg-secondary border border-border rounded-2xl px-5 py-4 outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 text-sm font-black text-foreground appearance-none transition-all shadow-inner"
                                    >
                                        <option value="">بدون قسم رئيسي (قسم أساسي)</option>
                                        {possibleParents.map(p => (
                                            <option key={p.id} value={p.id}>{p.name_ar}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest px-2">الرابط البديل (Slug)</label>
                                    <input
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        className="w-full bg-secondary border border-border rounded-2xl px-6 py-4 outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 text-sm font-black text-foreground transition-all shadow-inner placeholder:text-muted-foreground/30"
                                        placeholder="cold-drinks"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest px-2">ترتيب القسم</label>
                                    <input
                                        type="number"
                                        value={formData.display_order}
                                        onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-secondary border border-border rounded-2xl px-6 py-4 outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 text-sm font-black text-foreground transition-all shadow-inner"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 md:p-8 border-t border-border flex items-center justify-between gap-6 bg-secondary/30">
                            {category && (
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(true)}
                                    disabled={loading}
                                    className="px-5 py-3.5 text-destructive hover:bg-destructive/10 rounded-2xl transition-all flex items-center gap-2.5 font-black text-xs disabled:opacity-50"
                                >
                                    <Trash2 size={20} />
                                    حذف القسم
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
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} className="group-hover:rotate-12 transition-transform" />}
                                    {category ? 'تحديث القسم' : 'اعتماد القسم'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
