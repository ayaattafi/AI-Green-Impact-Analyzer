import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Moon, Sun, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

const links = [
  { label: 'Features', href: '/#features' },
  { label: 'AI', href: '/#ai' },
  { label: 'Sustainability', href: '/#sustainability' },
  { label: 'FAQ', href: '/#faq' },
  { label: 'About', href: '/about' },
];

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleNav = (href: string) => {
    setOpen(false);
    if (href.startsWith('/#')) {
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const el = document.querySelector(href.slice(1));
          el?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      } else {
        document.querySelector(href.slice(1))?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(href);
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mt-3 flex h-16 items-center justify-between rounded-2xl border border-border/60 bg-background/70 px-4 shadow-sm backdrop-blur-xl">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-white">
              <Leaf className="h-4 w-4" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-extrabold tracking-tight">GREEN<span className="text-primary">LY</span></span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <button
                key={l.label}
                onClick={() => handleNav(l.href)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" className="hidden sm:flex" onClick={() => navigate('/login')}>
              Sign in
            </Button>
            <Button className="hidden sm:flex" onClick={() => navigate('/register')}>
              Get started
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(!open)}>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-auto max-w-7xl px-4 sm:px-6 md:hidden"
          >
            <div className="mt-2 space-y-1 rounded-2xl border border-border/60 bg-background/90 p-4 backdrop-blur-xl">
              {links.map((l) => (
                <button
                  key={l.label}
                  onClick={() => handleNav(l.href)}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-muted-foreground hover:bg-muted"
                >
                  {l.label}
                </button>
              ))}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => { setOpen(false); navigate('/login'); }}>
                  Sign in
                </Button>
                <Button className="flex-1" onClick={() => { setOpen(false); navigate('/register'); }}>
                  Get started
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
