/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { resolveAssetUrl } from '../data/termicoreData';

export const TERMIFLUX_LOGO_PATH =
  'assets/aistudio/Termiflux_Connecting_Tomorrow_Logo_c9e65e6c.png';

export function TermifluxLogo({
  className = 'h-10 w-auto',
  blendOnLight = false,
}: {
  className?: string;
  blendOnLight?: boolean;
}) {
  return (
    <img
      src={resolveAssetUrl(TERMIFLUX_LOGO_PATH)}
      alt="Termiflux — Connecting Tomorrow"
      className={`${className} object-contain select-none ${
        blendOnLight ? 'mix-blend-multiply' : ''
      }`}
    />
  );
}

export const TermiCoreLogo = TermifluxLogo;
