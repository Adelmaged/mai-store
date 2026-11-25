import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { api } from '@/services/api';

interface CatalogProps {
  onAddToCart: (product: Product, colorIdx: number, size: string) => void;
  activeCategory: 'all' | 'esdala' | 'dress';
  onCategoryChange: (cat: 'all' | 'esdala' | 'dress') => void;
}

export function Catalog({ onAddToCart, activeCategory, onCategoryChange }: CatalogProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.getProducts().then((data) => {
      if (active) {
        setProducts(data);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const filtered =
    activeCategory === 'all'
      ? products
      : products.filter((p) => p.category === activeCategory);

  const tabs: { key: 'all' | 'esdala' | 'dress'; label: string }[] = [
    { key: 'all', label: 'الكل' },
    { key: 'esdala', label: 'إسدالات' },
    { key: 'dress', label: 'فساتين' },
  ];

  return (
    <section id="catalog" className="py-16 sm:py-20 lg:py-24 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="font-cairo font-bold text-burgundy text-2xl sm:text-3xl lg:text-4xl mb-3">
            تشكيلتنا
          </h2>
          <p className="font-cairo text-burgundy/60 text-sm sm:text-base">
            اختاري ما يناسب ذوقكِ من بين أحدث التصاميم
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex gap-1 p-1.5 bg-surface rounded-full border border-edge shadow-soft">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => onCategoryChange(tab.key)}
                className={`px-5 sm:px-7 py-2.5 rounded-full text-sm font-cairo font-medium transition-all duration-200 ${
                  activeCategory === tab.key
                    ? 'bg-burgundy text-cream shadow-soft'
                    : 'text-burgundy hover:bg-rose-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-surface rounded-2xl border border-edge overflow-hidden animate-pulse"
              >
                <div className="aspect-square bg-cream" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-cream rounded w-3/4" />
                  <div className="h-4 bg-cream rounded w-1/2" />
                  <div className="h-10 bg-cream rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
