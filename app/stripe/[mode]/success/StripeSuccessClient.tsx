'use client';

import { FadeInView } from '@/app/components/FadeInView';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function StripeSuccessClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const mode = params.mode as string;
  const accountId = searchParams.get('account_id');

  const APP_SCHEME = `rushfrontend://(provider)/stripe-connect?success=true&mode=${mode}&account_id=${accountId}`;

  // Redirects to App after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = APP_SCHEME;
    }, 3000);

    return () => clearTimeout(timer);
  }, [APP_SCHEME]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 shadow-xl rounded-2xl border-t-8 border-[#5d6d7a]">
          <FadeInView>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-6 bg-[#d6dbdc]">
                <svg
                  className="h-10 w-10 text-[#5d6d7a]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h2 className="text-3xl font-bold text-[#5d6d7a] font-poppins tracking-tight">
                Stripe Connected!
              </h2>

              <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#d6dbdc] text-[#5d6d7a]">
                {mode === 'live' ? '🔴 Live Mode' : '🟢 Test Mode'}
              </div>

              <p className="mt-3 text-base text-gray-600">
                Your payment account has been successfully linked.
              </p>

              <div className="mt-8 p-5 bg-[#d6dbdc]/20 rounded-xl border border-[#d6dbdc]">
                <p className="text-sm text-[#5d6d7a] font-semibold uppercase tracking-wider">
                  Return to App
                </p>
                <p className="mt-2 text-xs text-[#5d6d7a]/70 leading-relaxed">
                  You&apos;ll be automatically redirected back to the app in 3
                  seconds...
                </p>
              </div>

              <div className="mt-8">
                <a
                  href={APP_SCHEME}
                  className="w-full inline-flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-md text-base font-bold text-white bg-[#5d6d7a] hover:bg-[#4a5a67] active:scale-95 transition-all"
                >
                  Return to App Now
                </a>
              </div>

              <p className="mt-10 text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em]">
                R.U.S.H. Team
              </p>
            </div>
          </FadeInView>
        </div>
      </div>
    </div>
  );
}
