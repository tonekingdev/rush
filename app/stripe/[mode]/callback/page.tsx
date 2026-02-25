export async function generateStaticParams() {
  return [{ mode: 'test' }, { mode: 'live' }];
}

import { Suspense } from 'react';
import StripeCallbackClient from './CallbackClient';

export default function StripeCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StripeCallbackClient />
    </Suspense>
  );
}
