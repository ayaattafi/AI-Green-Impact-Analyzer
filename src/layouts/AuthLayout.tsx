import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  footer?: React.ReactNode;
}

export function AuthLayout({ children, title, subtitle, footer }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col lg:flex-row">
      {/* Visual side */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-primary to-accent lg:flex lg:w-1/2">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <Leaf className="h-5 w-5" />
            </div>
            <span className="text-xl font-extrabold">GREENLY</span>
          </Link>
          <div className="space-y-6">
            <h2 className="text-4xl font-extrabold leading-tight">
              Measure. Analyze.<br />Reduce your footprint.
            </h2>
            <p className="max-w-md text-lg text-white/80">
              AI-powered sustainability insights for individuals and organizations
              committed to a greener future.
            </p>
            <div className="grid grid-cols-3 gap-6 pt-4">
              {[
                { value: '2.4M', label: 'kg CO₂ saved' },
                { value: '48K', label: 'Active users' },
                { value: '96%', label: 'AI accuracy' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-3xl font-bold">{s.value}</div>
                  <div className="text-sm text-white/70">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-sm text-white/60">© 2026 GREENLY. All rights reserved.</p>
        </div>
      </div>

      {/* Form side */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white">
                <Leaf className="h-5 w-5" />
              </div>
              <span className="text-xl font-extrabold">GREENLY</span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
