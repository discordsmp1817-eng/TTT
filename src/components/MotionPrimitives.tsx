import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  getDirectionOffset,
  getGridItemDirection,
  GridDirectionPattern,
  ScrollRevealDirection,
} from '../utils/scrollReveal';

gsap.registerPlugin(ScrollTrigger);

export type { GridDirectionPattern, ScrollRevealDirection };

export const INDUSTRIAL_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function usePrefersReducedMotion(): boolean {
  return false;
}

export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(hover: none), (pointer: coarse)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(hover: none), (pointer: coarse)');
    const onChange = () => setIsTouch(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return isTouch;
}

/* -------------------------------------------------------------------------- */
/* Shared Bi-Directional ScrollTrigger Reveal Engine (Scroll Down & Up)       */
/* -------------------------------------------------------------------------- */

export interface BiDirectionalRevealOptions {
  direction?: ScrollRevealDirection;
  distance?: number;
  duration?: number;
  delay?: number;
  scaleFrom?: number;
  blur?: boolean;
  start?: string;
  end?: string;
}

function getEffectiveDistance(direction: ScrollRevealDirection, distance: number): number {
  if (typeof window !== 'undefined' && window.innerWidth < 640 && (direction === 'left' || direction === 'right')) {
    return Math.min(distance, 42);
  }
  return distance;
}

function isInitialLoaderActive(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean((window as Window & { __TERMICORE_LOADER_ACTIVE__?: boolean }).__TERMICORE_LOADER_ACTIVE__);
}

export function attachBiDirectionalReveal(
  el: HTMLElement,
  options: BiDirectionalRevealOptions = {}
): () => void {
  const {
    direction = 'down',
    distance = 86,
    duration = 0.78,
    delay = 0,
    scaleFrom = 1,
    blur = false,
    start = 'top 92%',
    end = 'bottom 10%',
  } = options;

  const effectiveDistance = getEffectiveDistance(direction, distance);
  const { x, y } = getDirectionOffset(direction, effectiveDistance);
  const hiddenFilter = blur ? 'blur(5px)' : 'blur(0px)';

  let currentState: 'shown' | 'hidden' = 'hidden';
  let settleTimer: number | null = null;

  el.setAttribute('data-scroll-reveal', direction);
  el.setAttribute('data-reveal-state', 'hidden');

  const applyHiddenStyles = () => {
    gsap.killTweensOf(el);
    gsap.set(el, {
      x,
      y,
      scale: scaleFrom,
      opacity: 0,
      filter: hiddenFilter,
    });
  };

  const setHidden = () => {
    if (currentState === 'hidden') return;
    currentState = 'hidden';
    el.setAttribute('data-reveal-state', 'hidden');
    applyHiddenStyles();
  };

  // Initialize hidden position before animating in
  applyHiddenStyles();

  const playReveal = (customDelay = delay) => {
    if (isInitialLoaderActive()) return;
    if (currentState === 'shown') return;
    currentState = 'shown';
    el.setAttribute('data-reveal-state', 'shown');
    gsap.killTweensOf(el);
    gsap.to(el, {
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1,
      filter: 'blur(0px)',
      duration,
      delay: customDelay,
      ease: 'power3.out',
      overwrite: 'auto',
      onComplete: () => {
        if (currentState === 'shown') {
          gsap.set(el, { clearProps: 'transform,filter' });
        }
      },
    });
  };

  const getLayoutVerticalBounds = () => {
    const rect = el.getBoundingClientRect();
    const currentY = Number(gsap.getProperty(el, 'y')) || 0;
    return {
      layoutTop: rect.top - currentY,
      layoutBottom: rect.bottom - currentY,
    };
  };

  const checkEdgeVisibility = (allowEdgeMargin = false) => {
    if (isInitialLoaderActive()) return;
    const vh = window.innerHeight || 900;
    const { layoutTop, layoutBottom } = getLayoutVerticalBounds();
    const docEl = document.documentElement;
    const atTop = window.scrollY <= 6;
    const atBottom = window.scrollY + vh >= docEl.scrollHeight - 8;

    const topCutoff = allowEdgeMargin ? vh * 0.995 : vh * 0.96;
    const bottomCutoff = allowEdgeMargin ? vh * 0.005 : vh * 0.04;
    const inRevealBand = layoutTop < topCutoff && layoutBottom > bottomCutoff;
    const visibleAtEdge =
      (atTop && layoutTop < vh && layoutBottom > 0) ||
      (atBottom && layoutTop < vh && layoutBottom > 0);

    if (inRevealBand || visibleAtEdge) {
      playReveal(layoutTop < 80 ? Math.min(delay, 0.04) : delay);
    } else if (layoutBottom <= -12 || layoutTop >= vh + 12) {
      setHidden();
    }
  };

  const onScroll = () => {
    checkEdgeVisibility(false);
    if (settleTimer !== null) {
      window.clearTimeout(settleTimer);
    }
    settleTimer = window.setTimeout(() => {
      checkEdgeVisibility(true);
    }, 120);
  };

  const revealTrigger = ScrollTrigger.create({
    trigger: el,
    start,
    end,
    onEnter: () => playReveal(delay),
    onEnterBack: () => playReveal(Math.min(delay, 0.04)),
  });

  // Reset only once element is 100% off-screen above or below viewport (with 12px buffer)
  const visibilityResetTrigger = ScrollTrigger.create({
    trigger: el,
    start: 'top bottom+=12',
    end: 'bottom top-=12',
    onLeave: () => {
      const vh = window.innerHeight || 900;
      const docEl = document.documentElement;
      if (window.scrollY + vh >= docEl.scrollHeight - 8) return;
      const { layoutBottom } = getLayoutVerticalBounds();
      if (layoutBottom <= -6) {
        setHidden();
      }
    },
    onLeaveBack: () => {
      if (window.scrollY <= 6) return;
      const vh = window.innerHeight || 900;
      const { layoutTop } = getLayoutVerticalBounds();
      if (layoutTop >= vh + 6) {
        setHidden();
      }
    },
  });

  const onLoaderDone = () => {
    ScrollTrigger.refresh();
    checkEdgeVisibility(true);
  };
  window.addEventListener('termicore:loader-done', onLoaderDone);
  window.addEventListener('scroll', onScroll, { passive: true });

  // Evaluate initial viewport placement when loader is already finished
  checkEdgeVisibility(true);

  return () => {
    if (settleTimer !== null) {
      window.clearTimeout(settleTimer);
    }
    window.removeEventListener('termicore:loader-done', onLoaderDone);
    window.removeEventListener('scroll', onScroll);
    revealTrigger.kill();
    visibilityResetTrigger.kill();
    gsap.killTweensOf(el);
  };
}

/* -------------------------------------------------------------------------- */
/* 1. GSAP Bi-Directional Section & Staggered Content Reveal                  */
/* -------------------------------------------------------------------------- */

interface RevealBlockProps {
  children: React.ReactNode;
  className?: string;
  direction?: ScrollRevealDirection;
  distance?: number;
  duration?: number;
  delay?: number;
  y?: number;
  blur?: boolean;
}

export function RevealBlock({
  children,
  className = '',
  direction = 'down',
  distance,
  duration = 0.78,
  delay = 0,
  y,
  blur = false,
}: RevealBlockProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  const resolvedDistance =
    distance !== undefined
      ? Math.max(distance, 48)
      : y !== undefined
      ? Math.max(Math.abs(y), 48)
      : 86;

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion) return;

    const cleanup = attachBiDirectionalReveal(el, {
      direction,
      distance: resolvedDistance,
      duration,
      delay,
      blur,
    });

    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      cancelAnimationFrame(raf);
      cleanup();
      gsap.set(el, { clearProps: 'transform,opacity,filter' });
    };
  }, [direction, resolvedDistance, duration, delay, blur, reducedMotion]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

interface StaggerGridProps {
  children: React.ReactNode;
  className?: string;
  itemSelector?: string;
  pattern?: GridDirectionPattern;
  columns?: 2 | 3 | 4;
  stagger?: number;
  distance?: number;
  duration?: number;
  y?: number;
  scaleFrom?: number;
}

export function StaggerGrid({
  children,
  className = '',
  itemSelector = '[data-stagger-item]',
  pattern = 'quad',
  columns = 3,
  stagger = 0.08,
  distance,
  duration = 0.78,
  y,
  scaleFrom = 0.94,
}: StaggerGridProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const resolvedDistance =
    distance !== undefined
      ? distance <= 36
        ? distance
        : Math.max(distance, 64)
      : y !== undefined
      ? Math.max(Math.abs(y), 64)
      : 86;

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion) return;

    const items = Array.from(el.querySelectorAll<HTMLElement>(itemSelector));
    if (!items.length) return;

    const cleanups = items.map((item, idx) => {
      const dir = getGridItemDirection(idx, pattern, columns);
      const colDelay = (idx % Math.max(1, columns)) * stagger;
      return attachBiDirectionalReveal(item, {
        direction: dir,
        distance: resolvedDistance,
        duration,
        delay: colDelay,
        scaleFrom,
      });
    });

    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      cancelAnimationFrame(raf);
      cleanups.forEach((fn) => fn());
      items.forEach((item) => gsap.set(item, { clearProps: 'transform,opacity,filter' }));
    };
  }, [
    itemSelector,
    pattern,
    columns,
    stagger,
    resolvedDistance,
    duration,
    scaleFrom,
    reducedMotion,
  ]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 2. GSAP Clip-Mask + Scale-Down Image Reveal & Optional Parallax            */
/* -------------------------------------------------------------------------- */

export type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'center';

interface ImageRevealProps {
  children: React.ReactNode;
  className?: string;
  direction?: RevealDirection;
  delay?: number;
  immediate?: boolean;
  parallax?: boolean;
}

const CLIP_INITIAL: Record<RevealDirection, string> = {
  up: 'inset(18% 0% 0% 0%)',
  down: 'inset(0% 0% 18% 0%)',
  left: 'inset(0% 20% 0% 0%)',
  right: 'inset(0% 0% 0% 20%)',
  center: 'inset(10% 10% 10% 10%)',
};

export function ImageReveal({
  children,
  className = '',
  direction = 'up',
  delay = 0,
  immediate = false,
  parallax = false,
}: ImageRevealProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const isTouch = useIsTouchDevice();

  useEffect(() => {
    const wrap = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner || reducedMotion) return;

    let removeLoaderListener = () => {};

    const ctx = gsap.context(() => {
      let imageShown = false;
      const playImageIn = () => {
        if (isInitialLoaderActive()) return;
        if (imageShown) return;
        imageShown = true;
        gsap.fromTo(
          wrap,
          { clipPath: CLIP_INITIAL[direction], opacity: 0.15 },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            opacity: 1,
            duration: 0.85,
            delay,
            ease: 'power3.out',
            overwrite: 'auto',
            clearProps: 'clipPath,opacity',
          }
        );
        gsap.fromTo(
          inner,
          { scale: 1.08 },
          {
            scale: 1,
            duration: 0.95,
            delay,
            ease: 'power3.out',
            overwrite: 'auto',
            clearProps: 'transform',
          }
        );
      };

      const resetImage = () => {
        imageShown = false;
        gsap.killTweensOf(wrap);
        gsap.killTweensOf(inner);
        gsap.set(wrap, { clipPath: CLIP_INITIAL[direction], opacity: immediate ? 1 : 0.15 });
        gsap.set(inner, { scale: 1.08 });
      };

      const checkInitialImage = () => {
        if (isInitialLoaderActive()) return;
        if (immediate) {
          playImageIn();
          return;
        }
        const vh = window.innerHeight || 900;
        const r = wrap.getBoundingClientRect();
        if (r.top < vh * 0.94 && r.bottom > vh * 0.06) {
          playImageIn();
        }
      };

      resetImage();

      if (immediate) {
        if (!isInitialLoaderActive()) {
          playImageIn();
        }
      } else {
        ScrollTrigger.create({
          trigger: wrap,
          start: 'top 93%',
          end: 'bottom 8%',
          onEnter: playImageIn,
          onEnterBack: playImageIn,
        });
        ScrollTrigger.create({
          trigger: wrap,
          start: 'top bottom+=10',
          end: 'bottom top-=10',
          onLeave: resetImage,
          onLeaveBack: resetImage,
        });
        checkInitialImage();
      }

      const onLoaderDone = () => {
        ScrollTrigger.refresh();
        checkInitialImage();
      };
      window.addEventListener('termicore:loader-done', onLoaderDone);
      removeLoaderListener = () =>
        window.removeEventListener('termicore:loader-done', onLoaderDone);

      if (parallax && !isTouch && !immediate) {
        gsap.fromTo(
          inner,
          { yPercent: -3.5 },
          {
            yPercent: 3.5,
            ease: 'none',
            scrollTrigger: {
              trigger: wrap,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.6,
            },
          }
        );
      }
    }, wrapRef);

    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      cancelAnimationFrame(raf);
      removeLoaderListener();
      ctx.revert();
    };
  }, [direction, delay, immediate, parallax, reducedMotion, isTouch]);

  return (
    <div ref={wrapRef} className={`overflow-hidden ${className}`}>
      <div ref={innerRef} className="h-full w-full will-change-transform">
        {children}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 2b. GSAP Precision Engineering Line-Draw Accent Rule                       */
/* -------------------------------------------------------------------------- */

interface EngineeringRuleProps {
  className?: string;
  immediate?: boolean;
  delay?: number;
  dark?: boolean;
}

export function EngineeringRule({
  className = '',
  immediate = false,
  delay = 0,
  dark = false,
}: EngineeringRuleProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const wrap = wrapRef.current;
    const line = lineRef.current;
    if (!wrap || !line || reducedMotion) return;

    let removeLoaderListener = () => {};

    const ctx = gsap.context(() => {
      const draw = () => {
        if (isInitialLoaderActive()) return;
        gsap.fromTo(
          line,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 0.85,
            delay,
            ease: 'power3.out',
            overwrite: 'auto',
            clearProps: 'transform',
          }
        );
      };

      const checkDraw = () => {
        if (isInitialLoaderActive()) return;
        if (immediate) {
          draw();
          return;
        }
        const vh = window.innerHeight || 900;
        const r = wrap.getBoundingClientRect();
        if (r.top < vh * 0.94 && r.bottom > vh * 0.06) {
          draw();
        }
      };

      gsap.set(line, { scaleX: 0 });

      if (immediate) {
        if (!isInitialLoaderActive()) {
          draw();
        }
      } else {
        ScrollTrigger.create({
          trigger: wrap,
          start: 'top 93%',
          end: 'bottom 8%',
          onEnter: draw,
          onEnterBack: draw,
        });
        ScrollTrigger.create({
          trigger: wrap,
          start: 'top bottom+=10',
          end: 'bottom top-=10',
          onLeave: () => gsap.set(line, { scaleX: 0 }),
          onLeaveBack: () => gsap.set(line, { scaleX: 0 }),
        });
        checkDraw();
      }

      const onLoaderDone = () => {
        ScrollTrigger.refresh();
        checkDraw();
      };
      window.addEventListener('termicore:loader-done', onLoaderDone);
      removeLoaderListener = () =>
        window.removeEventListener('termicore:loader-done', onLoaderDone);
    }, wrapRef);

    return () => {
      removeLoaderListener();
      ctx.revert();
    };
  }, [immediate, delay, reducedMotion]);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className={`relative h-[1px] w-full overflow-hidden ${dark ? 'bg-slate-800' : 'bg-[#DCE2E8]'} ${className}`}
    >
      <div
        ref={lineRef}
        className={`h-full w-full origin-left ${
          dark
            ? 'bg-gradient-to-r from-[#0D9488] via-[#2DD4BF]/50 to-transparent'
            : 'bg-gradient-to-r from-[#0F766E] via-[#0D9488]/40 to-transparent'
        }`}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 3. Meaningful Numeric Count-Up Metric                                      */
/* -------------------------------------------------------------------------- */

interface CountUpMetricProps {
  value: string;
  className?: string;
  immediate?: boolean;
  delay?: number;
  duration?: number;
}

function formatZeroStart(value: string): string {
  const match = value.match(/^([^\d]*)(\d+)(.*)$/);
  if (!match) return value;
  const [, prefix, digits, suffix] = match;
  const zeroDigits = prefix ? '0'.repeat(digits.length) : '0';
  return `${prefix}${zeroDigits}${suffix}`;
}

export function CountUpMetric({
  value,
  className = '',
  delay = 0,
  duration = 1.9,
}: CountUpMetricProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [display, setDisplay] = useState<string>(() =>
    reducedMotion ? value : formatZeroStart(value)
  );

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion) {
      setDisplay(value);
      return;
    }

    const match = value.match(/^([^\d]*)(\d+)(.*)$/);
    if (!match) {
      setDisplay(value);
      return;
    }

    const [, prefix, digits, suffix] = match;
    const target = parseInt(digits, 10);
    const padLength = prefix ? digits.length : 0;
    const durationMs = Math.max(400, duration * 1000);
    const delayMs = Math.max(0, delay * 1000);

    setDisplay(formatZeroStart(value));

    let rafId = 0;
    let timeoutId = 0;
    let started = false;
    let cancelled = false;

    const runAnimation = () => {
      if (started || cancelled) return;
      started = true;

      const startTimer = () => {
        if (cancelled) return;
        const startTime = performance.now();

        const step = (now: number) => {
          if (cancelled) return;
          const elapsed = now - startTime;
          const progress = Math.min(1, elapsed / durationMs);
          const eased = 1 - (1 - progress) * (1 - progress);
          const current = Math.round(target * eased);
          const numText =
            padLength > 0 ? String(current).padStart(padLength, '0') : String(current);
          setDisplay(`${prefix}${numText}${suffix}`);

          if (progress < 1) {
            rafId = window.requestAnimationFrame(step);
          } else {
            setDisplay(value);
          }
        };

        rafId = window.requestAnimationFrame(step);
      };

      if (delayMs > 0) {
        timeoutId = window.setTimeout(startTimer, delayMs);
      } else {
        startTimer();
      }
    };

    const tryStart = () => {
      if (isInitialLoaderActive()) return;
      runAnimation();
    };

    const onLoaderDone = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 900;
      if (r.top < vh && r.bottom > 0) {
        tryStart();
      }
    };
    window.addEventListener('termicore:loader-done', onLoaderDone);

    if (typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            if (!isInitialLoaderActive()) {
              observer.disconnect();
              tryStart();
            }
          }
        },
        { threshold: 0.15 }
      );
      observer.observe(el);

      return () => {
        cancelled = true;
        observer.disconnect();
        window.removeEventListener('termicore:loader-done', onLoaderDone);
        window.clearTimeout(timeoutId);
        window.cancelAnimationFrame(rafId);
      };
    }

    tryStart();
    return () => {
      cancelled = true;
      window.removeEventListener('termicore:loader-done', onLoaderDone);
      window.clearTimeout(timeoutId);
      window.cancelAnimationFrame(rafId);
    };
  }, [value, reducedMotion, delay, duration]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* 4. Interactive Mouse-Follow GlowCard (Precision Teal Radial Illumination)  */
/* -------------------------------------------------------------------------- */

interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'dark' | 'elevated' | 'light';
  active?: boolean;
  as?: 'div' | 'article';
}

export function GlowCard({
  children,
  className = '',
  variant = 'elevated',
  active = false,
  as = 'div',
  onMouseMove,
  onMouseLeave,
  ...rest
}: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const isTouch = useIsTouchDevice();
  const reducedMotion = usePrefersReducedMotion();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    onMouseMove?.(e);
    if (isTouch || reducedMotion || !cardRef.current || !glowRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    glowRef.current.style.opacity = '1';
    glowRef.current.style.background =
      variant === 'dark'
        ? `radial-gradient(400px circle at ${x}px ${y}px, rgba(45, 212, 191, 0.14), transparent 65%)`
        : `radial-gradient(380px circle at ${x}px ${y}px, rgba(13, 148, 136, 0.11), transparent 65%)`;
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    onMouseLeave?.(e);
    if (glowRef.current) {
      glowRef.current.style.opacity = '0';
    }
  };

  const surfaceStyles =
    variant === 'light'
      ? active
        ? 'bg-white border-[#0F766E] shadow-[0_12px_30px_rgba(16,29,43,0.08)] ring-1 ring-[#0F766E]/20'
        : 'bg-[#F8FAFC] border-[#DCE2E8] hover:border-[#0F766E]/55 hover:shadow-[0_12px_28px_rgba(16,29,43,0.07)]'
      : variant === 'dark'
      ? active
        ? 'bg-[#101D2B] border-[#0D9488]/70 shadow-[0_16px_40px_rgba(16,29,43,0.38)]'
        : 'bg-[#101D2B] border-[#243447] hover:border-[#0D9488]/60 hover:shadow-[0_18px_42px_rgba(16,29,43,0.42)]'
      : active
      ? 'bg-white border-[#0F766E] shadow-[0_12px_30px_rgba(16,29,43,0.08)] ring-1 ring-[#0F766E]/20'
      : 'bg-white border-[#DCE2E8] hover:border-[#0F766E]/55 hover:shadow-[0_12px_28px_rgba(16,29,43,0.07)]';

  const Tag = as;

  return (
    <Tag
      ref={cardRef as React.RefObject<HTMLDivElement>}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-lg border transition-[border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${surfaceStyles} ${className}`}
      {...rest}
    >
      {!isTouch && !reducedMotion && (
        <div
          ref={glowRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300"
        />
      )}
      <div className="relative z-10 h-full flex flex-col">{children}</div>
    </Tag>
  );
}

/* -------------------------------------------------------------------------- */
/* 5. Desktop-Only Subtle Magnetic CTA Button                                 */
/* -------------------------------------------------------------------------- */

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  strength?: number;
}

export function MagneticButton({
  children,
  className = '',
  strength = 0.22,
  onMouseMove,
  onMouseLeave,
  ...props
}: MagneticButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const isTouch = useIsTouchDevice();
  const reducedMotion = usePrefersReducedMotion();

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    onMouseMove?.(e);
    if (isTouch || reducedMotion || !btnRef.current) return;

    const rect = btnRef.current.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width / 2)) * strength;
    const dy = (e.clientY - (rect.top + rect.height / 2)) * strength;

    const clampedX = Math.max(-5, Math.min(5, dx));
    const clampedY = Math.max(-4, Math.min(4, dy));

    gsap.to(btnRef.current, {
      x: clampedX,
      y: clampedY,
      duration: 0.28,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    onMouseLeave?.(e);
    if (!btnRef.current || isTouch || reducedMotion) return;

    gsap.to(btnRef.current, {
      x: 0,
      y: 0,
      duration: 0.4,
      ease: 'power3.out',
      overwrite: 'auto',
    });
  };

  return (
    <button
      ref={btnRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}
