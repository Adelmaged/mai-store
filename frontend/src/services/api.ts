import {
  Product,
  Governorate,
  Order,
  OrderStatus,
  PromoCode,
} from '@/types';
import { generateProductImage } from '@/utils/images';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ADMIN_TOKEN_KEY = 'mai_admin_token';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isFetchAvailable(): boolean {
  return (
    typeof window !== 'undefined' &&
    Boolean(window.fetch) &&
    Boolean(import.meta.env.VITE_API_URL)
  );
}

async function apiGet<T>(path: string, fallback: T): Promise<T> {
  if (!isFetchAvailable()) {
    await delay(400);
    return fallback;
  }
  try {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}${path}`, { headers });
    if (!res.ok) throw new Error(`GET ${path} failed`);
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

async function apiPost<T>(path: string, body: unknown, fallback: T): Promise<T> {
  if (!isFetchAvailable()) {
    await delay(600);
    return fallback;
  }
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `POST ${path} failed (${res.status})`);
  }

  return (await res.json()) as T;
}

async function apiPatch<T>(
  path: string,
  body: unknown,
  fallback: T,
): Promise<T> {
  if (!isFetchAvailable()) {
    await delay(500);
    return fallback;
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem(ADMIN_TOKEN_KEY) || ''}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `PATCH ${path} failed (${res.status})`);
  }

  return (await res.json()) as T;
}

async function apiDelete<T>(path: string, fallback: T): Promise<T> {
  if (!isFetchAvailable()) {
    await delay(400);
    return fallback;
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${localStorage.getItem(ADMIN_TOKEN_KEY) || ''}`,
    },
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `DELETE ${path} failed (${res.status})`);
  }

  return (await res.json()) as T;
}

/* ----------------------- MOCK DATA ----------------------- */

const MOCK_GOVERNORATES: Governorate[] = [
  { id: 'g1', name: 'القاهرة', shippingCost: 60 },
  { id: 'g2', name: 'الجيزة', shippingCost: 60 },
  { id: 'g3', name: 'القليوبية', shippingCost: 65 },
  { id: 'g4', name: 'الإسكندرية', shippingCost: 80 },
  { id: 'g5', name: 'الدقهلية', shippingCost: 75 },
  { id: 'g6', name: 'الشرقية', shippingCost: 75 },
  { id: 'g7', name: 'الغربية', shippingCost: 75 },
  { id: 'g8', name: 'المنوفية', shippingCost: 70 },
  { id: 'g9', name: 'البحيرة', shippingCost: 85 },
  { id: 'g10', name: 'كفر الشيخ', shippingCost: 85 },
  { id: 'g11', name: 'دمياط', shippingCost: 85 },
  { id: 'g12', name: 'بورسعيد', shippingCost: 90 },
  { id: 'g13', name: 'الإسماعيلية', shippingCost: 85 },
  { id: 'g14', name: 'السويس', shippingCost: 90 },
  { id: 'g15', name: 'الفيوم', shippingCost: 90 },
  { id: 'g16', name: 'بني سويف', shippingCost: 90 },
  { id: 'g17', name: 'المنيا', shippingCost: 95 },
  { id: 'g18', name: 'أسيوط', shippingCost: 100 },
  { id: 'g19', name: 'سوهاج', shippingCost: 100 },
  { id: 'g20', name: 'قنا', shippingCost: 105 },
  { id: 'g21', name: 'الأقصر', shippingCost: 110 },
  { id: 'g22', name: 'أسوان', shippingCost: 115 },
  { id: 'g23', name: 'البحر الأحمر', shippingCost: 120 },
  { id: 'g24', name: 'الوادي الجديد', shippingCost: 130 },
  { id: 'g25', name: 'مطروح', shippingCost: 130 },
  { id: 'g26', name: 'شمال سيناء', shippingCost: 140 },
  { id: 'g27', name: 'جنوب سيناء', shippingCost: 140 },
];

const COLORS_ESDALA = [
  { name: 'كحلي', hex: '#1B2A41' },
  { name: 'بيج', hex: '#D4C4A8' },
  { name: 'بورجندي', hex: '#4A2535' },
  { name: 'زيتي', hex: '#5A5A3A' },
  { name: 'أسود', hex: '#2A2A2A' },
];

const COLORS_DRESS = [
  { name: 'وردي', hex: '#D9A7B0' },
  { name: 'بيج', hex: '#D4C4A8' },
  { name: 'كحلي', hex: '#1B2A41' },
  { name: 'زيتي', hex: '#5A5A3A' },
  { name: 'بني', hex: '#6B4A35' },
];

function buildProduct(
  id: string,
  title: string,
  category: 'esdala' | 'dress',
  price: number,
  oldPrice: number | undefined,
  description: string,
  sizes: string[],
  colorSet: { name: string; hex: string }[],
  accent: string,
  featured?: boolean,
): Product {
  const colors = colorSet.map((c) => ({
    name: c.name,
    hex: c.hex,
    image: generateProductImage(
      category,
      c.hex,
      accent,
      title.split(' ').slice(0, 2).join(' '),
      c.name,
    ),
  }));
  return {
    id,
    title,
    category,
    price,
    oldPrice,
    description,
    sizes,
    colors,
    featured,
    createdAt: new Date().toISOString(),
  };
}

const MOCK_PRODUCTS: Product[] = [
  buildProduct(
    'p1',
    'إسدال صلاة كحلي فاخر',
    'esdala',
    350,
    450,
    'إسدال صلاة من القطن الفاخر بقصة واسعة ومريحة، مثالي للصلاة اليومية والسفر. قماش ناعم لا يجع ويدوم طويلاً.',
    ['One Size'],
    COLORS_ESDALA,
    '#C5A059',
    true,
  ),
  buildProduct(
    'p2',
    'إسدال صلاة بيج كلاسيك',
    'esdala',
    320,
    400,
    'إسدال بيج أنيق بخامة قطنية مريحة، مناسب لجميع الأوقات. لون عملي يسهل تنسيقه.',
    ['One Size'],
    COLORS_ESDALA,
    '#A8863F',
  ),
  buildProduct(
    'p3',
    'إسدال صلاة بورجندي مطرز',
    'esdala',
    420,
    undefined,
    'إسدال بورجندي فخم بتفاصيل مطرزة على الأطراف، يمنحك إحساس بالأناقة أثناء الصلاة.',
    ['One Size'],
    COLORS_ESDALA,
    '#D9A7B0',
    true,
  ),
  buildProduct(
    'p4',
    'إسدال صلاة زيتي راقي',
    'esdala',
    360,
    440,
    'إسدال بلون زيتي هادئ، قماش قطني فاخر بملمس ناعم. خيار مثالي لمحبات الألوان الراقية.',
    ['One Size'],
    COLORS_ESDALA,
    '#C5A059',
  ),
  buildProduct(
    'p5',
    'فستان وردي محتشم أنيق',
    'dress',
    650,
    800,
    'فستان وردي محتشم بقصة كلاسيكية مريحة، مناسب للمناسبات واللقاءات اليومية. خامة ناعمة وانسيابية.',
    ['L', 'XL'],
    COLORS_DRESS,
    '#C5A059',
    true,
  ),
  buildProduct(
    'p6',
    'فستان بيج محتلم كلاسيك',
    'dress',
    580,
    720,
    'فستان بيج بتصميم بسيط وراقٍ، مناسب لكل المناسبات. خامة فاخرة تجمع بين الأناقة والراحة.',
    ['L', 'XL'],
    COLORS_DRESS,
    '#A8863F',
  ),
  buildProduct(
    'p7',
    'فستان كحلي محتشم سواريه',
    'dress',
    750,
    900,
    'فستان كحلي فخم بتصميم انسيابي يمنحك حضوراً مميزاً في المناسبات. تفاصيل دقيقة وخامة عالية الجودة.',
    ['L', 'XL'],
    COLORS_DRESS,
    '#D9A7B0',
    true,
  ),
  buildProduct(
    'p8',
    'فستان زيتي محتشم يومي',
    'dress',
    600,
    700,
    'فستان زيتي عملي وأنيق للاستخدام اليومي، خامة قطنية مريحة وقصة محتشمة تناسب جميع الأوقات.',
    ['L', 'XL'],
    COLORS_DRESS,
    '#C5A059',
  ),
];

const MOCK_ORDERS: Order[] = [
  {
    id: 'o1',
    orderNumber: 'MAI-1001',
    customerName: 'سارة محمد',
    phone: '01012345678',
    governorate: 'القاهرة',
    address: 'مدينة نصر، شارع مكرم عبيد، عمارة 12، شقة 5',
    items: [
      {
        productId: 'p1',
        title: 'إسدال صلاة كحلي فاخر',
        price: 350,
        colorName: 'كحلي',
        colorHex: '#1B2A41',
        size: 'One Size',
        image: MOCK_PRODUCTS[0].colors[0].image,
        quantity: 2,
      },
    ],
    subtotal: 700,
    shippingCost: 60,
    total: 760,
    status: 'new',
    createdAt: new Date(Date.now() - 3600_000).toISOString(),
  },
  {
    id: 'o2',
    orderNumber: 'MAI-1002',
    customerName: 'فاطمة علي',
    phone: '01198765432',
    governorate: 'الإسكندرية',
    address: 'سيدي بشر، شارع الكورنيش، بناية 45',
    items: [
      {
        productId: 'p5',
        title: 'فستان وردي محتشم أنيق',
        price: 650,
        colorName: 'وردي',
        colorHex: '#D9A7B0',
        size: 'L',
        image: MOCK_PRODUCTS[4].colors[0].image,
        quantity: 1,
      },
    ],
    subtotal: 650,
    shippingCost: 80,
    total: 730,
    status: 'confirmed',
    createdAt: new Date(Date.now() - 7200_000).toISOString(),
  },
  {
    id: 'o3',
    orderNumber: 'MAI-1003',
    customerName: 'منى حسن',
    phone: '01234567890',
    governorate: 'الجيزة',
    address: 'الدقي، شارع التحرير، فيلا 8',
    items: [
      {
        productId: 'p7',
        title: 'فستان كحلي محتشم سواريه',
        price: 750,
        colorName: 'كحلي',
        colorHex: '#1B2A41',
        size: 'XL',
        image: MOCK_PRODUCTS[6].colors[0].image,
        quantity: 1,
      },
    ],
    subtotal: 750,
    shippingCost: 60,
    total: 810,
    status: 'with_rep',
    createdAt: new Date(Date.now() - 86400_000).toISOString(),
  },
];

/* ----------------------- API EXPORTS ----------------------- */

export const api = {
  // Products
  getProducts: () => apiGet<Product[]>('/products', MOCK_PRODUCTS),
  createProduct: (product: Omit<Product, 'id' | 'createdAt'>) =>
    apiPost<Product>('/products', product, {
      ...product,
      id: `p${Date.now()}`,
      createdAt: new Date().toISOString(),
    } as Product),
  updateProduct: (id: string, product: Partial<Product>) =>
    apiPatch<Product>(`/products/${id}`, product, { ...product, id } as Product),
  deleteProduct: (id: string) =>
    apiDelete<{ success: boolean }>(`/products/${id}`, { success: true }),

  // Governorates
  getGovernorates: () =>
    apiGet<Governorate[]>('/shipping/governorates', MOCK_GOVERNORATES),
  updateGovernorate: (id: string, data: Partial<Governorate>) =>
    apiPatch<Governorate>(`/shipping/governorates/${id}`, data, {
      ...data,
      id,
    } as Governorate),

  // Orders
  getOrders: () => apiGet<Order[]>('/orders', MOCK_ORDERS),
  createOrder: (
    order: Omit<Order, 'id' | 'orderNumber' | 'status' | 'createdAt'>,
  ) => {
    const orderNumber = `MAI-${Math.floor(1000 + Math.random() * 9000)}`;
    const fallback: Order = {
      ...order,
      id: `o${Date.now()}`,
      orderNumber,
      status: 'new',
      createdAt: new Date().toISOString(),
    };
    return apiPost<Order>('/orders', order, fallback);
  },
  trackOrder: (query: string) =>
    apiGet<Order[]>(`/orders/track?q=${encodeURIComponent(query)}`, []),
  updateOrderStatus: (id: string, status: OrderStatus) =>
    apiPatch<Order>(`/orders/${id}/status`, { status }, {
      id,
      status,
    } as unknown as Order),

  // Promo Codes
  validatePromoCode: (code: string, subtotal: number) =>
    apiPost<{
      code: string;
      discountType: 'percent' | 'fixed';
      discountValue: number;
      discountAmount: number;
    }>(
      '/promo-codes/validate',
      { code, subtotal },
      {
        code: code.toUpperCase(),
        discountType: 'fixed',
        discountValue: 0,
        discountAmount: 0,
      },
    ),
  getPromoCodes: () => apiGet<PromoCode[]>('/promo-codes', []),
  createPromoCode: (data: {
    code: string;
    discountType: 'percent' | 'fixed';
    discountValue: number;
  }) =>
    apiPost<PromoCode>('/promo-codes', data, {
      id: Date.now(),
      ...data,
      code: data.code.toUpperCase(),
      active: true,
    }),
  togglePromoCode: (id: number | string, active: boolean) =>
    apiPatch<{ success: boolean; active: boolean }>(
      `/promo-codes/${id}`,
      { active },
      { success: true, active },
    ),
  deletePromoCode: (id: number | string) =>
    apiDelete<{ success: boolean }>(`/promo-codes/${id}`, { success: true }),

  // Admin auth
  adminLogin: (username: string, password: string) =>
    apiPost<{ token: string }>('/auth/login', { username, password }, {
      token: 'mock-admin-token',
    }),
};

export { MOCK_PRODUCTS, MOCK_GOVERNORATES, MOCK_ORDERS };