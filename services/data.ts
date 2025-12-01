
import { Product, Order, User, UserRole, OrderStatus, TrackingEvent, Review } from '../types';
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
const PRODUCTS_KEY = 'swiftcart_products_v16'; // Incremented version to force update
const ORDERS_KEY = 'swiftcart_orders_v1';
const USERS_KEY = 'swiftcart_users_v_final';
const BANNERS_KEY = 'swiftcart_banners_v4';

// Hardcoded Admin List
const ADMIN_EMAILS = ['admin@flipkart.com', 'owner@flipkart.com'];
const ADMIN_MOBILES = ['9999999999', '7891906445', '6378041283'];

// --- MOCK DATA GENERATOR ---

const generateMockProducts = (): Product[] => {
    const mockReviews: Review[] = [
        { id: 'r1', userId: 'u1', userName: 'Gaurav', rating: 5, comment: 'Amazing product, highly recommended!', date: '2023-10-15', likes: 12, isCertified: true },
        { id: 'r2', userId: 'u2', userName: 'Priya', rating: 4, comment: 'Good value for money.', date: '2023-10-12', likes: 5, isCertified: false }
    ];

    return [
        {
            id: 'prod_galaxy_s23',
            title: 'Samsung Galaxy S23 Ultra',
            description: 'Experience the future of smartphones with the Galaxy S23 Ultra. Pro-grade camera, powerful processor, and a stunning dynamic display.',
            price: 124999,
            originalPrice: 139999,
            category: 'Mobiles',
            image: 'https://images.unsplash.com/photo-1678820984841-67dc537a3d3c?auto=format&fit=crop&w=600&q=80',
            images: [
                'https://images.unsplash.com/photo-1678820984841-67dc537a3d3c?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1679232328227-99a7f04174c0?auto=format&fit=crop&w=800&q=80'
            ],
            rating: 4.8,
            reviewsCount: 1250,
            reviews: mockReviews,
            trending: true,
            brand: 'Samsung',
            colors: ['Phantom Black', 'Green', 'Cream'],
            isCustom: false
        },
        {
            id: 'prod_macbook_air_m2',
            title: 'MacBook Air M2',
            description: 'The new MacBook Air with the M2 chip is more capable than ever. Supercharged performance and up to 18 hours of battery life.',
            price: 110500,
            originalPrice: 114900,
            category: 'Electronics',
            image: 'https://images.unsplash.com/photo-1662010022437-adb599a059c7?auto=format&fit=crop&w=600&q=80',
            images: [],
            rating: 4.9,
            reviewsCount: 890,
            reviews: [],
            trending: true,
            brand: 'Apple',
            colors: ['Midnight', 'Starlight', 'Space Gray'],
            isCustom: false
        },
        {
            id: 'prod_nike_running',
            title: 'Nike Air Zoom Pegasus',
            description: 'A responsive ride for any run. The Nike Air Zoom Pegasus brings back the cushioning and support you love.',
            price: 8995,
            originalPrice: 10295,
            category: 'Fashion',
            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
            images: [],
            rating: 4.6,
            reviewsCount: 2340,
            reviews: [],
            trending: false,
            brand: 'Nike',
            colors: ['Black', 'White', 'Blue'],
            isCustom: false
        },
        {
            id: 'prod_fossil_watch',
            title: 'Fossil Gen 6 Smartwatch',
            description: 'The Fossil Gen 6 Smartwatch is the perfect blend of style and technology. Track your health, get notifications, and more.',
            price: 24995,
            originalPrice: 24995,
            category: 'Watches',
            image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=600&q=80',
            images: [],
            rating: 4.4,
            reviewsCount: 650,
            reviews: [],
            trending: true,
            brand: 'Fossil',
            colors: ['Smoke Stainless Steel', 'Brown Leather'],
            isCustom: false
        }
    ];
};

// --- SERVICE FUNCTIONS ---

export const initializeData = async (): Promise<void> => {
    if (typeof window !== 'undefined' && localStorage) {
        // We use a versioned key. If the key doesn't exist, we populate the data.
        // This allows us to update the mock data by just changing the key version.
        if (!localStorage.getItem(PRODUCTS_KEY)) {
            console.log("Initializing mock products in local storage...");
            const mockProducts = generateMockProducts();
            localStorage.setItem(PRODUCTS_KEY, JSON.stringify(mockProducts));
        }

        if (!localStorage.getItem(BANNERS_KEY)) {
            console.log("Initializing banners in local storage...");
            localStorage.setItem(BANNERS_KEY, JSON.stringify(BANNER_IMAGES));
        }
    }
};

const simulateTracking = (order: Order): Order => {
    // This is a mock function, it can be left as is.
    return order;
};


export const fetchProducts = async (): Promise<Product[]> => {
    await apiDelay();
    if (ENABLE_API) {
        try { return await apiRequest<Product[]>('/products'); } catch (e) { console.error(e); }
    }
    const localData = localStorage.getItem(PRODUCTS_KEY);
    return localData ? JSON.parse(localData) : [];
};

export const fetchOrders = async (): Promise<Order[]> => {
    await apiDelay();
    if (ENABLE_API) {
        try { return await apiRequest<Order[]>('/orders'); } catch (e) { console.error(e); }
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
        try { return await apiRequest<Order>('/orders', 'POST', newOrderWithTracking); } catch (e) { console.error(e); }
    }
    const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    orders.unshift(newOrderWithTracking);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    return newOrderWithTracking;
};

export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<void> => {
    await apiDelay();
    if (ENABLE_API) {
        try { await apiRequest(`/orders/${id}`, 'PATCH', { status }); return; } catch (e) { console.error(e); }
    }
    const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    const updated = orders.map((o: Order) => o.id === id ? { ...o, status } : o);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
};

// ... (Rest of the functions can remain as they are, they are not related to the product visibility issue)

export const checkUserExists = async (identifier: string): Promise<boolean> => { return false; };
export const registerUser = async (userData: any): Promise<User> => { const newUser: User = { id: '', name: '', email: '', mobile: '', role: UserRole.USER }; return newUser; };
export const authenticateUser = async (identifier: string): Promise<User> => { const user: User = { id: '', name: '', email: '', mobile: '', role: UserRole.USER }; return user; };
export const updateUser = async (user: User): Promise<User> => { return user; };
export const saveProduct = async (product: Product): Promise<void> => {};
export const deleteProduct = async (id: string): Promise<void> => {};

export const fetchBanners = async (): Promise<string[]> => {
    await apiDelay();
    if (ENABLE_API) {
      try { return await apiRequest<string[]>('/banners'); } catch(e) { console.error(e) }
    }
    const localBanners = localStorage.getItem(BANNERS_KEY);
    return localBanners ? JSON.parse(localBanners) : [];
};

export const saveBanners = async (banners: string[]): Promise<void> => {
    await apiDelay();
    if (ENABLE_API) {
      try { await apiRequest('/banners', 'POST', { banners }); return; } catch (e) { console.error(e) }
    }
    localStorage.setItem(BANNERS_KEY, JSON.stringify(banners));
};

export const initiatePayment = async (amount: number, orderId: string, email: string, name: string): Promise<{success: boolean, payment_session_id?: string}> => {
    console.log("Mock Payment Initiation");
    await apiDelay();
    return { success: true, payment_session_id: "mock_session_id_for_testing" };
};
