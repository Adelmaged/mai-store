import { MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '201000000000';
const WHATSAPP_MESSAGE = encodeURIComponent(
  'السلام عليكم، عندي استفسار بخصوص منتجات مَيّ ESDALA & DRESSES',
);

export function WhatsAppButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed bottom-5 left-5 z-30 flex items-center gap-3"
      aria-label="تواصلي معنا واتساب"
    >
      <span className="hidden sm:block px-4 py-2 rounded-full bg-surface text-burgundy text-sm font-cairo font-medium shadow-card border border-edge opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
        تواصلي معنا واتساب
      </span>
      <span className="w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lift hover:scale-110 active:scale-100 transition-transform duration-200 animate-fade-in">
        <MessageCircle size={26} fill="white" />
      </span>
    </a>
  );
}
