import { User, Product, Order, UserRole, OrderStatus } from './types';

export const MOCK_USERS: User[] = [
  { id: 'admin-01', username: 'admi', password: '123', role: UserRole.ADMIN, name: 'Administrador' },
  { id: 'plant-01', username: 'planta', password: '123', role: UserRole.PLANT, name: 'Planta Central de Panadería' },
  { id: 'store-01', username: 'tienda1', password: '123', role: UserRole.STORE, name: 'Panadería del Centro' },
  { id: 'store-02', username: 'tienda2', password: '123', role: UserRole.STORE, name: 'Panadería del Norte' },
  { id: 'store-03', username: 'tienda3', password: '123', role: UserRole.STORE, name: 'Panadería La Esquina' },
];

export const MOCK_PRODUCTS: Product[] = [
  { id: 'prod-01', name: 'Masa de Hojaldre (kg)', imageUrl: 'https://images.unsplash.com/photo-1621282103395-882a1b7c1a84?q=80&w=1974&auto=format&fit=crop' },
  { id: 'prod-02', name: 'Harina de Trigo (bulto)', imageUrl: 'https://images.unsplash.com/photo-1599579089988-193eb5b719f9?q=80&w=1974&auto=format&fit=crop' },
  { id: 'prod-03', name: 'Huevos (Bandeja x30)', imageUrl: 'https://images.unsplash.com/photo-1582722872445-44dc5f2e6c8f?q=80&w=1974&auto=format&fit=crop' },
  { id: 'prod-04', name: 'Mantequilla (Bloque 1kg)', imageUrl: 'https://images.unsplash.com/photo-1628088240563-54440538a1f4?q=80&w=1995&auto=format&fit=crop' },
  { id: 'prod-05', name: 'Levadura Fresca (kg)', imageUrl: 'https://images.unsplash.com/photo-1627918512533-365239a531a8?q=80&w=1974&auto=format&fit=crop' },
  { id: 'prod-06', name: 'Arequipe (5kg)', imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdfc1586a?q=80&w=1974&auto=format&fit=crop' },
];

export const MOCK_ORDERS: Order[] = [
    {
        id: 'ord-001',
        storeId: 'store-01',
        storeName: 'Panadería del Centro',
        items: [{ productId: 'prod-01', quantity: 50 }, { productId: 'prod-02', quantity: 30 }],
        status: OrderStatus.PENDING,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'ord-002',
        storeId: 'store-02',
        storeName: 'Panadería del Norte',
        items: [{ productId: 'prod-03', quantity: 20 }, { productId: 'prod-05', quantity: 15 }],
        status: OrderStatus.PENDING,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'ord-003',
        storeId: 'store-01',
        storeName: 'Panadería del Centro',
        items: [{ productId: 'prod-04', quantity: 40 }],
        status: OrderStatus.PENDING,
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'ord-004',
        storeId: 'store-03',
        storeName: 'Panadería La Esquina',
        items: [{ productId: 'prod-01', quantity: 25 }, { productId: 'prod-06', quantity: 60 }],
        status: OrderStatus.PENDING,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    },
     {
        id: 'ord-005',
        storeId: 'store-02',
        storeName: 'Panadería del Norte',
        items: [{ productId: 'prod-02', quantity: 40 }, { productId: 'prod-03', quantity: 10 }, { productId: 'prod-04', quantity: 30 }],
        status: OrderStatus.DISPATCHED,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
];

// FIX: Added missing MILHOJAS_LOGO_BASE64 constant which was causing an import error.
export const MILHOJAS_LOGO_BASE64 = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PGcgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmJkMjgwIiBzdHJva2Utd2lkdGg9IjUiPjxwYXRoIGQ9Ik01MCAyNWgxMDAiLz48cGF0aCBkPSJNNTAgNTBoMTAwIi8+PHBhdGggZD0iTTUwIDc1aDEwMCIvPjwvZz48dGV4dCB4PSIxMDAiIHk9IjE0MCIgZm9udC1mYW1pbHk9InNlcmlmIiBmb250LXNpemU9IjMwIiBmaWxsPSIjMzMzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5NSUxIT0pBUzwvdGV4dD48L3N2Zz4=';
