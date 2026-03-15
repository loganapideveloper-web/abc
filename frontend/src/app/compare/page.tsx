'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Compare page removed - redirect to homepage
export default function ComparePage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
    </div>
  );
}
