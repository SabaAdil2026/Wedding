'use client';

import { Badge } from '@/components/ui/badge';
import { cn, getTaskUrgency, URGENCY_COLORS } from '@/lib/utils';
import type { Profile } from '@/types/database';

export function TaskTable({ tasks, profiles }: { tasks: any[]; profiles: Profile[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gold-300/20">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Task</th>
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Due Date</th>
            <th className="px-4 py-3">Urgency</th>
            <th className="px-4 py-3">Assigned</th>
            <th className="px-4 py-3">Completion</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const urgency = getTaskUrgency(task.due_date, task.status);
            const uc = URGENCY_COLORS[urgency];
            const assigneeIds: string[] = (task.task_assignees ?? []).map((a: any) => a.profile_id);
            const assignees = profiles.filter((p) => assigneeIds.includes(p.id));
            return (
              <tr key={task.id} className="border-t border-gold-300/10 hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{task.name}</td>
                <td className="px-4 py-3"><Badge variant="outline">{task.priority}</Badge></td>
                <td className="px-4 py-3">{task.status}</td>
                <td className="px-4 py-3">{task.due_date ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs', uc.bg, uc.text)}>
                    <span className={cn('h-1.5 w-1.5 rounded-full', uc.dot)} /> {urgency}
                  </span>
                </td>
                <td className="px-4 py-3">{assignees.map((a) => a.full_name).join(', ') || '—'}</td>
                <td className="px-4 py-3">{task.completion}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
