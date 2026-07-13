import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Car,
  Droplets,
  Zap,
  UtensilsCrossed,
  Recycle,
  Smartphone,
  Brain,
  BarChart3,
  FileText,
  History,
  User,
  Settings,
  Leaf,
} from 'lucide-react';

export interface NavConfig {
  label: string;
  href: string;
  icon: LucideIcon;
  group: 'overview' | 'calculators' | 'analytics' | 'account';
}

export const navItems: NavConfig[] = [
  { label: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard, group: 'overview' },
  { label: 'Carbon', href: '/app/calculators/carbon', icon: Car, group: 'calculators' },
  { label: 'Water', href: '/app/calculators/water', icon: Droplets, group: 'calculators' },
  { label: 'Energy', href: '/app/calculators/energy', icon: Zap, group: 'calculators' },
  { label: 'Food', href: '/app/calculators/food', icon: UtensilsCrossed as LucideIcon, group: 'calculators' },
  { label: 'Waste', href: '/app/calculators/waste', icon: Recycle, group: 'calculators' },
  { label: 'Electronics', href: '/app/calculators/electronics', icon: Smartphone, group: 'calculators' },
  { label: 'Analytics', href: '/app/ai-analytics', icon: Brain, group: 'analytics' },
  { label: 'Dashboard', href: '/app/bi', icon: BarChart3, group: 'analytics' },
  { label: 'Reports', href: '/app/reports', icon: FileText, group: 'analytics' },
  { label: 'History', href: '/app/history', icon: History, group: 'analytics' },
  { label: 'Profile', href: '/app/profile', icon: User, group: 'account' },
  { label: 'Settings', href: '/app/settings', icon: Settings, group: 'account' },
];

export const groupLabels: Record<NavConfig['group'], string> = {
  overview: 'Overview',
  calculators: 'Calculators',
  analytics: 'Analytics & Reports',
  account: 'Account',
};

export const brandIcon = Leaf;
