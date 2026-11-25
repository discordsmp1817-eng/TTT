/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { TermifluxLogo } from './TermiCoreLogo';
import { computeLogoFlightTransform } from '../utils/scrollReveal';

export function InitialLoader({ onComplete }: { onComplete: () => void }) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const logoWrapRef = useRef<HTMLDivElement>(null);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const win = window as Window & { __TERMICORE_LOADER_ACTIVE__?: boolean };
    win.__TERMICORE_LOADER_ACTIVE__ = true;

    const backdrop = backdropRef.current;
    const logoWrap = logoWrapRef.current;
    if (!backdrop || !logoWrap) {
      win.__TERMICORE_LOADER_ACTIVE__ = false;
      onCompleteRef.current();
      return;
    }

    const easeInOut = gsap.parseEase('power3.inOut');
    const flightProxy = { progress: 0 };
    let flightTween: gsap.core.Tween | null = null;
    let backdropTween: gsap.core.Tween | null = null;

    const tl = gsap.timeline();

    // Step 1: Paint centered logo immediately (FCP-ready) with subtle precision settle
    tl.fromTo(
      logoWrap,
      { scale: 0.88, opacity: 1 },
      { scale: 1, opacity: 1, duration: 0.36, ease: 'power3.out' }
    );

    // Step 2: Hold cleanly at center so only the logo is visible
    tl.to({}, { duration: 0.34 });

    // Step 3: Pin logoWrap in viewport space and fly dynamically to [data-navbar-logo]
    tl.add(() => {
      const startRect = logoWrap.getBoundingClientRect();
      gsap.set(logoWrap, {
        position: 'fixed',
        left: startRect.left,
        top: startRect.top,
        width: startRect.width,
        height: startRect.height,
        margin: 0,
        x: 0,
        y: 0,
        scale: 1,
        transformOrigin: 'center center',
      });

      let heroReleased = false;
      const releaseHeroReveal = () => {
        if (heroReleased) return;
        heroReleased = true;
        win.__TERMICORE_LOADER_ACTIVE__ = false;
        window.dispatchEvent(new CustomEvent('termicore:loader-done'));
      };

      const updateFlightFrame = () => {
        const targetEl = document.querySelector<HTMLElement>('[data-navbar-logo]');
        const targetRect = targetEl
          ? targetEl.getBoundingClientRect()
          : {
              left: 24,
              top: 10,
              width: 144,
              height: 48,
            };
        const flight = computeLogoFlightTransform(startRect, targetRect);
        const eased = easeInOut(flightProxy.progress);
        gsap.set(logoWrap, {
          x: flight.x * eased,
          y: flight.y * eased,
          scale: 1 + (flight.scale - 1) * eased,
        });
      };

      flightTween = gsap.to(flightProxy, {
        progress: 1,
        duration: 0.72,
        ease: 'none',
        onUpdate: updateFlightFrame,
        onComplete: () => {
          if (completedRef.current) return;
          completedRef.current = true;
          updateFlightFrame();
          releaseHeroReveal();
          onCompleteRef.current();
        },
      });

      backdropTween = gsap.to(backdrop, {
        opacity: 0,
        duration: 0.56,
        delay: 0.12,
        ease: 'power2.out',
        onStart: () => {
          releaseHeroReveal();
        },
      });
    });

    return () => {
      tl.kill();
      flightTween?.kill();
      backdropTween?.kill();
      gsap.killTweensOf(flightProxy);
      gsap.killTweensOf(logoWrap);
      gsap.killTweensOf(backdrop);
      win.__TERMICORE_LOADER_ACTIVE__ = false;
    };
  }, []);

  return (
    <div
      data-testid="initial-loader"
      className="fixed inset-0 z-50 pointer-events-auto flex items-center justify-center select-none overflow-hidden"
    >
      {/* Solid dark canvas covering all website content until the logo departs */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-[#0B131D]"
        aria-hidden="true"
      />

      {/* Centered Termiflux logo rendered immediately for FCP before flying to [data-navbar-logo] */}
      <div
        ref={logoWrapRef}
        role="img"
        aria-label="Termiflux"
        data-testid="loader-flying-logo"
        className="relative z-10 flex items-center justify-center rounded-2xl bg-white px-6 py-4 shadow-[0_24px_60px_rgba(0,0,0,0.45)] will-change-transform"
      >
        <TermifluxLogo className="h-20 sm:h-24 w-auto" />
      </div>
    </div>
  );
}
