'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TasksView } from '@/components/tasks/tasks-view';
import { ShoppingListView } from '@/components/shopping/shopping-list-view';
import { BudgetView } from '@/components/budget/budget-view';
import { EVENT_THEMES, formatCurrency, cn } from '@/lib/utils';
import type { WeddingEvent } from '@/types/database';

export function EventHub({
  event, tasks, shopping, budgetCategories, budgetExpenses, profiles, notes, events,
}: {
  event: WeddingEvent;
  tasks: any[];
  shopping: any[];
  budgetCategories: any[];
  budgetExpenses: any[];
  profiles: any[];
  notes: any[];
  events: WeddingEvent[];
}) {
  const supabase = createClient();
  const router = useRouter();
  const [noteText, setNoteText] = useState('');
  const [localNotes, setLocalNotes] = useState(notes);
  const theme = EVENT_THEMES[event.color_theme] ?? EVENT_THEMES.custom;

  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const completion = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const totalBudget = budgetCategories.reduce((s, c) => s + Number(c.planned_amount), 0);
  const totalSpent = budgetExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const purchased = shopping.filter((s) => s.is_purchased).length;

  async function addNote() {
    if (!noteText.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase.from('quick_notes').insert({ event_id: event.id, author_id: user?.id, body: noteText }).select('*, profiles(full_name)').single();
    if (data) { setLocalNotes([data, ...localNotes]); setNoteText(''); }
  }

  return (
    <div className="space-y-6">
      <div className={cn('rounded-2xl bg-gradient-to-br p-6 text-white sm:p-8', theme.gradient)}>
        <p className="text-xs uppercase tracking-widest opacity-80">{event.event_date ?? 'Date TBD'}</p>
        <h1 className={cn('font-display text-3xl font-bold', theme.text)}>{event.name}</h1>
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div><p className="text-2xl font-bold">{completion}%</p><p className="opacity-80">Complete</p></div>
          <div><p className="text-2xl font-bold">{purchased}/{shopping.length}</p><p className="opacity-80">Shopping</p></div>
          <div><p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p><p className="opacity-80">Spent of {formatCurrency(totalBudget)}</p></div>
        </div>
      </div>

      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="shopping">Shopping</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <TasksView initialTasks={tasks} events={events} profiles={profiles} eventId={event.id} />
        </TabsContent>

        <TabsContent value="shopping">
          <ShoppingListView initialItems={shopping} profiles={profiles} eventId={event.id} />
        </TabsContent>

        <TabsContent value="budget">
          <BudgetView categories={budgetCategories} expenses={budgetExpenses} eventId={event.id} />
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader><CardTitle className="text-base">Quick Notes</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Add a quick note..." onKeyDown={(e) => e.key === 'Enter' && addNote()} />
                <Button variant="gold" onClick={addNote}>Add</Button>
              </div>
              {localNotes.map((n) => (
                <div key={n.id} className="rounded-xl border border-gold-300/20 p-3 text-sm">
                  <p>{n.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{n.profiles?.full_name} · {new Date(n.created_at).toLocaleString()}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
