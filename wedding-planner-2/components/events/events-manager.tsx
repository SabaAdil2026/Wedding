'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Archive, ArchiveRestore, Trash2, ArrowUpRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { EVENT_THEMES, cn } from '@/lib/utils';
import type { WeddingEvent } from '@/types/database';

const THEME_OPTIONS = ['sangeet', 'haldi', 'nikah', 'reception', 'custom'] as const;

export function EventsManager({ initialEvents }: { initialEvents: WeddingEvent[] }) {
  const supabase = createClient();
  const [events, setEvents] = useState(initialEvents);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [theme, setTheme] = useState<typeof THEME_OPTIONS[number]>('custom');
  const [saving, setSaving] = useState(false);

  async function addEvent() {
    if (!name.trim()) return;
    setSaving(true);
    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const { data, error } = await supabase
      .from('events')
      .insert({ name, slug: `${slug}-${Date.now().toString(36)}`, event_date: date || null, color_theme: theme, sort_order: events.length })
      .select()
      .single();
    if (!error && data) {
      setEvents([...events, data]);
      setName(''); setDate(''); setTheme('custom'); setOpen(false);
    }
    setSaving(false);
  }

  async function toggleArchive(event: WeddingEvent) {
    const { data } = await supabase
      .from('events')
      .update({ is_archived: !event.is_archived })
      .eq('id', event.id)
      .select()
      .single();
    if (data) setEvents(events.map((e) => (e.id === event.id ? data : e)));
  }

  async function deleteEvent(event: WeddingEvent) {
    if (!confirm(`Permanently delete "${event.name}" and all its tasks, shopping items, and bookings?`)) return;
    const { error } = await supabase.from('events').delete().eq('id', event.id);
    if (!error) setEvents(events.filter((e) => e.id !== event.id));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Wedding Events</h1>
          <p className="text-sm text-muted-foreground">Add, manage, and archive functions/events. Every event gets its own board, budget, and shopping list.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="gold"><Plus className="h-4 w-4" /> Add Event</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Event</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Event name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Engagement, Mehendi Night" />
              </div>
              <div className="space-y-1.5">
                <Label>Date (optional)</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Color theme</Label>
                <Select value={theme} onValueChange={(v) => setTheme(v as typeof theme)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {THEME_OPTIONS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="gold" className="w-full" onClick={addEvent} disabled={saving}>
                {saving ? 'Creating...' : 'Create Event'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {events.map((event) => {
            const t = EVENT_THEMES[event.color_theme] ?? EVENT_THEMES.custom;
            return (
              <motion.div key={event.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                <Card className={cn('overflow-hidden', event.is_archived && 'opacity-50')}>
                  <div className={cn('h-2 w-full bg-gradient-to-r', t.gradient)} />
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-display text-lg font-bold">{event.name}</p>
                        <p className="text-xs text-muted-foreground">{event.event_date ?? 'Date TBD'}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => toggleArchive(event)} title={event.is_archived ? 'Restore' : 'Archive'}>
                          {event.is_archived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteEvent(event)} title="Delete">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <Link href={`/events/${event.id}`} className="mt-4 flex items-center gap-1 text-sm text-gold-600 hover:underline">
                      Open event hub <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
