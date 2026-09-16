'use client';

import { useState } from 'react';
import { Container } from '@novacommerce/ui/components/container';
import type { SellerPageViewModel, SellerRegisterStepId } from '@/lib/view-models/seller';
import { SellerRegisterAside } from './seller-register-aside';
import { SellerRegisterForm } from './seller-register-form';

export function SellerRegisterPage({
  page,
  initialStep = 'business',
}: {
  page: SellerPageViewModel;
  initialStep?: SellerRegisterStepId;
}) {
  const [step, setStep] = useState<SellerRegisterStepId>(initialStep);

  return (
    <div className="bg-page-canvas min-h-svh">
      <Container size="wide" className="py-8 lg:py-12">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.35fr)] lg:gap-10 xl:gap-14">
          <SellerRegisterAside variant={step === 'complete' ? 'complete' : 'onboarding'} />
          <div className="max-lg:order-first">
            <SellerRegisterForm page={page} initialStep={initialStep} onStepChange={setStep} />
          </div>
        </div>
      </Container>
    </div>
  );
}
