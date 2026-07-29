import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gold-gradient p-6 text-center text-gold-50">
      <Heart className="h-8 w-8 fill-gold-400 text-gold-400" />
      <h1 className="font-display text-3xl font-bold">Page not found</h1>
      <p className="text-gold-200/80">This part of the celebration hasn't been planned yet.</p>
      <Link href="/dashboard" className="rounded-xl bg-gold-gradient px-5 py-2.5 text-sm font-semibold shadow-gold hover:shadow-goldhover">
        Back to Dashboard
      </Link>
    </div>
  );
}
