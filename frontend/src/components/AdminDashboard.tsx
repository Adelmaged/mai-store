import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Lock,
  User,
  LogOut,
  Package,
  ShoppingBag,
  Truck,
  MessageCircle,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  DollarSign,
  Clock,
  Boxes,
  Upload,
  Tag,
} from 'lucide-react';
import {
  Product,
  Governorate,
  Order,
  OrderStatus,
  PromoCode,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_FLOW,
} from '@/types';
import { api } from '@/services/api';
import { generateProductImage } from '@/utils/images';

const ADMIN_TOKEN_KEY = 'mai_admin_token';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

async function uploadProductImageToSupabase(file: File): Promise<string> {
  if (!supabase) {
    throw new Error('إعدادات Supabase غير مكتملة في ملف frontend/.env');
  }
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const filePath = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from('products')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from('products').getPublicUrl(filePath);
  return data.publicUrl;
}

export function AdminDashboard() {
  const [authed, setAuthed] = useState(
    () => !!localStorage.getItem(ADMIN_TOKEN_KEY),
  );

  if (!authed) {
    return <AdminLogin onSuccess={() => setAuthed(true)} />;
  }

  return (
    <AdminPanel
      onLogout={() => {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        setAuthed(false);
      }}
    />
  );
}

/* ----------------------- LOGIN ----------------------- */

function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await api.adminLogin(username, password);
    setLoading(false);
    if (res.token) {
      localStorage.setItem(ADMIN_TOKEN_KEY, res.token);
      onSuccess();
    } else {
      setError('بيانات الدخول غير صحيحة');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-burgundy via-burgundy-600 to-burgundy-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-cream flex items-center justify-center mx-auto mb-4 shadow-lift">
            <span className="font-playfair text-burgundy text-2xl font-bold">M</span>
          </div>
          <h1 className="font-cairo font-bold text-cream text-2xl mb-1">
            مَيّ | لوحة التحكم
          </h1>
          <p className="font-cairo text-cream/60 text-sm">
            سجّلي الدخول لإدارة المتجر
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-cream rounded-3xl shadow-lift p-6 sm:p-8 space-y-5"
        >
          <div>
            <label className="block font-cairo text-burgundy text-sm font-medium mb-1.5">
              اسم المستخدم
            </label>
            <div className="relative">
              <User
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-burgundy/40"
              />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pr-10 pl-4 py-3 rounded-xl border border-edge bg-surface font-cairo text-burgundy text-sm outline-none focus:border-burgundy transition-colors"
                placeholder="admin"
              />
            </div>
          </div>

          <div>
            <label className="block font-cairo text-burgundy text-sm font-medium mb-1.5">
              كلمة المرور
            </label>
            <div className="relative">
              <Lock
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-burgundy/40"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-10 pl-4 py-3 rounded-xl border border-edge bg-surface font-cairo text-burgundy text-sm outline-none focus:border-burgundy transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 font-cairo text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-burgundy text-cream font-cairo font-bold text-base hover:bg-burgundy-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
            ) : (
              'دخول'
            )}
          </button>

          <p className="text-center font-cairo text-burgundy/40 text-xs">
            للتجربة: أي اسم مستخدم وكلمة مرور ستعمل (وضع المعاينة)
          </p>
        </form>

        <div className="text-center mt-6">
          <a
            href="/"
            className="font-cairo text-cream/70 text-sm hover:text-gold transition-colors"
          >
            ← العودة للمتجر
          </a>
        </div>
      </div>
    </div>
  );
}

/* ----------------------- PANEL ----------------------- */

type Tab = 'orders' | 'products' | 'shipping' | 'promos';

function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getOrders(),
      api.getProducts(),
      api.getGovernorates(),
      api.getPromoCodes(),
    ]).then(([o, p, g, pr]) => {
      setOrders(o);
      setProducts(p);
      setGovernorates(g);
      setPromoCodes(pr);
      setLoading(false);
    });
  }, []);

  const tabs: { key: Tab; label: string; icon: typeof Package }[] = [
    { key: 'orders', label: 'الطلبات', icon: ShoppingBag },
    { key: 'products', label: 'المنتجات', icon: Package },
    { key: 'shipping', label: 'مناطق الشحن', icon: Truck },
    { key: 'promos', label: 'أكواد الخصم', icon: Tag },
  ];

  const stats = {
    totalOrders: orders.length,
    revenue: orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0),
    pending: orders.filter((o) => o.status === 'new').length,
    products: products.length,
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Top bar */}
      <header className="bg-burgundy text-cream sticky top-0 z-30 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center">
              <span className="font-playfair text-burgundy text-lg font-bold">M</span>
            </div>
            <div>
              <h1 className="font-cairo font-bold text-base">لوحة تحكم مَيّ</h1>
              <p className="font-cairo text-cream/60 text-xs">MAI Admin Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="hidden sm:flex px-4 py-2 rounded-full text-sm font-cairo text-cream/80 hover:bg-cream/10 transition-colors"
            >
              المتجر
            </a>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-cairo bg-cream/10 hover:bg-cream/20 transition-colors"
            >
              <LogOut size={16} />
              خروج
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={ShoppingBag}
            label="إجمالي الطلبات"
            value={String(stats.totalOrders)}
            color="burgundy"
          />
          <StatCard
            icon={DollarSign}
            label="الإيرادات"
            value={`${stats.revenue} ج.م`}
            color="gold"
          />
          <StatCard
            icon={Clock}
            label="طلبات جديدة"
            value={String(stats.pending)}
            color="rose"
          />
          <StatCard
            icon={Boxes}
            label="عدد المنتجات"
            value={String(stats.products)}
            color="green"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1.5 bg-surface rounded-full border border-edge shadow-soft mb-6 w-fit overflow-x-auto max-w-full">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-full text-sm font-cairo font-medium transition-all whitespace-nowrap ${
                  tab === t.key
                    ? 'bg-burgundy text-cream shadow-soft'
                    : 'text-burgundy hover:bg-rose-100'
                }`}
              >
                <Icon size={16} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="w-10 h-10 border-4 border-burgundy/20 border-t-burgundy rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {tab === 'orders' && (
              <OrdersTab orders={orders} setOrders={setOrders} />
            )}
            {tab === 'products' && (
              <ProductsTab products={products} setProducts={setProducts} />
            )}
            {tab === 'shipping' && (
              <ShippingTab
                governorates={governorates}
                setGovernorates={setGovernorates}
              />
            )}
            {tab === 'promos' && (
              <PromoCodesTab
                promoCodes={promoCodes}
                setPromoCodes={setPromoCodes}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ----------------------- STAT CARD ----------------------- */

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Package;
  label: string;
  value: string;
  color: 'burgundy' | 'gold' | 'rose' | 'green';
}) {
  const colors = {
    burgundy: 'bg-burgundy/10 text-burgundy',
    gold: 'bg-gold/10 text-gold-600',
    rose: 'bg-rose-100 text-rose-700',
    green: 'bg-green-100 text-green-700',
  };
  return (
    <div className="bg-surface rounded-2xl border border-edge p-4 sm:p-5 shadow-soft">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}
      >
        <Icon size={20} />
      </div>
      <p className="font-cairo font-bold text-burgundy text-xl sm:text-2xl">
        {value}
      </p>
      <p className="font-cairo text-burgundy/60 text-xs sm:text-sm mt-0.5">
        {label}
      </p>
    </div>
  );
}

/* ----------------------- ORDERS TAB ----------------------- */

function OrdersTab({
  orders,
  setOrders,
}: {
  orders: Order[];
  setOrders: (o: Order[]) => void;
}) {
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');

  const filtered =
    filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    setOrders(orders.map((o) => (o.id === id ? { ...o, status } : o)));
    await api.updateOrderStatus(id, status);
  };

  const whatsappLink = (order: Order) => {
    let digits = order.phone.replace(/\D/g, '');
    if (digits.startsWith('0020')) {
      digits = digits.slice(2);
    } else if (digits.startsWith('01')) {
      digits = `20${digits.slice(1)}`;
    } else if (digits.startsWith('1') && digits.length === 10) {
      digits = `20${digits}`;
    }

    const itemsText = order.items
      .map((i) => `• ${i.title} (${i.colorName}) × ${i.quantity}`)
      .join('\n');
    const discountLine =
      order.promoCode && order.discountAmount
        ? `\nكود الخصم (${order.promoCode}): -${order.discountAmount} ج.م`
        : '';
    const msg = `السلام عليكم ${order.customerName}،\nنؤكد لكِ طلبك رقم ${order.orderNumber}:\n${itemsText}${discountLine}\nالإجمالي: ${order.total} ج.م\nمحافظة: ${order.governorate}`;
    return `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;
  };

  const statusOptions: (OrderStatus | 'all')[] = [
    'all',
    'new',
    'confirmed',
    'with_rep',
    'delivered',
    'cancelled',
  ];

  return (
    <div>
      {/* Filter */}
      <div className="flex gap-2 flex-wrap mb-5">
        {statusOptions.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-full text-sm font-cairo font-medium transition-all ${
              filter === s
                ? 'bg-burgundy text-cream'
                : 'bg-surface text-burgundy border border-edge hover:bg-rose-100'
            }`}
          >
            {s === 'all' ? 'الكل' : ORDER_STATUS_LABELS[s]}
            {s !== 'all' && (
              <span className="mr-1.5 opacity-60">
                ({orders.filter((o) => o.status === s).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-edge p-12 text-center">
          <ShoppingBag size={32} className="text-burgundy/30 mx-auto mb-3" />
          <p className="font-cairo text-burgundy/50 text-sm">لا توجد طلبات</p>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-edge overflow-hidden shadow-soft">
          {/* Desktop table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-cream border-b border-edge">
                <tr>
                  <Th>رقم الطلب</Th>
                  <Th>العميلة</Th>
                  <Th>الموبايل</Th>
                  <Th>المحافظة</Th>
                  <Th>كود الخصم</Th>
                  <Th>الإجمالي</Th>
                  <Th>الحالة</Th>
                  <Th>واتساب</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-edge last:border-0 hover:bg-cream/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="font-playfair font-bold text-burgundy text-sm tracking-wider">
                        {order.orderNumber}
                      </span>
                      <p className="font-cairo text-burgundy/40 text-xs mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-cairo text-burgundy text-sm font-medium">
                        {order.customerName}
                      </span>
                      <p className="font-cairo text-burgundy/40 text-xs mt-0.5 line-clamp-1 max-w-[200px]">
                        {order.address}
                      </p>
                    </td>
                    <td
                      className="px-4 py-3 font-cairo text-burgundy text-sm"
                      dir="ltr"
                    >
                      {order.phone}
                    </td>
                    <td className="px-4 py-3 font-cairo text-burgundy/70 text-sm">
                      {order.governorate}
                    </td>
                    <td className="px-4 py-3 font-cairo text-xs">
                      {order.promoCode ? (
                        <div>
                          <span className="inline-block px-2 py-0.5 rounded bg-green-100 text-green-800 font-bold">
                            {order.promoCode}
                          </span>
                          {order.discountAmount ? (
                            <p className="text-green-700 mt-0.5">
                              -{order.discountAmount} ج.م
                            </p>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-burgundy/30">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-cairo font-bold text-burgundy text-sm">
                      {order.total} ج.م
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(
                            order.id,
                            e.target.value as OrderStatus,
                          )
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-cairo font-bold border cursor-pointer outline-none transition-colors ${
                          ORDER_STATUS_COLORS[order.status]
                        }`}
                      >
                        {(ORDER_STATUS_FLOW as OrderStatus[])
                          .concat(['cancelled'])
                          .map((s) => (
                            <option key={s} value={s}>
                              {ORDER_STATUS_LABELS[s]}
                            </option>
                          ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={whatsappLink(order)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-xs font-cairo font-medium hover:scale-105 transition-transform"
                      >
                        <MessageCircle size={14} />
                        تواصل
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden divide-y divide-edge">
            {filtered.map((order) => (
              <div key={order.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-playfair font-bold text-burgundy text-sm tracking-wider">
                    {order.orderNumber}
                  </span>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(
                        order.id,
                        e.target.value as OrderStatus,
                      )
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-cairo font-bold border cursor-pointer outline-none ${
                      ORDER_STATUS_COLORS[order.status]
                    }`}
                  >
                    {(ORDER_STATUS_FLOW as OrderStatus[])
                      .concat(['cancelled'])
                      .map((s) => (
                        <option key={s} value={s}>
                          {ORDER_STATUS_LABELS[s]}
                        </option>
                      ))}
                  </select>
                </div>
                <p className="font-cairo text-burgundy text-sm font-medium mb-1">
                  {order.customerName} · <span dir="ltr">{order.phone}</span>
                </p>
                <p className="font-cairo text-burgundy/50 text-xs mb-2 line-clamp-2">
                  {order.governorate} — {order.address}
                </p>
                {order.promoCode && (
                  <p className="font-cairo text-green-700 text-xs font-medium mb-2">
                    كود الخصم: {order.promoCode}
                    {order.discountAmount ? ` (-${order.discountAmount} ج.م)` : ''}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="font-cairo font-bold text-burgundy text-sm">
                    {order.total} ج.م
                  </span>
                  <a
                    href={whatsappLink(order)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-xs font-cairo font-medium"
                  >
                    <MessageCircle size={14} />
                    تواصل واتساب
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 font-cairo font-bold text-burgundy text-xs whitespace-nowrap">
      {children}
    </th>
  );
}

/* ----------------------- PRODUCTS TAB ----------------------- */

function ProductsTab({
  products,
  setProducts,
}: {
  products: Product[];
  setProducts: (p: Product[]) => void;
}) {
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكدة من حذف هذا المنتج؟')) return;
    setProducts(products.filter((p) => p.id !== id));
    await api.deleteProduct(id);
  };

  const handleSave = async (product: Product) => {
    try {
      if (editing) {
        const updated = await api.updateProduct(product.id, product);
        const finalProduct =
          (updated as Product)?.id ? (updated as Product) : product;
        setProducts(
          products.map((p) => (p.id === product.id ? finalProduct : p)),
        );
      } else {
        const created = await api.createProduct(product);
        const finalProduct =
          (created as Product)?.id ? (created as Product) : product;
        setProducts([...products, finalProduct]);
      }
      setShowForm(false);
      setEditing(null);
    } catch (err) {
      console.error('Error saving product:', err);
      alert('حصل خطأ أثناء حفظ المنتج في قاعدة البيانات');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-cairo font-bold text-burgundy text-lg">
          المنتجات ({products.length})
        </h3>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-burgundy text-cream font-cairo font-bold text-sm hover:bg-burgundy-600 transition-colors"
        >
          <Plus size={18} />
          إضافة منتج
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <div
            key={p.id}
            className="bg-surface rounded-2xl border border-edge overflow-hidden shadow-soft"
          >
            <div className="flex gap-3 p-3">
              <img
                src={p.colors[0]?.image || ''}
                alt={p.title}
                className="w-20 h-20 rounded-lg object-cover bg-cream shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-cairo font-bold text-burgundy text-sm line-clamp-1">
                  {p.title}
                </h4>
                <p className="font-cairo text-burgundy/50 text-xs mt-0.5">
                  {p.category === 'esdala' ? 'إسدال' : 'فستان'} ·{' '}
                  {p.sizes.join(', ')}
                </p>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="font-cairo font-bold text-burgundy text-sm">
                    {p.price} ج.م
                  </span>
                  {p.oldPrice && (
                    <span className="font-cairo text-burgundy/40 text-xs line-through">
                      {p.oldPrice}
                    </span>
                  )}
                </div>
                <div className="flex gap-1 mt-2">
                  {p.colors.slice(0, 5).map((c, i) => (
                    <span
                      key={i}
                      className="w-4 h-4 rounded-full border border-edge"
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex border-t border-edge">
              <button
                onClick={() => {
                  setEditing(p);
                  setShowForm(true);
                }}
                className="flex-1 py-2.5 flex items-center justify-center gap-1.5 text-burgundy font-cairo text-xs font-medium hover:bg-rose-100 transition-colors"
              >
                <Pencil size={14} />
                تعديل
              </button>
              <div className="w-px bg-edge" />
              <button
                onClick={() => handleDelete(p.id)}
                className="flex-1 py-2.5 flex items-center justify-center gap-1.5 text-red-600 font-cairo text-xs font-medium hover:bg-red-50 transition-colors"
              >
                <Trash2 size={14} />
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <ProductForm
          product={editing}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

/* ----------------------- PRODUCT FORM ----------------------- */

type EditableColor = {
  name: string;
  hex: string;
  image?: string;
};

function ProductForm({
  product,
  onSave,
  onClose,
}: {
  product: Product | null;
  onSave: (p: Product) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(product?.title || '');
  const [category, setCategory] = useState<'esdala' | 'dress'>(
    product?.category || 'esdala',
  );
  const [price, setPrice] = useState(String(product?.price || ''));
  const [oldPrice, setOldPrice] = useState(String(product?.oldPrice || ''));
  const [description, setDescription] = useState(product?.description || '');
  const [sizes, setSizes] = useState(
    product?.sizes.join(', ') || 'One Size',
  );
  const [colors, setColors] = useState<EditableColor[]>(
    product?.colors.map((c) => ({
      name: c.name,
      hex: c.hex,
      image: c.image,
    })) || [{ name: 'كحلي', hex: '#1B2A41', image: '' }],
  );
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState('');

  const handleAddColor = () => {
    setColors([...colors, { name: 'لون جديد', hex: '#D9A7B0', image: '' }]);
  };

  const handleColorChange = (
    i: number,
    field: 'name' | 'hex' | 'image',
    value: string,
  ) => {
    const next = [...colors];
    next[i] = { ...next[i], [field]: value };
    setColors(next);
  };

  const handleRemoveColor = (i: number) => {
    setColors(colors.filter((_, idx) => idx !== i));
  };

  const handleFileUpload = async (
    i: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setUploadingIndex(i);
    try {
      const publicUrl = await uploadProductImageToSupabase(file);
      handleColorChange(i, 'image', publicUrl);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'تعذر رفع الصورة إلى Supabase';
      setUploadError(msg);
    } finally {
      setUploadingIndex(null);
      e.target.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const builtColors = colors.map((c) => ({
      name: c.name,
      hex: c.hex,
      image:
        c.image && c.image.trim().length > 0
          ? c.image
          : generateProductImage(
              category,
              c.hex,
              '#C5A059',
              title.split(' ').slice(0, 2).join(' '),
              c.name,
            ),
    }));

    const saved: Product = {
      id: product?.id || `p${Date.now()}`,
      title,
      category,
      price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : undefined,
      description,
      sizes: sizes
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      colors: builtColors,
      featured: product?.featured,
      createdAt: product?.createdAt || new Date().toISOString(),
    };
    onSave(saved);
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-burgundy/40 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-cream rounded-3xl shadow-lift w-full max-w-lg max-h-[90vh] overflow-y-auto pointer-events-auto animate-scale-in">
          <div className="flex items-center justify-between px-5 py-4 bg-burgundy text-cream rounded-t-3xl sticky top-0 z-10">
            <h3 className="font-cairo font-bold text-lg">
              {product ? 'تعديل منتج' : 'إضافة منتج جديد'}
            </h3>
            <button
              onClick={onClose}
              className="hover:text-gold transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block font-cairo text-burgundy text-sm font-medium mb-1.5">
                اسم المنتج
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-edge bg-surface font-cairo text-burgundy text-sm outline-none focus:border-burgundy"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-cairo text-burgundy text-sm font-medium mb-1.5">
                  الفئة
                </label>
                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as 'esdala' | 'dress')
                  }
                  className="w-full px-4 py-3 rounded-xl border border-edge bg-surface font-cairo text-burgundy text-sm outline-none focus:border-burgundy"
                >
                  <option value="esdala">إسدال</option>
                  <option value="dress">فستان</option>
                </select>
              </div>
              <div>
                <label className="block font-cairo text-burgundy text-sm font-medium mb-1.5">
                  المقاسات (مفصولة بفاصلة)
                </label>
                <input
                  value={sizes}
                  onChange={(e) => setSizes(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-edge bg-surface font-cairo text-burgundy text-sm outline-none focus:border-burgundy"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-cairo text-burgundy text-sm font-medium mb-1.5">
                  السعر (ج.م)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-edge bg-surface font-cairo text-burgundy text-sm outline-none focus:border-burgundy"
                />
              </div>
              <div>
                <label className="block font-cairo text-burgundy text-sm font-medium mb-1.5">
                  السعر القديم (اختياري)
                </label>
                <input
                  type="number"
                  value={oldPrice}
                  onChange={(e) => setOldPrice(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-edge bg-surface font-cairo text-burgundy text-sm outline-none focus:border-burgundy"
                />
              </div>
            </div>

            <div>
              <label className="block font-cairo text-burgundy text-sm font-medium mb-1.5">
                الوصف
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-edge bg-surface font-cairo text-burgundy text-sm outline-none focus:border-burgundy resize-none"
              />
            </div>

            {/* Colors & Images */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-cairo text-burgundy text-sm font-medium">
                  الألوان وصور كل لون
                </label>
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="flex items-center gap-1 text-gold-600 text-xs font-cairo font-medium hover:text-gold-700"
                >
                  <Plus size={14} />
                  إضافة لون
                </button>
              </div>

              {uploadError && (
                <div className="mb-3 bg-red-50 border border-red-200 rounded-xl p-2.5 text-red-700 font-cairo text-xs">
                  {uploadError}
                </div>
              )}

              <div className="space-y-3">
                {colors.map((c, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-2xl border border-edge bg-surface space-y-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={c.hex}
                        onChange={(e) =>
                          handleColorChange(i, 'hex', e.target.value)
                        }
                        className="w-10 h-10 rounded-lg border border-edge cursor-pointer shrink-0"
                      />
                      <input
                        value={c.name}
                        onChange={(e) =>
                          handleColorChange(i, 'name', e.target.value)
                        }
                        placeholder="اسم اللون"
                        className="flex-1 px-3 py-2 rounded-xl border border-edge bg-cream font-cairo text-burgundy text-sm outline-none focus:border-burgundy"
                      />
                      {colors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(i)}
                          className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-1">
                      <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cream border border-edge text-burgundy font-cairo text-xs font-medium cursor-pointer hover:bg-rose-100 transition-colors">
                        <Upload size={14} />
                        {uploadingIndex === i ? 'جاري الرفع...' : 'رفع صورة'}
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingIndex !== null}
                          onChange={(e) => handleFileUpload(i, e)}
                          className="hidden"
                        />
                      </label>

                      {c.image && (
                        <div className="flex items-center gap-2">
                          <img
                            src={c.image}
                            alt={c.name}
                            className="w-11 h-11 rounded-lg object-cover border border-edge"
                          />
                          <button
                            type="button"
                            onClick={() => handleColorChange(i, 'image', '')}
                            className="text-red-600 font-cairo text-xs hover:underline"
                          >
                            إزالة
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-edge text-burgundy font-cairo font-bold text-sm hover:bg-rose-100 transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={uploadingIndex !== null}
                className="flex-1 py-3 rounded-xl bg-burgundy text-cream font-cairo font-bold text-sm hover:bg-burgundy-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <Check size={18} />
                حفظ
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

/* ----------------------- SHIPPING TAB ----------------------- */

function ShippingTab({
  governorates,
  setGovernorates,
}: {
  governorates: Governorate[];
  setGovernorates: (g: Governorate[]) => void;
}) {
  const [editing, setEditing] = useState<Record<string, string>>({});

  const handleCostChange = (id: string, value: string) => {
    setEditing({ ...editing, [id]: value });
  };

  const handleSave = async (g: Governorate) => {
    const newCost = Number(editing[g.id]);
    if (isNaN(newCost) || newCost < 0) return;
    const updated = { ...g, shippingCost: newCost };
    setGovernorates(governorates.map((x) => (x.id === g.id ? updated : x)));
    const rest = { ...editing };
    delete rest[g.id];
    setEditing(rest);
    await api.updateGovernorate(g.id, { shippingCost: newCost });
  };

  return (
    <div>
      <h3 className="font-cairo font-bold text-burgundy text-lg mb-1">
        مناطق الشحن وأسعار التوصيل
      </h3>
      <p className="font-cairo text-burgundy/60 text-sm mb-5">
        عدّلي رسوم التوصيل لكل محافظة
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {governorates.map((g) => (
          <div
            key={g.id}
            className="bg-surface rounded-xl border border-edge p-4 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <Truck size={18} />
              </div>
              <span className="font-cairo font-medium text-burgundy text-sm">
                {g.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="number"
                  value={editing[g.id] ?? String(g.shippingCost)}
                  onChange={(e) => handleCostChange(g.id, e.target.value)}
                  className="w-20 px-3 py-2 rounded-lg border border-edge bg-cream font-cairo text-burgundy text-sm text-center outline-none focus:border-burgundy"
                />
                <span className="absolute left-2 top-1/2 -translate-y-1/2 font-cairo text-burgundy/40 text-xs">
                  ج.م
                </span>
              </div>
              {editing[g.id] && Number(editing[g.id]) !== g.shippingCost && (
                <button
                  onClick={() => handleSave(g)}
                  className="w-8 h-8 rounded-lg bg-green-100 text-green-700 border border-green-200 flex items-center justify-center hover:bg-green-200 transition-colors"
                >
                  <Check size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ----------------------- PROMO CODES TAB ----------------------- */

function PromoCodesTab({
  promoCodes,
  setPromoCodes,
}: {
  promoCodes: PromoCode[];
  setPromoCodes: (p: PromoCode[]) => void;
}) {
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountValue, setDiscountValue] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!code.trim() || !discountValue || Number(discountValue) <= 0) {
      setError('أدخل اسم الكود وقيمة خصم صحيحة');
      return;
    }
    setSaving(true);
    try {
      const created = await api.createPromoCode({
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
      });
      setPromoCodes([created, ...promoCodes]);
      setCode('');
      setDiscountValue('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'تعذر إضافة الكود');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (promo: PromoCode) => {
    const nextActive = !promo.active;
    setPromoCodes(
      promoCodes.map((p) => (p.id === promo.id ? { ...p, active: nextActive } : p)),
    );
    await api.togglePromoCode(promo.id, nextActive);
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm('هل أنت متأكدة من حذف كود الخصم؟')) return;
    setPromoCodes(promoCodes.filter((p) => p.id !== id));
    await api.deletePromoCode(id);
  };

  return (
    <div className="space-y-6">
      {/* Add Form */}
      <form
        onSubmit={handleCreate}
        className="bg-surface rounded-2xl border border-edge p-4 sm:p-5 shadow-soft"
      >
        <h3 className="font-cairo font-bold text-burgundy text-base mb-4">
          إضافة كود خصم جديد
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="اسم الكود (مثال: MAI10)"
            className="px-4 py-2.5 rounded-xl border border-edge bg-cream font-cairo text-burgundy text-sm uppercase outline-none focus:border-burgundy"
          />
          <select
            value={discountType}
            onChange={(e) =>
              setDiscountType(e.target.value as 'percent' | 'fixed')
            }
            className="px-4 py-2.5 rounded-xl border border-edge bg-cream font-cairo text-burgundy text-sm outline-none focus:border-burgundy"
          >
            <option value="percent">نسبة مئوية (%)</option>
            <option value="fixed">مبلغ ثابت (ج.م)</option>
          </select>
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder={discountType === 'percent' ? 'النسبة (مثلاً 10)' : 'القيمة (مثلاً 50)'}
              className="flex-1 px-4 py-2.5 rounded-xl border border-edge bg-cream font-cairo text-burgundy text-sm outline-none focus:border-burgundy"
            />
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-burgundy text-cream font-cairo font-bold text-sm hover:bg-burgundy-600 transition-colors disabled:opacity-60 whitespace-nowrap"
            >
              {saving ? '...' : 'إضافة'}
            </button>
          </div>
        </div>
        {error && (
          <p className="text-red-600 text-xs font-cairo mt-2">{error}</p>
        )}
      </form>

      {/* List */}
      {promoCodes.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-edge p-10 text-center">
          <Tag size={30} className="text-burgundy/30 mx-auto mb-2" />
          <p className="font-cairo text-burgundy/50 text-sm">
            لا توجد أكواد خصم مضافة بعد
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {promoCodes.map((p) => (
            <div
              key={p.id}
              className="bg-surface rounded-2xl border border-edge p-4 flex items-center justify-between gap-3 shadow-soft"
            >
              <div>
                <span className="font-playfair font-bold text-burgundy text-base tracking-wider">
                  {p.code}
                </span>
                <p className="font-cairo text-burgundy/70 text-xs mt-0.5">
                  {p.discountType === 'percent'
                    ? `خصم ${p.discountValue}%`
                    : `خصم ${p.discountValue} ج.م`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggle(p)}
                  className={`px-3 py-1 rounded-full text-xs font-cairo font-bold transition-colors ${
                    p.active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {p.active ? 'مفعل' : 'متوقف'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(p.id)}
                  className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors"
                  aria-label="حذف الكود"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}