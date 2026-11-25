import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { Catalog } from '@/components/Catalog';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { TrackOrderModal } from '@/components/TrackOrderModal';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { AdminDashboard } from '@/components/AdminDashboard';
import { CartItem, Product } from '@/types';

const CART_KEY = 'mai_cart';

function App() {
  const [route, setRoute] = useState(
    typeof window !== 'undefined' ? window.location.pathname : '/',
  );

  useEffect(() => {
    const onPop = () => setRoute(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setRoute(path);
  };

  if (route.startsWith('/admin')) {
    return <AdminDashboard />;
  }

  return <Storefront navigate={navigate} />;
}

function Storefront({ navigate }: { navigate: (path: string) => void }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [trackOpen, setTrackOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'esdala' | 'dress'>(
    'all',
  );
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToCart = (
    product: Product,
    colorIdx: number,
    size: string,
  ) => {
    const color = product.colors[colorIdx];
    const existingIdx = cart.findIndex(
      (item) =>
        item.productId === product.id &&
        item.colorName === color.name &&
        item.size === size,
    );

    if (existingIdx >= 0) {
      const next = [...cart];
      next[existingIdx].quantity += 1;
      setCart(next);
    } else {
      const newItem: CartItem = {
        productId: product.id,
        title: product.title,
        price: product.price,
        colorName: color.name,
        colorHex: color.hex,
        size,
        image: color.image,
        quantity: 1,
      };
      setCart([...cart, newItem]);
    }
    setCartOpen(true);
  };

  const handleUpdateQty = (index: number, qty: number) => {
    if (qty <= 0) {
      setCart(cart.filter((_, i) => i !== index));
      return;
    }
    const next = [...cart];
    next[index].quantity = qty;
    setCart(next);
  };

  const handleRemove = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const handleClear = () => setCart([]);

  return (
    <div className="min-h-screen bg-cream">
      <Navbar
        cartCount={cartCount}
        onCartClick={() => setCartOpen(true)}
        onTrackClick={() => setTrackOpen(true)}
        onCategorySelect={setActiveCategory}
        activeCategory={activeCategory}
      />

      <main>
        <Hero />
        <Catalog
          onAddToCart={handleAddToCart}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      </main>

      <Footer onNavigate={navigate} />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart}
        onUpdateQty={handleUpdateQty}
        onRemove={handleRemove}
        onClear={handleClear}
      />

      <TrackOrderModal open={trackOpen} onClose={() => setTrackOpen(false)} />

      <WhatsAppButton />
    </div>
  );
}

export default App;
