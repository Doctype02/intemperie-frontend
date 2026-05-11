export interface User {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  _count?: { products: number };
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  _count?: { products: number };
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  pricePerMeter: number;
  pricePerPanel: number | null;
  panelHeight: number | null;
  panelWidth: number | null;
  material: string;
  stock: number;
  isActive: boolean;
  categoryId: string;
  collectionId: string | null;
  category?: Category;
  collection?: Collection | null;
  images: ProductImage[];
  specifications: Record<string, string> | null;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unit: "meters" | "panels";
}

export interface Cart {
  id: string;
  userId: string | null;
  sessionId: string | null;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unit: "meters" | "panels";
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  userId: string;
  user?: User;
  status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  total: number;
  subtotal: number;
  tax: number;
  shippingCost: number;
  shippingAddress: Address;
  items: OrderItem[];
  paymentId: string | null;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  method: string;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  stripeSessionId: string | null;
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  user?: User;
  productId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface ContentBlock {
  id: string;
  key: string;
  title: string;
  body: string;
  image: string | null;
}

export interface CalculatorInput {
  productId: string;
  linearMeters: number;
  includeInstallation: boolean;
}

export interface CalculatorResult {
  productName: string;
  linearMeters: number;
  costPerMeter: number;
  materialCost: number;
  installationCost: number;
  totalCost: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface CheckoutInput {
  addressId: string;
  items: { productId: string; quantity: number; unit: "meters" | "panels" }[];
}
