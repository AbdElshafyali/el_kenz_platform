import { create } from 'zustand';
import { AX_StaffService } from '../services/AX_StaffService';
import type { AX_StaffMember, AX_StaffPermission, AX_ActionMap } from '../types/AX_StaffTypes';

interface StaffState {
    members: AX_StaffMember[];
    loading: boolean;
    error: string | null;
    loadStaff: () => Promise<void>;
    savePermissions: (userId: string, permissions: Record<string, AX_ActionMap>) => Promise<void>;
    clearPermissions: (userId: string) => Promise<void>;
}

export const useStaffStore = create<StaffState>((set, get) => ({
    members: [],
    loading: false,
    error: null,

    loadStaff: async () => {
        set({ loading: true, error: null });
        try {
            const [profiles, allPerms] = await Promise.all([
                AX_StaffService.getStaffMembers(),
                AX_StaffService.getAllPermissions(),
            ]);

            const members: AX_StaffMember[] = (profiles || []).map((p: any) => ({
                ...p,
                permissions: allPerms.filter((perm: AX_StaffPermission) => perm.user_id === p.id),
            }));

            set({ members, loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }

        // Subscribe once if not already subscribed
        if (!(window as any).__staffSubscribed) {
            AX_StaffService.subscribeToStaffPermissions(() => get().loadStaff());
            AX_StaffService.subscribeToProfiles(() => get().loadStaff());
            (window as any).__staffSubscribed = true;
        }
    },

    savePermissions: async (userId, permissions) => {
        await AX_StaffService.bulkUpsertPermissions(userId, permissions);
        await get().loadStaff();
    },

    clearPermissions: async (userId) => {
        await AX_StaffService.clearAllPermissions(userId);
        await get().loadStaff();
    },
}));
