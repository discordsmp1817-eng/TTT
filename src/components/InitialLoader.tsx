/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TermiCoreLogo } from './TermiCoreLogo';
import { INDUSTRIAL_EASE } from './MotionPrimitives';

const LOADING_STEPS = [
  'Initializing TermiCore DIN Rail Connection Systems...',
  'Loading UL 1059 & IEC 60947-7-1 Metrology Data...',
  'Calibrating High-Current Copper Stamping & Dielectric Specs...',
  'System Ready — Welcome to TermiCore Engineering',
];

export function InitialLoader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const win = window as Window & { __TERMICORE_LOADER_ACTIVE__?: boolean };
    win.__TERMICORE_LOADER_ACTIVE__ = true;

    const startTime = Date.now();
    const duration = 1200; // 1.2s loading experience

    const interval = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(p);

      if (p < 35) setStepIndex(0);
      else if (p < 70) setStepIndex(1);
      else if (p < 95) setStepIndex(2);
      else setStepIndex(3);

      if (p >= 100) {
        window.clearInterval(interval);
        window.setTimeout(() => {
          setIsDone(true);
          win.__TERMICORE_LOADER_ACTIVE__ = false;
          window.dispatchEvent(new CustomEvent('termicore:loader-done'));
          window.setTimeout(onComplete, 650); // match transition duration
        }, 120);
      }
    }, 25);

    return () => {
      window.clearInterval(interval);
      win.__TERMICORE_LOADER_ACTIVE__ = false;
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0B131D] bg-engineering-grid-dark px-6 text-white select-none overflow-hidden"
        >
          <div className="flex flex-col items-center">
            {/* Center Logo with layoutId for seamless transition to navbar */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: INDUSTRIAL_EASE }}
              className="relative mb-6"
            >
              <div className="absolute -inset-8 rounded-full bg-[#0D9488]/25 blur-2xl animate-pulse" />
              <motion.div
                layoutId="nav-logo"
                className="relative flex h-24 w-24 items-center justify-center rounded-2xl border border-[#334155] bg-[#111C2A] shadow-2xl"
              >
                <TermiCoreLogo className="h-14 w-14 text-[#2DD4BF]" />
              </motion.div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="font-display text-2xl font-bold tracking-tight text-white mb-2"
            >
              TermiCore
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="font-mono text-xs text-[#2DD4BF] h-6 mb-6 text-center"
            >
              {LOADING_STEPS[stepIndex]}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 220 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="w-[220px] h-1.5 rounded-full bg-[#1E293B] overflow-hidden p-0.5 border border-[#334155]/60"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] transition-all duration-75"
                style={{ width: `${progress}%` }}
              />
            </motion.div>

            <div className="mt-2 font-mono text-[11px] text-slate-400">
              {progress}%
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
