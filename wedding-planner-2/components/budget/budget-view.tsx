'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';

const COLORS = ['#0B0B0C', '#4a3b1a', '#a86f18', '#D4AF37', '#F2D98E', '#e0a92f'];

export function BudgetView({ categories, expenses, eventId }: { categories: any[]; expenses: any[]; eventId?: string }) {
  const supabase = createClient();
  const [localExpenses, setLocalExpenses] = useState(expenses);
  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '');
  const [vendorName, setVendorName] = useState('');
  const [amount, setAmount] = useState('');
  const [isAdvance, setIsAdvance] = useState(false);

  const chartData = categories.map((c) => {
    const spent = localExpenses.filter((e) => e.category_id === c.id).reduce((s, e) => s + Number(e.amount), 0);
    return { name: c.name, planned: Number(c.planned_amount), spent };
  });

  const pieData = chartData.filter((c) => c.spent > 0).map((c) => ({ name: c.name, value: c.spent }));
  const totalPlanned = categories.reduce((s, c) => s + Number(c.planned_amount), 0);
  const totalSpent = localExpenses.reduce((s, e) => s + Number(e.amount), 0);

  async function addExpense() {
    if (!amount) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase.from('budget_expenses').insert({
      category_id: categoryId || null, event_id: eventId ?? null, vendor_name: vendorName,
      amount: Number(amount), is_advance: isAdvance, created_by: user?.id,
    }).select().single();
    if (data) { setLocalExpenses([...localExpenses, data]); setAmount(''); setVendorName(''); setOpen(false); }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Planned</p><p className="text-xl font-bold">{formatCurrency(totalPlanned)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Spent</p><p className="text-xl font-bold">{formatCurrency(totalSpent)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Remaining</p><p className="text-xl font-bold">{formatCurrency(totalPlanned - totalSpent)}</p></CardContent></Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Planned vs Spent</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="planned" fill="#4a3b1a" radius={[6, 6, 0, 0]} />
                <Bar dataKey="spent" fill="#D4AF37" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Spend Distribution</CardTitle></CardHeader>
          <CardContent className="h-64">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground">No expenses logged yet.</p>}
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Expense History</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button variant="gold" size="sm"><Plus className="h-4 w-4" /> Log Expense</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Log Expense</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Vendor / description</Label><Input value={vendorName} onChange={(e) => setVendorName(e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Amount (₹)</Label><Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isAdvance} onChange={(e) => setIsAdvance(e.target.checked)} /> This is an advance payment</label>
              <Button variant="gold" className="w-full" onClick={addExpense}>Save Expense</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-2">
        {localExpenses.map((e) => (
          <div key={e.id} className="flex items-center justify-between rounded-xl border border-gold-300/20 p-3 text-sm">
            <div>
              <p className="font-medium">{e.vendor_name || 'Expense'}</p>
              <p className="text-xs text-muted-foreground">{e.paid_on} {e.is_advance && '· Advance'}</p>
            </div>
            <p className="font-semibold">{formatCurrency(e.amount)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
