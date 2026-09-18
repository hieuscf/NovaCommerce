'use client';

import { Bell, Globe, LogOut, Menu, Moon, Search, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from '@novacommerce/ui/components/avatar';
import { Button } from '@novacommerce/ui/components/button';
import { Input } from '@novacommerce/ui/components/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@novacommerce/ui/components/sheet';
import { useEffect, useState, Suspense } from 'react';
import { signOut } from '@/lib/auth/session';
import { AdminSidebarPanel } from './admin-sidebar';

export function AdminTopbar() {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';

  function handleSignOut() {
    signOut();
    router.replace('/login');
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-surface/95 px-4 backdrop-blur-md lg:px-6">
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon-sm" className="lg:hidden" aria-label="Open menu">
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 border-0 bg-slate-950 p-0 text-white sm:max-w-72">
          <SheetHeader className="sr-only">
            <SheetTitle>Admin navigation</SheetTitle>
          </SheetHeader>
          <Suspense fallback={null}>
            <AdminSidebarPanel onNavigate={() => setMenuOpen(false)} />
          </Suspense>
        </SheetContent>
      </Sheet>

      <div className="min-w-0 flex-1">
        <Input
          type="search"
          placeholder="Search anything..."
          aria-label="Search admin console"
          startAdornment={<Search className="size-4 text-muted-foreground" aria-hidden="true" />}
          className="h-10"
          groupClassName="max-w-xl rounded-full border-border/80 bg-muted/40 shadow-none"
        />
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <Button variant="ghost" size="icon-sm" className="relative" aria-label="Notifications, 5 unread">
          <Bell className="size-4" strokeWidth={1.75} />
          <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-info text-[10px] font-bold text-white">
            5
          </span>
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
        >
          {isDark ? (
            <Sun className="size-4" strokeWidth={1.75} />
          ) : (
            <Moon className="size-4" strokeWidth={1.75} />
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="hidden gap-1.5 px-2 text-muted-foreground sm:inline-flex"
          aria-label="Language: English"
        >
          <Globe className="size-4" strokeWidth={1.75} />
          <span className="text-xs font-semibold tracking-wide">EN</span>
        </Button>

        <div className="ml-1 flex items-center gap-2.5 border-l border-border pl-3">
          <Avatar className="size-9 ring-2 ring-primary/15">
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-semibold text-white">
              AU
            </AvatarFallback>
          </Avatar>
          <div className="hidden leading-tight md:block">
            <p className="text-sm font-semibold text-foreground">Admin User</p>
            <p className="text-caption text-muted-foreground">Administrator</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Sign out"
            onClick={handleSignOut}
          >
            <LogOut className="size-4" strokeWidth={1.75} />
          </Button>
        </div>
      </div>
    </header>
  );
}
