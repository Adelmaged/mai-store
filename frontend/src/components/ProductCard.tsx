import { useState } from 'react';
import { ShoppingBag, Check } from 'lucide-react';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, colorIdx: number, size: string) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [colorIdx, setColorIdx] = useState(0);
  const [size, setSize] = useState(product.sizes[0]);
  const [justAdded, setJustAdded] = useState(false);

  const selectedColor = product.colors[colorIdx];
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const handleAdd = () => {
    onAddToCart(product, colorIdx, size);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <div className="group bg-surface rounded-2xl border border-edge overflow-hidden shadow-soft hover:shadow-lift transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-cream">
        <img
          src={selectedColor.image}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {discount > 0 && (
          <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-gold text-burgundy text-xs font-cairo font-bold shadow-soft">
            خصم {discount}%
          </span>
        )}
        {product.featured && (
          <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-burgundy text-cream text-xs font-cairo font-bold shadow-soft">
            مميز
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4 sm:p-5">
        <h3 className="font-cairo font-bold text-burgundy text-base sm:text-lg mb-1 line-clamp-1">
          {product.title}
        </h3>
        <p className="font-cairo text-burgundy/55 text-xs sm:text-sm mb-3 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="font-cairo font-bold text-burgundy text-lg sm:text-xl">
            {product.price} ج.م
          </span>
          {product.oldPrice && (
            <span className="font-cairo text-burgundy/40 text-sm line-through">
              {product.oldPrice} ج.م
            </span>
          )}
        </div>

        {/* Colors */}
        <div className="mb-3">
          <p className="font-cairo text-burgundy/70 text-xs mb-2">
            اللون: <span className="font-medium">{selectedColor.name}</span>
          </p>
          <div className="flex gap-2 flex-wrap">
            {product.colors.map((color, idx) => (
              <button
                key={idx}
                onClick={() => setColorIdx(idx)}
                className={`w-7 h-7 rounded-full border-2 transition-all duration-200 ${
                  colorIdx === idx
                    ? 'border-gold scale-110 shadow-soft'
                    : 'border-edge hover:border-rose-300'
                }`}
                style={{ backgroundColor: color.hex }}
                aria-label={color.name}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Sizes */}
        <div className="mb-4">
          <p className="font-cairo text-burgundy/70 text-xs mb-2">المقاس</p>
          <div className="flex gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-cairo font-medium transition-all duration-200 ${
                  size === s
                    ? 'bg-burgundy text-cream'
                    : 'bg-cream text-burgundy border border-edge hover:border-rose-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Add to cart */}
        <button
          onClick={handleAdd}
          className={`w-full py-3 rounded-xl font-cairo font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
            justAdded
              ? 'bg-green-600 text-cream'
              : 'bg-burgundy text-cream hover:bg-burgundy-600 hover:shadow-card'
          }`}
        >
          {justAdded ? (
            <>
              <Check size={18} />
              تمت الإضافة
            </>
          ) : (
            <>
              <ShoppingBag size={18} />
              أضيفي للسلة
            </>
          )}
        </button>
      </div>
    </div>
  );
}
