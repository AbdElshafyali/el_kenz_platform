import { createClient } from '@/lib/supabase/client';
import type { AX_StaffPermission, AX_ActionMap } from '../types/AX_StaffTypes';

const supabase = createClient();

export const AX_StaffService = {
    getStaffMembers: async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .in('role', ['store_owner', 'delivery', 'customer'])
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    getPermissions: async (userId: string): Promise<AX_StaffPermission[]> => {
        const { data, error } = await supabase
            .from('staff_permissions')
            .select('*')
            .eq('user_id', userId);
        if (error) throw error;
        return data || [];
    },

    getAllPermissions: async (): Promise<AX_StaffPermission[]> => {
        const { data, error } = await supabase
            .from('staff_permissions')
            .select('*');
        if (error) throw error;
        return data || [];
    },

    upsertPermission: async (userId: string, resource: string, actions: AX_ActionMap) => {
        const hasAny = Object.values(actions).some(Boolean);

        if (!hasAny) {
            const { error } = await supabase
                .from('staff_permissions')
                .delete()
                .eq('user_id', userId)
                .eq('resource', resource);
            if (error) throw error;
            return null;
        }

        const { data, error } = await supabase
            .from('staff_permissions')
            .upsert(
                { user_id: userId, resource, actions, updated_at: new Date().toISOString() },
                { onConflict: 'user_id,resource' }
            )
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    bulkUpsertPermissions: async (userId: string, permissions: Record<string, AX_ActionMap>) => {
        const toDelete: string[] = [];
        const toUpsert: { user_id: string; resource: string; actions: AX_ActionMap; updated_at: string }[] = [];

        for (const [resource, actions] of Object.entries(permissions)) {
            const hasAny = Object.values(actions).some(Boolean);
            if (hasAny) {
                toUpsert.push({ user_id: userId, resource, actions, updated_at: new Date().toISOString() });
            } else {
                toDelete.push(resource);
            }
        }

        if (toDelete.length > 0) {
            const { error } = await supabase
                .from('staff_permissions')
                .delete()
                .eq('user_id', userId)
                .in('resource', toDelete);
            if (error) throw error;
        }

        if (toUpsert.length > 0) {
            const { error } = await supabase
                .from('staff_permissions')
                .upsert(toUpsert, { onConflict: 'user_id,resource' });
            if (error) throw error;
        }
    },

    clearAllPermissions: async (userId: string) => {
        const { error } = await supabase
            .from('staff_permissions')
            .delete()
            .eq('user_id', userId);
        if (error) throw error;
    },

    subscribeToStaffPermissions: (callback: (payload: any) => void) => {
        return supabase
            .channel('public:staff_permissions')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'staff_permissions' }, callback)
            .subscribe();
    },

    subscribeToProfiles: (callback: (payload: any) => void) => {
        return supabase
            .channel('public:profiles')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, callback)
            .subscribe();
    },
};
