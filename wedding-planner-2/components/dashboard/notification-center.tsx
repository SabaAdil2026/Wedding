'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Notification } from '@/types/database';

export function NotificationCenter({ userId }: { userId: string | undefined }) {
  const supabase = createClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!userId) return;
    supabase.from('notifications').select('*').eq('profile_id', userId).order('created_at', { ascending: false }).limit(20)
      .then(({ data }) => setNotifications(data ?? []));

    const channel = supabase
      .channel('notifications-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `profile_id=eq.${userId}` }, (payload) => {
        setNotifications((prev) => [payload.new as Notification, ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase, userId]);

  const unread = notifications.filter((n) => !n.is_read).length;

  async function markAllRead() {
    if (!userId) return;
    await supabase.from('notifications').update({ is_read: true }).eq('profile_id', userId).eq('is_read', false);
    setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
  }

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content align="end" sideOffset={8} className="z-50 w-80 rounded-2xl border border-gold-300/30 bg-popover p-3 shadow-gold">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold">Notifications</p>
            {unread > 0 && <button onClick={markAllRead} className="text-xs text-gold-600 hover:underline">Mark all read</button>}
          </div>
          <div className="max-h-80 space-y-1 overflow-y-auto">
            {notifications.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">No notifications yet.</p>}
            {notifications.map((n) => (
              <div key={n.id} className={`rounded-xl p-2.5 text-sm ${!n.is_read ? 'bg-gold-100/50 dark:bg-gold-900/20' : ''}`}>
                <p className="font-medium">{n.title}</p>
                {n.body && <p className="text-xs text-muted-foreground">{n.body}</p>}
                <p className="mt-0.5 text-[10px] text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
