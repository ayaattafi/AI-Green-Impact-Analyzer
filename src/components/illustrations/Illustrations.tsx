interface IllustrationProps {
  className?: string;
}

export function CarIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 120 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 55 Q10 45 20 42 L30 30 Q35 25 45 25 L75 25 Q85 25 90 30 L100 42 Q110 45 110 55 L110 60 Q110 63 107 63 L100 63" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M35 30 L40 25 Q42 22 46 22 L72 22 Q76 22 78 25 L82 30" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" fill="hsl(var(--primary) / 0.1)"/>
      <circle cx="35" cy="63" r="9" stroke="hsl(var(--primary))" strokeWidth="2.5" fill="hsl(var(--card))"/>
      <circle cx="85" cy="63" r="9" stroke="hsl(var(--primary))" strokeWidth="2.5" fill="hsl(var(--card))"/>
      <circle cx="35" cy="63" r="3" fill="hsl(var(--primary))"/>
      <circle cx="85" cy="63" r="3" fill="hsl(var(--primary))"/>
      <path d="M100 63 L107 63 Q110 63 110 60" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

export function AirplaneIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 120 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 40 L50 36 L70 20 Q80 18 78 26 L66 42 L90 50 Q95 52 92 56 L60 52 L50 64 Q47 67 43 65 L48 50 L20 46 Q15 45 20 40Z" stroke="hsl(var(--accent))" strokeWidth="2" strokeLinejoin="round" fill="hsl(var(--accent) / 0.1)"/>
    </svg>
  );
}

export function BicycleIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 120 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="55" r="13" stroke="hsl(var(--primary))" strokeWidth="2.5" fill="none"/>
      <circle cx="92" cy="55" r="13" stroke="hsl(var(--primary))" strokeWidth="2.5" fill="none"/>
      <path d="M28 55 L50 35 L70 55 L92 55 M50 35 L60 35 M70 55 L60 35 L55 28" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="28" cy="55" r="3" fill="hsl(var(--primary))"/>
      <circle cx="92" cy="55" r="3" fill="hsl(var(--primary))"/>
    </svg>
  );
}

export function WaterIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 120 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M60 15 Q40 45 40 65 Q40 82 60 82 Q80 82 80 65 Q80 45 60 15Z" stroke="hsl(var(--accent))" strokeWidth="2.5" strokeLinejoin="round" fill="hsl(var(--accent) / 0.15)"/>
      <path d="M55 60 Q50 68 55 73" stroke="hsl(var(--accent))" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
    </svg>
  );
}

export function ElectricityIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M58 10 L30 52 L48 52 L42 90 L70 48 L52 48 L58 10Z" stroke="hsl(var(--chart-5))" strokeWidth="2.5" strokeLinejoin="round" fill="hsl(var(--chart-5) / 0.15)"/>
    </svg>
  );
}

export function FoodIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="55" r="30" stroke="hsl(var(--primary))" strokeWidth="2.5" fill="hsl(var(--primary) / 0.1)"/>
      <circle cx="42" cy="48" r="4" fill="hsl(var(--chart-5))"/>
      <circle cx="58" cy="48" r="4" fill="hsl(var(--chart-2))"/>
      <circle cx="50" cy="62" r="4" fill="hsl(var(--chart-3))"/>
      <circle cx="40" cy="65" r="3" fill="hsl(var(--chart-1))"/>
      <circle cx="60" cy="65" r="3" fill="hsl(var(--chart-4))"/>
    </svg>
  );
}

export function TreesIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 12 Q35 30 35 45 Q35 58 50 58 Q65 58 65 45 Q65 30 50 12Z" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinejoin="round" fill="hsl(var(--primary) / 0.15)"/>
      <path d="M50 58 L50 85" stroke="hsl(var(--forest))" strokeWidth="3" strokeLinecap="round"/>
      <path d="M50 75 L42 82 M50 80 L58 86" stroke="hsl(var(--forest))" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export function RecyclingIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 18 L62 38 L50 30 L38 38 Z" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinejoin="round" fill="hsl(var(--primary) / 0.15)"/>
      <path d="M38 38 L25 58 L38 58 L32 68" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M62 38 L75 58 L62 58 L68 68" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function HomeIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 50 L50 25 L80 50 L80 80 L20 80 Z" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinejoin="round" fill="hsl(var(--primary) / 0.1)"/>
      <rect x="42" y="60" width="16" height="20" stroke="hsl(var(--forest))" strokeWidth="2" fill="hsl(var(--card))"/>
      <rect x="28" y="55" width="10" height="10" stroke="hsl(var(--forest))" strokeWidth="2" fill="hsl(var(--card))"/>
      <rect x="62" y="55" width="10" height="10" stroke="hsl(var(--forest))" strokeWidth="2" fill="hsl(var(--card))"/>
    </svg>
  );
}

export function SolarEnergyIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 120 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="30" r="12" stroke="hsl(var(--chart-5))" strokeWidth="2.5" fill="hsl(var(--chart-5) / 0.15)"/>
      <g stroke="hsl(var(--chart-5))" strokeWidth="2" strokeLinecap="round">
        <path d="M60 10 L60 16 M60 44 L60 50 M40 30 L46 30 M74 30 L80 30 M46 16 L50 20 M70 40 L74 44 M74 16 L70 20 M50 40 L46 44"/>
      </g>
      <path d="M25 70 L80 70 L90 85 L15 85 Z" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinejoin="round" fill="hsl(var(--primary) / 0.12)"/>
      <path d="M43 70 L43 85 M61 70 L61 85" stroke="hsl(var(--primary))" strokeWidth="2"/>
      <path d="M25 77 L90 77" stroke="hsl(var(--primary))" strokeWidth="2"/>
    </svg>
  );
}

export function LeafIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 15 Q25 30 25 55 Q25 75 50 80 Q75 75 75 55 Q75 30 50 15Z" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinejoin="round" fill="hsl(var(--primary) / 0.15)"/>
      <path d="M50 15 L50 80 M50 40 L38 50 M50 55 L62 65 M50 40 L62 50 M50 55 L38 65" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    </svg>
  );
}

export const illustrations = {
  carbon: CarIllustration,
  water: WaterIllustration,
  energy: ElectricityIllustration,
  food: FoodIllustration,
  waste: RecyclingIllustration,
  electronics: SmartphoneIllustrationFallback,
};

function SmartphoneIllustrationFallback({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 80 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="15" width="40" height="70" rx="6" stroke="hsl(var(--primary))" strokeWidth="2.5" fill="hsl(var(--primary) / 0.1)"/>
      <rect x="25" y="25" width="30" height="45" rx="2" stroke="hsl(var(--primary))" strokeWidth="1.5" fill="hsl(var(--card))"/>
      <circle cx="40" cy="78" r="3" stroke="hsl(var(--primary))" strokeWidth="2" fill="none"/>
    </svg>
  );
}
