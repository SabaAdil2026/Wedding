import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { differenceInDays, differenceInWeeks, differenceInSeconds } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ----------------------------------------------------------------------------
// WEDDING COUNTDOWN ENGINE
// ----------------------------------------------------------------------------
export const WEDDING_DATE = new Date('2026-11-20T00:00:00');
// Planning window start — first day the couple started actively planning.
// Adjust in .env or here if you want the "% of planning time elapsed" to reflect
// your actual start date.
export const PLANNING_START_DATE = new Date('2025-11-20T00:00:00');

export function getCountdown(now: Date = new Date()) {
  const totalSeconds = Math.max(0, differenceInSeconds(WEDDING_DATE, now));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const daysRemaining = Math.max(0, differenceInDays(WEDDING_DATE, now));
  const weeksRemaining = Math.max(0, differenceInWeeks(WEDDING_DATE, now));

  const totalPlanningDays = differenceInDays(WEDDING_DATE, PLANNING_START_DATE);
  const elapsedPlanningDays = differenceInDays(now, PLANNING_START_DATE);
  const percentElapsed = totalPlanningDays > 0
    ? Math.min(100, Math.max(0, Math.round((elapsedPlanningDays / totalPlanningDays) * 100)))
    : 0;

  return { days, hours, minutes, seconds, daysRemaining, weeksRemaining, percentElapsed };
}

// ----------------------------------------------------------------------------
// TASK URGENCY ENGINE
// Classifies a task by days-until-due relative to today.
// ----------------------------------------------------------------------------
export type UrgencyLevel = 'critical' | 'urgent' | 'upcoming' | 'can-wait' | 'none';

export const URGENCY_COLORS: Record<UrgencyLevel, { bg: string; text: string; dot: string }> = {
  critical: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' },
  urgent:   { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', dot: 'bg-orange-500' },
  upcoming: { bg: 'bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-400', dot: 'bg-yellow-500' },
  'can-wait': { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  none: { bg: 'bg-muted', text: 'text-muted-foreground', dot: 'bg-muted-foreground' },
};

export function getTaskUrgency(dueDate: string | null, status: string, now: Date = new Date()): UrgencyLevel {
  if (!dueDate || status === 'Completed' || status === 'Cancelled') return 'none';
  const daysUntil = differenceInDays(new Date(dueDate), now);
  if (daysUntil < 0) return 'critical'; // overdue
  if (daysUntil <= 2) return 'critical';
  if (daysUntil <= 7) return 'urgent';
  if (daysUntil <= 21) return 'upcoming';
  return 'can-wait';
}

// ----------------------------------------------------------------------------
// BOOKING URGENCY ENGINE
// Each vendor category has a typical "ideal lead time" (days before the wedding
// it should ideally be booked by). We compare that ideal-booking-by date against
// today to flag Red / Orange / Yellow / Green for still-unbooked categories.
// ----------------------------------------------------------------------------
export const BOOKING_LEAD_TIMES: Record<string, number> = {
  'Venue': 270,
  'Non Veg Food Catering': 270,
  'Veg Food Catering': 270,
  'Decoration': 180,
  'Photographer': 180,
  'Videographer': 180,
  'DJ / Sound': 150,
  'Accommodation / Guest Hotel': 150,
  'Transportation': 120,
  'Makeup Artist': 120,
  'Wedding Clothes': 120,
  'Mehendi Artist': 90,
  'Invitation Cards Printing': 90,
  'Lighting': 90,
  'Others': 60,
};

export function getBookingUrgency(category: string, status: string, now: Date = new Date()) {
  if (status === 'Booked' || status === 'Confirmed' || status === 'Cancelled') {
    return { level: 'none' as UrgencyLevel, isOverdue: false, idealBookByDate: null as Date | null, daysUntilIdeal: null as number | null };
  }
  const leadDays = BOOKING_LEAD_TIMES[category] ?? 90;
  const idealBookByDate = new Date(WEDDING_DATE);
  idealBookByDate.setDate(idealBookByDate.getDate() - leadDays);

  const daysUntilIdeal = differenceInDays(idealBookByDate, now);
  const isOverdue = daysUntilIdeal < 0;

  let level: UrgencyLevel;
  if (isOverdue) level = 'critical';
  else if (daysUntilIdeal <= 14) level = 'urgent';
  else if (daysUntilIdeal <= 45) level = 'upcoming';
  else level = 'can-wait';

  return { level, isOverdue, idealBookByDate, daysUntilIdeal };
}

// ----------------------------------------------------------------------------
// EVENT THEME COLORS (festive color-coding per event type)
// ----------------------------------------------------------------------------
export const EVENT_THEMES: Record<string, { gradient: string; text: string; badge: string }> = {
  sangeet: {
    gradient: 'from-zinc-900 via-zinc-800 to-gold-600',
    text: 'text-gold-300',
    badge: 'bg-zinc-900 text-gold-300 border-gold-500/40',
  },
  haldi: {
    gradient: 'from-orange-600 via-amber-500 to-yellow-400',
    text: 'text-orange-50',
    badge: 'bg-orange-600/90 text-white border-orange-300/40',
  },
  nikah: {
    gradient: 'from-pink-200 via-rose-200 to-gold-300',
    text: 'text-rose-900',
    badge: 'bg-rose-100 text-rose-900 border-gold-400/50',
  },
  reception: {
    gradient: 'from-amber-100 via-yellow-100 to-gold-300',
    text: 'text-amber-900',
    badge: 'bg-amber-100 text-amber-900 border-gold-400/50',
  },
  custom: {
    gradient: 'from-slate-700 via-slate-600 to-gold-500',
    text: 'text-gold-200',
    badge: 'bg-slate-800 text-gold-200 border-gold-500/40',
  },
};

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function whatsappLink(phone: string | null | undefined, message: string) {
  if (!phone) return '#';
  const cleaned = phone.replace(/[^\d+]/g, '');
  return `https://wa.me/${cleaned.replace('+', '')}?text=${encodeURIComponent(message)}`;
}
