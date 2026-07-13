import { useState } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Menu, Moon, Sun, Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/shared/Sidebar';
import { navItems } from '@/lib/navigation';

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const currentItem = navItems.find((n) => n.href === location.pathname);
  const pageTitle = currentItem?.label ?? 'Dashboard';

  return (
    <div className="min-h-screen bg-background">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border/60 bg-background/70 px-4 backdrop-blur-xl sm:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation menu">
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">{pageTitle}</h1>

          <div className="ml-auto flex items-center gap-2">
            <div className="relative hidden sm:block">
              <label htmlFor="app-search" className="sr-only">Search history</label>
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="app-search"
                placeholder="Search..."
                className="h-9 w-48 pl-8 lg:w-64"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') navigate('/app/history');
                }}
              />
            </div>
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full bg-primary/10 text-primary"
              onClick={() => navigate('/app/profile')}
              aria-label="Open profile"
            >
              {(user?.email ?? 'U').slice(0, 1).toUpperCase()}
            </Button>
          </div>
        </header>

        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
