import { useState, useEffect } from 'react';
import { ShoppingBag, Package, Menu, X } from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  onCartClick: () => void;
  onTrackClick: () => void;
  onCategorySelect: (cat: 'all' | 'esdala' | 'dress') => void;
  activeCategory: 'all' | 'esdala' | 'dress';
}

export function Navbar({
  cartCount,
  onCartClick,
  onTrackClick,
  onCategorySelect,
  activeCategory,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const categories: { key: 'all' | 'esdala' | 'dress'; label: string }[] = [
    { key: 'all', label: 'الكل' },
    { key: 'esdala', label: 'إسدالات' },
    { key: 'dress', label: 'فساتين' },
  ];

  const handleNav = (cat: 'all' | 'esdala' | 'dress') => {
    onCategorySelect(cat);
    setMobileOpen(false);
    const el = document.getElementById('catalog');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-cream/95 backdrop-blur-md shadow-soft py-3'
          : 'bg-cream/80 backdrop-blur-sm py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 shrink-0"
          >
            <img
              src="/logo.jpeg"
              alt="مَيّ | MAI ESDALA & DRESSES"
              className="w-12 h-12 rounded-full object-cover shadow-soft border border-gold/40"
            />
            <div className="text-right leading-none">
              <h1 className="font-cairo font-bold text-burgundy text-lg sm:text-xl">
                مَيّ
              </h1>
              <p className="font-playfair text-gold text-[10px] sm:text-xs tracking-widest">
                MAI ESDALA &amp; DRESSES
              </p>
            </div>
          </button>

          <div className="hidden md:flex items-center gap-1">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => handleNav(cat.key)}
                className={`px-5 py-2.5 rounded-full text-sm font-cairo font-medium transition-all duration-200 ${
                  activeCategory === cat.key
                    ? 'bg-burgundy text-cream shadow-soft'
                    : 'text-burgundy hover:bg-rose-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={onTrackClick}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-cairo font-medium text-burgundy hover:bg-rose-100 transition-colors"
            >
              <Package size={18} />
              <span>تتبع طلبك</span>
            </button>

            <button
              onClick={onCartClick}
              className="relative w-11 h-11 rounded-full bg-burgundy text-cream flex items-center justify-center shadow-soft hover:bg-burgundy-600 transition-colors"
              aria-label="السلة"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -left-1 min-w-5 h-5 px-1 rounded-full bg-gold text-burgundy text-xs font-cairo font-bold flex items-center justify-center animate-scale-in">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-11 h-11 rounded-full border border-edge text-burgundy flex items-center justify-center"
              aria-label="القائمة"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden mt-3 pb-2 animate-fade-in">
            <div className="flex flex-col gap-1 bg-surface rounded-2xl p-2 shadow-card border border-edge">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => handleNav(cat.key)}
                  className={`px-4 py-3 rounded-xl text-right text-sm font-cairo font-medium transition-colors ${
                    activeCategory === cat.key
                      ? 'bg-burgundy text-cream'
                      : 'text-burgundy hover:bg-rose-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
              <button
                onClick={() => {
                  onTrackClick();
                  setMobileOpen(false);
                }}
                className="px-4 py-3 rounded-xl text-right text-sm font-cairo font-medium text-burgundy hover:bg-rose-100 transition-colors flex items-center gap-2"
              >
                <Package size={18} />
                تتبع طلبك
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}