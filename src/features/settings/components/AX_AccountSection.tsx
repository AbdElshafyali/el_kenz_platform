'use client';

import React, { useState, useEffect } from 'react';
import { User, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { AX_DataService } from '@/services/data-service';
import { axToast } from '@/hooks/use-toast';
import { AX_ImageUploader } from '@/components/ui/AX_ImageUploader';

export function AX_AccountSection() {
    const { user, setAuth } = useAuthStore();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [fullName, setFullName] = useState(user?.full_name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [birthDate, setBirthDate] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');

    useEffect(() => {
        if (!user?.id) return;

        const loadProfile = async () => {
            try {
                const profile = await AX_DataService.getProfile(user.id);
                if (profile) {
                    setFullName(profile.full_name || '');
                    setPhone(profile.phone || '');
                    setAvatarUrl(profile.avatar_url || '');
                    // Assuming birth_date is stored in the database if added, or fallback to local
                    setBirthDate(profile.birth_date || localStorage.getItem(`ax_birth_${user.id}`) || '');
                }
            } catch (err) {
                console.error("Failed to fetch profile", err);
            } finally {
                setFetching(false);
            }
        };

        loadProfile();
    }, [user?.id]);

    const handleSave = async () => {
        if (!user?.id) return;

        try {
            setLoading(true);

            // Try saving birthDate locally to ensure it persists if DB column is missing
            localStorage.setItem(`ax_birth_${user.id}`, birthDate);

            const updates: any = {
                full_name: fullName,
                phone: phone,
                avatar_url: avatarUrl
            };

            // Send it, worst case it drops or we handle it via DB
            try {
                await AX_DataService.updateProfile(user.id, { ...updates, birth_date: birthDate });
            } catch (dbErr: any) {
                // Fallback if 'birth_date' column doesn't exist
                if (dbErr.message?.includes('birth_date')) {
                    await AX_DataService.updateProfile(user.id, updates);
                } else {
                    throw dbErr;
                }
            }

            // Update auth store
            setAuth({
                ...user,
                full_name: fullName,
                phone: phone
            });

            axToast.success('تم تحديث بيانات حسابك بنجاح.');
        } catch (err: any) {
            console.error(err);
            axToast.error('فشل الحفظ: ' + (err.message || 'حدث خطأ أثناء حفظ البيانات'));
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex justify-center items-center py-20 opacity-50">
                <Loader2 className="animate-spin text-amber-500 w-8 h-8" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-6 md:p-8 space-y-8">
                <div className="flex items-center gap-6">
                    <div className="relative group w-24 h-24">
                        <AX_ImageUploader
                            defaultImage={avatarUrl}
                            folder="/avatars"
                            label=""
                            onUploadSuccess={(url) => setAvatarUrl(url)}
                            onUploadError={(err) => axToast.error(err)}
                        />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white">{user?.full_name}</h3>
                        <p className="text-zinc-500 text-sm">{user?.email}</p>
                        <div className="mt-2 inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-[10px] font-black uppercase tracking-widest leading-none">
                            حساب {user?.role === 'admin' ? 'مدير النظام' : 'تاجر'}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                        label="الاسم الكامل"
                        value={fullName}
                        onChange={setFullName}
                    />
                    <InputField
                        label="البريد الإلكتروني"
                        value={user?.email || ''}
                        disabled
                    />
                    <InputField
                        label="رقم الهاتف"
                        value={phone}
                        onChange={setPhone}
                        placeholder="01xxxxxxxxx"
                    />
                    <InputField
                        label="تاريخ الميلاد"
                        type="date"
                        value={birthDate}
                        onChange={setBirthDate}
                        placeholder="يوم / شهر / سنة"
                    />
                </div>

                <div className="pt-4 flex justify-end gap-4">
                    <button className="px-6 py-3 rounded-2xl text-zinc-500 font-black text-sm hover:bg-zinc-800 transition-all">إلغاء</button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-8 py-3 bg-white text-black font-black rounded-2xl text-sm hover:bg-zinc-200 transition-all shadow-xl active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function InputField({
    label,
    value,
    placeholder,
    type = 'text',
    disabled = false,
    onChange
}: {
    label: string,
    value?: string,
    placeholder?: string,
    type?: string,
    disabled?: boolean,
    onChange?: (val: string) => void
}) {
    return (
        <div className="space-y-2">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest px-1">{label}</label>
            <input
                type={type}
                value={value || ''}
                onChange={(e) => onChange?.(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                className={`w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-3.5 outline-none focus:border-amber-500/40 focus:ring-4 focus:ring-amber-500/5 transition-all text-sm font-medium ${type === 'date' ? 'text-zinc-400 [color-scheme:dark]' : 'text-white'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
        </div>
    );
}

function PlusIcon() {
    return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
}
