'use client';

import dynamic from 'next/dynamic';
import { Suspense, useEffect, useState } from 'react';
import { Skeleton } from '@novacommerce/ui/components/skeleton';

const HeroProductCanvas = dynamic(
  () =>
    import('@/components/three/hero-product-canvas').then((mod) => mod.HeroProductCanvas),
  {
    ssr: false,
    loading: () => <HeroSceneFallback />,
  },
);

function HeroSceneFallback() {
  return (
    <div className="relative flex aspect-square w-full items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-gradient-ambient opacity-60" />
      <Skeleton className="size-48 rounded-full lg:size-64" />
    </div>
  );
}

function StaticHeroFallback() {
  return (
    <div className="relative flex aspect-square w-full items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-gradient-ambient" />
      <div className="relative flex size-56 flex-col items-center justify-center rounded-full border border-border/50 bg-surface/80 shadow-premium lg:size-72">
        <div className="grid grid-cols-2 gap-3 p-6">
          {['📱', '🎧', '⌚', '💻'].map((emoji) => (
            <div
              key={emoji}
              className="flex size-16 items-center justify-center rounded-2xl bg-surface-subtle text-2xl shadow-sm lg:size-20 lg:text-3xl"
            >
              {emoji}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HeroProductScene() {
  const [mode, setMode] = useState<'loading' | '3d' | 'static'>('loading');

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 639px)').matches;

    if (prefersReducedMotion || isMobile) {
      setMode('static');
      return;
    }

    setMode('3d');
  }, []);

  if (mode === 'loading') {
    return <HeroSceneFallback />;
  }

  if (mode === 'static') {
    return <StaticHeroFallback />;
  }

  return (
    <Suspense fallback={<HeroSceneFallback />}>
      <HeroProductCanvas />
    </Suspense>
  );
}
