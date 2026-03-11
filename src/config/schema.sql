-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- 1. ENUMS (Constants)
CREATE TYPE user_role AS ENUM ('admin', 'store_owner', 'delivery', 'customer');
CREATE TYPE order_status AS ENUM (
    'pending',
    'accepted',
    'pickup_ready',
    'picked_up',
    'delivered',
    'cancelled',
    'returned'
);
CREATE TYPE payment_status AS ENUM (
    'unpaid',
    'paid_full',
    'paid_partial',
    'deferred'
);
CREATE TYPE transaction_type AS ENUM (
    'deposit',
    'withdrawal',
    'commission',
    'penalty',
    'refund'
);
-- 2. AX_NODES (The Multi-Node Map)
CREATE TABLE ax_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    url VARCHAR(255) NOT NULL,
    anon_key VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    storage_limit_gb INT DEFAULT 1,
    current_usage_gb DECIMAL(10, 2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 2.1 AX_INVITES (Pre-authorized Users by Admin)
CREATE TABLE ax_invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    role user_role DEFAULT 'customer',
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 3. PROFILES (Users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE,
    role user_role DEFAULT 'customer',
    telegram_chat_id BIGINT UNIQUE,
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 4. STORES (Shops & Restaurants)
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES profiles(id) ON DELETE
    SET NULL,
        node_id UUID REFERENCES ax_nodes(id),
        -- Which DB node holds this store's heavy data?
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(20),
        location_lat DECIMAL(10, 8),
        location_lng DECIMAL(11, 8),
        address TEXT,
        is_active BOOLEAN DEFAULT FALSE,
        subscription_plan VARCHAR(50) DEFAULT 'free',
        commission_rate DECIMAL(5, 2) DEFAULT 10.00,
        -- e.g. 10%
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 5. PRODUCTS (Menu Items)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    category VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 6. ORDERS (The Core)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id),
    customer_id UUID REFERENCES profiles(id),
    delivery_id UUID REFERENCES profiles(id),
    status order_status DEFAULT 'pending',
    payment_status payment_status DEFAULT 'unpaid',
    total_amount DECIMAL(10, 2) NOT NULL,
    delivery_fee DECIMAL(10, 2) DEFAULT 0.0,
    system_commission DECIMAL(10, 2) DEFAULT 0.0,
    -- Security Photos
    pickup_photo_url TEXT,
    -- Store took this
    delivery_photo_url TEXT,
    -- Driver took this
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    picked_up_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE
);
-- 7. ORDER ITEMS
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INT DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL
);
-- 8. WALLETS (Financials)
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES profiles(id) UNIQUE,
    -- User Wallet
    store_id UUID REFERENCES stores(id) UNIQUE,
    -- Store Wallet
    balance DECIMAL(12, 2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'EGP',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT one_owner_only CHECK (
        (
            owner_id IS NOT NULL
            AND store_id IS NULL
        )
        OR (
            owner_id IS NULL
            AND store_id IS NOT NULL
        )
    )
);
-- 9. TRANSACTIONS (Audit Trail)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID REFERENCES wallets(id),
    amount DECIMAL(12, 2) NOT NULL,
    -- Positive = Credit, Negative = Debit
    type transaction_type NOT NULL,
    reference_id UUID,
    -- Order ID or Admin Action ID
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 10. PERMISSIONS (Granular RBAC)
CREATE TABLE ax_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role user_role NOT NULL,
    action VARCHAR(50) NOT NULL,
    -- e.g., 'orders.view', 'products.edit'
    resource VARCHAR(50) NOT NULL,
    -- e.g., 'orders', 'products'
    conditions JSONB,
    -- Custom conditions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 11. PRODUCT LIKES
CREATE TABLE product_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);
-- RLS POLICIES (Simplified for V1)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_likes ENABLE ROW LEVEL SECURITY;
-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR
SELECT USING (auth.uid() = id);
-- Policy: Stores are public (for menu browsing)
CREATE POLICY "Stores are public" ON stores FOR
SELECT USING (true);
-- Policy: Likes Management
CREATE POLICY "Public likes view" ON product_likes FOR
SELECT USING (true);
CREATE POLICY "Users can add likes" ON product_likes FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove likes" ON product_likes FOR DELETE USING (auth.uid() = user_id);