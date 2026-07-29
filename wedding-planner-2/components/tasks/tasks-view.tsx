'use client';

import { useEffect, useState } from 'react';
import { Plus, LayoutGrid, Table2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskBoard } from '@/components/tasks/task-board';
import { TaskTable } from '@/components/tasks/task-table';
import { TaskFormDialog } from '@/components/tasks/task-form-dialog';
import { fireGoldConfetti } from '@/lib/confetti';
import type { Profile, Task, WeddingEvent } from '@/types/database';

export function TasksView({
  initialTasks, events, profiles, eventId,
}: {
  initialTasks: any[];
  events: WeddingEvent[];
  profiles: Profile[];
  eventId?: string;
}) {
  const supabase = createClient();
  const [tasks, setTasks] = useState<any[]>(initialTasks);
  const [view, setView] = useState<'kanban' | 'table'>('kanban');
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    const channel = supabase
      .channel('tasks-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        if (payload.eventType === 'INSERT') setTasks((prev) => [...prev, payload.new as Task]);
        if (payload.eventType === 'UPDATE') setTasks((prev) => prev.map((t) => (t.id === (payload.new as Task).id ? { ...t, ...payload.new } : t)));
        if (payload.eventType === 'DELETE') setTasks((prev) => prev.filter((t) => t.id !== (payload.old as Task).id));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  const filteredTasks = eventId ? tasks.filter((t) => t.event_id === eventId) : tasks;

  async function updateStatus(taskId: string, status: string) {
    const completion = status === 'Completed' ? 100 : undefined;
    await supabase.from('tasks').update({ status, ...(completion !== undefined ? { completion } : {}) }).eq('id', taskId);

    if (status === 'Completed' && eventId) {
      // Milestone confetti: only when this was the last remaining task for the event
      const scopeTasks = tasks.filter((t) => t.event_id === eventId);
      const stillPending = scopeTasks.filter((t) => t.id !== taskId && t.status !== 'Completed' && t.status !== 'Cancelled').length;
      if (stillPending === 0 && scopeTasks.length > 0) fireGoldConfetti();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Tasks</h1>
          <p className="text-sm text-muted-foreground">{filteredTasks.length} tasks</p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={view} onValueChange={(v) => setView(v as any)}>
            <TabsList>
              <TabsTrigger value="kanban"><LayoutGrid className="mr-1.5 h-3.5 w-3.5" />Kanban</TabsTrigger>
              <TabsTrigger value="table"><Table2 className="mr-1.5 h-3.5 w-3.5" />Table</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="gold" onClick={() => setFormOpen(true)}><Plus className="h-4 w-4" /> New Task</Button>
        </div>
      </div>

      {view === 'kanban' ? (
        <TaskBoard tasks={filteredTasks} profiles={profiles} onStatusChange={updateStatus} />
      ) : (
        <TaskTable tasks={filteredTasks} profiles={profiles} />
      )}

      <TaskFormDialog open={formOpen} onOpenChange={setFormOpen} events={events} profiles={profiles} defaultEventId={eventId} />
    </div>
  );
}
