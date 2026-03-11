export interface AX_OrderItem {
    id: string;
    product_id?: string;
    name: string;
    name_ar?: string;
    price: number;
    quantity: number;
    image_url?: string;
    images?: string[];
}

export interface AX_Order {
    id: string;
    status: string;
    customer_name?: string;
    customer_phone?: string;
    customer_phone2?: string;
    customer_whatsapp?: string;
    customer_address?: string;
    customer_city?: string;
    customer_district?: string;
    customer_lat?: number;
    customer_lng?: number;
    confirm_method?: 'phone' | 'whatsapp' | 'both';
    order_notes?: string;
    shipping_notes?: string;
    total_amount: number;
    prepayment_amount: number;
    payment_method: string;
    payment_proof_url?: string;
    pickup_photo_url?: string;
    delivery_photo_url?: string;
    confirmed_by?: string;
    prepared_by?: string;
    delivered_by?: string;
    created_at: string;
    items?: AX_OrderItem[];
    [key: string]: any;
}

export interface AX_Staff {
    id: string;
    name: string;
    roles?: string[];
    is_active: boolean;
}
