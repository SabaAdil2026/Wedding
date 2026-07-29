'use client';

import { useMemo, useState } from 'react';
import { Plus, AlertTriangle, CalendarCheck2, Clock, MessageCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { getBookingUrgency, formatCurrency, whatsappLink, URGENCY_COLORS, cn } from '@/lib/utils';
import type { Booking, WeddingEvent } from '@/types/database';

const CATEGORIES = [
  'Makeup Artist', 'Wedding Clothes', 'Decoration', 'Veg Food Catering', 'Non Veg Food Catering',
  'Photographer', 'Videographer', 'Mehendi Artist', 'DJ / Sound', 'Lighting', 'Transportation',
  'Venue', 'Invitation Cards Printing', 'Accommodation / Guest Hotel', 'Others',
];

const STATUSES = ['Not Booked', 'Enquired', 'Negotiating', 'Booked', 'Confirmed', 'Cancelled'];

const STATUS_BADGE: Record<string, 'destructive' | 'outline' | 'gold' | 'success'> = {
  'Not Booked': 'destructive', 'Enquired': 'outline', 'Negotiating': 'gold', 'Booked': 'success', 'Confirmed': 'success', 'Cancelled': 'outline',
};

export function BookingsView({ initialBookings, events }: { initialBookings: Booking[]; events: WeddingEvent[] }) {
  const supabase = createClient();
  const [bookings, setBookings] = useState(initialBookings);
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [eventId, setEventId] = useState(events[0]?.id ?? '');
  const [vendorName, setVendorName] = useState('');

  const now = new Date();
  const withUrgency = useMemo(
    () => bookings.map((b) => ({ ...b, urgency: getBookingUrgency(b.category, b.status, now) })),
    [bookings]
  );

  const total = bookings.length;
  const confirmed = bookings.filter((b) => b.status === 'Booked' || b.status === 'Confirmed').length;
  const pending = total - confirmed;
  const overdue = withUrgency.filter((b) => b.urgency.isOverdue);
  const upcomingTrials = bookings.filter((b) => b.trial_scheduled_date && new Date(b.trial_scheduled_date) > now);
  const overallPct = total > 0 ? Math.round((confirmed / total) * 100) : 0;

  async function addBooking() {
    const { data } = await supabase.from('bookings').insert({
      category, event_id: eventId || null, vendor_name: vendorName, status: 'Not Booked',
    }).select().single();
    if (data) { setBookings([...bookings, data]); setVendorName(''); setOpen(false); }
  }

  async function updateBooking(id: string, patch: Partial<Booking>) {
    const { data } = await supabase.from('bookings').update(patch).eq('id', id).select().single();
    if (data) setBookings(bookings.map((b) => (b.id === id ? data : b)));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Vendor Booking Tracker</h1>
          <p className="text-sm text-muted-foreground">Track booking status across every required vendor category</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button variant="gold"><Plus className="h-4 w-4" /> Add Booking</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Booking Record</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Event / Function</Label>
                <Select value={eventId} onValueChange={setEventId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{events.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Vendor name (optional)</Label><Input value={vendorName} onChange={(e) => setVendorName(e.target.value)} /></div>
              <Button variant="gold" className="w-full" onClick={addBooking}>Create Booking</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Needed</p><p className="text-2xl font-bold">{total}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Confirmed</p><p className="text-2xl font-bold text-emerald-600">{confirmed}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Pending</p><p className="text-2xl font-bold text-orange-500">{pending}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Overdue</p><p className="text-2xl font-bold text-red-600">{overdue.length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base flex items-center gap-2"><CalendarCheck2 className="h-4 w-4" /> Overall Booking Progress</CardTitle>
          <span className="font-display text-xl font-bold text-gold-600">{overallPct}%</span>
        </CardHeader>
        <CardContent><Progress value={overallPct} /></CardContent>
      </Card>

      {overdue.length > 0 && (
        <Card className="border-red-400/40 bg-red-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-red-600 dark:text-red-400"><AlertTriangle className="h-4 w-4" /> Overdue Bookings — Book Immediately</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {overdue.map((b) => <Badge key={b.id} variant="destructive">{b.category === 'Others' ? b.custom_category_name || 'Other' : b.category}</Badge>)}
          </CardContent>
        </Card>
      )}

      {upcomingTrials.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Clock className="h-4 w-4" /> Upcoming Trials &amp; Fittings</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {upcomingTrials.map((b) => (
              <div key={b.id} className="flex items-center justify-between text-sm">
                <p>{b.category} {b.vendor_name && `— ${b.vendor_name}`}</p>
                <p className="text-muted-foreground">{new Date(b.trial_scheduled_date!).toLocaleString()}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {withUrgency.map((b) => {
          const uc = URGENCY_COLORS[b.urgency.level];
          return (
            <Card key={b.id} className={cn('gold-border-hover', b.urgency.isOverdue && 'border-red-400/50')}>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{b.category === 'Others' ? (b.custom_category_name || 'Other') : b.category}</p>
                    {b.vendor_name && <p className="text-sm text-muted-foreground">{b.vendor_name}</p>}
                  </div>
                  <Badge variant={STATUS_BADGE[b.status]}>{b.status}</Badge>
                </div>

                {b.status !== 'Booked' && b.status !== 'Confirmed' && b.status !== 'Cancelled' && (
                  <p className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', uc.bg, uc.text)}>
                    <span className={cn('h-1.5 w-1.5 rounded-full', uc.dot)} />
                    {b.urgency.isOverdue ? 'Overdue — book now' : b.urgency.idealBookByDate ? `Ideally book by ${b.urgency.idealBookByDate.toLocaleDateString()}` : ''}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <Select value={b.status} onValueChange={(v) => updateBooking(b.id, { status: v as any })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                  <label className="flex items-center gap-1.5 text-xs">
                    <input type="checkbox" checked={b.contract_signed} onChange={(e) => updateBooking(b.id, { contract_signed: e.target.checked })} />
                    Contract signed
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <span>Advance: {formatCurrency(b.advance_paid)}</span>
                  <span>Balance: {formatCurrency(b.balance_due)}</span>
                </div>

                {b.contact_phone && (
                  <a href={whatsappLink(b.contact_phone, `Hi, following up on ${b.category} booking for Saba & Adil's wedding.`)} target="_blank" className="flex items-center gap-1 text-xs text-emerald-600 hover:underline">
                    <MessageCircle className="h-3 w-3" /> WhatsApp {b.contact_person || ''}
                  </a>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
