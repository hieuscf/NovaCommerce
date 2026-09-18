import { NovaCommerceLogo } from '@novacommerce/ui/components/nova-commerce-logo';

export function AdminLoginShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <aside className="relative hidden overflow-hidden bg-slate-950 text-white lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-80"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 20% 20%, rgba(99,102,241,0.35), transparent 55%), radial-gradient(ellipse 70% 50% at 80% 80%, rgba(168,85,247,0.25), transparent 50%)',
          }}
        />
        <div className="relative">
          <NovaCommerceLogo tone="inverse" size={36} subLabel="Admin Console" />
        </div>
        <div className="relative max-w-md space-y-4">
          <p className="text-xs font-semibold tracking-[0.18em] text-indigo-300 uppercase">
            Operations
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white xl:text-4xl">
            Sign in to manage your marketplace.
          </h1>
          <p className="text-sm leading-relaxed text-slate-300">
            Secure access for operators. Roles and permissions are enforced by the Identity Gateway.
          </p>
        </div>
        <p className="relative text-caption text-slate-500">NovaCommerce Admin · v1.0.0</p>
      </aside>

      <div className="relative flex flex-col bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_48%,#f8fafc_100%)]">
        <div className="flex items-center justify-between px-6 py-5 lg:hidden">
          <NovaCommerceLogo size={32} subLabel="Admin" />
        </div>
        <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-md rounded-3xl border border-border/80 bg-card p-7 shadow-xl shadow-indigo-500/5 sm:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
