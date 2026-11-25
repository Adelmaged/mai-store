import { ArrowDown, Sparkles } from 'lucide-react';
import { generateHeroImage } from '@/utils/images';

export function Hero() {
  const heroImg = generateHeroImage();

  const scrollToCatalog = () => {
    const el = document.getElementById('catalog');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative pt-28 sm:pt-32 lg:pt-36 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden shadow-lift">
          <img
            src={heroImg}
            alt="مَيّ إسدالات وفساتين"
            className="w-full h-[420px] sm:h-[500px] lg:h-[560px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-burgundy/80 via-burgundy/40 to-transparent" />

          <div className="absolute inset-0 flex items-center">
            <div className="px-6 sm:px-12 lg:px-20 max-w-xl animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cream/15 backdrop-blur-sm border border-cream/20 mb-5">
                <Sparkles size={16} className="text-gold" />
                <span className="text-cream text-xs sm:text-sm font-cairo">
                  تشكيلة جديدة وصلت الآن
                </span>
              </div>

              <h2 className="text-cream text-3xl sm:text-4xl lg:text-5xl font-cairo font-bold leading-tight text-balance mb-4">
                أناقة محتشمة تليق بكِ
                <br />
                <span className="text-gold">في كل وقت</span>
              </h2>

              <p className="text-cream/85 text-base sm:text-lg font-cairo leading-relaxed mb-8 max-w-md">
                إسدالات وفساتين بتصاميم راقية وخامات قطنية فاخرة، صُممت لتمنحكِ
                الراحة والأناقة في آنٍ واحد.
              </p>

              <button
                onClick={scrollToCatalog}
                className="group inline-flex items-center gap-3 px-7 py-4 rounded-full bg-gold text-burgundy font-cairo font-bold text-base shadow-lift hover:bg-gold-300 hover:scale-105 active:scale-100 transition-all duration-200"
              >
                تسوّقي الآن
                <ArrowDown
                  size={20}
                  className="group-hover:translate-y-1 transition-transform"
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trust bar */}
      <TrustBar />
    </section>
  );
}

function TrustBar() {
  const items = [
    { icon: '🧵', title: 'خامات قطنية فاخرة', sub: 'راحة تدوم طوال اليوم' },
    { icon: '🚚', title: 'شحن لجميع المحافظات', sub: 'توصيل سريع وآمن' },
    { icon: '✨', title: 'معاينة قبل الاستلام', sub: 'اطمئني قبل الدفع' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-10 relative z-10">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-surface rounded-2xl shadow-card border border-edge p-6 sm:p-8">
        {items.map((item, i) => (
          <div
            key={i}
            className={`flex items-center gap-4 ${
              i < items.length - 1 ? 'sm:border-l sm:border-edge sm:pl-6' : ''
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-cream flex items-center justify-center text-2xl shrink-0">
              {item.icon}
            </div>
            <div>
              <h3 className="font-cairo font-bold text-burgundy text-sm sm:text-base">
                {item.title}
              </h3>
              <p className="font-cairo text-burgundy/60 text-xs sm:text-sm">
                {item.sub}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
