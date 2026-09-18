import { AdminShell } from '@/components/layout/admin-shell';
import { RequireAdminAuth } from '@/features/auth/require-admin-auth';

export default function ConsoleLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RequireAdminAuth>
      <AdminShell>{children}</AdminShell>
    </RequireAdminAuth>
  );
}
