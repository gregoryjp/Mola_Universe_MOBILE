import { readFileSync } from 'node:fs';
import { act, create, type ReactTestInstance, type ReactTestRenderer } from 'react-test-renderer';
import { describe, expect, it, vi } from 'vitest';

const scheme = vi.hoisted(() => ({ value: 'light' as 'light' | 'dark' }));

vi.mock('react-native', async () => {
  const stub = (await import('../../helpers/reactNativeStub')).reactNativeStub;
  return { ...stub, useColorScheme: () => scheme.value };
});

vi.mock('@shared/assets/brand', () => ({
  brandAssets: {
    logoIcon: 'asset:logo-icon',
    logoPrimary: 'asset:logo-primary',
    mascotMeow: 'asset:mascot',
  },
}));

import { BrandLogo } from '@presentation/components/brand/BrandLogo';

/**
 * The brand decision under guard: the wordmark on the light scheme, the symbol
 * on the dark one. `BrandLogo` branches on `useColorScheme`, not on the colour
 * palette, so this is also the proof that a theme/token change (TD-044) cannot
 * reach it.
 */

const flatten = (style: unknown): Record<string, number | string> => {
  if (Array.isArray(style)) {
    return Object.assign({}, ...style.map((entry) => flatten(entry)));
  }
  if (style !== null && typeof style === 'object') {
    return style as Record<string, number | string>;
  }
  return {};
};

const render = (): ReactTestRenderer => {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(<BrandLogo />);
  });
  if (!renderer) throw new Error('renderer not created');
  return renderer;
};

const isHostImage = (node: ReactTestInstance): boolean =>
  (node.type as unknown as string) === 'Image';

const image = (renderer: ReactTestRenderer) =>
  renderer.root.findAll((node) => isHostImage(node))[0];

const sourceOf = (renderer: ReactTestRenderer) => image(renderer)?.props.source;

const boxOf = (renderer: ReactTestRenderer) => {
  const style = flatten(image(renderer)?.props.style);
  return { width: Number(style.width), height: Number(style.height) };
};

describe('BrandLogo', () => {
  it('shows the wordmark on the light scheme', () => {
    scheme.value = 'light';
    const renderer = render();

    expect(sourceOf(renderer)).toBe('asset:logo-primary');

    const box = boxOf(renderer);
    expect(box.width / box.height).toBeGreaterThan(3);
    expect(image(renderer)?.props.accessibilityLabel).toBe('MOLA');

    renderer.unmount();
  });

  it('shows the square symbol on the dark scheme, never the wordmark', () => {
    scheme.value = 'dark';
    const renderer = render();

    expect(sourceOf(renderer)).toBe('asset:logo-icon');
    expect(sourceOf(renderer)).not.toBe('asset:logo-primary');

    const box = boxOf(renderer);
    expect(box.width).toBe(box.height);

    renderer.unmount();
  });

  it('brings the wordmark back when the scheme turns light again', () => {
    scheme.value = 'dark';
    const renderer = render();
    expect(sourceOf(renderer)).toBe('asset:logo-icon');

    // The stub's `useColorScheme` is a plain function with no subscription, so
    // the re-render the real hook would trigger has to be forced by a prop
    // change here.
    scheme.value = 'light';
    act(() => {
      renderer.update(<BrandLogo width={170} />);
    });

    expect(sourceOf(renderer)).toBe('asset:logo-primary');

    renderer.unmount();
  });
});

/**
 * The component test mocks the asset module, so it cannot notice a swapped or
 * overwritten PNG on disk. These assertions read the real files' IHDR headers:
 * the light asset must stay a wide wordmark and the dark one a square symbol.
 */
describe('brand assets on disk', () => {
  const pngSize = (url: URL): { width: number; height: number } => {
    const buffer = readFileSync(url);
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  };

  const asset = (name: string) =>
    pngSize(new URL(`../../../src/shared/assets/brand/${name}`, import.meta.url));

  it('keeps logo-primary a wide wordmark', () => {
    const { width, height } = asset('logo-primary.png');

    expect(width).toBe(170);
    expect(height).toBe(39);
  });

  it('keeps logo-icon square', () => {
    const { width, height } = asset('logo-icon-512.png');

    expect(width).toBe(height);
  });
});
