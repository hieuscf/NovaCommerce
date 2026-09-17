/**
 * Presentation fixtures for Admin Account Management until an Identity /
 * admin-users Gateway adapter exists.
 */

export type AccountRole = 'customer' | 'admin';
export type AccountStatus = 'active' | 'inactive' | 'blocked';

export interface AccountKpi {
  id: string;
  label: string;
  value: string;
  change: string;
  changeLabel: string;
  tone: 'primary' | 'success' | 'warning' | 'destructive' | 'muted';
}

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  initials: string;
  accent: string;
  role: AccountRole;
  status: AccountStatus;
  emailVerified: boolean;
  lastLogin: string;
  createdAt: string;
}

export const accountsPageMeta = {
  title: 'Account Management',
  description: 'Manage user accounts, roles and permissions across your platform.',
  breadcrumb: [
    { label: 'Home', href: '/' as string | undefined },
    { label: 'Accounts', href: undefined as string | undefined },
  ],
};

export const accountKpis: AccountKpi[] = [
  {
    id: 'total',
    label: 'Total Accounts',
    value: '1,248',
    change: '+12.5%',
    changeLabel: 'vs last 30 days',
    tone: 'primary',
  },
  {
    id: 'customers',
    label: 'Customers',
    value: '1,142',
    change: '+14.2%',
    changeLabel: 'vs last 30 days',
    tone: 'success',
  },
  {
    id: 'admins',
    label: 'Admins',
    value: '12',
    change: '0.0%',
    changeLabel: 'vs last 30 days',
    tone: 'muted',
  },
  {
    id: 'blocked',
    label: 'Blocked Accounts',
    value: '24',
    change: '+8.7%',
    changeLabel: 'vs last 30 days',
    tone: 'destructive',
  },
];

export const adminAccounts: AdminAccount[] = [
  {
    id: 'usr_2847',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    initials: 'SJ',
    accent: '#6366F1',
    role: 'customer',
    status: 'active',
    emailVerified: true,
    lastLogin: 'Sep 22, 2025 10:24 AM',
    createdAt: 'Jan 15, 2025 09:00 AM',
  },
  {
    id: 'usr_2846',
    name: 'Michael Chen',
    email: 'm.chen@novacommerce.com',
    initials: 'MC',
    accent: '#8B5CF6',
    role: 'admin',
    status: 'active',
    emailVerified: true,
    lastLogin: 'Sep 22, 2025 09:15 AM',
    createdAt: 'Dec 01, 2024 11:30 AM',
  },
  {
    id: 'usr_2845',
    name: 'Emily Davis',
    email: 'emily.davis@email.com',
    initials: 'ED',
    accent: '#EC4899',
    role: 'customer',
    status: 'inactive',
    emailVerified: false,
    lastLogin: 'Sep 10, 2025 04:42 PM',
    createdAt: 'Mar 22, 2025 02:15 PM',
  },
  {
    id: 'usr_2844',
    name: 'James Wilson',
    email: 'j.wilson@email.com',
    initials: 'JW',
    accent: '#0EA5E9',
    role: 'customer',
    status: 'blocked',
    emailVerified: true,
    lastLogin: 'Aug 30, 2025 06:30 PM',
    createdAt: 'Feb 08, 2025 10:00 AM',
  },
  {
    id: 'usr_2843',
    name: 'Lisa Anderson',
    email: 'lisa.a@email.com',
    initials: 'LA',
    accent: '#22C55E',
    role: 'customer',
    status: 'active',
    emailVerified: true,
    lastLogin: 'Sep 21, 2025 04:18 PM',
    createdAt: 'Apr 12, 2025 08:45 AM',
  },
  {
    id: 'usr_2842',
    name: 'David Martinez',
    email: 'd.martinez@novacommerce.com',
    initials: 'DM',
    accent: '#F59E0B',
    role: 'admin',
    status: 'active',
    emailVerified: true,
    lastLogin: 'Sep 22, 2025 08:05 AM',
    createdAt: 'Nov 18, 2024 03:20 PM',
  },
  {
    id: 'usr_2841',
    name: 'Amanda Brown',
    email: 'amanda.brown@email.com',
    initials: 'AB',
    accent: '#14B8A6',
    role: 'customer',
    status: 'active',
    emailVerified: false,
    lastLogin: 'Sep 20, 2025 01:12 PM',
    createdAt: 'May 03, 2025 09:30 AM',
  },
  {
    id: 'usr_2840',
    name: 'Robert Taylor',
    email: 'robert.t@email.com',
    initials: 'RT',
    accent: '#64748B',
    role: 'customer',
    status: 'inactive',
    emailVerified: true,
    lastLogin: 'Jul 14, 2025 11:50 AM',
    createdAt: 'Jan 28, 2025 04:00 PM',
  },
  {
    id: 'usr_2839',
    name: 'Jennifer Lee',
    email: 'jennifer.lee@email.com',
    initials: 'JL',
    accent: '#A855F7',
    role: 'customer',
    status: 'active',
    emailVerified: true,
    lastLogin: 'Sep 21, 2025 07:33 PM',
    createdAt: 'Jun 09, 2025 12:10 PM',
  },
  {
    id: 'usr_2838',
    name: 'Chris Nguyen',
    email: 'c.nguyen@email.com',
    initials: 'CN',
    accent: '#EF4444',
    role: 'customer',
    status: 'blocked',
    emailVerified: false,
    lastLogin: 'Sep 01, 2025 02:20 PM',
    createdAt: 'Mar 01, 2025 01:45 PM',
  },
];

export const ACCOUNT_PAGE_SIZE = 10;
export const ACCOUNT_TOTAL_COUNT = 1248;
export const ACCOUNT_TOTAL_PAGES = 125;

export const roleLabel: Record<AccountRole, string> = {
  customer: 'Customer',
  admin: 'Admin',
};

export const statusLabel: Record<AccountStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  blocked: 'Blocked',
};

export function filterAccounts(
  accounts: AdminAccount[],
  query: { q?: string; role?: AccountRole | 'all'; status?: AccountStatus | 'all' },
): AdminAccount[] {
  const q = query.q?.trim().toLowerCase();
  return accounts.filter((account) => {
    if (query.role && query.role !== 'all' && account.role !== query.role) return false;
    if (query.status && query.status !== 'all' && account.status !== query.status) return false;
    if (!q) return true;
    return (
      account.name.toLowerCase().includes(q) ||
      account.email.toLowerCase().includes(q) ||
      account.id.toLowerCase().includes(q)
    );
  });
}
