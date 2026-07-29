'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ListChecks, ShoppingBag, Wallet, Users, Building2,
  CalendarCheck2, Sparkles, Heart, ChevronRight,
} from 'lucide-react';
import { cn, EVENT_THEMES } from '@/lib/utils';
import type { Profile, WeddingEvent } from '@/types/database';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tasks', label: 'Tasks', icon: ListChecks },
  { href: '/bookings', label: 'Bookings', icon: CalendarCheck2 },
  { href: '/shopping', label: 'Shopping', icon: ShoppingBag },
  { href: '/budget', label: 'Budget', icon: Wallet },
  { href: '/guests', label: 'Guests', icon: Users },
  { href: '/vendors', label: 'Vendors', icon: Building2 },
  { href: '/events', label: 'Events', icon: Sparkles },
];

export function Sidebar({ profile, events }: { profile: Profile | null; events: WeddingEvent[] }) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-gold-300/20 bg-card/60 backdrop-blur-xl lg:flex">
      <div className="flex items-center gap-2 px-6 py-6">
        <Heart className="h-5 w-5 fill-gold-500 text-gold-500" />
        <div>
          <p className="font-display text-lg font-bold leading-none">Saba &amp; Adil</p>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">16 Nov 2026</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-gold-gradient text-gold-50 shadow-gold'
                  : 'text-muted-foreground hover:bg-gold-100/40 hover:text-foreground dark:hover:bg-gold-900/20'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}

        <div className="mt-6 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Events
        </div>
        <div className="space-y-1">
          {events.map((event) => {
            const theme = EVENT_THEMES[event.color_theme] ?? EVENT_THEMES.custom;
            const href = `/events/${event.id}`;
            const active = pathname === href;
            return (
              <Link
                key={event.id}
                href={href}
                className={cn(
                  'group flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors',
                  active ? 'bg-muted' : 'hover:bg-muted/60'
                )}
              >
                <span className="flex items-center gap-2">
                  <span className={cn('h-2 w-2 rounded-full bg-gradient-to-br', theme.gradient)} />
                  {event.name}
                </span>
                <ChevronRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-60" />
              </Link>
            );
          })}
        </div>
      </nav>

      {profile && (
        <div className="border-t border-gold-300/20 p-4 text-xs text-muted-foreground">
          Signed in as <span className="font-semibold text-foreground">{profile.full_name}</span>
          <br />
          <span className="capitalize">{profile.role}</span>
        </div>
      )}
    </aside>
  );
}
