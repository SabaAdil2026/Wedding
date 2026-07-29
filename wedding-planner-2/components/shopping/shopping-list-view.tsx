'use client';

import { useState } from 'react';
import { Plus, CheckCircle2, Circle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatCurrency, cn } from '@/lib/utils';
import type { Profile } from '@/types/database';

const CATEGORIES = ['Clothes', 'Jewelry', 'Decorations', 'Flowers', 'Food', 'Return Gifts', 'Wedding Cards', 'Stage', 'Lighting', 'Other'];

export function ShoppingListView({ initialItems, profiles, eventId }: { initialItems: any[]; profiles: Profile[]; eventId?: string }) {
  const supabase = createClient();
  const [items, setItems] = useState(initialItems);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [budget, setBudget] = useState('');
  const [quantity, setQuantity] = useState('1');

  async function addItem() {
    if (!name.trim()) return;
    const { data } = await supabase.from('shopping_items').insert({
      event_id: eventId ?? null, name, category, quantity: Number(quantity) || 1, budget: Number(budget) || 0,
    }).select().single();
    if (data) { setItems([...items, data]); setName(''); setBudget(''); setQuantity('1'); setOpen(false); }
  }

  async function togglePurchased(item: any) {
    const { data } = await supabase.from('shopping_items').update({ is_purchased: !item.is_purchased }).eq('id', item.id).select().single();
    if (data) setItems(items.map((i) => (i.id === item.id ? data : i)));
  }

  const totalBudget = items.reduce((s, i) => s + Number(i.budget), 0);
  const totalActual = items.reduce((s, i) => s + Number(i.actual_price ?? 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          Budget {formatCurrency(totalBudget)} · Spent {formatCurrency(totalActual)}
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button variant="gold" size="sm"><Plus className="h-4 w-4" /> Add Item</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Shopping Item</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5"><Label>Item name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 w-full rounded-xl border border-gold-300/30 bg-background px-3 text-sm">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5"><Label>Quantity</Label><Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></div>
              </div>
              <div className="space-y-1.5"><Label>Budget (₹)</Label><Input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} /></div>
              <Button variant="gold" className="w-full" onClick={addItem}>Add Item</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id} className={cn('gold-border-hover', item.is_purchased && 'opacity-60')}>
            <CardContent className="space-y-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium">{item.name}</p>
                <button onClick={() => togglePurchased(item)}>
                  {item.is_purchased ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                </button>
              </div>
              <Badge variant="outline">{item.category}</Badge>
              <p className="text-sm text-muted-foreground">Qty {item.quantity} · Budget {formatCurrency(item.budget)}</p>
              {item.actual_price != null && <p className="text-sm">Actual: {formatCurrency(item.actual_price)}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
