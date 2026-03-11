export interface AX_DashboardStats {
    totalOrders: number;
    totalSales: number;
    totalStores: number;
    totalDelivery: number;
    salesChange: number;
    ordersChange: number;
}

export interface AX_ChartData {
    name: string;
    sales: number;
    orders: number;
}

export interface AX_Notification {
    id: string;
    title: string;
    desc: string;
    time: string;
    type: 'order' | 'payout' | 'user' | 'alert';
}
