import { Suspense } from 'react';
import StripeCallbackClient from './CallbackClient';

export async function generateStaticParams() {
  return [{ mode: 'test' }, { mode: 'live' }];
}

export default function StripeCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StripeCallbackClient />
    </Suspense>
  );
}
