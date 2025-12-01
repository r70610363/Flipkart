
import { Product, Order, User, UserRole, OrderStatus, TrackingEvent } from '../types';
import { API_BASE_URL, ENABLE_API, MOCK_DELAY } from './config';
import { BANNER_IMAGES } from '../constants';

// Helper for API requests
async function apiRequest<T>(endpoint: string, method: string = 'GET', body?: any): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    
    const config: RequestInit = {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("API Request Failed", error);
        throw error;
    }
}

const apiDelay = () => new Promise(resolve => setTimeout(resolve, MOCK_DELAY));

// Keys for Local Storage
const PRODUCTS_KEY = 'swiftcart_products_v15';
const ORDERS_KEY = 'swiftcart_orders_v1';
const USERS_KEY = 'swiftcart_users_v_final';
const BANNERS_KEY = 'swiftcart_banners_v4';

// Hardcoded Admin List
const ADMIN_EMAILS = ['admin@flipkart.com', 'owner@flipkart.com'];
const ADMIN_MOBILES = ['9999999999', '7891906445', '6378041283'];

// --- MOCK DATA GENERATOR ---

const generateMockProducts = (): Product[] => {
    // ... (mock data generation - keeping it collapsed for brevity)
    return []; // In a real scenario, this would generate the full list
};

// --- SERVICE FUNCTIONS ---

export const initializeData = async (): Promise<void> => {
    // ... (data initialization - keeping it collapsed)
};

const simulateTracking = (order: Order): Order => {
    // ... (tracking simulation - keeping it collapsed)
    return order;
};


export const fetchProducts = async (): Promise<Product[]> => {
    await apiDelay();
    if (ENABLE_API) {
        try { return await apiRequest<Product[]>('/products'); } catch (e) {}
    }
    const localData = localStorage.getItem(PRODUCTS_KEY);
    return localData ? JSON.parse(localData) : [];
};

export const fetchOrders = async (): Promise<Order[]> => {
    await apiDelay();
    if (ENABLE_API) {
        try { return await apiRequest<Order[]>('/orders'); } catch (e) {}
    }
    const localData = localStorage.getItem(ORDERS_KEY);
    const orders: Order[] = localData ? JSON.parse(localData) : [];
    return orders.map(simulateTracking);
};

export const fetchOrderById = async (id: string): Promise<Order | null> => {
    await apiDelay();
    const orders = await fetchOrders(); 
    const order = orders.find(o => o.id === id);
    return order || null;
}

export const createOrder = async (order: Order): Promise<Order> => {
    await apiDelay();
    
    const startDate = new Date(order.date);
    const estimatedDeliveryDate = new Date(new Date(order.date).setDate(startDate.getDate() + 3));

    const newOrderWithTracking: Order = {
        ...order,
        status: 'Ordered',
        estimatedDelivery: estimatedDeliveryDate.toISOString(),
        trackingHistory: [{
            status: 'Ordered',
            date: order.date,
            location: 'Online',
            description: 'Your order has been placed successfully.'
        }]
    };

    if (ENABLE_API) {
        try { return await apiRequest<Order>('/orders', 'POST', newOrderWithTracking); } catch (e) {}
    }
    const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    orders.unshift(newOrderWithTracking);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    return newOrderWithTracking;
};

export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<void> => {
    await apiDelay();
    if (ENABLE_API) {
        try { await apiRequest(`/orders/${id}`, 'PATCH', { status }); return; } catch (e) {}
    }
    const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    const updated = orders.map((o: Order) => o.id === id ? { ...o, status } : o);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
};

// --- USER MANAGEMENT ---

export const checkUserExists = async (identifier: string): Promise<boolean> => {
    // ... (user check)
    return false;
};

export const registerUser = async (userData: any): Promise<User> => {
    // ... (user registration)
    const newUser: User = { id: '', name: '', email: '', mobile: '', role: UserRole.USER };
    return newUser;
};

export const authenticateUser = async (identifier: string): Promise<User> => {
    // ... (user auth)
    const user: User = { id: '', name: '', email: '', mobile: '', role: UserRole.USER };
    return user;
};

export const updateUser = async (user: User): Promise<User> => {
    // ... (user update)
    return user;
};

// --- ADMIN PRODUCT MANAGEMENT ---

export const saveProduct = async (product: Product): Promise<void> => {
    // ... (save product)
};

export const deleteProduct = async (id: string): Promise<void> => {
    // ... (delete product)
};

// --- BANNER MANAGEMENT ---

export const fetchBanners = async (): Promise<string[]> => {
    // ... (fetch banners)
    return [];
};

export const saveBanners = async (banners: string[]): Promise<void> => {
    // ... (save banners)
};

export const initiatePayment = async (amount: number, orderId: string, email: string, name: string): Promise<{success: boolean, payment_session_id?: string}> => {
    if (ENABLE_API) {
        try {
            return await apiRequest<{success: boolean, payment_session_id?: string}>('/api/payment/initiate', 'POST', { amount, orderId, email, name });
        } catch (e) {
            console.error("Payment API Error", e);
            return { success: false };
        }
    }
    // Mock Success for local testing without backend
    console.log("Mock Payment Initiation with Cashfree Session ID");
    await apiDelay();
    return { success: true, payment_session_id: "mock_session_id_for_testing" };
};
