'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import { createClient } from '@/lib/supabase/client';

interface Result { type: string; id: string; label: string; sub?: string; href: string }

export function GlobalSearch() {
  const supabase = createClient();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (timeout.current) clearTimeout(timeout.current);
    if (query.trim().length < 2) { setResults([]); return; }
    timeout.current = setTimeout(async () => {
      const [tasks, guests, vendors] = await Promise.all([
        supabase.from('tasks').select('id, name').ilike('name', `%${query}%`).limit(5),
        supabase.from('guests').select('id, full_name').ilike('full_name', `%${query}%`).limit(5),
        supabase.from('vendors').select('id, name, category').ilike('name', `%${query}%`).limit(5),
      ]);
      const combined: Result[] = [
        ...(tasks.data ?? []).map((t) => ({ type: 'Task', id: t.id, label: t.name, href: '/tasks' })),
        ...(guests.data ?? []).map((g) => ({ type: 'Guest', id: g.id, label: g.full_name, href: '/guests' })),
        ...(vendors.data ?? []).map((v) => ({ type: 'Vendor', id: v.id, label: v.name, sub: v.category, href: '/vendors' })),
      ];
      setResults(combined);
      setOpen(combined.length > 0);
    }, 250);
  }, [query, supabase]);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Anchor asChild>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, guests, vendors..."
            className="h-10 w-full rounded-xl border border-gold-300/30 bg-muted/40 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </Popover.Anchor>
      <Popover.Portal>
        <Popover.Content align="start" sideOffset={8} onOpenAutoFocus={(e) => e.preventDefault()} className="z-50 w-80 rounded-2xl border border-gold-300/30 bg-popover p-2 shadow-gold">
          {results.map((r) => (
            <button
              key={`${r.type}-${r.id}`}
              onClick={() => { router.push(r.href); setOpen(false); setQuery(''); }}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
            >
              <span>{r.label} {r.sub && <span className="text-muted-foreground">· {r.sub}</span>}</span>
              <span className="text-xs text-gold-600">{r.type}</span>
            </button>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
