'use client';

import { DndContext, DragEndEvent, useDroppable } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn, getTaskUrgency, URGENCY_COLORS } from '@/lib/utils';
import type { Profile } from '@/types/database';

const COLUMNS = ['Not Started', 'In Progress', 'Waiting', 'Blocked', 'Completed', 'Cancelled'] as const;

const PRIORITY_BADGE: Record<string, 'destructive' | 'gold' | 'outline' | 'success'> = {
  Critical: 'destructive',
  High: 'gold',
  Medium: 'outline',
  Low: 'success',
};

export function TaskBoard({
  tasks, profiles, onStatusChange,
}: {
  tasks: any[];
  profiles: Profile[];
  onStatusChange: (taskId: string, status: string) => void;
}) {
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const newStatus = over.id as string;
    const taskId = active.id as string;
    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== newStatus) onStatusChange(taskId, newStatus);
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="grid grid-flow-col auto-cols-[260px] gap-4 overflow-x-auto pb-4 sm:auto-cols-[280px]">
        {COLUMNS.map((col) => (
          <Column key={col} id={col} tasks={tasks.filter((t) => t.status === col)} profiles={profiles} />
        ))}
      </div>
    </DndContext>
  );
}

function Column({ id, tasks, profiles }: { id: string; tasks: any[]; profiles: Profile[] }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={cn('flex flex-col rounded-2xl border border-gold-300/20 bg-muted/30 p-3 transition-colors', isOver && 'bg-gold-100/40 dark:bg-gold-900/20')}>
      <div className="mb-3 flex items-center justify-between px-1">
        <p className="text-sm font-semibold">{id}</p>
        <Badge variant="outline">{tasks.length}</Badge>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {tasks.map((task) => <TaskCard key={task.id} task={task} profiles={profiles} />)}
      </div>
    </div>
  );
}

function TaskCard({ task, profiles }: { task: any; profiles: Profile[] }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
  const urgency = getTaskUrgency(task.due_date, task.status);
  const urgencyColor = URGENCY_COLORS[urgency];

  const assigneeIds: string[] = (task.task_assignees ?? []).map((a: any) => a.profile_id);
  const assignees = profiles.filter((p) => assigneeIds.includes(p.id));

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 50 } : undefined}
      className={cn('cursor-grab active:cursor-grabbing', isDragging && 'opacity-60')}
    >
      <Card className="gold-border-hover">
        <CardContent className="space-y-2 p-3">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium leading-snug">{task.name}</p>
            <Badge variant={PRIORITY_BADGE[task.priority]}>{task.priority}</Badge>
          </div>
          {task.due_date && (
            <p className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium', urgencyColor.bg, urgencyColor.text)}>
              <span className={cn('h-1.5 w-1.5 rounded-full', urgencyColor.dot)} />
              Due {task.due_date}
            </p>
          )}
          {assignees.length > 0 && (
            <div className="flex -space-x-2">
              {assignees.map((a) => (
                <Avatar key={a.id} className="h-6 w-6 border-2 border-background">
                  <AvatarFallback className="text-[9px]">{a.full_name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
