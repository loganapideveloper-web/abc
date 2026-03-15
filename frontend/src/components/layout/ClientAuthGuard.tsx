'use client';

import dynamic from 'next/dynamic';

const AuthGuard = dynamic(() => import('./AuthGuard'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 text-lg font-bold text-white shadow-glow">
          A
        </div>
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    </div>
  ),
});

export default function ClientAuthGuard({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
