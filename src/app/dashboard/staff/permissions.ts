export type PermissionsMap = Record<string, Record<string, boolean>>;

export const SECTIONS = [
    {
        id: 'orders',
        label: 'الطلبات',
        icon: '📦',
        actions: [
            { id: 'view', label: 'عرض' },
            { id: 'update_status', label: 'تحديث الحالة' },
            { id: 'assign_staff', label: 'تعيين موظف' },
            { id: 'delete', label: 'حذف' },
        ],
    },
    {
        id: 'products',
        label: 'المنتجات',
        icon: '🛍',
        actions: [
            { id: 'view', label: 'عرض' },
            { id: 'add', label: 'إضافة' },
            { id: 'edit', label: 'تعديل' },
            { id: 'delete', label: 'حذف' },
        ],
    },
    {
        id: 'categories',
        label: 'الأقسام',
        icon: '🗂',
        actions: [
            { id: 'view', label: 'عرض' },
            { id: 'add', label: 'إضافة' },
            { id: 'edit', label: 'تعديل' },
            { id: 'delete', label: 'حذف' },
        ],
    },
    {
        id: 'customers',
        label: 'العملاء',
        icon: '👥',
        actions: [
            { id: 'view', label: 'عرض' },
            { id: 'edit', label: 'تعديل' },
        ],
    },
    {
        id: 'staff',
        label: 'الفريق',
        icon: '🔐',
        actions: [
            { id: 'view', label: 'عرض' },
            { id: 'add', label: 'إضافة' },
            { id: 'edit', label: 'تعديل' },
            { id: 'delete', label: 'حذف' },
        ],
    },
];

const ALL_PERMS: PermissionsMap = Object.fromEntries(
    SECTIONS.map(s => [s.id, Object.fromEntries(s.actions.map(a => [a.id, true]))])
);

const ORDERS_BASIC: PermissionsMap = {
    orders: { view: true, update_status: true, assign_staff: false, delete: false },
};

export const PRESETS: { id: string; label: string; desc: string; color: string; permissions: PermissionsMap }[] = [
    {
        id: 'admin',
        label: 'مدير كامل',
        desc: 'كامل الصلاحيات بدون قيود',
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        permissions: ALL_PERMS,
    },
    {
        id: 'order_confirmer',
        label: 'مؤكد طلبات',
        desc: 'عرض الطلبات وتأكيدها فقط',
        color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
        permissions: ORDERS_BASIC,
    },
    {
        id: 'preparer',
        label: 'مجهز',
        desc: 'عرض الطلبات والتحضير',
        color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
        permissions: { orders: { view: true, update_status: true, assign_staff: false, delete: false } },
    },
    {
        id: 'deliverer',
        label: 'مندوب توصيل',
        desc: 'عرض الطلبات وتحديث حالة التوصيل',
        color: 'text-green-400 bg-green-500/10 border-green-500/30',
        permissions: { orders: { view: true, update_status: true, assign_staff: false, delete: false } },
    },
    {
        id: 'sales',
        label: 'موظف مبيعات',
        desc: 'المنتجات والأقسام والطلبات',
        color: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
        permissions: {
            products: { view: true, add: true, edit: true, delete: false },
            categories: { view: true, add: true, edit: true, delete: false },
            orders: { view: true, update_status: false, assign_staff: false, delete: false },
        },
    },
    {
        id: 'custom',
        label: 'مخصص',
        desc: 'حدد الصلاحيات يدوياً',
        color: 'text-zinc-400 bg-zinc-800 border-zinc-700',
        permissions: {},
    },
];

export const buildEmptyPermissions = (): PermissionsMap =>
    Object.fromEntries(SECTIONS.map(s => [s.id, Object.fromEntries(s.actions.map(a => [a.id, false]))]));

export const mergePermissions = (base: PermissionsMap, override: PermissionsMap): PermissionsMap => {
    const empty = buildEmptyPermissions();
    const merged = { ...empty };
    for (const sectionId of Object.keys(empty)) {
        merged[sectionId] = {
            ...empty[sectionId],
            ...(base[sectionId] || {}),
            ...(override[sectionId] || {}),
        };
    }
    return merged;
};
