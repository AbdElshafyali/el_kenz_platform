export interface AX_Customer {
    id: string;
    phone: string;
    name: string;
    phone2?: string;
    whatsapp?: string;
    address?: string;
    city?: string;
    district?: string;
    is_blocked: boolean;
    block_reason?: string;
    admin_notes?: string;
    total_orders: number;
    created_at: string;
}

export interface AX_CustomerOrder {
    id: string;
    created_at: string;
    payment_method: string;
    total_amount: number;
    status: string;
}
