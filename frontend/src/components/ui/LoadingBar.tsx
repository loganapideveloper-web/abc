'use client';

import dynamic from 'next/dynamic';

const LoadingBarComponent = dynamic(
  () => import('./LoadingBarInner'),
  { ssr: false }
);

export function LoadingBar() {
  return <LoadingBarComponent />;
}
