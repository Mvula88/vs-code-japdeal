import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Logo({ className, size = 'md' }: LogoProps) {
  const sizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

  return (
    <div className={cn('font-bold tracking-tight', sizes[size], className)}>
      <span className="text-primary">Jap</span>
      <span className="text-foreground">DEAL</span>
    </div>
  );
}

// Alternative minimalist logo with icon
export function LogoWithIcon({ className, size = 'md' }: LogoProps) {
  const sizes = {
    sm: { text: 'text-xl', icon: 'w-5 h-5' },
    md: { text: 'text-2xl', icon: 'w-6 h-6' },
    lg: { text: 'text-3xl', icon: 'w-8 h-8' },
    xl: { text: 'text-4xl', icon: 'w-10 h-10' }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('relative', sizes[size].icon)}>
        <div className="absolute inset-0 bg-primary rounded-lg rotate-12 opacity-20"></div>
        <div className="relative bg-primary rounded-lg flex items-center justify-center text-white font-bold">
          <span className="text-xs">J</span>
        </div>
      </div>
      <div className={cn('font-bold tracking-tight', sizes[size].text)}>
        <span className="text-primary">Jap</span>
        <span className="text-foreground">DEAL</span>
      </div>
    </div>
  );
}

// Modern gradient logo
export function LogoGradient({ className, size = 'md' }: LogoProps) {
  const sizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

  return (
    <div className={cn('font-bold tracking-tight', sizes[size], className)}>
      <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
        JapDEAL
      </span>
    </div>
  );
}

// Clean monochrome logo
export function LogoMonochrome({ className, size = 'md' }: LogoProps) {
  const sizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

  return (
    <div className={cn('font-bold tracking-tight text-foreground', sizes[size], className)}>
      JapDEAL
    </div>
  );
}