'use client';

import { useEffect, useState } from 'react';
import { Search, Moon, Sun, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { NotificationCenter } from '@/components/dashboard/notification-center';
import { GlobalSearch } from '@/components/dashboard/global-search';
import type { Profile } from '@/types/database';

export function Topbar({ profile }: { profile: Profile | null }) {
  const router = useRouter();
  const supabase = createClient();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDark(isDark);
  }, []);

  function toggleDark() {
    document.documentElement.classList.toggle('dark');
    setDark(!dark);
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  const initials = profile?.full_name?.split(' ').map((n) => n[0]).slice(0, 2).join('') ?? '?';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gold-300/20 bg-background/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="hidden max-w-sm flex-1 sm:block">
        <GlobalSearch />
      </div>
      <div className="flex-1 sm:hidden" />

      <Button variant="ghost" size="icon" onClick={toggleDark} aria-label="Toggle theme">
        {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>

      <NotificationCenter userId={profile?.id} />

      <Avatar>
        <AvatarFallback>{initials.toUpperCase()}</AvatarFallback>
      </Avatar>

      <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
        <LogOut className="h-4 w-4" />
      </Button>
    </header>
  );
}
