'use client';

import React from 'react';
import { Plus, Check, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROLES } from '../constants';
import PermissionsEditor from '@/app/dashboard/staff/PermissionsEditor';

interface AX_StaffFormProps {
    form: any;
    setForm: (val: any) => void;
    activePreset: string;
    setActivePreset: (val: string) => void;
    inviteDuration: string;
    setInviteDuration: (val: string) => void;
    onSave: () => void;
    onCancel: () => void;
    isSaving: boolean;
}

export const AX_StaffForm = ({
    form, setForm, activePreset, setActivePreset, 
    inviteDuration, setInviteDuration, onSave, onCancel, isSaving
}: AX_StaffFormProps) => {

    const toggleRole = (roleId: string) => {
        const current = form.roles || [];
        setForm({
            ...form,
            roles: current.includes(roleId) ? current.filter((r: string) => r !== roleId) : [...current, roleId]
        });
    };

    return (
        <div className="bg-primary/5 border border-primary/20 rounded-[2rem] p-8 space-y-8 animate-in slide-in-from-top-4 duration-500 shadow-2xl relative overflow-hidden backdrop-blur-xl transition-colors duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl -z-10 animate-pulse" />
            
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6">
                    <Plus size={24} className="text-primary-foreground" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-foreground tracking-tighter uppercase">إضافة عضو فريق جديد</h2>
                    <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest opacity-60">املأ البيانات والتمس الدقة في الصلاحيات</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-muted-foreground uppercase px-2 tracking-widest">الاسم الكامل (اختياري - يكتبه الموظف)</label>
                    <input 
                        placeholder="موظف الكنز الجديد..." 
                        value={form.name} 
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        className="w-full bg-background border border-border rounded-2xl px-5 py-3.5 text-sm font-bold text-foreground outline-none focus:border-primary/50 shadow-inner transition-all" 
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-muted-foreground uppercase px-2 tracking-widest">رقم التليفون (اختياري - يكتبه الموظف)</label>
                    <input 
                        placeholder="01xxxxxxxxx" 
                        value={form.phone} 
                        onChange={e => setForm({ ...form, phone: e.target.value })}
                        className="w-full bg-background border border-border rounded-2xl px-5 py-3.5 text-sm font-bold text-foreground outline-none focus:border-primary/50 shadow-inner transition-all font-mono" 
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-muted-foreground uppercase px-2 tracking-widest">البريد (اختياري - يكتبه الموظف)</label>
                    <input 
                        placeholder="email@example.com" 
                        value={form.email} 
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        className="w-full bg-background border border-border rounded-2xl px-5 py-3.5 text-sm font-bold text-foreground outline-none focus:border-primary/50 shadow-inner transition-all" 
                    />
                </div>
            </div>

            <div className="space-y-4">
                <div className="text-[10px] font-black text-foreground mb-2 uppercase tracking-[0.2em] flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" /> الأدوار الوظيفية في النظام
                </div>
                <div className="flex gap-3 flex-wrap">
                    {ROLES.map(r => {
                        const active = form.roles.includes(r.id);
                        return (
                            <button 
                                key={r.id} 
                                type="button" 
                                onClick={() => toggleRole(r.id)}
                                className={cn(
                                    "inline-flex items-center gap-2 px-5 py-3 rounded-2xl border text-xs font-black transition-all transform hover:scale-105 active:scale-95 shadow-sm",
                                    active ? `${r.bg} ${r.color} border-transparent shadow-md` : 'bg-background text-muted-foreground border-border hover:border-primary/30'
                                )}
                            >
                                {r.icon} {r.label} {active && <Check size={14} />}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="border-t border-border/50 pt-8">
                <PermissionsEditor
                    value={form.permissions}
                    onChange={v => setForm({ ...form, permissions: v })}
                    activePreset={activePreset}
                    onPresetChange={setActivePreset}
                />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-border/50">
                <div className="flex items-center gap-4 bg-secondary/30 px-5 py-2.5 rounded-2xl border border-border/50">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">مدة صلاحية رابط الدعوة:</p>
                    <select
                        value={inviteDuration}
                        onChange={(e) => setInviteDuration(e.target.value)}
                        className="bg-transparent text-sm font-black text-primary outline-none cursor-pointer"
                    >
                        <option value="24">يوم كامل (24س)</option>
                        <option value="12">12 ساعة</option>
                        <option value="8">8 ساعات</option>
                        <option value="1">ساعة واحدة</option>
                    </select>
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                    <button 
                        onClick={onSave} 
                        disabled={isSaving}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-10 py-4 bg-primary text-primary-foreground rounded-2xl text-sm font-black shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />} حفظ بيانات العضو
                    </button>
                    <button 
                        onClick={onCancel} 
                        className="px-8 py-4 bg-secondary text-muted-foreground rounded-2xl text-sm font-black hover:text-foreground transition-all active:scale-95 shadow-lg"
                    >
                        إلغاء
                    </button>
                </div>
            </div>
        </div>
    );
};
