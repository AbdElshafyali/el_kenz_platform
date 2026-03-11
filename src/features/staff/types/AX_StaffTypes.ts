export type AX_Action = 'select' | 'insert' | 'update' | 'delete';

export interface AX_ActionMap {
    select: boolean;
    insert: boolean;
    update: boolean;
    delete: boolean;
}

export interface AX_StaffPermission {
    id?: string;
    user_id: string;
    resource: string;
    actions: AX_ActionMap;
    created_at?: string;
    updated_at?: string;
}

export interface AX_StaffMember {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    role: string;
    avatar_url?: string;
    created_at?: string;
    permissions: AX_StaffPermission[];
}

export const AX_RESOURCES: { key: string; label: string; icon: string }[] = [
    { key: 'products', label: 'المنتجات', icon: 'Package' },
    { key: 'categories', label: 'الأقسام', icon: 'Tag' },
    { key: 'orders', label: 'الطلبات', icon: 'Truck' },
    { key: 'order_items', label: 'تفاصيل الطلبات', icon: 'List' },
    { key: 'stores', label: 'المتاجر', icon: 'ShoppingBag' },
    { key: 'wallets', label: 'المحفظة', icon: 'Wallet' },
    { key: 'transactions', label: 'المعاملات المالية', icon: 'ArrowLeftRight' },
    { key: 'profiles', label: 'الملفات الشخصية', icon: 'Users' },
];

export const AX_ACTION_LABELS: Record<AX_Action, string> = {
    select: 'عرض',
    insert: 'إضافة',
    update: 'تعديل',
    delete: 'حذف',
};

export const AX_EMPTY_ACTIONS: AX_ActionMap = {
    select: false,
    insert: false,
    update: false,
    delete: false,
};

export const AX_FULL_ACTIONS: AX_ActionMap = {
    select: true,
    insert: true,
    update: true,
    delete: true,
};

export const AX_READ_ONLY: AX_ActionMap = {
    select: true,
    insert: false,
    update: false,
    delete: false,
};

export interface AX_PermissionPreset {
    key: string;
    label: string;
    description: string;
    permissions: Record<string, AX_ActionMap>;
}

export const AX_PRESETS: AX_PermissionPreset[] = [
    {
        key: 'full_admin',
        label: 'مدير كامل',
        description: 'كل الصلاحيات على كل الجداول',
        permissions: Object.fromEntries(AX_RESOURCES.map(r => [r.key, { ...AX_FULL_ACTIONS }])),
    },
    {
        key: 'store_manager',
        label: 'مدير متجر',
        description: 'تحكم كامل في المنتجات والأقسام والطلبات',
        permissions: {
            products: { ...AX_FULL_ACTIONS },
            categories: { ...AX_FULL_ACTIONS },
            orders: { select: true, insert: true, update: true, delete: false },
            order_items: { ...AX_READ_ONLY },
            stores: { select: true, insert: false, update: true, delete: false },
            wallets: { ...AX_READ_ONLY },
            transactions: { ...AX_READ_ONLY },
            profiles: { ...AX_READ_ONLY },
        },
    },
    {
        key: 'cashier',
        label: 'كاشير',
        description: 'عرض المنتجات + إدارة الطلبات',
        permissions: {
            products: { ...AX_READ_ONLY },
            categories: { ...AX_READ_ONLY },
            orders: { select: true, insert: true, update: true, delete: false },
            order_items: { select: true, insert: true, update: false, delete: false },
            stores: { ...AX_READ_ONLY },
            wallets: { ...AX_EMPTY_ACTIONS },
            transactions: { ...AX_EMPTY_ACTIONS },
            profiles: { ...AX_EMPTY_ACTIONS },
        },
    },
    {
        key: 'viewer',
        label: 'مشاهد فقط',
        description: 'عرض كل البيانات بدون تعديل',
        permissions: Object.fromEntries(AX_RESOURCES.map(r => [r.key, { ...AX_READ_ONLY }])),
    },
];
