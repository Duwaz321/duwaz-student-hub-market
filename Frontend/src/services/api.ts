import type {
  Category,
  Product,
  Business,
  Student,
  Order,
  Review,
  Reward,
  Transaction,
  DeliveryDriver,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

function getToken(): string | null {
  return localStorage.getItem('duwaz_token');
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // Redirect to login on 401
  if (response.status === 401) {
    localStorage.removeItem('duwaz_token');
    localStorage.removeItem('duwaz_user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export interface AuthResponse {
  token: string;
  userId: number;
  studentName: string;
  email: string;
}

export const authApi = {
  register: (data: {
    studentName: string;
    studentNumber: string;
    email: string;
    password: string;
  }) => request<AuthResponse>('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    request<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
};

// ── Categories ────────────────────────────────────────────────────────────────
export const categoriesApi = {
  getAll: () => request<Category[]>('/api/categories'),
  getById: (id: number) => request<Category>(`/api/categories/${id}`),
  create: (data: Omit<Category, 'id'>) =>
    request<Category>('/api/categories', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Category>) =>
    request<Category>(`/api/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<null>(`/api/categories/${id}`, { method: 'DELETE' }),
};

// ── Products ──────────────────────────────────────────────────────────────────
export const productsApi = {
  getAll: () => request<Product[]>('/api/products'),
  getById: (id: number) => request<Product>(`/api/products/${id}`),
  create: (data: Omit<Product, 'id'>) =>
    request<Product>('/api/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Product>) =>
    request<Product>(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<null>(`/api/products/${id}`, { method: 'DELETE' }),
};

// ── Businesses (Shops) ────────────────────────────────────────────────────────
export const businessesApi = {
  getAll: () => request<Business[]>('/api/businesses'),
  getById: (id: number) => request<Business>(`/api/businesses/${id}`),
  create: (data: Omit<Business, 'id'>) =>
    request<Business>('/api/businesses', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Business>) =>
    request<Business>(`/api/businesses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<null>(`/api/businesses/${id}`, { method: 'DELETE' }),
};

// ── Students ──────────────────────────────────────────────────────────────────
export const studentsApi = {
  getAll: () => request<Student[]>('/Student/getall'),
  getById: (id: number) => request<Student>(`/Student/read/${id}`),
  create: (data: Omit<Student, 'id'>) =>
    request<Student>('/Student/create', { method: 'POST', body: JSON.stringify(data) }),
  update: (data: Student) =>
    request<Student>('/Student/update', { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<null>(`/Student/delete/${id}`, { method: 'DELETE' }),
};

// ── Orders ────────────────────────────────────────────────────────────────────
export const ordersApi = {
  getAll: () => request<Order[]>('/api/orders'),
  getById: (id: number) => request<Order>(`/api/orders/${id}`),
  getByStudent: (studentId: number) => request<Order[]>(`/api/orders/student/${studentId}`),
  getByStatus: (status: string) => request<Order[]>(`/api/orders/status/${status}`),
  create: (data: Omit<Order, 'id'>) =>
    request<Order>('/api/orders', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: number) => request<null>(`/api/orders/${id}`, { method: 'DELETE' }),
};

// ── Reviews ───────────────────────────────────────────────────────────────────
export const reviewsApi = {
  getAll: () => request<Review[]>('/api/reviews'),
  getById: (id: number) => request<Review>(`/api/reviews/${id}`),
  getByProduct: (productId: number) => request<Review[]>(`/api/reviews/product/${productId}`),
  getByStudent: (studentId: number) => request<Review[]>(`/api/reviews/student/${studentId}`),
  create: (data: Omit<Review, 'id'>) =>
    request<Review>('/api/reviews', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: number) => request<null>(`/api/reviews/${id}`, { method: 'DELETE' }),
};

// ── Rewards ───────────────────────────────────────────────────────────────────
export const rewardsApi = {
  getAll: () => request<Reward[]>('/api/rewards'),
  getById: (id: number) => request<Reward>(`/api/rewards/${id}`),
  create: (data: Omit<Reward, 'id'>) =>
    request<Reward>('/api/rewards', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Reward>) =>
    request<Reward>(`/api/rewards/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<null>(`/api/rewards/${id}`, { method: 'DELETE' }),
};

// ── Transactions ──────────────────────────────────────────────────────────────
export const transactionsApi = {
  getAll: () => request<Transaction[]>('/api/transactions'),
  getById: (id: number) => request<Transaction>(`/api/transactions/${id}`),
  getByStudent: (studentId: number) =>
    request<Transaction[]>(`/api/transactions/student/${studentId}`),
  getByStatus: (status: string) => request<Transaction[]>(`/api/transactions/status/${status}`),
  create: (data: Omit<Transaction, 'id'>) =>
    request<Transaction>('/api/transactions', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: number) => request<null>(`/api/transactions/${id}`, { method: 'DELETE' }),
};

// ── Delivery Drivers ──────────────────────────────────────────────────────────
export const driversApi = {
  getAll: () => request<DeliveryDriver[]>('/api/delivery-drivers'),
  getById: (id: number) => request<DeliveryDriver>(`/api/delivery-drivers/${id}`),
  create: (data: Omit<DeliveryDriver, 'deliveryDriverId'>) =>
    request<DeliveryDriver>('/api/delivery-drivers', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<DeliveryDriver>) =>
    request<DeliveryDriver>(`/api/delivery-drivers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) => request<null>(`/api/delivery-drivers/${id}`, { method: 'DELETE' }),
};
