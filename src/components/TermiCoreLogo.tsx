/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useId } from 'react';

export function TermiCoreLogo({ className = 'h-8 w-8' }: { className?: string }) {
  const uid = useId().replace(/:/g, '');
  const plateGradId = `tc-plate-${uid}`;
  const rimGradId = `tc-rim-${uid}`;
  const coreGradId = `tc-core-${uid}`;

  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={plateGradId} x1="4" y1="2" x2="36" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#162436" />
          <stop offset="0.55" stopColor="#0D1724" />
          <stop offset="1" stopColor="#070D16" />
        </linearGradient>
        <linearGradient id={rimGradId} x1="4" y1="2" x2="36" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#94A3B8" stopOpacity="0.45" />
          <stop offset="0.5" stopColor="#2DD4BF" stopOpacity="0.28" />
          <stop offset="1" stopColor="#334155" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id={coreGradId} x1="20" y1="17.5" x2="20" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#5EEAD4" />
          <stop offset="0.45" stopColor="#14B8A6" />
          <stop offset="1" stopColor="#0F766E" />
        </linearGradient>
      </defs>

      {/* Chamfered Octagonal Machined Housing */}
      <path
        d="M9 2H31L38 9V31L31 38H9L2 31V9L9 2Z"
        fill={`url(#${plateGradId})`}
      />
      <path
        d="M9.35 2.75H30.65L37.25 9.35V30.65L30.65 37.25H9.35L2.75 30.65V9.35L9.35 2.75Z"
        stroke={`url(#${rimGradId})`}
        strokeWidth="1.2"
      />

      {/* Top Dovetail Busbar Bridge */}
      <path
        d="M9.5 10.5H30.5L28 15.75H12L9.5 10.5Z"
        fill="#FFFFFF"
      />

      {/* Twin Side Clamping Jaws */}
      <path
        d="M9.5 17.5H14V25.75L9.5 29.25V17.5Z"
        fill="#E2E8F0"
      />
      <path
        d="M30.5 17.5H26V25.75L30.5 29.25V17.5Z"
        fill="#E2E8F0"
      />

      {/* Center Interlocking Bayonet Contact Pin */}
      <path
        d="M16.5 17.5H23.5V30.25L20 33.5L16.5 30.25V17.5Z"
        fill={`url(#${coreGradId})`}
      />
    </svg>
  );
}
