export interface AX_StaffMember {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    roles?: string[];
    permissions: any;
    is_active: boolean;
    user_id?: string;
    store_id: string;
    created_at: string;
}
