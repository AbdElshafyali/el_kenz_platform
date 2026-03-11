import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export type PermissionsMap = Record<string, Record<string, boolean>>;

interface MyPermissionsState {
    loading: boolean;
    isOwner: boolean;
    permissions: PermissionsMap;
    can: (section: string, action: string) => boolean;
}

export function useMyPermissions(): MyPermissionsState {
    const [loading, setLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);
    const [permissions, setPermissions] = useState<PermissionsMap>({});

    useEffect(() => {
        const load = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) { setLoading(false); return; }

            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .maybeSingle();

            if (profile?.role === 'admin' || profile?.role === 'store_owner') {
                setIsOwner(true);
                setLoading(false);
                return;
            }

            const { data: member } = await supabase
                .from('staff_members')
                .select('permissions')
                .eq('user_id', session.user.id)
                .eq('is_active', true)
                .maybeSingle();

            if (member?.permissions) {
                setPermissions(member.permissions as PermissionsMap);
            }

            setLoading(false);
        };

        load();
    }, []);

    const can = (section: string, action: string): boolean => {
        if (isOwner) return true;
        return permissions?.[section]?.[action] === true;
    };

    return { loading, isOwner, permissions, can };
}
