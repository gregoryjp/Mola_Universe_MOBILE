import { cardToneBackground, colors } from '@core/theme/colors';
import { describe, expect, it } from 'vitest';

/**
 * Guards the TD-044 contract: the dark palette is a real palette, not the light
 * one reused.
 *
 * The root cause of TD-044 was that `dark` spread the light object and overrode
 * only seven tokens, so every `*Soft` fill silently stayed a near-white light
 * pastel. `text` is near-white in dark mode, so text on those fills landed at
 * 1.00–1.09:1 — invisible. TypeScript now catches a *missing* token (the dark
 * palette is annotated `ColorTokens`), but it cannot catch a token that exists
 * yet points at the wrong value. These tests can.
 */

// WCAG 2.1 relative luminance and contrast ratio.
const channel = (value: number) => {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

const luminance = (hex: string) => {
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

const contrast = (a: string, b: string) => {
  const [la, lb] = [luminance(a), luminance(b)];
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
};

const HEX = /^#[0-9A-F]{6}$/;
const AA_NORMAL = 4.5;

const palettes = [['light', colors.light] as const, ['dark', colors.dark] as const];

const tones = Object.keys(cardToneBackground) as (keyof typeof cardToneBackground)[];

describe('colour token palettes', () => {
  it('gives both palettes exactly the same token set', () => {
    expect(Object.keys(colors.light).sort()).toEqual(Object.keys(colors.dark).sort());
  });

  it('defines every token as a 6-digit uppercase hex in both palettes', () => {
    for (const [name, tokens] of palettes) {
      for (const [token, value] of Object.entries(tokens)) {
        expect(HEX.test(value), `${name}.${token} = ${JSON.stringify(value)}`).toBe(true);
      }
    }
  });

  it('declares at least the 16 tokens the dark palette used to be missing', () => {
    // The seven colors.md specifies were never the problem; these derived ones were.
    const derived = [
      'primaryDark',
      'primarySoft',
      'secondary',
      'secondarySoft',
      'accent',
      'accentSoft',
      'textInverse',
      'borderStrong',
      'error',
      'errorSoft',
      'success',
      'successSoft',
      'warning',
      'warningSoft',
      'info',
      'infoSoft',
    ];
    for (const token of derived) {
      expect(colors.dark).toHaveProperty(token);
    }
  });
});

describe.each(palettes)('Card tones in %s', (_name, tokens) => {
  it('covers every supported tone', () => {
    expect(tones).toHaveLength(7);
  });

  it.each(tones)('tone "%s" points at a token that exists with a real hex value', (tone) => {
    const token = cardToneBackground[tone];
    const value = tokens[token];
    expect(value, `tokens.${token} is missing for tone "${tone}"`).toBeDefined();
    expect(HEX.test(value), `tokens.${token} = ${JSON.stringify(value)}`).toBe(true);
  });

  it.each(tones)('tone "%s" keeps `text` readable on its own fill', (tone) => {
    const fill = tokens[cardToneBackground[tone]];
    const ratio = contrast(tokens.text, fill);
    expect(
      ratio,
      `text on ${cardToneBackground[tone]} = ${ratio.toFixed(2)}:1`,
    ).toBeGreaterThanOrEqual(AA_NORMAL);
  });

  it.each(tones)('tone "%s" fill is not the same colour as `surface`', (tone) => {
    const fill = tokens[cardToneBackground[tone]];
    // Deliberately weak. In light mode four of the seven fills are actually less
    // distinct from `surface` than `surfaceAlt` is (primarySoft 1.12, secondarySoft
    // 1.13, successSoft 1.12, warningSoft 1.09, against a 1.14 reference) — a
    // weakness of the colours.md pastels, not of this contract. Those values are
    // a designer decision, so the strict form of this assertion is enforced below
    // only for the palette TD-044 derived (dark).
    expect(contrast(fill, tokens.surface)).toBeGreaterThan(1);
  });
});

describe('dark tone fills are a real surface change (TD-044 derivation contract)', () => {
  const dark = colors.dark;
  const reference = contrast(dark.surfaceAlt, dark.surface);

  it.each(tones)('tone "%s" fill is at least as distinct as `surfaceAlt`', (tone) => {
    const ratio = contrast(dark[cardToneBackground[tone]], dark.surface);
    expect(
      ratio,
      `${cardToneBackground[tone]} vs surface = ${ratio.toFixed(2)}:1`,
    ).toBeGreaterThanOrEqual(reference);
  });
});

describe('TD-044 regression: dark forbids reusing the light fills', () => {
  it.each(tones)('tone "%s" resolves to a different fill in dark than in light', (tone) => {
    const token = cardToneBackground[tone];
    expect(colors.dark[token], `dark.${token} was left as the light value`).not.toBe(
      colors.light[token],
    );
  });
});

describe('Badge and Chip label contrast', () => {
  const badgeFills = ['successSoft', 'warningSoft', 'errorSoft', 'infoSoft'] as const;

  it.each(palettes)('Badge chromatic labels clear AA on their fills in %s', (_name, tokens) => {
    for (const token of badgeFills) {
      const ratio = contrast(tokens.text, tokens[token]);
      expect(ratio, `text on ${token} = ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_NORMAL);
    }
  });

  it.each(palettes)('Badge default label clears AA on `surfaceAlt` in %s', (_name, tokens) => {
    const ratio = contrast(tokens.textMuted, tokens.surfaceAlt);
    expect(ratio, `textMuted on surfaceAlt = ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(
      AA_NORMAL,
    );
  });

  it.each(palettes)('Chip labels clear AA in %s', (_name, tokens) => {
    // Unselected: `textMuted` on `surface`. Selected: `text` on `primarySoft`.
    expect(contrast(tokens.textMuted, tokens.surface)).toBeGreaterThanOrEqual(AA_NORMAL);
    expect(contrast(tokens.text, tokens.primarySoft)).toBeGreaterThanOrEqual(AA_NORMAL);
  });
});
