import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, ChevronLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { navItems, groupLabels, type NavConfig } from '@/lib/navigation';
import { Logo } from '@/components/shared/Logo';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const groups: NavConfig['group'][] = ['overview', 'calculators', 'analytics', 'account'];

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

export function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const initials = (user?.email ?? 'U')
    .slice(0, 2)
    .toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-4">
        <Link to="/app/dashboard">
          <Logo size="sm" />
        </Link>
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation menu">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3">
        <nav className="space-y-6 py-4">
          {groups.map((group) => (
            <div key={group}>
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {groupLabels[group]}
              </p>
              <div className="space-y-1">
                {navItems
                  .filter((n) => n.group === group)
                  .map((item) => {
                    const active = location.pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                          active
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{item.label}</span>
                        {active && (
                          <motion.div
                            layoutId="sidebar-active"
                            className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
                          />
                        )}
                      </Link>
                    );
                  })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      <div className="border-t border-border/60 p-3">
        <Link
          to="/"
          className="mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to home
        </Link>
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium">{user?.email}</p>
            <p className="text-xs text-muted-foreground">Free plan</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut} className="h-7 w-7" aria-label="Sign out">
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border/60 bg-card/50 backdrop-blur-xl lg:block">
        {content}
      </aside>

      {/* Mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border/60 bg-card lg:hidden"
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
