import fs from 'fs';
import path from 'path';

const logosDir = path.resolve('client/public/logos');

const logos = {
  'mobitel.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="100%" height="100%">
    <rect width="240" height="80" rx="8" fill="#FFFFFF"/>
    <g transform="translate(15, 18)">
      <path d="M0,22 C0,10 10,0 22,0 C34,0 44,10 44,22 C44,34 34,44 22,44 C10,44 0,34 0,22 Z" fill="#0070BA"/>
      <path d="M12,22 C12,16 16,12 22,12 C28,12 32,16 32,22 C32,28 28,32 22,32 C16,32 12,28 12,22 Z" fill="#009944"/>
      <circle cx="22" cy="22" r="5" fill="#FFFFFF"/>
    </g>
    <text x="68" y="38" font-family="system-ui, sans-serif" font-weight="900" font-size="20" fill="#0070BA" letter-spacing="1">SLT-MOBITEL</text>
    <text x="69" y="52" font-family="system-ui, sans-serif" font-weight="700" font-size="9" fill="#009944" letter-spacing="1.5">THE CONNECTION</text>
  </svg>`,

  'uwu.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="100%" height="100%">
    <rect width="240" height="80" rx="8" fill="#FFFFFF"/>
    <g transform="translate(15, 14)">
      <polygon points="26,0 52,15 52,38 26,52 0,38 0,15" fill="#800020"/>
      <polygon points="26,6 46,18 46,36 26,46 6,36 6,18" fill="#D4AF37"/>
      <text x="26" y="32" font-family="Georgia, serif" font-weight="bold" font-size="16" fill="#800020" text-anchor="middle">UWU</text>
    </g>
    <text x="76" y="38" font-family="Georgia, serif" font-weight="bold" font-size="17" fill="#800020">Uva Wellassa</text>
    <text x="76" y="53" font-family="system-ui, sans-serif" font-weight="600" font-size="11" fill="#555555" letter-spacing="0.5">University of Sri Lanka</text>
  </svg>`,

  'uoc.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="100%" height="100%">
    <rect width="240" height="80" rx="8" fill="#FFFFFF"/>
    <g transform="translate(15, 14)">
      <circle cx="26" cy="26" r="25" fill="#7A0019"/>
      <circle cx="26" cy="26" r="21" fill="#FFFFFF" stroke="#D4AF37" stroke-width="2"/>
      <text x="26" y="32" font-family="Georgia, serif" font-weight="bold" font-size="14" fill="#7A0019" text-anchor="middle">UOC</text>
    </g>
    <text x="75" y="38" font-family="Georgia, serif" font-weight="bold" font-size="17" fill="#7A0019">University of</text>
    <text x="75" y="54" font-family="Georgia, serif" font-weight="bold" font-size="16" fill="#D4AF37">Colombo</text>
  </svg>`,

  'nibm.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="100%" height="100%">
    <rect width="240" height="80" rx="8" fill="#FFFFFF"/>
    <g transform="translate(15, 18)">
      <rect x="0" y="0" width="44" height="44" rx="10" fill="#003366"/>
      <path d="M10,32 L10,12 L17,12 L26,26 L26,12 L33,12 L33,32 L26,32 L17,18 L17,32 Z" fill="#F37021"/>
    </g>
    <text x="68" y="38" font-family="system-ui, sans-serif" font-weight="900" font-size="22" fill="#003366" letter-spacing="2">NIBM</text>
    <text x="69" y="52" font-family="system-ui, sans-serif" font-weight="600" font-size="10" fill="#F37021" letter-spacing="1">SRI LANKA</text>
  </svg>`,

  'ucl.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="100%" height="100%">
    <rect width="240" height="80" rx="8" fill="#FFFFFF"/>
    <g transform="translate(15, 15)">
      <path d="M0,5 C0,25 24,48 24,48 C24,48 48,25 48,5 Z" fill="#0A2540"/>
      <path d="M5,9 C5,25 24,42 24,42 C24,42 43,25 43,9 Z" fill="#D4AF37"/>
      <text x="24" y="28" font-family="system-ui, sans-serif" font-weight="900" font-size="14" fill="#0A2540" text-anchor="middle">UCL</text>
    </g>
    <text x="72" y="37" font-family="Georgia, serif" font-weight="bold" font-size="16" fill="#0A2540">Universal College</text>
    <text x="73" y="53" font-family="system-ui, sans-serif" font-weight="700" font-size="11" fill="#D4AF37" letter-spacing="1">LANKA</text>
  </svg>`,

  'lyceum.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="100%" height="100%">
    <rect width="240" height="80" rx="8" fill="#FFFFFF"/>
    <g transform="translate(15, 16)">
      <circle cx="24" cy="24" r="23" fill="#002D62"/>
      <circle cx="24" cy="24" r="19" fill="#FFFFFF"/>
      <text x="24" y="29" font-family="Georgia, serif" font-weight="bold" font-size="18" fill="#C59B27" text-anchor="middle">L</text>
    </g>
    <text x="70" y="38" font-family="Georgia, serif" font-weight="bold" font-size="19" fill="#002D62" letter-spacing="0.5">LYCEUM</text>
    <text x="71" y="53" font-family="system-ui, sans-serif" font-weight="700" font-size="11" fill="#C59B27" letter-spacing="2">CAMPUS</text>
  </svg>`,

  'wiin.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="100%" height="100%">
    <rect width="240" height="80" rx="8" fill="#FFFFFF"/>
    <g transform="translate(15, 18)">
      <rect x="0" y="0" width="44" height="44" rx="10" fill="#0F172A"/>
      <path d="M10,12 L16,32 L22,18 L28,32 L34,12" stroke="#06B6D4" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    <text x="68" y="37" font-family="system-ui, sans-serif" font-weight="900" font-size="21" fill="#0F172A" letter-spacing="1">WIIN</text>
    <text x="69" y="52" font-family="system-ui, sans-serif" font-weight="600" font-size="9" fill="#06B6D4" letter-spacing="0.5">INSTITUTE OF TECHNOLOGY</text>
  </svg>`,

  'domains-lk.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="100%" height="100%">
    <rect width="240" height="80" rx="8" fill="#FFFFFF"/>
    <g transform="translate(15, 18)">
      <rect x="0" y="0" width="44" height="44" rx="10" fill="#FF6B00"/>
      <text x="22" y="29" font-family="system-ui, sans-serif" font-weight="900" font-size="17" fill="#FFFFFF" text-anchor="middle">.LK</text>
    </g>
    <text x="68" y="38" font-family="system-ui, sans-serif" font-weight="800" font-size="18" fill="#1E293B">LK DOMAIN</text>
    <text x="69" y="52" font-family="system-ui, sans-serif" font-weight="600" font-size="10" fill="#FF6B00" letter-spacing="1">REGISTRY (T2T)</text>
  </svg>`,

  'zeroplastic.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="100%" height="100%">
    <rect width="240" height="80" rx="8" fill="#FFFFFF"/>
    <g transform="translate(15, 16)">
      <circle cx="24" cy="24" r="23" fill="#16A34A"/>
      <path d="M24,10 C16,18 16,32 24,38 C32,32 32,18 24,10 Z" fill="#FFFFFF"/>
      <line x1="24" y1="12" x2="24" y2="34" stroke="#16A34A" stroke-width="2"/>
    </g>
    <text x="70" y="37" font-family="system-ui, sans-serif" font-weight="800" font-size="18" fill="#15803D">ZeroPlastic</text>
    <text x="71" y="52" font-family="system-ui, sans-serif" font-weight="700" font-size="11" fill="#64748B" letter-spacing="1.5">MOVEMENT</text>
  </svg>`,

  'pickabook.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="100%" height="100%">
    <rect width="240" height="80" rx="8" fill="#FFFFFF"/>
    <g transform="translate(15, 17)">
      <rect x="0" y="0" width="44" height="44" rx="10" fill="#EF4444"/>
      <path d="M12,14 C16,12 22,14 22,18 L22,34 C22,30 16,28 12,30 Z" fill="#FFFFFF"/>
      <path d="M32,14 C28,12 22,14 22,18 L22,34 C22,30 28,28 32,30 Z" fill="#FEE2E2"/>
    </g>
    <text x="68" y="37" font-family="system-ui, sans-serif" font-weight="900" font-size="19" fill="#1E293B">Pick a Book</text>
    <text x="69" y="52" font-family="system-ui, sans-serif" font-weight="600" font-size="10" fill="#EF4444" letter-spacing="1">COMMUNITY</text>
  </svg>`,

  'digitaltrust.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="100%" height="100%">
    <rect width="240" height="80" rx="8" fill="#FFFFFF"/>
    <g transform="translate(15, 16)">
      <path d="M24,4 L44,12 L44,28 C44,38 24,48 24,48 C24,48 4,38 4,28 L4,12 Z" fill="#0F172A"/>
      <polyline points="15,26 22,33 34,19" fill="none" stroke="#38BDF8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    <text x="68" y="36" font-family="system-ui, sans-serif" font-weight="800" font-size="17" fill="#0F172A">Digital Trust</text>
    <text x="69" y="52" font-family="system-ui, sans-serif" font-weight="700" font-size="11" fill="#0284C7" letter-spacing="1">ALLIANCE (DTA)</text>
  </svg>`,

  'gudppl.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="100%" height="100%">
    <rect width="240" height="80" rx="8" fill="#FFFFFF"/>
    <g transform="translate(15, 17)">
      <circle cx="23" cy="23" r="23" fill="#8B5CF6"/>
      <text x="23" y="30" font-family="system-ui, sans-serif" font-weight="900" font-size="18" fill="#FFFFFF" text-anchor="middle">g+</text>
    </g>
    <text x="70" y="38" font-family="system-ui, sans-serif" font-weight="900" font-size="22" fill="#7C3AED" letter-spacing="0.5">gudppl</text>
    <text x="71" y="52" font-family="system-ui, sans-serif" font-weight="600" font-size="10" fill="#64748B" letter-spacing="1">DO GOOD NETWORK</text>
  </svg>`,

  'youlead.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="100%" height="100%">
    <rect width="240" height="80" rx="8" fill="#FFFFFF"/>
    <g transform="translate(15, 18)">
      <rect x="0" y="0" width="44" height="44" rx="10" fill="#F97316"/>
      <polygon points="14,14 32,22 14,30" fill="#FFFFFF"/>
    </g>
    <text x="68" y="38" font-family="system-ui, sans-serif" font-weight="900" font-size="20" fill="#0F172A">YouLead</text>
    <text x="69" y="52" font-family="system-ui, sans-serif" font-weight="700" font-size="10" fill="#F97316" letter-spacing="1">YOUTH EMPOWERMENT</text>
  </svg>`,

  'slaf.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="100%" height="100%">
    <rect width="240" height="80" rx="8" fill="#FFFFFF"/>
    <g transform="translate(15, 16)">
      <circle cx="24" cy="24" r="23" fill="#1E3A8A"/>
      <circle cx="24" cy="24" r="16" fill="#FACC15"/>
      <circle cx="24" cy="24" r="8" fill="#DC2626"/>
    </g>
    <text x="70" y="37" font-family="Georgia, serif" font-weight="bold" font-size="20" fill="#1E3A8A">SLAF</text>
    <text x="71" y="52" font-family="system-ui, sans-serif" font-weight="600" font-size="10" fill="#64748B" letter-spacing="1">SRI LANKA AIR FORCE</text>
  </svg>`,

  'uda.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="100%" height="100%">
    <rect width="240" height="80" rx="8" fill="#FFFFFF"/>
    <g transform="translate(15, 16)">
      <rect x="0" y="0" width="44" height="44" rx="8" fill="#047857"/>
      <rect x="8" y="16" width="8" height="22" fill="#FFFFFF"/>
      <rect x="18" y="10" width="8" height="28" fill="#F59E0B"/>
      <rect x="28" y="20" width="8" height="18" fill="#FFFFFF"/>
    </g>
    <text x="68" y="36" font-family="system-ui, sans-serif" font-weight="800" font-size="17" fill="#065F46">Urban Development</text>
    <text x="69" y="51" font-family="system-ui, sans-serif" font-weight="700" font-size="11" fill="#F59E0B" letter-spacing="1.5">AUTHORITY (UDA)</text>
  </svg>`,

  'nia.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="100%" height="100%">
    <rect width="240" height="80" rx="8" fill="#FFFFFF"/>
    <g transform="translate(15, 16)">
      <circle cx="24" cy="24" r="23" fill="#0284C7"/>
      <polygon points="24,10 27,19 37,20 29,26 32,35 24,29 16,35 19,26 11,20 21,19" fill="#FDE047"/>
    </g>
    <text x="70" y="36" font-family="system-ui, sans-serif" font-weight="800" font-size="16" fill="#0C4A6E">National Innovation</text>
    <text x="71" y="52" font-family="system-ui, sans-serif" font-weight="700" font-size="11" fill="#0284C7" letter-spacing="1.5">AGENCY (NIA)</text>
  </svg>`,

  'jrdc.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="100%" height="100%">
    <rect width="240" height="80" rx="8" fill="#FFFFFF"/>
    <g transform="translate(15, 17)">
      <rect x="0" y="0" width="44" height="44" rx="10" fill="#0284C7"/>
      <path d="M22,10 C16,18 14,24 14,28 C14,33 18,37 22,37 C26,37 30,33 30,28 C30,24 28,18 22,10 Z" fill="#FFFFFF"/>
    </g>
    <text x="68" y="38" font-family="system-ui, sans-serif" font-weight="900" font-size="20" fill="#0C4A6E">JRDC</text>
    <text x="69" y="52" font-family="system-ui, sans-serif" font-weight="600" font-size="10" fill="#0284C7" letter-spacing="0.5">WATER RESEARCH CENTER</text>
  </svg>`,

  'isb.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="100%" height="100%">
    <rect width="240" height="80" rx="8" fill="#FFFFFF"/>
    <g transform="translate(15, 18)">
      <rect x="0" y="0" width="44" height="44" rx="10" fill="#1E3A8A"/>
      <circle cx="22" cy="22" r="14" fill="none" stroke="#F59E0B" stroke-width="4" stroke-dasharray="6 3"/>
      <circle cx="22" cy="22" r="6" fill="#FFFFFF"/>
    </g>
    <text x="68" y="38" font-family="system-ui, sans-serif" font-weight="900" font-size="22" fill="#1E3A8A" letter-spacing="1">ISB</text>
    <text x="69" y="52" font-family="system-ui, sans-serif" font-weight="600" font-size="10" fill="#F59E0B" letter-spacing="0.5">INDUSTRIAL SERVICES BUREAU</text>
  </svg>`,

  'portcity.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="100%" height="100%">
    <rect width="240" height="80" rx="8" fill="#FFFFFF"/>
    <g transform="translate(15, 16)">
      <rect x="0" y="0" width="44" height="44" rx="10" fill="#0369A1"/>
      <path d="M12,32 L22,12 L32,32 Z" fill="#38BDF8"/>
      <path d="M22,12 L22,32" stroke="#FFFFFF" stroke-width="2"/>
    </g>
    <text x="68" y="37" font-family="system-ui, sans-serif" font-weight="800" font-size="17" fill="#0C4A6E">Port City</text>
    <text x="69" y="52" font-family="system-ui, sans-serif" font-weight="700" font-size="11" fill="#0284C7" letter-spacing="1.5">COLOMBO (LOI)</text>
  </svg>`,

  'hometree.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="100%" height="100%">
    <rect width="240" height="80" rx="8" fill="#FFFFFF"/>
    <g transform="translate(15, 16)">
      <circle cx="24" cy="24" r="23" fill="#15803D"/>
      <path d="M24,10 L34,26 L26,26 L32,36 L16,36 L22,26 L14,26 Z" fill="#FFFFFF"/>
    </g>
    <text x="70" y="38" font-family="system-ui, sans-serif" font-weight="800" font-size="19" fill="#14532D">HomeTree</text>
    <text x="71" y="52" font-family="system-ui, sans-serif" font-weight="600" font-size="10" fill="#16A34A" letter-spacing="1">COWORKING &amp; LABS</text>
  </svg>`,

  'ideafactory.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="100%" height="100%">
    <rect width="240" height="80" rx="8" fill="#FFFFFF"/>
    <g transform="translate(15, 17)">
      <rect x="0" y="0" width="44" height="44" rx="10" fill="#F59E0B"/>
      <circle cx="22" cy="18" r="9" fill="#FFFFFF"/>
      <rect x="18" y="27" width="8" height="8" rx="2" fill="#FFFFFF"/>
    </g>
    <text x="68" y="38" font-family="system-ui, sans-serif" font-weight="900" font-size="19" fill="#1E293B">IDEA Factory</text>
    <text x="69" y="52" font-family="system-ui, sans-serif" font-weight="600" font-size="10" fill="#D97706" letter-spacing="1">INNOVATIONS LAB</text>
  </svg>`,

  'tiecolombo.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="100%" height="100%">
    <rect width="240" height="80" rx="8" fill="#FFFFFF"/>
    <g transform="translate(15, 18)">
      <rect x="0" y="0" width="44" height="44" rx="8" fill="#DC2626"/>
      <text x="22" y="30" font-family="Georgia, serif" font-weight="bold" font-size="20" fill="#FFFFFF" text-anchor="middle">TiE</text>
    </g>
    <text x="68" y="38" font-family="system-ui, sans-serif" font-weight="900" font-size="20" fill="#1E293B">TiE Colombo</text>
    <text x="69" y="52" font-family="system-ui, sans-serif" font-weight="600" font-size="10" fill="#DC2626" letter-spacing="1">ENTREPRENEUR NETWORK</text>
  </svg>`,

  'isc2.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="100%" height="100%">
    <rect width="240" height="80" rx="8" fill="#FFFFFF"/>
    <g transform="translate(15, 18)">
      <rect x="0" y="0" width="44" height="44" rx="8" fill="#047857"/>
      <text x="22" y="29" font-family="system-ui, sans-serif" font-weight="bold" font-size="14" fill="#FFFFFF" text-anchor="middle">(ISC)²</text>
    </g>
    <text x="68" y="38" font-family="system-ui, sans-serif" font-weight="900" font-size="18" fill="#064E3B">(ISC)² Colombo</text>
    <text x="69" y="52" font-family="system-ui, sans-serif" font-weight="600" font-size="10" fill="#059669" letter-spacing="0.5">CYBERSECURITY CHAPTER</text>
  </svg>`,

  'iiba.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="100%" height="100%">
    <rect width="240" height="80" rx="8" fill="#FFFFFF"/>
    <g transform="translate(15, 18)">
      <rect x="0" y="0" width="44" height="44" rx="8" fill="#E11D48"/>
      <text x="22" y="29" font-family="system-ui, sans-serif" font-weight="900" font-size="14" fill="#FFFFFF" text-anchor="middle">IIBA</text>
    </g>
    <text x="68" y="38" font-family="system-ui, sans-serif" font-weight="900" font-size="18" fill="#881337">IIBA Colombo</text>
    <text x="69" y="52" font-family="system-ui, sans-serif" font-weight="600" font-size="10" fill="#E11D48" letter-spacing="0.5">BUSINESS ANALYSIS CHAPTER</text>
  </svg>`,

  'ieee.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="100%" height="100%">
    <rect width="240" height="80" rx="8" fill="#FFFFFF"/>
    <g transform="translate(15, 16)">
      <polygon points="24,2 44,24 24,46 4,24" fill="#006699"/>
      <circle cx="24" cy="24" r="8" fill="#FFFFFF"/>
    </g>
    <text x="68" y="38" font-family="system-ui, sans-serif" font-weight="900" font-size="20" fill="#006699" letter-spacing="1">IEEE</text>
    <text x="69" y="52" font-family="system-ui, sans-serif" font-weight="600" font-size="10" fill="#555555" letter-spacing="0.5">SRI LANKA SECTION</text>
  </svg>`,

  'shift-canada.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="100%" height="100%">
    <rect width="240" height="80" rx="8" fill="#FFFFFF"/>
    <g transform="translate(15, 18)">
      <rect x="0" y="0" width="44" height="44" rx="8" fill="#DC2626"/>
      <path d="M12,22 L32,22 M24,14 L32,22 L24,30" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    <text x="68" y="38" font-family="system-ui, sans-serif" font-weight="900" font-size="20" fill="#1E293B">SHIFT</text>
    <text x="69" y="52" font-family="system-ui, sans-serif" font-weight="700" font-size="10" fill="#DC2626" letter-spacing="1">CANADA</text>
  </svg>`,

  'novum.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="100%" height="100%">
    <rect width="240" height="80" rx="8" fill="#FFFFFF"/>
    <g transform="translate(15, 17)">
      <polygon points="23,3 43,14 43,36 23,47 3,36 3,14" fill="#0A192F"/>
      <polygon points="23,9 37,17 37,33 23,41 9,33 9,17" fill="#D4AF37"/>
    </g>
    <text x="68" y="37" font-family="Georgia, serif" font-weight="bold" font-size="19" fill="#0A192F">NOVUM</text>
    <text x="69" y="52" font-family="system-ui, sans-serif" font-weight="600" font-size="9" fill="#D4AF37" letter-spacing="1.5">CONSULTANCY LLC</text>
  </svg>`,

  'engenuity.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="100%" height="100%">
    <rect width="240" height="80" rx="8" fill="#FFFFFF"/>
    <g transform="translate(15, 18)">
      <rect x="0" y="0" width="44" height="44" rx="10" fill="#4338CA"/>
      <circle cx="16" cy="16" r="4" fill="#38BDF8"/>
      <circle cx="30" cy="16" r="4" fill="#38BDF8"/>
      <circle cx="23" cy="30" r="4" fill="#38BDF8"/>
      <line x1="16" y1="16" x2="30" y2="16" stroke="#FFFFFF" stroke-width="2"/>
      <line x1="16" y1="16" x2="23" y2="30" stroke="#FFFFFF" stroke-width="2"/>
      <line x1="30" y1="16" x2="23" y2="30" stroke="#FFFFFF" stroke-width="2"/>
    </g>
    <text x="68" y="37" font-family="system-ui, sans-serif" font-weight="800" font-size="18" fill="#1E1B4B">Engenuity AI</text>
    <text x="69" y="52" font-family="system-ui, sans-serif" font-weight="700" font-size="10" fill="#4338CA" letter-spacing="1">OPS (PVT) LTD</text>
  </svg>`,

  'glx.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="100%" height="100%">
    <rect width="240" height="80" rx="8" fill="#FFFFFF"/>
    <g transform="translate(15, 18)">
      <rect x="0" y="0" width="44" height="44" rx="10" fill="#15803D"/>
      <text x="22" y="30" font-family="system-ui, sans-serif" font-weight="900" font-size="18" fill="#84CC16" text-anchor="middle">GLX</text>
    </g>
    <text x="68" y="38" font-family="system-ui, sans-serif" font-weight="900" font-size="20" fill="#14532D">Good Life X</text>
    <text x="69" y="52" font-family="system-ui, sans-serif" font-weight="600" font-size="10" fill="#16A34A" letter-spacing="1">SUSTAINABLE VENTURES</text>
  </svg>`,

  'jendo.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="100%" height="100%">
    <rect width="240" height="80" rx="8" fill="#FFFFFF"/>
    <g transform="translate(15, 18)">
      <rect x="0" y="0" width="44" height="44" rx="10" fill="#BE123C"/>
      <path d="M10,24 L18,24 L21,14 L25,32 L28,20 L31,24 L36,24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    <text x="68" y="37" font-family="system-ui, sans-serif" font-weight="900" font-size="20" fill="#881337">Jendo</text>
    <text x="69" y="52" font-family="system-ui, sans-serif" font-weight="700" font-size="10" fill="#BE123C" letter-spacing="1">INNOVATIONS</text>
  </svg>`,

  'nagarro.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="100%" height="100%">
    <rect width="240" height="80" rx="8" fill="#FFFFFF"/>
    <g transform="translate(15, 18)">
      <rect x="0" y="0" width="44" height="44" rx="8" fill="#0284C7"/>
      <polygon points="12,12 28,12 34,22 28,32 12,32 18,22" fill="#FFFFFF"/>
    </g>
    <text x="68" y="38" font-family="system-ui, sans-serif" font-weight="900" font-size="22" fill="#0F172A" letter-spacing="1">nagarro</text>
    <text x="69" y="52" font-family="system-ui, sans-serif" font-weight="600" font-size="10" fill="#0284C7" letter-spacing="1.5">ENGINEERING</text>
  </svg>`,

  'effective-solutions.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="100%" height="100%">
    <rect width="240" height="80" rx="8" fill="#FFFFFF"/>
    <g transform="translate(15, 18)">
      <rect x="0" y="0" width="44" height="44" rx="10" fill="#0284C7"/>
      <path d="M12,28 C16,20 28,20 32,28" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="22" cy="18" r="4" fill="#38BDF8"/>
    </g>
    <text x="68" y="37" font-family="system-ui, sans-serif" font-weight="800" font-size="16" fill="#0F172A">Effective Solutions</text>
    <text x="69" y="52" font-family="system-ui, sans-serif" font-weight="600" font-size="10" fill="#0284C7" letter-spacing="0.5">IOT &amp; AI INNOVATIONS</text>
  </svg>`,

  'onedesk.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="100%" height="100%">
    <rect width="240" height="80" rx="8" fill="#FFFFFF"/>
    <g transform="translate(15, 18)">
      <rect x="0" y="0" width="44" height="44" rx="10" fill="#0F172A"/>
      <rect x="10" y="14" width="24" height="16" rx="3" fill="#38BDF8"/>
      <line x1="16" y1="30" x2="28" y2="30" stroke="#FFFFFF" stroke-width="2"/>
    </g>
    <text x="68" y="38" font-family="system-ui, sans-serif" font-weight="900" font-size="20" fill="#0F172A">OneDesk</text>
    <text x="69" y="52" font-family="system-ui, sans-serif" font-weight="600" font-size="10" fill="#0284C7" letter-spacing="1">FOUNDER PLATFORM</text>
  </svg>`,

  'iterativelab.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="100%" height="100%">
    <rect width="240" height="80" rx="8" fill="#FFFFFF"/>
    <g transform="translate(15, 18)">
      <rect x="0" y="0" width="44" height="44" rx="10" fill="#090D16"/>
      <text x="22" y="29" font-family="system-ui, sans-serif" font-weight="900" font-size="16" fill="#00E5FF" text-anchor="middle">ITER8</text>
    </g>
    <text x="68" y="38" font-family="system-ui, sans-serif" font-weight="800" font-size="18" fill="#090D16">Iterative Lab</text>
    <text x="69" y="52" font-family="system-ui, sans-serif" font-weight="600" font-size="10" fill="#00E5FF" letter-spacing="1">DIGITAL COMMERCE</text>
  </svg>`,

  'igniterspace.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="100%" height="100%">
    <rect width="240" height="80" rx="8" fill="#FFFFFF"/>
    <g transform="translate(15, 17)">
      <circle cx="23" cy="23" r="23" fill="#EA580C"/>
      <polygon points="23,9 29,21 39,23 31,31 34,40 23,34 12,40 15,31 7,23 17,21" fill="#FDE047"/>
    </g>
    <text x="68" y="37" font-family="system-ui, sans-serif" font-weight="900" font-size="19" fill="#1E293B">IgniterSpace</text>
    <text x="69" y="52" font-family="system-ui, sans-serif" font-weight="700" font-size="10" fill="#EA580C" letter-spacing="1">MAKER ACADEMY</text>
  </svg>`,

  'gavesha.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="100%" height="100%">
    <rect width="240" height="80" rx="8" fill="#FFFFFF"/>
    <g transform="translate(15, 18)">
      <rect x="0" y="0" width="44" height="44" rx="10" fill="#7C3AED"/>
      <circle cx="22" cy="22" r="10" fill="#A78BFA"/>
      <ellipse cx="22" cy="22" rx="18" ry="6" fill="none" stroke="#FDE047" stroke-width="2" transform="rotate(-25 22 22)"/>
    </g>
    <text x="68" y="38" font-family="system-ui, sans-serif" font-weight="900" font-size="18" fill="#4C1D95">Gavesha Labs</text>
    <text x="69" y="52" font-family="system-ui, sans-serif" font-weight="700" font-size="10" fill="#7C3AED" letter-spacing="1">STEM &amp; SPACE</text>
  </svg>`,

  'roboticgen.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="100%" height="100%">
    <rect width="240" height="80" rx="8" fill="#FFFFFF"/>
    <g transform="translate(15, 18)">
      <rect x="0" y="0" width="44" height="44" rx="10" fill="#2563EB"/>
      <rect x="12" y="14" width="20" height="16" rx="4" fill="#FFFFFF"/>
      <circle cx="17" cy="22" r="2.5" fill="#2563EB"/>
      <circle cx="27" cy="22" r="2.5" fill="#2563EB"/>
    </g>
    <text x="68" y="38" font-family="system-ui, sans-serif" font-weight="900" font-size="19" fill="#1E3A8A">RoboticGen</text>
    <text x="69" y="52" font-family="system-ui, sans-serif" font-weight="700" font-size="10" fill="#2563EB" letter-spacing="1">ROBOTICS &amp; AI</text>
  </svg>`,

  'themakers.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="100%" height="100%">
    <rect width="240" height="80" rx="8" fill="#FFFFFF"/>
    <g transform="translate(15, 18)">
      <rect x="0" y="0" width="44" height="44" rx="10" fill="#0D9488"/>
      <polygon points="22,10 34,32 10,32" fill="#FDE047"/>
    </g>
    <text x="68" y="37" font-family="system-ui, sans-serif" font-weight="900" font-size="18" fill="#134E4A">The Makers</text>
    <text x="69" y="52" font-family="system-ui, sans-serif" font-weight="600" font-size="10" fill="#0D9488" letter-spacing="1">STEM EDUCATION</text>
  </svg>`,

  'aracreate.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="100%" height="100%">
    <rect width="240" height="80" rx="8" fill="#FFFFFF"/>
    <g transform="translate(15, 18)">
      <rect x="0" y="0" width="44" height="44" rx="10" fill="#9333EA"/>
      <path d="M14,14 L30,22 L14,30 Z" fill="#FFFFFF"/>
    </g>
    <text x="68" y="37" font-family="system-ui, sans-serif" font-weight="800" font-size="18" fill="#581C87">araCreate</text>
    <text x="69" y="52" font-family="system-ui, sans-serif" font-weight="600" font-size="10" fill="#9333EA" letter-spacing="1">MEDIA SERVICES</text>
  </svg>`,

  'innovatorpark.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="100%" height="100%">
    <rect width="240" height="80" rx="8" fill="#FFFFFF"/>
    <g transform="translate(15, 17)">
      <circle cx="23" cy="23" r="23" fill="#059669"/>
      <polygon points="23,10 28,20 38,23 30,30 33,39 23,33 13,39 16,30 8,23 18,20" fill="#FFFFFF"/>
    </g>
    <text x="68" y="37" font-family="system-ui, sans-serif" font-weight="800" font-size="18" fill="#064E3B">Innovator Park</text>
    <text x="69" y="52" font-family="system-ui, sans-serif" font-weight="600" font-size="10" fill="#059669" letter-spacing="1">KANDY HUB</text>
  </svg>`,

  'slldc.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="100%" height="100%">
    <rect width="240" height="80" rx="8" fill="#FFFFFF"/>
    <g transform="translate(15, 17)">
      <rect x="0" y="0" width="44" height="44" rx="10" fill="#15803D"/>
      <path d="M10,32 Q22,14 34,32" stroke="#FFFFFF" stroke-width="4" fill="none" stroke-linecap="round"/>
    </g>
    <text x="68" y="37" font-family="system-ui, sans-serif" font-weight="900" font-size="20" fill="#14532D">SLLDC / LRDC</text>
    <text x="69" y="52" font-family="system-ui, sans-serif" font-weight="600" font-size="10" fill="#15803D" letter-spacing="0.5">LAND DEVELOPMENT CORP</text>
  </svg>`
};

for (const [filename, svgContent] of Object.entries(logos)) {
  const filePath = path.join(logosDir, filename);
  fs.writeFileSync(filePath, svgContent.trim());
  console.log('Saved:', filename);
}
console.log('Done writing all verified logos!');

