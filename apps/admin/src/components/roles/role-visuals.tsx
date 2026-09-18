import {
  BarChart3,
  Bell,
  Box,
  CreditCard,
  FileText,
  Headphones,
  Megaphone,
  Package,
  Search,
  Settings,
  Shield,
  ShoppingCart,
  Store,
  Truck,
  Undo2,
  UserRound,
  Warehouse,
  type LucideIcon,
} from 'lucide-react';
import type { RoleIconName, RoleTone } from '@/lib/identity/get-roles-page';

export const ROLE_ICONS: Record<RoleIconName, LucideIcon> = {
  user: UserRound,
  shield: Shield,
  headphones: Headphones,
  box: Box,
  megaphone: Megaphone,
  chart: BarChart3,
};

export const MODULE_ICONS: Record<string, LucideIcon> = {
  identity: UserRound,
  user: UserRound,
  catalog: Package,
  product: Package,
  cart: ShoppingCart,
  checkout: CreditCard,
  order: ShoppingCart,
  inventory: Warehouse,
  payment: CreditCard,
  shipping: Truck,
  promotion: Megaphone,
  notification: Bell,
  review: FileText,
  cms: FileText,
  content: FileText,
  search: Search,
  analytics: BarChart3,
  seller: Store,
  return: Undo2,
  admin: Settings,
};

export const TONE_WELL: Record<RoleTone, string> = {
  violet: 'bg-violet-100 text-violet-600',
  blue: 'bg-sky-100 text-sky-600',
  teal: 'bg-emerald-100 text-emerald-600',
  orange: 'bg-orange-100 text-orange-500',
  pink: 'bg-fuchsia-100 text-fuchsia-600',
  cyan: 'bg-cyan-100 text-cyan-600',
  slate: 'bg-slate-100 text-slate-600',
};
