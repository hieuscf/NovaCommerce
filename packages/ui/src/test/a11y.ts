import axe, { type RunOptions } from 'axe-core';
import { expect } from 'vitest';

/**
 * Runs axe-core against a rendered container and fails with a readable report.
 *
 * Colour-contrast rules are disabled because jsdom does not apply the
 * stylesheet, so every element would resolve to transparent-on-transparent.
 * Contrast is governed by the token system instead (see the `*-strong` tone
 * tokens in `styles/globals.css`).
 */
export async function expectNoA11yViolations(
  container: HTMLElement,
  options: RunOptions = {},
): Promise<void> {
  const results = await axe.run(container, {
    rules: { 'color-contrast': { enabled: false } },
    ...options,
  });

  const report = results.violations
    .map(
      (violation) =>
        `${violation.id} (${violation.impact}): ${violation.help}\n` +
        violation.nodes.map((node) => `  → ${node.html}`).join('\n'),
    )
    .join('\n\n');

  expect(report, report).toBe('');
}
