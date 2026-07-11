// ── Backend entity types ───────────────────────────────────────────────────────
// These match the Spring Boot entity classes 1-to-1.

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface Business {
  id: number;
  businessName: string;
  description: string;
  student?: Student;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category?: Category;
}

export interface Student {
  id: number;
  studentName: string;
  studentNumber: string;
  businesses?: Business[];
}

export interface Order {
  id: number;
  studentId: number;
  totalAmount: number;
  orderDate: string;   // ISO date string from backend
  status: string;
}

export interface Review {
  id: number;
  studentId: number;
  productId: number;
  rating: number;
  comment: string;
  reviewDate: string;  // ISO date string from backend
}

export interface Reward {
  id: number;
  name: string;
  description: string;
  points: number;
}

export type TransactionStatus =
  | 'PENDING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface Transaction {
  id: number;
  student?: Student;
  product?: Product;
  amount: number;
  transactionDate: string; // ISO date string from backend
  status: TransactionStatus;
}

export interface DeliveryDriver {
  deliveryDriverId: number;
  firstName: string;
  lastName: string;
  contactNumber: string;
  email: string;
  vehicleType: string;
  licenseNumber: string;
  deliveryCount: number;
  rating: number;
}

// ── Frontend-only types ────────────────────────────────────────────────────────
// Used for cart state and UI — not sent to the backend directly.

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  shopName: string;
}
