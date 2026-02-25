export async function generateStaticParams() {
  return [{ mode: 'test' }, { mode: 'live' }];
}

import { Suspense } from 'react';
import StripeSuccessClient from './StripeSuccessClient';

export default function StripeSuccessPage() {
  <Suspense fallback={<div>Loading...</div>}>
    <StripeSuccessClient />
  </Suspense>;
}
