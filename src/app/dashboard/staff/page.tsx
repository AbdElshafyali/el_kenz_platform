'use client';

import React, { useEffect, useState } from 'react';
import { Users, Plus, Loader2 } from 'lucide-react';
import { AX_DataService } from '@/services/data-service';
import { axToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { AX_StaffMember } from '@/features/staff/types';
import { AX_StaffCard } from '@/features/staff/components/AX_StaffCard';
import { AX_StaffForm } from '@/features/staff/components/AX_StaffForm';
import { buildEmptyPermissions } from './permissions';
import { useMyPermissions } from '@/features/staff/hooks/useMyPermissions';

const EMPTY_FORM = {
    name: '', phone: '', email: '',
    roles: [] as string[],
    permissions: buildEmptyPermissions(),
    is_active: true,
};

export default function StaffPage() {
    const [staff, setStaff] = useState<AX_StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [storeId, setStoreId] = useState<string | null>(null);
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [saving, setSaving] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [inviteLinks, setInviteLinks] = useState<Record<string, string>>({});
    const [expandedPerms, setExpandedPerms] = useState<string | null>(null);
    const { isOwner, can } = useMyPermissions();

    const canAdd = isOwner || can('staff', 'add');
    const canEdit = isOwner || can('staff', 'edit');
    const canDelete = isOwner || can('staff', 'delete');

    useEffect(() => {
        const init = async () => {
            try {
                const store = await AX_DataService.getMyStore();
                if (!store) return;
                setStoreId(store.id);
                const data = await AX_DataService.getStaff(store.id);
                setStaff(data);
            } catch { axToast.error('فشل تحميل الفريق'); }
            finally { setLoading(false); }
        };
        init();
    }, []);

    const handleAdd = async () => {
        if (!storeId) return;
        setSaving(true);
        try {
            const member = await AX_DataService.addStaff({ ...form, store_id: storeId });
            setStaff(prev => [member, ...prev]);
            setShowAdd(false);
            setForm({ ...EMPTY_FORM });
            axToast.success('تمت إضافة العضو بنجاح');
        } catch { axToast.error('فشل الإضافة'); }
        finally { setSaving(false); }
    };

    const handleSave = async (id: string, editForm: any) => {
        setSaving(true);
        try {
            const updated = await AX_DataService.updateStaff(id, editForm);
            setStaff(prev => prev.map(s => s.id === id ? updated : s));
            setEditId(null);
            axToast.success('تم التحديث بنجاح');
        } catch { axToast.error('فشل التحديث'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id: string) => {
        try {
            await AX_DataService.deleteStaff(id);
            setStaff(prev => prev.filter(s => s.id !== id));
            axToast.success('تم الحذف بنجاح');
        } catch { axToast.error('فشل الحذف'); }
    };

    const toggleActive = async (member: AX_StaffMember) => {
        try {
            const updated = await AX_DataService.updateStaff(member.id, { is_active: !member.is_active });
            setStaff(prev => prev.map(s => s.id === member.id ? updated : s));
        } catch { axToast.error('فشل تغيير الحالة'); }
    };

    const generateInvite = async (id: string) => {
        if (!storeId) return;
        try {
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24);
            const { data, error } = await createClient().from('staff_invitations').insert({ store_id: storeId, staff_id: id, expires_at: expiresAt.toISOString() }).select('token').single();
            if (error) throw error;
            const link = `${window.location.origin}/invite/${data.token}`;
            setInviteLinks(prev => ({ ...prev, [id]: link }));
            axToast.success('تم إنشاء الرابط');
        } catch { axToast.error('فشل إنشاء الرابط'); }
    };

    if (loading) return <div className="flex-1 flex items-center justify-center p-24"><Loader2 className="w-12 h-12 text-primary animate-spin" /></div>;

    return (
        <div className="p-4 md:p-10 space-y-10 max-w-[1600px] mx-auto min-h-screen transition-colors duration-300" dir="rtl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
                <div className="space-y-1">
                    <h1 className="text-3xl md:text-4xl font-black text-foreground flex items-center gap-4 tracking-tighter uppercase transition-colors">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
                            <Users size={24} className="text-primary" />
                        </div>
                        إدارة فريق عمل الكنز
                    </h1>
                    <p className="text-muted-foreground text-[11px] md:text-sm font-black uppercase tracking-widest italic opacity-60">صلاحيات دقيقة، تحكم كامل، وأداء استثنائي.</p>
                </div>
                {canAdd && (
                    <button 
                        onClick={() => setShowAdd(!showAdd)}
                        className="flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-2xl text-sm font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        <Plus size={20} /> {showAdd ? 'إغلاق النموذج' : 'إضافة عضو جديد'}
                    </button>
                )}
            </div>

            {showAdd && canAdd && (
                <AX_StaffForm 
                    form={form} setForm={setForm} activePreset="custom" setActivePreset={() => {}} 
                    inviteDuration="24" setInviteDuration={() => {}} onSave={handleAdd} 
                    onCancel={() => setShowAdd(false)} isSaving={saving} 
                />
            )}

            <div className="grid grid-cols-1 gap-6">
                {staff.map(member => (
                    <AX_StaffCard 
                        key={member.id} member={member} isEditing={editId === member.id}
                        onEdit={() => setEditId(member.id)} onCancelEdit={() => setEditId(null)}
                        onSave={handleSave} onDelete={handleDelete} onToggleActive={toggleActive}
                        onGenerateInvite={generateInvite} isSaving={saving} isDeleting={false}
                        isGenerating={false} inviteLink={inviteLinks[member.id]}
                        onCopyInvite={(link) => navigator.clipboard.writeText(link).then(() => axToast.success('تم النسخ'))}
                        inviteDuration="24" onDurationChange={() => {}}
                        expandedPerms={expandedPerms === member.id}
                        onTogglePerms={() => setExpandedPerms(expandedPerms === member.id ? null : member.id)}
                        canEdit={canEdit}
                        canDelete={canDelete}
                    />
                ))}
            </div>
        </div>
    );
}

