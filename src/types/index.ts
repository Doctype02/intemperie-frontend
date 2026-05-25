// Roles match backend Prisma enum Role { CLIENT | ADMIN }
export type UserRole = 'CLIENT' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  userId: string | null;
  street: string;
  city: string;
  province: string;
  country: string;
  postalCode?: string | null;
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
  id?: string;
  url: string;
  alt?: string | null;
  order?: number;
}

// Product unit matches backend enum: METRO | PANEL | UNIDAD
export type ProductUnit = 'METRO' | 'PANEL' | 'UNIDAD';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  collectionId: string;
  basePrice: number;
  unit: ProductUnit;
  stock: number;
  isActive: boolean;
  category?: Category;
  collection?: Collection | null;
  images: ProductImage[];
  attributes?: Record<string, unknown> | null;
  specifications?: { label: string; value: string }[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
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
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: Product;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'TRANSFERENCIA' | 'TILOPAY' | 'MERCADOPAGO';

export interface Payment {
  id: string;
  orderId: string;
  tilopayRef: string | null;
  status: PaymentStatus;
  amount: number;
  paidAt: string | null;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string | null;
  guestName: string | null;
  guestEmail: string | null;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddressId: string;
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  notes: string | null;
  items: OrderItem[];
  payment: Payment | null;
  user?: Pick<User, 'id' | 'name' | 'email'> | null;
  createdAt: string;
  updatedAt: string;
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
  section: string;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  image: string | null;
  link: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CalculatorInput {
  productSlug: string;
  meters: number;
  includeInstallation: boolean;
}

export interface CalculatorResult {
  productName: string;
  unitPrice: number;
  meters: number;
  subtotal: number;
  installationCost: number;
  tax: number;
  total: number;
  details: { description: string; amount: number }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: {
    message: string;
    code?: string;
    errors?: { field: string; message: string }[];
  };
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
  accessToken: string;
  refreshToken: string;
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

// Inline address for guest checkout or new address on checkout
export interface GuestAddress {
  name: string;
  email: string;
  street: string;
  address2?: string;
  city: string;
  province: string;
  phone: string;
}

export interface CreateOrderPayload {
  items: { productId: string; quantity: number }[];
  paymentMethod: 'TRANSFERENCIA' | 'TILOPAY';
  shippingAddressId?: string;
  guestAddress?: {
    street: string;
    city: string;
    province: string;
    phone: string;
    country?: string;
    postalCode?: string;
  };
  guestName?: string;
  guestEmail?: string;
  notes?: string;
}
