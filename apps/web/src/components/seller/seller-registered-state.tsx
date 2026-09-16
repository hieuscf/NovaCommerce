import { Container } from '@novacommerce/ui/components/container';

/**
 * Registered-seller workspace. Intentionally minimal until the Seller
 * Gateway exists — `/seller` currently always loads the unregistered
 * onboarding UI from `getSellerPageStatus()`.
 */
export function SellerRegisteredState() {
  return (
    <div className="bg-page-canvas min-h-svh">
      <Container size="wide" className="py-16">
        <p className="text-[13px] font-semibold tracking-wide text-primary">Seller Center</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink">Your seller workspace</h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-copy">
          This view appears after a seller profile exists. The dashboard lands in a follow-up once
          the Seller module is available.
        </p>
      </Container>
    </div>
  );
}
