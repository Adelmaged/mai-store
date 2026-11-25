function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function garmentSvg(opts: {
  category: 'esdala' | 'dress';
  bodyColor: string;
  accent: string;
  label: string;
  labelEn: string;
}): string {
  const { category, bodyColor, accent, label, labelEn } = opts;
  const isEsdala = category === 'esdala';
  const headTop = isEsdala ? 70 : 60;
  const robeTop = isEsdala ? 120 : 100;
  const hemLine = isEsdala ? 740 : 720;
  const shoulderW = isEsdala ? 180 : 160;
  const hemW = isEsdala ? 240 : 220;
  const cx = 400;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FAF6F0"/>
      <stop offset="100%" stop-color="#F3E9E0"/>
    </linearGradient>
    <linearGradient id="robe" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${bodyColor}" stop-opacity="0.95"/>
      <stop offset="50%" stop-color="${bodyColor}" stop-opacity="1"/>
      <stop offset="100%" stop-color="${bodyColor}" stop-opacity="0.85"/>
    </linearGradient>
    <radialGradient id="shadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#4A2535" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#4A2535" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="800" height="800" fill="url(#bg)"/>
  <!-- floor shadow -->
  <ellipse cx="${cx}" cy="${hemLine + 30}" rx="${hemW + 60}" ry="30" fill="url(#shadow)"/>

  ${
    isEsdala
      ? // prayer outfit: includes head covering
        `<path d="M ${cx - 90} ${headTop - 20} Q ${cx} ${headTop - 60} ${cx + 90} ${headTop - 20} L ${cx + 70} ${robeTop} L ${cx - 70} ${robeTop} Z" fill="${bodyColor}" opacity="0.9"/>
         <ellipse cx="${cx}" cy="${headTop + 20}" rx="55" ry="65" fill="#E8C9B8"/>
         <path d="M ${cx - 55} ${headTop + 10} Q ${cx - 90} ${headTop + 80} ${cx - 80} ${robeTop + 20} L ${cx + 80} ${robeTop + 20} Q ${cx + 90} ${headTop + 80} ${cx + 55} ${headTop + 10} Z" fill="${bodyColor}" opacity="0.85"/>`
      : // dress: elegant shoulders
        `<ellipse cx="${cx}" cy="${headTop + 30}" rx="55" ry="65" fill="#E8C9B8"/>
         <path d="M ${cx - 50} ${headTop + 15} Q ${cx - 60} ${headTop - 10} ${cx} ${headTop - 15} Q ${cx + 60} ${headTop - 10} ${cx + 50} ${headTop + 15} Z" fill="#3D2A1E"/>`
  }

  <!-- Robe/dress body -->
  <path d="M ${cx - shoulderW / 2} ${robeTop}
           Q ${cx - shoulderW / 2 - 10} ${robeTop + 20} ${cx - shoulderW / 2 - 30} ${robeTop + 40}
           L ${cx - hemW / 2} ${hemLine}
           Q ${cx} ${hemLine + 20} ${cx + hemW / 2} ${hemLine}
           L ${cx + shoulderW / 2 + 30} ${robeTop + 40}
           Q ${cx + shoulderW / 2 + 10} ${robeTop + 20} ${cx + shoulderW / 2} ${robeTop}
           Q ${cx} ${robeTop - 10} ${cx - shoulderW / 2} ${robeTop} Z"
        fill="url(#robe)"/>

  <!-- Center fold line -->
  <line x1="${cx}" y1="${robeTop}" x2="${cx}" y2="${hemLine + 10}" stroke="#00000018" stroke-width="2"/>

  <!-- Accent trim on hem -->
  <path d="M ${cx - hemW / 2 + 10} ${hemLine - 8} Q ${cx} ${hemLine + 14} ${cx + hemW / 2 - 10} ${hemLine - 8}"
        stroke="${accent}" stroke-width="4" fill="none" opacity="0.7"/>

  <!-- Accent trim on neckline -->
  <path d="M ${cx - shoulderW / 2 + 10} ${robeTop + 5} Q ${cx} ${robeTop + 30} ${cx + shoulderW / 2 - 10} ${robeTop + 5}"
        stroke="${accent}" stroke-width="3" fill="none" opacity="0.7"/>

  <!-- Sleeve hint -->
  <path d="M ${cx - shoulderW / 2 - 25} ${robeTop + 35} Q ${cx - shoulderW / 2 - 60} ${robeTop + 120} ${cx - hemW / 2 + 30} ${hemLine - 40}"
        stroke="${accent}" stroke-width="2" fill="none" opacity="0.4"/>
  <path d="M ${cx + shoulderW / 2 + 25} ${robeTop + 35} Q ${cx + shoulderW / 2 + 60} ${robeTop + 120} ${cx + hemW / 2 - 30} ${hemLine - 40}"
        stroke="${accent}" stroke-width="2" fill="none" opacity="0.4"/>

  <!-- Label -->
  <text x="${cx}" y="${hemLine + 70}" text-anchor="middle" font-family="Cairo, sans-serif" font-size="28" fill="#4A2535" font-weight="600">${label}</text>
  <text x="${cx}" y="${hemLine + 100}" text-anchor="middle" font-family="Playfair Display, serif" font-size="18" fill="#C5A059" letter-spacing="2">${labelEn}</text>
</svg>`;
}

export function generateProductImage(
  category: 'esdala' | 'dress',
  bodyColor: string,
  accent: string,
  label: string,
  labelEn: string,
): string {
  return svgToDataUri(garmentSvg({ category, bodyColor, accent, label, labelEn }));
}

export function generateHeroImage(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 700" width="1200" height="700">
  <defs>
    <linearGradient id="hg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#4A2535"/>
      <stop offset="60%" stop-color="#6B3A48"/>
      <stop offset="100%" stop-color="#4A2535"/>
    </linearGradient>
    <radialGradient id="glow" cx="30%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#D9A7B0" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#D9A7B0" stop-opacity="0"/>
    </radialGradient>
    <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
      <circle cx="20" cy="20" r="1.5" fill="#C5A059" opacity="0.15"/>
    </pattern>
  </defs>
  <rect width="1200" height="700" fill="url(#hg)"/>
  <rect width="1200" height="700" fill="url(#dots)"/>
  <rect width="1200" height="700" fill="url(#glow)"/>
  <!-- decorative arches -->
  <path d="M 200 500 Q 200 300 400 300 Q 600 300 600 500 L 600 600 L 200 600 Z" fill="#00000018"/>
  <path d="M 250 500 Q 250 340 400 340 Q 550 340 550 500 L 550 600 L 250 600 Z" fill="#C5A05922"/>
  <!-- silhouette -->
  <ellipse cx="400" cy="200" rx="45" ry="55" fill="#D9A7B0" opacity="0.3"/>
  <path d="M 320 270 Q 300 280 290 300 L 260 560 Q 400 580 540 560 L 510 300 Q 500 280 480 270 Q 400 250 320 270 Z" fill="#D9A7B0" opacity="0.25"/>
  <line x1="400" y1="270" x2="400" y2="570" stroke="#FFFFFF" stroke-width="2" opacity="0.15"/>
</svg>`;
  return svgToDataUri(svg);
}
