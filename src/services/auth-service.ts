import { createClient } from '@/lib/supabase/client';

export type UserRole = 'admin' | 'store_owner' | 'delivery' | 'customer';

interface SignUpData {
    email: string;
    password?: string;
    fullName: string;
    phone: string;
    role: UserRole;
    storeName?: string;
}

export class AX_AuthService {
    private static supabase = createClient();

    /**
     * Checks if an email is registered, invited, or new.
     */
    static async checkEmailStatus(email: string): Promise<{ status: 'registered' | 'invited' | 'denied', data?: any }> {
        // 1. Check if already in profiles (Registered)
        const { data: profile } = await this.supabase
            .from('profiles')
            .select('id')
            .eq('email', email) // Note: Make sure email is in profiles or use auth.users check
            .maybeSingle();

        if (profile) return { status: 'registered' };

        // 2. Check if in invites
        const { data: invite } = await this.supabase
            .from('ax_invites')
            .select('*')
            .eq('email', email)
            .eq('is_used', false)
            .maybeSingle();

        if (invite) return { status: 'invited', data: invite };

        return { status: 'denied' };
    }

    /**
     * Checks if a token is valid and returns invite details.
     */
    static async checkToken(token: string) {
        const { data, error } = await this.supabase
            .from('ax_invites')
            .select('*')
            .eq('token', token)
            .eq('is_used', false)
            .maybeSingle();

        if (error || !data) throw new Error('رابط الدعوة غير صالح أو منتهي');
        return data;
    }

    /**
     * Finalize registration using an invite token
     */
    static async signUpWithToken({ token, email, password, fullName, phone }: { token: string, email: string, password: string, fullName: string, phone: string }) {
        // 1. Get invite by token
        const invite = await this.checkToken(token);

        // 2. Auth SignUp
        // The Postgres trigger 'on_auth_user_created' will handle profile creation automatically
        // using the data passed in the 'options.data' object.
        const { data: authData, error: authError } = await this.supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    phone: phone,
                    role: invite.role
                }
            }
        });

        if (authError) {
            if (authError.message.includes('already registered')) {
                throw new Error('هذا البريد الإلكتروني مسجل بالفعل');
            }
            throw authError;
        }

        if (!authData.user) throw new Error('فشل إنشاء الحساب');

        // 3. Mark invite as used
        // Even if profile creation fails (which it shouldn't now), the invite must be linked to the used email
        await this.supabase
            .from('ax_invites')
            .update({ is_used: true, email: email })
            .eq('id', invite.id);

        return authData.user;
    }

    static async signIn(email: string, password?: string) {
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email,
            password: password || '',
        });

        if (error) throw error;
        return data.user;
    }

    static async signOut() {
        const { error } = await this.supabase.auth.signOut();
        if (error) throw error;
    }

    static async getCurrentSession() {
        const { data: { session }, error } = await this.supabase.auth.getSession();
        if (error) return null;
        return session;
    }
}
