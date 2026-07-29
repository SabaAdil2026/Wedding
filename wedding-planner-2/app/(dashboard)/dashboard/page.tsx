import Link from 'next/link';
import {
  ListChecks, AlertTriangle, CalendarClock, ShoppingBag, Wallet,
  CalendarCheck2, Sparkles, ArrowUpRight,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getDashboardData } from '@/lib/data';
import { CountdownRing } from '@/components/dashboard/countdown-ring';
import { StatCard } from '@/components/dashboard/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { EVENT_THEMES, URGENCY_COLORS, formatCurrency, cn } from '@/lib/utils';

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user?.id).single();

  const data = await getDashboardData();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-8">
      {/* Hero / Countdown */}
      <Card className="overflow-hidden border-gold-400/30 bg-gold-gradient text-gold-50">
        <CardContent className="p-6 sm:p-10">
          <div className="mb-8">
            <p className="text-sm text-gold-200/80">{greeting}, {profile?.full_name ?? 'there'} ✨</p>
            <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">
              Planning Saba &amp; Adil's Wedding
            </h1>
            <p className="mt-1 text-gold-200/70">20th November 2026 · Overall progress {data.overallCompletion}%</p>
          </div>
          <CountdownRing />
        </CardContent>
      </Card>

      {/* Overall progress bar */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Overall Wedding Progress</CardTitle>
          <span className="font-display text-xl font-bold text-gold-600">{data.overallCompletion}%</span>
        </CardHeader>
        <CardContent>
          <Progress value={data.overallCompletion} />
          <p className="mt-2 text-xs text-muted-foreground">
            {data.completedTasks} of {data.totalTasks} tasks completed across all events
          </p>
        </CardContent>
      </Card>

      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Urgent Tasks" value={data.urgentTasks.length} icon={AlertTriangle} tone="danger" />
        <StatCard label="Bookings Confirmed" value={`${data.confirmedBookings}/${data.totalBookings}`} icon={CalendarCheck2} tone="gold" />
        <StatCard label="Shopping Purchased" value={`${data.purchasedItems}/${data.totalShoppingItems}`} icon={ShoppingBag} />
        <StatCard label="Budget Spent" value={formatCurrency(data.totalSpent)} icon={Wallet} tone={data.totalSpent > data.totalBudget ? 'danger' : 'success'} />
      </div>

      {/* Overdue bookings alert */}
      {data.overdueBookings.length > 0 && (
        <Card className="border-red-400/40 bg-red-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-red-600 dark:text-red-400">
              <AlertTriangle className="h-4 w-4" /> {data.overdueBookings.length} Overdue Booking{data.overdueBookings.length > 1 ? 's' : ''}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {data.overdueBookings.map((b) => (
              <Badge key={b.id} variant="destructive">{b.category}</Badge>
            ))}
            <Link href="/bookings" className="ml-2 flex items-center gap-1 text-sm text-red-600 hover:underline dark:text-red-400">
              Review bookings <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Urgent + Today's tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><ListChecks className="h-4 w-4" /> Urgent Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.urgentTasks.length === 0 && <p className="text-sm text-muted-foreground">Nothing urgent right now. 🎉</p>}
            {data.urgentTasks.map((t: any) => (
              <div key={t.id} className="flex items-center justify-between rounded-xl border border-gold-300/20 p-3">
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">Due {t.due_date ?? '—'}</p>
                </div>
                <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', URGENCY_COLORS[t.urgency as keyof typeof URGENCY_COLORS].bg, URGENCY_COLORS[t.urgency as keyof typeof URGENCY_COLORS].text)}>
                  {t.priority}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><CalendarClock className="h-4 w-4" /> Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.upcomingDeadlines.length === 0 && <p className="text-sm text-muted-foreground">No upcoming deadlines.</p>}
            {data.upcomingDeadlines.map((t: any) => (
              <div key={t.id} className="flex items-center justify-between rounded-xl border border-gold-300/20 p-3">
                <p className="text-sm font-medium">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.due_date}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Event status cards */}
      <div>
        <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold"><Sparkles className="h-5 w-5 text-gold-500" /> Event Status</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.eventsWithProgress.map((event: any) => {
            const theme = EVENT_THEMES[event.color_theme] ?? EVENT_THEMES.custom;
            return (
              <Link key={event.id} href={`/events/${event.id}`}>
                <Card className={cn('gold-border-hover overflow-hidden bg-gradient-to-br text-white', theme.gradient)}>
                  <CardContent className="p-5">
                    <p className={cn('font-display text-lg font-bold', theme.text)}>{event.name}</p>
                    <p className="text-xs opacity-80">{event.event_date ?? 'Date TBD'}</p>
                    <div className="mt-4">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                        <div className="h-full rounded-full bg-white/90" style={{ width: `${event.completion}%` }} />
                      </div>
                      <p className="mt-1 text-xs opacity-90">{event.completion}% · {event.taskCount} tasks</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {data.activity.length === 0 && <p className="text-sm text-muted-foreground">No activity yet.</p>}
          {data.activity.map((a: any) => (
            <div key={a.id} className="flex items-center justify-between text-sm">
              <p><span className="font-medium">{a.profiles?.full_name ?? 'Someone'}</span> {a.action}</p>
              <p className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
