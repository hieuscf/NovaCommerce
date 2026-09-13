import { Facebook, Instagram, Linkedin, Mail, Twitter, Youtube } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { Container } from '@novacommerce/ui/components/container';
import { NovaCommerceLogo } from '@novacommerce/ui/components/nova-commerce-logo';

const social = [
  { Icon: Facebook, label: 'Facebook' },
  { Icon: Twitter, label: 'X' },
  { Icon: Instagram, label: 'Instagram' },
  { Icon: Youtube, label: 'YouTube' },
  { Icon: Linkedin, label: 'LinkedIn' },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white/70">
      <Container
        size="wide"
        className="flex flex-col items-center gap-6 px-8 py-6 lg:flex-row lg:justify-between"
      >
        <NovaCommerceLogo
          size={26}
          subLabel="More than just shopping. It's a better experience."
        />

        <div className="text-center">
          <p className="text-[13px] font-bold text-ink">Subscribe to our newsletter</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Get the latest updates, offers and more.
          </p>
        </div>

        <form className="flex h-9 items-center gap-2 rounded-pill border border-slate-200 bg-white pl-3 pr-1 shadow-sm" action="#" method="post">
          <Mail className="size-3.5 text-slate-400" aria-hidden />
          <input
            type="email"
            placeholder="Enter your email address"
            aria-label="Email for newsletter"
            className="w-[190px] bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
          />
          <Button type="submit" variant="primary-gradient" className="h-7 rounded-pill px-3.5 text-[11.5px]">
            Subscribe
          </Button>
        </form>

        <nav className="flex items-center gap-2" aria-label="Social links">
          {social.map(({ Icon, label }) => (
            <a
              key={label}
              href="#"
              aria-label={label}
              className="grid size-8 place-items-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
            >
              <Icon className="size-3.5" />
            </a>
          ))}
        </nav>
      </Container>
    </footer>
  );
}
