import { cn } from '@/lib/utils';
import { scoreColor } from '@/lib/format';

interface ScoreGaugeProps {
  score: number;
  size?: number;
  label?: string;
  className?: string;
}

export function ScoreGauge({ score, size = 160, label = 'Green Score', className }: ScoreGaugeProps) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference * 0.75;
  const arcLength = circumference * 0.75;

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-[135deg]">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="10"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth="10"
            strokeDasharray={`${arcLength - offset} ${circumference}`}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--accent))" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('text-4xl font-extrabold', scoreColor(clamped))}>{clamped}</span>
          <span className="text-xs text-muted-foreground">/ 100</span>
        </div>
      </div>
      <span className="mt-2 text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  );
}
