import { Instagram, Facebook, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-burgundy text-cream mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-cream flex items-center justify-center">
                <span className="font-playfair text-burgundy text-xl font-bold">M</span>
              </div>
              <div>
                <h3 className="font-cairo font-bold text-lg">مَيّ</h3>
                <p className="font-playfair text-gold text-xs tracking-widest">
                  MAI ESDALA &amp; DRESSES
                </p>
              </div>
            </div>
            <p className="font-cairo text-cream/70 text-sm leading-relaxed max-w-xs">
              إسدالات وفساتين محتشمة بتصاميم راقية وخامات فاخرة، صُنعت بعناية
              لتمنحكِ الأناقة والراحة.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-cairo font-bold text-gold mb-4">روابط سريعة</h4>
            <ul className="space-y-2 font-cairo text-sm text-cream/70">
              <li><a href="#catalog" className="hover:text-cream transition-colors">المنتجات</a></li>
              <li><a href="#catalog" className="hover:text-cream transition-colors">إسدالات</a></li>
              <li><a href="#catalog" className="hover:text-cream transition-colors">فساتين</a></li>
              <li><button onClick={() => onNavigate('/admin')} className="hover:text-cream transition-colors text-right">لوحة التحكم</button></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-cairo font-bold text-gold mb-4">تواصلي معنا</h4>
            <ul className="space-y-2 font-cairo text-sm text-cream/70">
              <li>واتساب: 01000000000</li>
              <li> Instagram: @mai_esdala</li>
              <li>القاهرة، مصر</li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-cairo font-bold text-gold mb-4">تابعينا</h4>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-cream/10 hover:bg-cream/20 flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-cream/10 hover:bg-cream/20 flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-cream/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-center">
          <p className="font-cairo text-cream/60 text-xs sm:text-sm">
            © {new Date().getFullYear()} مَيّ | MAI ESDALA &amp; DRESSES — جميع
            الحقوق محفوظة
          </p>
          <p className="font-cairo text-cream/60 text-xs sm:text-sm flex items-center gap-1.5">
            صُنع بـ <Heart size={14} className="text-rose-400 fill-rose-400" /> في مصر
          </p>
        </div>
      </div>
    </footer>
  );
}
