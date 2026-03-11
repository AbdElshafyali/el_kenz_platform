import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export const AX_DataService = {
    // Auth
    getCurrentSession: async () => {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        return session;
    },

    // Categories
    getCategories: async () => {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('display_order', { ascending: true });
        if (error) throw error;
        return data;
    },

    addCategory: async (category: any) => {
        const { data, error } = await supabase
            .from('categories')
            .insert([category])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    updateCategory: async (id: string, updates: any) => {
        const { data, error } = await supabase
            .from('categories')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    deleteCategory: async (id: string) => {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
    },

    subscribeToCategories: (callback: (payload: any) => void) => {
        return supabase
            .channel('public:categories')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, callback)
            .subscribe();
    },

    // Real-time Stores
    getStores: async () => {
        const { data, error } = await supabase
            .from('stores')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    getMyStore: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return null;

        const { data: owned, error: ownedErr } = await supabase
            .from('stores')
            .select('*')
            .eq('owner_id', session.user.id)
            .maybeSingle();

        if (ownedErr) throw ownedErr;
        if (owned) return owned;

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .maybeSingle();

        if (profile?.role === 'admin') {
            const { data: firstStore, error: fsErr } = await supabase
                .from('stores')
                .select('*')
                .order('created_at', { ascending: true })
                .limit(1)
                .maybeSingle();
            if (fsErr) throw fsErr;
            return firstStore;
        }

        return null;
    },

    subscribeToStores: (callback: (payload: any) => void) => {
        return supabase
            .channel('public:stores')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'stores' }, callback)
            .subscribe();
    },

    updateStore: async (id: string, updates: any) => {
        const { data, error } = await supabase
            .from('stores')
            .update(updates)
            .eq('id', id)
            .select()
            .maybeSingle();
        if (error) throw error;
        if (!data) throw new Error('فشل الحفظ: لا توجد صلاحية للتعديل على هذا المتجر.');
        return data;
    },

    // Real-time Products
    getProducts: async () => {
        const { data, error } = await supabase
            .from('products')
            .select('*, stores(name)')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    subscribeToProducts: (callback: (payload: any) => void) => {
        return supabase
            .channel('public:products')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, callback)
            .subscribe();
    },


    placeOrder: async (order: any) => {
        const { data, error } = await supabase
            .from('orders')
            .insert([order])
            .select()
            .single();
        if (error) throw error;
        return data;
    },



    // Wallet Balance (calculated or from table)
    // Wallet Balance (calculated or from table)
    getWalletBalance: async (storeId?: string) => {
        const query = supabase.from('wallets').select('*');
        if (storeId) {
            query.eq('store_id', storeId);
        }
        const { data, error } = await query.maybeSingle();
        if (error) throw error;
        return data;
    },

    subscribeToWallets: (callback: (payload: any) => void) => {
        return supabase
            .channel('public:wallets')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'wallets' }, callback)
            .subscribe();
    },

    // Product Mutations
    addProduct: async (product: any) => {
        const { data, error } = await supabase
            .from('products')
            .insert([product])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    updateProduct: async (id: string, updates: any) => {
        const { data, error } = await supabase
            .from('products')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    deleteProduct: async (id: string) => {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
    },

    // Transactions
    getTransactions: async (limit = 10, startDate?: string, endDate?: string) => {
        let query = supabase
            .from('transactions')
            .select('*')
            .order('created_at', { ascending: false });

        if (startDate) query = query.gte('created_at', startDate);
        if (endDate) query = query.lte('created_at', endDate);

        const { data, error } = await query.limit(limit);
        if (error) throw error;
        return data;
    },

    subscribeToTransactions: (callback: (payload: any) => void) => {
        return supabase
            .channel('public:transactions')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, callback)
            .subscribe();
    },

    // Likes
    likeProduct: async (userId: string, productId: string) => {
        const { data, error } = await supabase
            .from('product_likes')
            .insert([{ user_id: userId, product_id: productId }])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    unlikeProduct: async (userId: string, productId: string) => {
        const { error } = await supabase
            .from('product_likes')
            .delete()
            .eq('user_id', userId)
            .eq('product_id', productId);
        if (error) throw error;
        return true;
    },

    getUserLikes: async (userId: string) => {
        const { data, error } = await supabase
            .from('product_likes')
            .select('product_id')
            .eq('user_id', userId);
        if (error) throw error;
        return data.map((l: any) => l.product_id);
    },

    getProductLikesCount: async () => {
        const { data, error } = await supabase
            .from('product_likes')
            .select('product_id');
        if (error) throw error;

        return (data || []).reduce((acc: any, curr: any) => {
            acc[curr.product_id] = (acc[curr.product_id] || 0) + 1;
            return acc;
        }, {});
    },

    getRecentLikes: async () => {
        const { data, error } = await supabase
            .from('product_likes')
            .select(`
                user_id,
                product_id,
                created_at,
                profiles ( full_name )
            `)
            .order('created_at', { ascending: false })
            .limit(15);

        if (error) {
            console.warn('Could not fetch recent likes, table might not support it:', error);
            return [];
        }
        return data;
    },

    subscribeToLikes: (callback: (payload: any) => void) => {
        return supabase
            .channel('public:product_likes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'product_likes' }, callback)
            .subscribe();
    },

    getStore: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return null;
        const { data } = await supabase.from('stores').select('*').eq('owner_id', session.user.id).maybeSingle();
        return data;
    },

    getOrders: async (storeId?: string, startDate?: string, endDate?: string) => {
        let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (storeId) query = query.eq('store_id', storeId);
        if (startDate) query = query.gte('created_at', startDate);
        if (endDate) query = query.lte('created_at', endDate);

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    updateOrderStatus: async (orderId: string, status: string) => {
        const { data, error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', orderId)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    subscribeToOrders: (storeIdOrCallback: string | (() => void), callback?: () => void) => {
        const storeId = typeof storeIdOrCallback === 'string' ? storeIdOrCallback : undefined;
        const cb = typeof storeIdOrCallback === 'function' ? storeIdOrCallback : callback!;
        const channelName = storeId ? `orders:${storeId}` : 'orders:all';
        const filter = storeId ? `store_id=eq.${storeId}` : undefined;
        const config: any = { event: '*', schema: 'public', table: 'orders' };
        if (filter) config.filter = filter;
        return supabase.channel(channelName).on('postgres_changes', config, cb).subscribe();
    },

    getCustomers: async (storeId: string) => {
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .eq('store_id', storeId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },

    getCustomerOrders: async (storeId: string, phone: string) => {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('store_id', storeId)
            .eq('customer_phone', phone)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },

    updateCustomer: async (id: string, updates: any) => {
        const { data, error } = await supabase
            .from('customers')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    getStaff: async (storeId: string) => {
        const { data, error } = await supabase
            .from('staff_members')
            .select('*')
            .eq('store_id', storeId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },

    addStaff: async (member: any) => {
        const { data, error } = await supabase
            .from('staff_members')
            .insert([member])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    updateStaff: async (id: string, updates: any) => {
        const { data, error } = await supabase
            .from('staff_members')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    deleteStaff: async (id: string) => {
        const { error } = await supabase
            .from('staff_members')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
    },

    updateOrderAssignment: async (orderId: string, updates: Record<string, any>) => {
        const { data, error } = await supabase
            .from('orders')
            .update(updates)
            .eq('id', orderId)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    getProfiles: async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*');
        if (error) throw error;
        return data || [];
    },

    getProfile: async (userId: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
        if (error) throw error;
        return data;
    },

    updateProfile: async (userId: string, updates: any) => {
        const { data, error } = await supabase
            .from('profiles')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', userId)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    getSystemMetrics: async () => {
        const { data, error } = await supabase.rpc('get_db_metrics');
        if (error) throw error;
        return data;
    },
};

