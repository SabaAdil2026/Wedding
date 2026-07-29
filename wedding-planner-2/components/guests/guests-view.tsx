'use client';

import { useMemo, useState } from 'react';
import { Plus, Search, MessageCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { whatsappLink } from '@/lib/utils';
import type { Guest } from '@/types/database';

const RSVP_VARIANT: Record<string, 'success' | 'destructive' | 'outline'> = {
  Confirmed: 'success', Declined: 'destructive', Pending: 'outline',
};

export function GuestsView({ initialGuests }: { initialGuests: Guest[] }) {
  const supabase = createClient();
  const [guests, setGuests] = useState(initialGuests);
  const [search, setSearch] = useState('');
  const [sideFilter, setSideFilter] = useState('All');
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [side, setSide] = useState<'Bride' | 'Groom' | 'Both'>('Both');
  const [group, setGroup] = useState<'Family' | 'Friends' | 'VIP'>('Family');

  const filtered = useMemo(() => guests.filter((g) =>
    g.full_name.toLowerCase().includes(search.toLowerCase()) && (sideFilter === 'All' || g.side === sideFilter)
  ), [guests, search, sideFilter]);

  async function addGuest() {
    if (!name.trim()) return;
    const { data } = await supabase.from('guests').insert({ full_name: name, phone, side, guest_group: group }).select().single();
    if (data) { setGuests([...guests, data]); setName(''); setPhone(''); setOpen(false); }
  }

  async function updateRsvp(guest: Guest, status: string) {
    const { data } = await supabase.from('guests').update({ rsvp_status: status }).eq('id', guest.id).select().single();
    if (data) setGuests(guests.map((g) => (g.id === guest.id ? data : g)));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Guest Management</h1>
          <p className="text-sm text-muted-foreground">{guests.length} guests · {guests.filter((g) => g.rsvp_status === 'Confirmed').length} confirmed</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button variant="gold"><Plus className="h-4 w-4" /> Add Guest</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Guest</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5"><Label>Full name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91..." /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Side</Label>
                  <Select value={side} onValueChange={(v) => setSide(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Bride">Bride</SelectItem><SelectItem value="Groom">Groom</SelectItem><SelectItem value="Both">Both</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Group</Label>
                  <Select value={group} onValueChange={(v) => setGroup(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Family">Family</SelectItem><SelectItem value="Friends">Friends</SelectItem><SelectItem value="VIP">VIP</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <Button variant="gold" className="w-full" onClick={addGuest}>Add Guest</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search guests..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={sideFilter} onValueChange={setSideFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            {['All', 'Bride', 'Groom', 'Both'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gold-300/20">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Side</th><th className="px-4 py-3">Group</th><th className="px-4 py-3">RSVP</th><th className="px-4 py-3">Invite Sent</th><th className="px-4 py-3">Contact</th></tr>
          </thead>
          <tbody>
            {filtered.map((g) => (
              <tr key={g.id} className="border-t border-gold-300/10">
                <td className="px-4 py-3 font-medium">{g.full_name}</td>
                <td className="px-4 py-3">{g.side}</td>
                <td className="px-4 py-3"><Badge variant="outline">{g.guest_group}</Badge></td>
                <td className="px-4 py-3">
                  <Select value={g.rsvp_status} onValueChange={(v) => updateRsvp(g, v)}>
                    <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['Pending', 'Confirmed', 'Declined'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-3">{g.invitation_sent ? '✅' : '—'}</td>
                <td className="px-4 py-3">
                  {g.phone && (
                    <a href={whatsappLink(g.phone, `Hi ${g.full_name}, this is regarding Saba & Adil's wedding!`)} target="_blank" className="flex items-center gap-1 text-emerald-600 hover:underline">
                      <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
