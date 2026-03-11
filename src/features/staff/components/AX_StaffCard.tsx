'use client';

import React from 'react';
import { 
    Phone, Edit3, Trash2, Loader2, Check, X, 
    Copy, RefreshCw, Link2, ChevronUp, ChevronDown 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AX_StaffMember } from '../types';
import { ROLES } from '../constants';
import PermissionsEditor from '@/app/dashboard/staff/PermissionsEditor';
import { buildEmptyPermissions } from '@/app/dashboard/staff/permissions';

interface AX_StaffCardProps {
    member: AX_StaffMember;
    isEditing: boolean;
    onEdit: () => void;
    onCancelEdit: () => void;
    onSave: (id: string, form: any) => void;
    onDelete: (id: string) => void;
    onToggleActive: (member: AX_StaffMember) => void;
    onGenerateInvite: (id: string) => void;
    isSaving: boolean;
    isDeleting: boolean;
    isGenerating: boolean;
    inviteLink?: string;
    onCopyInvite: (link: string) => void;
    inviteDuration: string;
    onDurationChange: (val: string) => void;
    expandedPerms: boolean;
    onTogglePerms: () => void;
    canEdit?: boolean;
    canDelete?: boolean;
}

export const AX_StaffCard = ({
    member, isEditing, onEdit, onCancelEdit, onSave, onDelete, onToggleActive,
    onGenerateInvite, isSaving, isDeleting, isGenerating, inviteLink,
    onCopyInvite, inviteDuration, onDurationChange, expandedPerms, onTogglePerms,
    canEdit = true, canDelete = true
}: AX_StaffCardProps) => {
    const [editForm, setEditForm] = React.useState({ ...member, permissions: member.permissions || buildEmptyPermissions() });

    const toggleRole = (roleId: string) => {
        const current = editForm.roles || [];
        setEditForm(prev => ({
            ...prev,
            roles: current.includes(roleId) ? current.filter(r => r !== roleId) : [...current, roleId]
        }));
    };

    const countActivePerms = (perms: any) => {
        if (!perms) return 0;
        return Object.values(perms).reduce((acc: number, actions: any) =>
            acc + Object.values(actions).filter(Boolean).length, 0);
    };

    return (
        <div className={cn(
            "bg-secondary/20 border rounded-[1.5rem] overflow-hidden transition-all duration-300",
            member.is_active ? "border-border hover:border-primary/30" : "border-border opacity-50 grayscale-[0.5]"
        )}>
            {isEditing ? (
                <div className="p-6 space-y-6 animate-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-muted-foreground uppercase px-2">الاسم</label>
                            <input 
                                value={editForm.name} 
                                onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs font-bold text-foreground outline-none focus:border-primary/40 shadow-inner" 
                                placeholder="الاسم" 
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-muted-foreground uppercase px-2">التليفون</label>
                            <input 
                                value={editForm.phone || ''} 
                                onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))}
                                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs font-bold text-foreground outline-none focus:border-primary/40 shadow-inner" 
                                placeholder="التليفون" 
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-muted-foreground uppercase px-2">الإيميل</label>
                            <input 
                                value={editForm.email || ''} 
                                onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs font-bold text-foreground outline-none focus:border-primary/40 shadow-inner" 
                                placeholder="الإيميل" 
                            />
                        </div>
                    </div>

                    <div>
                        <p className="text-[10px] font-black text-muted-foreground mb-3 uppercase tracking-widest px-2">الأدوار في الطلبات</p>
                        <div className="flex gap-2 flex-wrap px-2">
                            {ROLES.map(r => {
                                const active = editForm.roles?.includes(r.id);
                                return (
                                    <button 
                                        key={r.id} 
                                        type="button" 
                                        onClick={() => toggleRole(r.id)}
                                        className={cn(
                                            "inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-[11px] font-black transition-all",
                                            active ? `${r.bg} ${r.color} border-transparent shadow-sm` : 'bg-background text-muted-foreground border-border hover:border-primary/30'
                                        )}
                                    >
                                        {r.icon} {r.label} {active && <Check size={12} />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-background/40 border border-border rounded-2xl p-4">
                        <PermissionsEditor
                            value={editForm.permissions}
                            onChange={v => setEditForm(p => ({ ...p, permissions: v }))}
                            activePreset="custom"
                            onPresetChange={() => {}}
                        />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button 
                            onClick={() => onSave(member.id, editForm)} 
                            disabled={isSaving}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-xs font-black shadow-md transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} حفظ التعديلات
                        </button>
                        <button 
                            onClick={onCancelEdit} 
                            className="px-6 py-3 bg-secondary text-muted-foreground rounded-xl text-xs font-black hover:text-foreground transition-all active:scale-95"
                        >
                            إلغاء
                        </button>
                    </div>
                </div>
            ) : (
                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 shadow-inner">
                            <span className="text-lg font-black text-primary">{(member.name || '?').charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-base font-black text-foreground">{member.name}</span>
                                {member.phone && (
                                    <a href={`tel:${member.phone}`} className="text-[11px] text-muted-foreground/60 hover:text-primary transition-colors font-mono flex items-center gap-1.5 bg-secondary/30 px-2 py-0.5 rounded-lg border border-border/50">
                                        <Phone size={10} /> {member.phone}
                                    </a>
                                )}
                                {member.user_id
                                    ? <span className="text-[10px] px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 font-black shadow-sm">مسجل ✓</span>
                                    : <span className="text-[10px] px-3 py-1 rounded-full bg-secondary text-muted-foreground/50 border border-border font-black">في انتظار التسجيل</span>
                                }
                            </div>
                            <div className="flex gap-2 mt-2.5 flex-wrap">
                                {(member.roles || []).map((role: string) => {
                                    const r = ROLES.find(x => x.id === role);
                                    if (!r) return null;
                                    return (
                                        <span key={role} className={cn(
                                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black shadow-sm",
                                            r.bg, r.color, "border-transparent"
                                        )}>
                                            {r.icon} {r.label}
                                        </span>
                                    );
                                })}
                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-secondary/50 border border-border text-muted-foreground/60 text-[10px] font-black italic">
                                    {countActivePerms(member.permissions)} صلاحية مفعلة
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <button 
                                onClick={() => onToggleActive(member)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-black transition-all border shadow-sm",
                                    member.is_active 
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/20" 
                                    : "bg-secondary border-border text-muted-foreground/40 hover:border-primary/30"
                                )}
                            >
                                {member.is_active ? 'نشط' : 'متوقف'}
                            </button>
                            {canEdit && (
                                <button 
                                    onClick={onEdit} 
                                    className="p-2.5 rounded-xl bg-background border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-all shadow-sm active:scale-90"
                                >
                                    <Edit3 size={15} />
                                </button>
                            )}
                            {canDelete && (
                                <button 
                                    onClick={() => onDelete(member.id)} 
                                    disabled={isDeleting}
                                    className="p-2.5 rounded-xl bg-destructive/5 border border-destructive/20 text-destructive hover:bg-destructive/10 transition-all shadow-sm active:scale-90 disabled:opacity-50"
                                >
                                    {isDeleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                                </button>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={onTogglePerms}
                        className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground/40 hover:text-primary transition-colors pr-2 uppercase tracking-widest"
                    >
                        {expandedPerms ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        {expandedPerms ? 'إخفاء تفاصيل الصلاحيات' : 'عرض تفاصيل الصلاحيات'}
                    </button>

                    {expandedPerms && (
                        <div className="border-t border-border/50 pt-4 animate-in slide-in-from-top-2 duration-200">
                            <div className="bg-background/20 rounded-2xl p-4 border border-border/50">
                                <PermissionsEditor
                                    value={member.permissions || buildEmptyPermissions()}
                                    onChange={() => { }}
                                    activePreset="custom"
                                    onPresetChange={() => { }}
                                />
                                <p className="text-[10px] text-muted-foreground/30 mt-3 font-black text-center italic tracking-wider">لتعديل الصلاحيات اضغط على أيقونة القلم في الأعلى ⬆</p>
                            </div>
                        </div>
                    )}

                    {!member.user_id && (
                        <div className="border-t border-border pt-4">
                            {inviteLink ? (
                                <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-300">
                                    <div className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 font-mono text-[11px] text-primary truncate shadow-inner">
                                        {inviteLink}
                                    </div>
                                    <button 
                                        onClick={() => onCopyInvite(inviteLink)}
                                        className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all active:scale-90 shrink-0 shadow-sm"
                                    >
                                        <Copy size={14} />
                                    </button>
                                    <button 
                                        onClick={() => onGenerateInvite(member.id)} 
                                        disabled={isGenerating}
                                        className="p-3 rounded-xl bg-secondary border border-border text-muted-foreground hover:text-foreground transition-all active:spin-once shrink-0 shadow-sm"
                                    >
                                        {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <select
                                        value={inviteDuration}
                                        onChange={(e) => onDurationChange(e.target.value)}
                                        className="bg-background border border-border rounded-xl px-4 py-2.5 text-xs font-black text-muted-foreground outline-none focus:border-primary/40 transition-colors shrink-0 shadow-sm"
                                    >
                                        <option value="24">رابط صالح لـ 24 ساعة</option>
                                        <option value="12">رابط صالح لـ 12 ساعة</option>
                                        <option value="8">رابط صالح لـ 8 ساعات</option>
                                        <option value="1">رابط صالح لـ ساعة واحدة</option>
                                    </select>
                                    <button 
                                        onClick={() => onGenerateInvite(member.id)} 
                                        disabled={isGenerating}
                                        className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-black transition-all active:scale-95 disabled:opacity-50 shadow-md"
                                    >
                                        {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />}
                                        توليد رابط دعوة الكنز
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
