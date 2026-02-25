export async function generateStaticParams() {
  return [{ mode: 'test' }, { mode: 'live' }];
}

import { Suspense } from 'react';
import StripeErrorClient from './StripeErrorClient';

export default function StripeErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StripeErrorClient />
    </Suspense>
  );
}
