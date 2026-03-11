export const dynamic = 'force-static';
export async function generateStaticParams() { return []; }

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
    try {
        const { token } = await params;
        const admin = createAdminClient();
        const { data: invite, error } = await admin
            .from('staff_invitations')
            .select('id, staff_id, store_id, expires_at, used_at, staff_members(name, permission_level, roles)')
            .eq('token', token)
            .single();

        if (error || !invite) return NextResponse.json({ error: 'not_found' }, { status: 404 });
        if (invite.used_at) return NextResponse.json({ error: 'used' }, { status: 400 });
        if (new Date(invite.expires_at) < new Date()) return NextResponse.json({ error: 'expired' }, { status: 400 });

        return NextResponse.json({ valid: true, staff: invite.staff_members });
    } catch {
        return NextResponse.json({ error: 'server_error' }, { status: 500 });
    }
}
