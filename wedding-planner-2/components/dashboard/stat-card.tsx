import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function StatCard({
  label, value, icon: Icon, tone = 'default', suffix,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: 'default' | 'gold' | 'danger' | 'success';
  suffix?: string;
}) {
  const toneClasses = {
    default: 'bg-muted text-foreground',
    gold: 'bg-gold-gradient text-gold-50',
    danger: 'bg-red-500/10 text-red-600 dark:text-red-400',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  }[tone];

  return (
    <Card className="gold-border-hover">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', toneClasses)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-2xl font-bold tabular-nums">
            {value}
            {suffix && <span className="ml-1 text-sm font-medium text-muted-foreground">{suffix}</span>}
          </p>
          <p className="truncate text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
