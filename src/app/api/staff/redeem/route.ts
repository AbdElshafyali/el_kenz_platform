export const dynamic = 'force-static';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
    try {
        const { token, name, phone, email, password } = await req.json();

        if (!token || !name || !phone || !email || !password) {
            return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 });
        }

        const admin = createAdminClient();

        const { data: invite, error: inviteErr } = await admin
            .from('staff_invitations')
            .select('*, staff_members(*)')
            .eq('token', token)
            .is('used_at', null)
            .gt('expires_at', new Date().toISOString())
            .single();

        if (inviteErr || !invite) {
            console.error('Invite Error:', inviteErr, 'Invite Data:', invite);
            return NextResponse.json({ error: 'الرابط غير صالح أو منتهي' }, { status: 400 });
        }

        const { data: authData, error: authErr } = await admin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
        });

        if (authErr || !authData.user) {
            console.error('Auth Error:', authErr);
            return NextResponse.json({ error: authErr?.message || 'فشل إنشاء الحساب' }, { status: 400 });
        }

        await admin
            .from('staff_members')
            .update({ user_id: authData.user.id, name, phone, email })
            .eq('id', invite.staff_id);

        await admin
            .from('staff_invitations')
            .update({ used_at: new Date().toISOString() })
            .eq('id', invite.id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('General Error:', error);
        return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 });
    }
}
