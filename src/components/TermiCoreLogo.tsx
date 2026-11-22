/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useId } from 'react';

export function TermiCoreLogo({ className = 'h-8 w-8' }: { className?: string }) {
  const uid = useId().replace(/:/g, '');
  const bgGradId = `tc-bg-${uid}`;
  const accentGradId = `tc-accent-${uid}`;

  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={bgGradId} x1="4" y1="2" x2="36" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#132234" />
          <stop offset="1" stopColor="#09111A" />
        </linearGradient>
        <linearGradient id={accentGradId} x1="8" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#5EEAD4" />
          <stop offset="1" stopColor="#0D9488" />
        </linearGradient>
      </defs>

      {/* Outer precision housing badge with subtle metallic teal hairline */}
      <rect x="1" y="1" width="38" height="38" rx="10" fill={`url(#${bgGradId})`} />
      <rect x="1" y="1" width="38" height="38" rx="10" stroke="#2DD4BF" strokeOpacity="0.38" strokeWidth="1.25" />

      {/* Left & Right incoming copper/teal conductor leads */}
      <path d="M5 20H11" stroke={`url(#${accentGradId})`} strokeWidth="2.8" strokeLinecap="round" />
      <path d="M29 20H35" stroke={`url(#${accentGradId})`} strokeWidth="2.8" strokeLinecap="round" />

      {/* Inner terminal clamp U-saddle cradling the T core */}
      <path
        d="M11 16.5V23.5C11 25.433 12.567 27 14.5 27H25.5C27.433 27 29 25.433 29 23.5V16.5"
        stroke={`url(#${accentGradId})`}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Precision Interlocking 'T' Busbar Core */}
      <path
        d="M10.5 10.5H29.5V15H22.25V24.5H17.75V15H10.5V10.5Z"
        fill="#FFFFFF"
      />

      {/* Center Torque Screw & DIN Rail Foot Notch */}
      <circle cx="20" cy="12.75" r="1.45" fill="#0F766E" />
      <path d="M14 31.5H26" stroke="#2DD4BF" strokeWidth="2.2" strokeLinecap="round" opacity="0.85" />
    </svg>
  );
}

