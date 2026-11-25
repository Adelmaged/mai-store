import { useState, useEffect, useMemo } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Check,
  Truck,
  ChevronLeft,
  Tag,
} from 'lucide-react';
import { CartItem, Governorate, Order } from '@/types';
import { api } from '@/services/api';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQty: (index: number, qty: number) => void;
  onRemove: (index: number) => void;
  onClear: () => void;
}

type Step = 'cart' | 'checkout' | 'confirm';

const PHONE_RE = /^01[0-2,5]\d{8}$/;

export function CartDrawer({
  open,
  onClose,
  items,
  onUpdateQty,
  onRemove,
  onClear,
}: CartDrawerProps) {
  const [step, setStep] = useState<Step>('cart');
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [selectedGov, setSelectedGov] = useState('');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Promo code states
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountType: 'percent' | 'fixed';
    discountValue: number;
    discountAmount: number;
  } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);

  useEffect(() => {
    if (open && governorates.length === 0) {
      api.getGovernorates().then(setGovernorates);
    }
  }, [open, governorates.length]);

  useEffect(() => {
    if (open) {
      setStep(items.length === 0 && step === 'checkout' ? 'cart' : step);
    }
  }, [open]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  // إعادة حساب الخصم تلقائياً لو العميل عدّل الكميات في السلة
  const discountAmount = useMemo(() => {
    if (!appliedPromo) return 0;
    const raw =
      appliedPromo.discountType === 'percent'
        ? Math.round((subtotal * appliedPromo.discountValue) / 100)
        : appliedPromo.discountValue;
    return Math.min(raw, subtotal);
  }, [appliedPromo, subtotal]);

  const shippingCost = useMemo(() => {
    const gov = governorates.find((g) => g.name === selectedGov);
    return gov ? gov.shippingCost : 0;
  }, [governorates, selectedGov]);

  const total = Math.max(0, subtotal - discountAmount) + shippingCost;

  const handleApplyPromo = async () => {
    const code = promoInput.trim();
    if (!code) {
      setPromoError('أدخلي كود الخصم أولاً');
      return;
    }
    setApplyingPromo(true);
    setPromoError('');
    try {
      const res = await api.validatePromoCode(code, subtotal);
      setAppliedPromo(res);
      setPromoInput(res.code);
    } catch (err: unknown) {
      setAppliedPromo(null);
      setPromoError(
        err instanceof Error ? err.message : 'كود الخصم غير صحيح',
      );
    } finally {
      setApplyingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoError('');
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 3) e.name = 'من فضلك أدخلي الاسم بالكامل';
    if (!PHONE_RE.test(form.phone.trim()))
      e.phone = 'رقم موبايل غير صحيح (يجب أن يكون 11 رقم مصري)';
    if (!selectedGov) e.governorate = 'اختاري المحافظة';
    if (form.address.trim().length < 10)
      e.address = 'أدخلي العنوان بالتفصيل (شارع، رقم عمارة، شقة)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    const order = await api.createOrder({
      customerName: form.name.trim(),
      phone: form.phone.trim(),
      governorate: selectedGov,
      address: form.address.trim(),
      items,
      subtotal,
      shippingCost,
      promoCode: appliedPromo?.code,
      discountAmount,
      total,
    });
    setSubmitting(false);
    setConfirmedOrder(order);
    setStep('confirm');
    handleRemovePromo();
    onClear();
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      if (step === 'confirm') {
        setStep('cart');
        setConfirmedOrder(null);
        setForm({ name: '', phone: '', address: '' });
        setSelectedGov('');
        setErrors({});
        handleRemovePromo();
      }
    }, 300);
  };

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-burgundy/40 backdrop-blur-sm z-50 animate-fade-in"
        onClick={handleClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 bottom-0 right-0 w-full sm:max-w-md z-50 bg-cream shadow-lift flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-burgundy text-cream shrink-0">
          <div className="flex items-center gap-2">
            {step === 'checkout' && (
              <button
                onClick={() => setStep('cart')}
                className="hover:text-gold transition-colors"
                aria-label="رجوع"
              >
                <ChevronLeft size={22} />
              </button>
            )}
            <ShoppingBag size={22} />
            <h3 className="font-cairo font-bold text-lg">
              {step === 'cart' && `سلة التسوق (${items.length})`}
              {step === 'checkout' && 'إتمام الطلب'}
              {step === 'confirm' && 'تم تأكيد الطلب'}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="hover:text-gold transition-colors"
            aria-label="إغلاق"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* CART STEP */}
          {step === 'cart' && (
            <div className="p-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 rounded-full bg-surface border border-edge flex items-center justify-center mb-4">
                    <ShoppingBag size={32} className="text-burgundy/40" />
                  </div>
                  <p className="font-cairo text-burgundy/60 text-sm mb-2">
                    سلتك فارغة حالياً
                  </p>
                  <p className="font-cairo text-burgundy/40 text-xs">
                    أضيفي منتجاتك المفضلة لتبدئي التسوق
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div
                      key={`${item.productId}-${item.colorName}-${item.size}`}
                      className="flex gap-3 bg-surface rounded-xl border border-edge p-3 animate-fade-in"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-20 h-20 rounded-lg object-cover bg-cream shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-cairo font-bold text-burgundy text-sm line-clamp-1">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className="w-4 h-4 rounded-full border border-edge"
                            style={{ backgroundColor: item.colorHex }}
                          />
                          <span className="font-cairo text-burgundy/60 text-xs">
                            {item.colorName} · {item.size}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-cairo font-bold text-burgundy text-sm">
                            {item.price * item.quantity} ج.م
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onUpdateQty(index, item.quantity - 1)}
                              className="w-7 h-7 rounded-full bg-cream border border-edge flex items-center justify-center text-burgundy hover:bg-rose-100 transition-colors"
                              aria-label="إنقاص"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="font-cairo font-bold text-burgundy text-sm w-6 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQty(index, item.quantity + 1)}
                              className="w-7 h-7 rounded-full bg-cream border border-edge flex items-center justify-center text-burgundy hover:bg-rose-100 transition-colors"
                              aria-label="زيادة"
                            >
                              <Plus size={14} />
                            </button>
                            <button
                              onClick={() => onRemove(index)}
                              className="w-7 h-7 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600 hover:bg-red-100 transition-colors mr-1"
                              aria-label="حذف"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CHECKOUT STEP */}
          {step === 'checkout' && (
            <div className="p-4 space-y-4">
              {/* Promo Code Box */}
              <div className="bg-surface rounded-xl border border-edge p-4">
                <label className="flex items-center gap-1.5 font-cairo font-bold text-burgundy text-sm mb-2">
                  <Tag size={16} className="text-gold" />
                  هل لديكِ كود خصم؟
                </label>
                {appliedPromo ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3.5 py-2.5">
                    <div className="font-cairo text-xs text-green-800">
                      تم تطبيق الكود{' '}
                      <span className="font-bold">{appliedPromo.code}</span> (خصم{' '}
                      {discountAmount} ج.م)
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      className="text-xs font-cairo font-bold text-red-600 hover:underline"
                    >
                      إلغاء
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => {
                        setPromoInput(e.target.value.toUpperCase());
                        if (promoError) setPromoError('');
                      }}
                      placeholder="أدخلي الكود هنا (مثال: MAI10)"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-edge bg-cream font-cairo text-burgundy text-sm uppercase outline-none focus:border-burgundy"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      disabled={applyingPromo}
                      className="px-4 py-2.5 rounded-xl bg-burgundy text-cream font-cairo font-bold text-sm hover:bg-burgundy-600 transition-colors disabled:opacity-60"
                    >
                      {applyingPromo ? '...' : 'تطبيق'}
                    </button>
                  </div>
                )}
                {promoError && (
                  <p className="text-red-600 text-xs font-cairo mt-1.5">
                    {promoError}
                  </p>
                )}
              </div>

              {/* Summary */}
              <div className="bg-surface rounded-xl border border-edge p-4">
                <h4 className="font-cairo font-bold text-burgundy text-sm mb-3">
                  ملخص الطلب
                </h4>
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.colorName}-${item.size}`}
                    className="flex justify-between text-xs font-cairo text-burgundy/70 py-1"
                  >
                    <span className="line-clamp-1 ml-2">
                      {item.title} ({item.colorName}) × {item.quantity}
                    </span>
                    <span className="shrink-0">{item.price * item.quantity} ج.م</span>
                  </div>
                ))}
                <div className="border-t border-edge mt-2 pt-2 space-y-1">
                  <div className="flex justify-between text-sm font-cairo text-burgundy/70">
                    <span>المجموع الفرعي</span>
                    <span>{subtotal} ج.م</span>
                  </div>
                  {appliedPromo && discountAmount > 0 && (
                    <div className="flex justify-between text-sm font-cairo text-green-700 font-medium">
                      <span>الخصم ({appliedPromo.code})</span>
                      <span>-{discountAmount} ج.م</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-cairo text-burgundy/70">
                    <span>الشحن</span>
                    <span>
                      {selectedGov
                        ? `${shippingCost} ج.م`
                        : 'اختاري المحافظة'}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-cairo font-bold text-burgundy pt-1">
                    <span>الإجمالي</span>
                    <span>{total} ج.م</span>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="bg-surface rounded-xl border border-edge p-4 space-y-4">
                <h4 className="font-cairo font-bold text-burgundy text-sm">
                  بيانات التوصيل
                </h4>

                <Field
                  label="الاسم بالكامل"
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                  error={errors.name}
                  placeholder="مثال: سارة محمد علي"
                />

                <Field
                  label="رقم الموبايل"
                  value={form.phone}
                  onChange={(v) => setForm({ ...form, phone: v })}
                  error={errors.phone}
                  placeholder="01XXXXXXXXX"
                  type="tel"
                  maxLength={11}
                />

                <div>
                  <label className="block font-cairo text-burgundy text-sm font-medium mb-1.5">
                    المحافظة
                  </label>
                  <select
                    value={selectedGov}
                    onChange={(e) => setSelectedGov(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border bg-cream font-cairo text-burgundy text-sm outline-none transition-colors ${
                      errors.governorate
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-edge focus:border-burgundy'
                    }`}
                  >
                    <option value="">اختاري المحافظة</option>
                    {governorates.map((g) => (
                      <option key={g.id} value={g.name}>
                        {g.name} — {g.shippingCost} ج.م
                      </option>
                    ))}
                  </select>
                  {errors.governorate && (
                    <p className="text-red-600 text-xs font-cairo mt-1">
                      {errors.governorate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-cairo text-burgundy text-sm font-medium mb-1.5">
                    العنوان بالتفصيل
                  </label>
                  <textarea
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    rows={3}
                    className={`w-full px-4 py-3 rounded-xl border bg-cream font-cairo text-burgundy text-sm outline-none transition-colors resize-none ${
                      errors.address
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-edge focus:border-burgundy'
                    }`}
                    placeholder="المدينة، الحي، الشارع، رقم العمارة، الشقة"
                  />
                  {errors.address && (
                    <p className="text-red-600 text-xs font-cairo mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>

                <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-lg p-3">
                  <Truck size={18} className="text-rose-600 shrink-0 mt-0.5" />
                  <p className="font-cairo text-burgundy/70 text-xs leading-relaxed">
                    الدفع عند الاستلام. سيتم التواصل معكِ لتأكيد الطلب قبل الشحن.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* CONFIRM STEP */}
          {step === 'confirm' && confirmedOrder && (
            <div className="p-6 flex flex-col items-center text-center pt-12">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-5 animate-scale-in">
                <Check size={40} className="text-green-600" />
              </div>
              <h3 className="font-cairo font-bold text-burgundy text-xl mb-2">
                تم استلام طلبكِ بنجاح!
              </h3>
              <p className="font-cairo text-burgundy/60 text-sm mb-6 leading-relaxed">
                سيتم التواصل معكِ خلال 24 ساعة لتأكيد الطلب وموعد التوصيل
              </p>

              <div className="bg-surface rounded-xl border border-edge p-5 w-full mb-6">
                <div className="font-cairo text-burgundy/60 text-xs mb-1">
                  رقم الطلب
                </div>
                <div className="font-playfair font-bold text-burgundy text-2xl mb-4 tracking-wider">
                  {confirmedOrder.orderNumber}
                </div>
                <div className="border-t border-edge pt-3 space-y-2 text-right">
                  <Row label="الاسم" value={confirmedOrder.customerName} />
                  <Row label="الموبايل" value={confirmedOrder.phone} />
                  <Row label="المحافظة" value={confirmedOrder.governorate} />
                  {confirmedOrder.promoCode && confirmedOrder.discountAmount ? (
                    <Row
                      label={`الخصم (${confirmedOrder.promoCode})`}
                      value={`-${confirmedOrder.discountAmount} ج.م`}
                    />
                  ) : null}
                  <Row
                    label="الإجمالي"
                    value={`${confirmedOrder.total} ج.م`}
                    bold
                  />
                </div>
              </div>

              <p className="font-cairo text-burgundy/50 text-xs">
                احتفظي برقم الطلب لتتبع حالة الشحن
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'cart' && items.length > 0 && (
          <div className="shrink-0 border-t border-edge bg-surface p-4 space-y-3">
            <div className="flex justify-between font-cairo text-burgundy">
              <span className="text-sm text-burgundy/70">المجموع الفرعي</span>
              <span className="font-bold text-lg">{subtotal} ج.م</span>
            </div>
            <button
              onClick={() => setStep('checkout')}
              className="w-full py-4 rounded-xl bg-burgundy text-cream font-cairo font-bold text-base hover:bg-burgundy-600 hover:shadow-card transition-all"
            >
              متابعة لإتمام الطلب
            </button>
          </div>
        )}

        {step === 'checkout' && (
          <div className="shrink-0 border-t border-edge bg-surface p-4">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-4 rounded-xl bg-gold text-burgundy font-cairo font-bold text-base hover:bg-gold-300 hover:shadow-card transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="w-5 h-5 border-2 border-burgundy/30 border-t-burgundy rounded-full animate-spin" />
                  جاري التأكيد...
                </>
              ) : (
                `تأكيد الطلب (${total} ج.م)`
              )}
            </button>
          </div>
        )}

        {step === 'confirm' && (
          <div className="shrink-0 border-t border-edge bg-surface p-4">
            <button
              onClick={handleClose}
              className="w-full py-4 rounded-xl bg-burgundy text-cream font-cairo font-bold text-base hover:bg-burgundy-600 transition-colors"
            >
              العودة للتسوق
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  placeholder,
  type = 'text',
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
  maxLength?: number;
}) {
  return (
    <div>
      <label className="block font-cairo text-burgundy text-sm font-medium mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full px-4 py-3 rounded-xl border bg-cream font-cairo text-burgundy text-sm outline-none transition-colors ${
          error
            ? 'border-red-400 focus:border-red-500'
            : 'border-edge focus:border-burgundy'
        }`}
      />
      {error && (
        <p className="text-red-600 text-xs font-cairo mt-1">{error}</p>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className="font-cairo text-burgundy/60 text-sm">{label}</span>
      <span
        className={`font-cairo text-burgundy text-sm ${
          bold ? 'font-bold' : ''
        }`}
      >
        {value}
      </span>
    </div>
  );
}