import { Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, showText = true, size = 'md' }: LogoProps) {
  const iconSize = size === 'sm' ? 'h-7 w-7' : size === 'lg' ? 'h-10 w-10' : 'h-8 w-8';
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn(
        'relative flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-glow',
        iconSize
      )}>
        <Leaf className="h-1/2 w-1/2" strokeWidth={2.5} />
      </div>
      {showText && (
        <span className={cn('font-extrabold tracking-tight', textSize)}>
          GREEN<span className="text-primary">LY</span>
        </span>
      )}
    </div>
  );
}
