export type Category = 'all' | 'esdala' | 'dress';

export interface ColorVariant {
  name: string;
  hex: string;
  image: string;
}

export interface Product {
  id: string;
  title: string;
  category: 'esdala' | 'dress';
  price: number;
  oldPrice?: number;
  description: string;
  sizes: string[];
  colors: ColorVariant[];
  featured?: boolean;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  title: string;
  price: number;
  colorName: string;
  colorHex: string;
  size: string;
  image: string;
  quantity: number;
}

export interface Governorate {
  id: string;
  name: string;
  shippingCost: number;
}

export type OrderStatus =
  | 'new'
  | 'confirmed'
  | 'with_rep'
  | 'delivered'
  | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  governorate: string;
  address: string;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  promoCode?: string;
  discountAmount?: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export interface PromoCode {
  id: number | string;
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  active: boolean;
  createdAt?: string;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'جديد',
  confirmed: 'تم التأكيد',
  with_rep: 'مع المندوب',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
};

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  'new',
  'confirmed',
  'with_rep',
  'delivered',
];

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  new: 'bg-gold-100 text-gold-700 border-gold-300',
  confirmed: 'bg-rose-100 text-rose-700 border-rose-300',
  with_rep: 'bg-blue-100 text-blue-700 border-blue-300',
  delivered: 'bg-green-100 text-green-700 border-green-300',
  cancelled: 'bg-red-100 text-red-700 border-red-300',
};