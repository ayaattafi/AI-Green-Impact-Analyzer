import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  iconColor?: string;
  className?: string;
}

export function KpiCard({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  trendLabel,
  iconColor = 'text-primary',
  className,
}: KpiCardProps) {
  const TrendIcon = trend === undefined ? Minus : trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend === undefined ? '' : trend > 0 ? 'text-emerald-500' : trend < 0 ? 'text-red-500' : 'text-muted-foreground';

  return (
    <Card className={cn('glass-card relative overflow-hidden p-5 transition-all hover:shadow-glow', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold tracking-tight">{value}</span>
            {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
          </div>
        </div>
        <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10', iconColor)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {(trend !== undefined || trendLabel) && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          {trend !== undefined && (
            <span className={cn('flex items-center gap-0.5 font-medium', trendColor)}>
              <TrendIcon className="h-3 w-3" />
              {Math.abs(trend)}%
            </span>
          )}
          {trendLabel && <span className="text-muted-foreground">{trendLabel}</span>}
        </div>
      )}
    </Card>
  );
}
