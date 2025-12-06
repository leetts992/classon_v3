// Product Types
export type ProductType = "ebook" | "video";

export interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  discountPrice?: number;
  thumbnail: string;
  type: ProductType;
  rating?: number;
  reviewCount?: number;
  duration?: number; // 동영상 길이 (분)
  category?: string;
  tags?: string[];
  instructorId: string;
  isPublished: boolean;
  createdAt: string;
}

// Instructor Types
export interface Instructor {
  id: string;
  name: string;
  email: string;
  subdomain: string;
  storeName: string;
  logo?: string;
  bio?: string;
  createdAt: string;
}

// Store Config Types
export interface StoreConfig {
  id: string;
  instructorId: string;
  primaryColor: string;
  secondaryColor?: string;
  bannerUrl?: string;
  menuItems: MenuItem[];
  theme: string;
  customCss?: string;
  footerText?: string;
  socialLinks?: SocialLinks;
}

export interface MenuItem {
  name: string;
  path: string;
}

export interface SocialLinks {
  instagram?: string;
  youtube?: string;
  twitter?: string;
  facebook?: string;
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

// Order Types
export type OrderStatus = "pending" | "paid" | "cancelled" | "refunded";

export interface Order {
  id: string;
  userId: string;
  instructorId: string;
  orderNumber: string;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  status: OrderStatus;
  paymentMethod?: string;
  items: OrderItem[];
  createdAt: string;
  paidAt?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productTitle: string;
  price: number;
  quantity: number;
}

// Cart Types
export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  createdAt: string;
}

// Review Types
export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  content: string;
  createdAt: string;
}
