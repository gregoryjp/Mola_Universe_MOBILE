import logoIcon512 from './logo-icon-512.png';
import logoPrimary from './logo-primary.png';
import mascotMeow from './mascot-meow.png';

/**
 * Brand assets for the app bundle.
 *
 * The sources live in `design/brand/` (see `design/README.md`). These PNGs are
 * derived from them, not hand-copied:
 *
 * - `logo-primary.png` and `mascot-meow.png` are the PNGs that those two `.svg`
 *   files carry inside an `<image href="data:image/png;base64,...">` wrapper, so
 *   the `.svg` files are not vectors and Metro could not render them as such.
 * - `logo-icon-512.png` is `logo-icon.svg` (the one real vector, 128x128)
 *   rasterised via a browser canvas at 512 px.
 *
 * The other sizes are for native config (`app.json`), not for code:
 * `logo-icon-1024.png` for the app icon / Android adaptive foreground and
 * `logo-icon-192.png` for the web favicon.
 */
export const brandAssets = {
  logoIcon: logoIcon512,
  logoPrimary,
  mascotMeow,
} as const;
