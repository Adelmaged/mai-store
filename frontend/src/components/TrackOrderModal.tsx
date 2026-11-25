import { useState } from 'react';
import { X, Search, Package, Check, Truck, Home, Clock } from 'lucide-react';
import { Order, ORDER_STATUS_FLOW, ORDER_STATUS_LABELS } from '@/types';
import { api } from '@/services/api';

interface TrackOrderModalProps {
  open: boolean;
  onClose: () => void;
}

export function TrackOrderModal({ open, onClose }: TrackOrderModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (query.trim().length < 3) return;
    setLoading(true);
    setSearched(true);
    const data = await api.trackOrder(query.trim());
    setResults(data);
    setLoading(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-burgundy/40 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-cream rounded-3xl shadow-lift w-full max-w-lg max-h-[90vh] overflow-y-auto pointer-events-auto animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-burgundy text-cream rounded-t-3xl sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <Package size={22} />
              <h3 className="font-cairo font-bold text-lg">تتبع طلبك</h3>
            </div>
            <button
              onClick={onClose}
              className="hover:text-gold transition-colors"
              aria-label="إغلاق"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-5">
            {/* Search */}
            <p className="font-cairo text-burgundy/70 text-sm mb-3">
              أدخلي رقم الطلب (مثل MAI-1001) أو رقم الموبايل لتتبع حالة شحنتك
            </p>
            <div className="flex gap-2 mb-5">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKey}
                placeholder="MAI-1001 أو 01XXXXXXXXX"
                className="flex-1 px-4 py-3 rounded-xl border border-edge bg-surface font-cairo text-burgundy text-sm outline-none focus:border-burgundy transition-colors"
              />
              <button
                onClick={handleSearch}
                disabled={loading || query.trim().length < 3}
                className="px-5 py-3 rounded-xl bg-burgundy text-cream font-cairo font-bold text-sm hover:bg-burgundy-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Search size={18} />
                بحث
              </button>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-10">
                <span className="w-8 h-8 border-4 border-burgundy/20 border-t-burgundy rounded-full animate-spin" />
              </div>
            )}

            {/* No results */}
            {!loading && searched && results.length === 0 && (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-full bg-surface border border-edge flex items-center justify-center mx-auto mb-3">
                  <Package size={28} className="text-burgundy/40" />
                </div>
                <p className="font-cairo text-burgundy/60 text-sm">
                  لم نجد طلباً بهذا الرقم
                </p>
                <p className="font-cairo text-burgundy/40 text-xs mt-1">
                  تأكدي من رقم الطلب أو رقم الموبايل
                </p>
              </div>
            )}

            {/* Results */}
            {!loading && results.length > 0 && (
              <div className="space-y-4">
                {results.map((order) => (
                  <OrderTrackCard key={order.id} order={order} />
                ))}
              </div>
            )}

            {!searched && !loading && (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-3">
                  <Truck size={28} className="text-rose-500" />
                </div>
                <p className="font-cairo text-burgundy/50 text-sm">
                  ابحثي عن طلبك لمعرفة حالته
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function OrderTrackCard({ order }: { order: Order }) {
  const isCancelled = order.status === 'cancelled';
  const currentIdx = ORDER_STATUS_FLOW.indexOf(order.status);

  const steps = [
    { icon: Check, label: ORDER_STATUS_LABELS.new },
    { icon: Clock, label: ORDER_STATUS_LABELS.confirmed },
    { icon: Truck, label: ORDER_STATUS_LABELS.with_rep },
    { icon: Home, label: ORDER_STATUS_LABELS.delivered },
  ];

  return (
    <div className="bg-surface rounded-2xl border border-edge p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="font-playfair font-bold text-burgundy text-base tracking-wider">
            {order.orderNumber}
          </span>
          <p className="font-cairo text-burgundy/50 text-xs mt-0.5">
            {order.customerName} · {order.governorate}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-cairo font-bold border ${
            isCancelled
              ? 'bg-red-100 text-red-700 border-red-300'
              : 'bg-green-100 text-green-700 border-green-300'
          }`}
        >
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      {isCancelled ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="font-cairo text-red-700 text-sm">
            تم إلغاء هذا الطلب. للاستفسار تواصلي معنا عبر واتساب.
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Progress line */}
          <div className="absolute top-5 right-5 left-5 h-1 bg-edge rounded-full" />
          <div
            className="absolute top-5 right-5 h-1 bg-gold rounded-full transition-all duration-500"
            style={{
              width: `calc((100% - 2.5rem) * ${currentIdx / (steps.length - 1)})`,
            }}
          />

          {/* Steps */}
          <div className="relative flex justify-between">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const done = i <= currentIdx;
              return (
                <div
                  key={i}
                  className="flex flex-col items-center gap-2 z-10"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      done
                        ? 'bg-gold text-burgundy'
                        : 'bg-surface text-burgundy/30 border-2 border-edge'
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <span
                    className={`font-cairo text-[10px] sm:text-xs text-center ${
                      done ? 'text-burgundy font-medium' : 'text-burgundy/40'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Items summary */}
      <div className="mt-4 pt-3 border-t border-edge">
        <div className="flex justify-between font-cairo text-sm">
          <span className="text-burgundy/60">الإجمالي</span>
          <span className="font-bold text-burgundy">{order.total} ج.م</span>
        </div>
      </div>
    </div>
  );
}
