'use client';

import { useState } from 'react';
import { Plus, MessageCircle, Star } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { formatCurrency, whatsappLink } from '@/lib/utils';
import type { Vendor } from '@/types/database';

const CATEGORIES = ['Photographer', 'Decorator', 'Non Veg Catering', 'Veg Catering', 'Makeup', 'Mehendi Artist', 'DJ', 'Venue', 'Anchor', 'Other'];

export function VendorsView({ initialVendors }: { initialVendors: Vendor[] }) {
  const supabase = createClient();
  const [vendors, setVendors] = useState(initialVendors);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [advance, setAdvance] = useState('');
  const [balance, setBalance] = useState('');

  async function addVendor() {
    if (!name.trim()) return;
    const { data } = await supabase.from('vendors').insert({
      name, phone, category, advance_paid: Number(advance) || 0, balance: Number(balance) || 0,
    }).select().single();
    if (data) { setVendors([...vendors, data]); setName(''); setPhone(''); setAdvance(''); setBalance(''); setOpen(false); }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Vendors</h1>
          <p className="text-sm text-muted-foreground">{vendors.length} vendors</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button variant="gold"><Plus className="h-4 w-4" /> Add Vendor</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Vendor</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91..." /></div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Advance Paid</Label><Input type="number" value={advance} onChange={(e) => setAdvance(e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Balance</Label><Input type="number" value={balance} onChange={(e) => setBalance(e.target.value)} /></div>
              </div>
              <Button variant="gold" className="w-full" onClick={addVendor}>Add Vendor</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {vendors.map((v) => (
          <Card key={v.id} className="gold-border-hover">
            <CardContent className="space-y-2 p-4">
              <div className="flex items-start justify-between">
                <p className="font-medium">{v.name}</p>
                <Badge variant="outline">{v.category}</Badge>
              </div>
              {v.rating && (
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < v.rating! ? 'fill-gold-400 text-gold-400' : 'text-muted-foreground'}`} />
                  ))}
                </div>
              )}
              <p className="text-sm text-muted-foreground">Advance: {formatCurrency(v.advance_paid)} · Balance: {formatCurrency(v.balance)}</p>
              {v.phone && (
                <a href={whatsappLink(v.phone, `Hi ${v.name}, following up regarding Saba & Adil's wedding.`)} target="_blank" className="flex items-center gap-1 text-sm text-emerald-600 hover:underline">
                  <MessageCircle className="h-3.5 w-3.5" /> Contact on WhatsApp
                </a>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
