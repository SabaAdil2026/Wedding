'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getCountdown } from '@/lib/utils';

export function CountdownRing() {
  const [countdown, setCountdown] = useState(getCountdown());

  useEffect(() => {
    const interval = setInterval(() => setCountdown(getCountdown()), 1000);
    return () => clearInterval(interval);
  }, []);

  const size = 220;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentRemaining = 100 - countdown.percentElapsed;
  const offset = circumference - (percentRemaining / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-10">
      <div className="relative h-[220px] w-[220px] shrink-0">
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id="goldRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0B0B0C" />
              <stop offset="60%" stopColor="#a86f18" />
              <stop offset="100%" stopColor="#F2D98E" />
            </linearGradient>
          </defs>
          <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} fill="none" className="progress-ring-track" />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            className="progress-ring-fill"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-5xl font-bold tabular-nums">{countdown.daysRemaining}</span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">days to go</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-center sm:text-left">
        <Stat label="Weeks Remaining" value={countdown.weeksRemaining} />
        <Stat label="Planning Elapsed" value={`${countdown.percentElapsed}%`} />
        <Stat label="Hours" value={countdown.hours} sub />
        <Stat label="Minutes : Seconds" value={`${countdown.minutes.toString().padStart(2, '0')}:${countdown.seconds.toString().padStart(2, '0')}`} sub />
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: boolean }) {
  return (
    <div>
      <p className={sub ? 'font-display text-2xl font-semibold tabular-nums' : 'font-display text-3xl font-bold tabular-nums'}>
        {value}
      </p>
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
    </div>
  );
}
