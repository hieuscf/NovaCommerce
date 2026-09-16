import {
  AlertSpecimens,
  BadgeSpecimens,
  ButtonSpecimens,
  CardSpecimens,
  DataDisplaySpecimens,
  StateSpecimens,
} from '@/features/design-system/component-sections';
import {
  ColorSpecimens,
  ScaleSpecimens,
  TypographySpecimens,
} from '@/features/design-system/foundation-sections';
import { FormControlSpecimens } from '@/features/design-system/form-control-specimens';
import { FormSystemSpecimen } from '@/features/design-system/form-system-specimen';
import { OverlaySpecimens } from '@/features/design-system/overlay-specimens';
import { ShowcaseSection, ShowcaseShell } from '@/features/design-system/showcase-shell';

/**
 * Visual reference for the NovaCommerce design system. Every specimen is built
 * from `@novacommerce/ui` primitives and semantic tokens only — if something
 * cannot be expressed here, it does not belong in a feature either.
 *
 * This page is a server component; only the interactive sections opt into the
 * client bundle.
 */
export default function DesignSystemPage() {
  return (
    <ShowcaseShell>
      <div className="py-12">
        <p className="text-overline text-primary">NovaCommerce</p>
        <h1 className="mt-3 text-h1">
          Design <span className="text-gradient-hero">System</span>
        </h1>
        <p className="mt-4 max-w-2xl text-body text-muted-foreground">
          Tokens, primitives and states shared by the storefront and the admin console. See{' '}
          <code className="text-body-sm">docs/design-system.md</code> for the rules
          behind these decisions.
        </p>
      </div>

      <ShowcaseSection
        id="colors"
        index={1}
        title="Colors"
        description="Semantic tokens only. Never reach for a raw Tailwind palette colour when a token exists."
      >
        <ColorSpecimens />
      </ShowcaseSection>

      <ShowcaseSection
        id="typography"
        index={2}
        title="Typography"
        description="Inter across both apps. Heading scales are fluid; body scales are fixed for predictable reading."
      >
        <TypographySpecimens />
      </ShowcaseSection>

      <ShowcaseSection
        id="scales"
        index={3}
        title="Spacing, radius and elevation"
        description="One spacing rhythm, one radius hierarchy and four elevation levels."
      >
        <ScaleSpecimens />
      </ShowcaseSection>

      <ShowcaseSection
        id="buttons"
        index={4}
        title="Buttons"
        description="The gradient is reserved for the single highest-value action on a view."
      >
        <ButtonSpecimens />
      </ShowcaseSection>

      <ShowcaseSection
        id="form-controls"
        index={5}
        title="Form controls"
        description="Error styling is driven by aria-invalid, so the visual and announced states cannot diverge."
      >
        <FormControlSpecimens />
      </ShowcaseSection>

      <ShowcaseSection
        id="form-system"
        index={6}
        title="Form system"
        description="react-hook-form plus Zod, with labels, descriptions, field errors and server errors wired up automatically."
      >
        <FormSystemSpecimen />
      </ShowcaseSection>

      <ShowcaseSection id="cards" index={7} title="Cards">
        <CardSpecimens />
      </ShowcaseSection>

      <ShowcaseSection
        id="badges"
        index={8}
        title="Badges"
        description="Compact by design. Tinted variants use the -strong tone tokens to hold contrast."
      >
        <BadgeSpecimens />
      </ShowcaseSection>

      <ShowcaseSection
        id="feedback"
        index={9}
        title="Feedback"
        description="Alerts persist in the page; toasts are transient. They are deliberately different surfaces."
      >
        <AlertSpecimens />
      </ShowcaseSection>

      <ShowcaseSection
        id="overlays"
        index={10}
        title="Overlays and navigation"
        description="Dialog, dropdown, sheet, tooltip and tabs are Radix. Toasts use React-Toastify."
      >
        <OverlaySpecimens />
      </ShowcaseSection>

      <ShowcaseSection
        id="data-display"
        index={11}
        title="Data display"
        description="Tables ship two densities: comfortable for the storefront, dense for admin grids."
      >
        <DataDisplaySpecimens />
      </ShowcaseSection>

      <ShowcaseSection
        id="states"
        index={12}
        title="Loading, empty and error states"
        description="Skeletons mirror the shape of their content. Empty states are not errors."
      >
        <StateSpecimens />
      </ShowcaseSection>
    </ShowcaseShell>
  );
}
