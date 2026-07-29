'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) setError(error.message);
      else router.push('/dashboard');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else router.push('/dashboard');
    }
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gold-gradient p-4">
      <div className="pointer-events-none absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,#D4AF37,transparent_45%),radial-gradient(circle_at_80%_80%,#D4AF37,transparent_40%)]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <div className="mb-3 flex items-center justify-center gap-2 text-gold-300">
            <Heart className="h-5 w-5 fill-gold-400" />
            <span className="text-xs uppercase tracking-widest">20 · 11 · 2026</span>
            <Heart className="h-5 w-5 fill-gold-400" />
          </div>
          <h1 className="font-display text-4xl font-bold text-gold-50 sm:text-5xl">
            Saba <span className="text-gold-400">&amp;</span> Adil
          </h1>
          <p className="mt-2 text-sm text-gold-200/80">Wedding Planning Dashboard</p>
        </div>

        <Card className="border-gold-400/30 bg-black/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-gold-50">
              {mode === 'signin' ? 'Welcome back' : 'Join the celebration'}
            </CardTitle>
            <CardDescription className="text-gold-200/70">
              {mode === 'signin' ? 'Sign in to continue planning.' : 'Create an account to help plan.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <Label className="text-gold-100">Full name</Label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required
                    className="border-gold-500/30 bg-white/5 text-gold-50 placeholder:text-gold-200/40" placeholder="Your name" />
                </div>
              )}
              <div className="space-y-1.5">
                <Label className="text-gold-100">Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="border-gold-500/30 bg-white/5 text-gold-50 placeholder:text-gold-200/40" placeholder="you@example.com" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-gold-100">Password</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                  className="border-gold-500/30 bg-white/5 text-gold-50 placeholder:text-gold-200/40" placeholder="••••••••" />
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <Button type="submit" variant="gold" size="lg" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === 'signin' ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            <button
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              className="mt-4 w-full text-center text-sm text-gold-200/70 hover:text-gold-100"
            >
              {mode === 'signin' ? "New here? Create an account" : 'Already have an account? Sign in'}
            </button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
