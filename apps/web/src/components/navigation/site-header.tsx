'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ChevronDown, Globe, Heart, Menu, Search, ShoppingCart, User } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { Input } from '@novacommerce/ui/components/input';
import { Container } from '@novacommerce/ui/components/container';
import { NovaCommerceLogo } from '@novacommerce/ui/components/nova-commerce-logo';
import { Skeleton } from '@novacommerce/ui/components/skeleton';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@novacommerce/ui/components/sheet';
import { useSession } from '@/features/auth/use-session';
import { cn } from '@/lib/utils';
import { AccountMenu } from './account-menu';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop', caret: true },
  { href: '/shop?category=electronics', label: 'Categories', caret: true },
  { href: '/shop?sale=true', label: 'Deals' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

const iconButtonClass =
  'text-white hover:bg-white/10 hover:text-white';

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { status, isAuthenticated, isSigningOut, signOut } = useSession();
  const sessionResolving = status === 'unknown' || status === 'loading';

  async function handleMobileSignOut() {
    if (isSigningOut) {
      return;
    }
    setMobileOpen(false);
    await signOut();
    router.push('/');
  }

  return (
    <header
      className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-[6px]"
      style={{ backgroundImage: 'linear-gradient(#7f95c4 0%, #8fa3ca 100%)' }}
    >
      <Container size="wide">
        <div className="flex h-16 items-center gap-4 lg:gap-6">
          <Link href="/" className="flex shrink-0 items-center" aria-label="NovaCommerce">
            <NovaCommerceLogo
              size={26}
              tone="inverse"
              wordmarkClassName="sr-only text-white sm:not-sr-only"
            />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
            {navLinks.map((link) => {
              const current = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group relative flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
                  aria-current={current ? 'page' : undefined}
                >
                  {link.label}
                  {link.caret ? <ChevronDown className="size-3.5 opacity-80" /> : null}
                  <span
                    className={cn(
                      'absolute right-3 bottom-0.5 left-3 h-0.5 rounded-full bg-white transition-opacity',
                      current ? 'opacity-100' : 'opacity-0 group-hover:opacity-60',
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto hidden min-w-0 flex-1 justify-end md:flex lg:max-w-[520px]">
            <Input
              type="search"
              placeholder="Search for products, brands and more..."
              startAdornment={<Search aria-hidden="true" />}
              className="h-10 text-[13px]"
              groupClassName="h-10 rounded-pill border-white/60 bg-white/95"
              aria-label="Search products"
            />
          </div>

          <div className="flex items-center gap-1 text-white md:ml-0">
            <Button
              variant="ghost"
              size="sm"
              className={cn('hidden gap-1.5 px-2 sm:inline-flex', iconButtonClass)}
              aria-label="Language"
            >
              <Globe className="size-[18px]" />
              <span className="text-[13px] font-medium">EN</span>
              <ChevronDown className="size-3.5 opacity-80" />
            </Button>
            {sessionResolving ? (
              <Skeleton className="hidden size-9 rounded-lg md:block" aria-hidden="true" />
            ) : isAuthenticated ? (
              <div className="hidden md:block">
                <AccountMenu />
              </div>
            ) : (
              <Button
                asChild
                variant="ghost"
                size="icon-sm"
                className={cn('hidden md:inline-flex', iconButtonClass)}
                aria-label="Sign in"
              >
                <Link href="/login">
                  <User className="size-4" />
                </Link>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              className={cn('hidden md:inline-flex', iconButtonClass)}
              aria-label="Wishlist"
            >
              <Heart className="size-[19px]" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className={cn('relative', iconButtonClass)}
              aria-label="Cart"
            >
              <ShoppingCart className="size-[19px]" />
              <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                2
              </span>
            </Button>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className={cn('lg:hidden', iconButtonClass)}
                  aria-label="Open menu"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-xs">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="px-6 pb-6">
                  <div className="mb-6">
                    <Input
                      type="search"
                      placeholder="Search products..."
                      startAdornment={<Search aria-hidden="true" />}
                      aria-label="Search products"
                    />
                  </div>
                  <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'rounded-xl px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted',
                        )}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                  <div className="mt-6 border-t border-border pt-4">
                    {sessionResolving ? (
                      <p className="px-4 text-sm text-muted-foreground">Checking session…</p>
                    ) : isAuthenticated ? (
                      <div className="flex flex-col gap-1">
                        <Link
                          href="/account"
                          onClick={() => setMobileOpen(false)}
                          className="rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-muted"
                        >
                          Account
                        </Link>
                        <Button
                          type="button"
                          variant="ghost"
                          className="justify-start px-4"
                          loading={isSigningOut}
                          loadingLabel="Signing out"
                          onClick={() => {
                            void handleMobileSignOut();
                          }}
                        >
                          Sign out
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <Link
                          href="/login"
                          onClick={() => setMobileOpen(false)}
                          className="rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-muted"
                        >
                          Sign in
                        </Link>
                        <Link
                          href="/register"
                          onClick={() => setMobileOpen(false)}
                          className="rounded-xl px-4 py-3 text-sm font-medium text-primary hover:bg-muted"
                        >
                          Create account
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </Container>
    </header>
  );
}
