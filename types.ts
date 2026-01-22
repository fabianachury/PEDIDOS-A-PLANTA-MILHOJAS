
export enum UserRole {
  PLANT = 'plant',
  STORE = 'store',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  imageUrl: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
}

export enum OrderStatus {
  PENDING = 'Pendiente',
  DISPATCHED = 'Despachado',
  RECEIVED = 'Recibido',
  ISSUE = 'Con Novedad',
}

export interface Order {
  id: string;
  storeId: string;
  storeName: string;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: string;
  dispatchedAt?: string;
  receivedAt?: string;
  novedades?: string;
}
