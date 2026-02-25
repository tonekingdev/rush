'use client';

import { FadeInView } from '@/app/components/FadeInView';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function StripeCallbackClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const mode = params.mode as string;
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>(
    'processing',
  );
  const [message, setMessage] = useState(
    'Processing your Stripe connection...',
  );

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        // Check if Stripe returned an error
        if (error) {
          console.error('[TK Development] Stripe OAuth error;', error);
          window.location.href = `/stripe/${mode}/error?error=${error}`;
          return;
        }

        // Verify required params are received
        if (!code || !state) {
          throw new Error('Missing required OAuth parameters');
        }

        setMessage('Exchanging authorization code...');

        const apiUrl = `https://api.rushhealthc.com/api/v1/stripe/oauth/callback`;

        // Send the code to the backend to exchange for tokens
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code, state }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error?.message || 'Failed to complete Stripe Connection',
          );
        }

        setStatus('success');
        setMessage('Connection successful! Redirecting...');

        // Success! Redirect to the success page with account_id
        setTimeout(() => {
          window.location.href = `/stripe/${mode}/success?account_id=${data.account_id}`;
        }, 1000);
      } catch (err) {
        console.error('[TK Development] Error in OAuth callback:', err);
        setStatus('error');
        const errorMessage =
          err instanceof Error ? err.message : 'connection_failed';
        setMessage(errorMessage);

        setTimeout(() => {
          window.location.href = `/stripe/${mode}/error?error=${errorMessage}`;
        }, 2000);
      }
    };

    handleCallback();
  }, [mode, searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-6">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 shadow-xl rounded-2xl border-t-8 border-[#5d6d7a]">
          <FadeInView>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[#d6dbdc] mb-6">
                <svg
                  className="h-10 w-10 text-[#5d6d7a] animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>

              <h2 className="text-3xl font-bold text-[#5d6d7a] font-poppins tracking-tight">
                {status === 'processing' && 'Connecting Stripe...'}
                {status === 'success' && 'Connected!'}
                {status === 'error' && 'Connection Failed'}
              </h2>

              <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#d6dbdc] text-[#5d6d7a]">
                {mode === 'live' ? '🔴 Live Mode' : '🟢 Test Mode'}
              </div>

              <p className="mt-3 text-base text-gray-600">{message}</p>

              <div className="mt-8 p-5 bg-[#d6dbdc]/20 rounded-xl border border-[#d6dbdc]">
                <p className="text-sm text-[#5d6d7a] font-semibold uppercase tracking-wider">
                  Please wait
                </p>
                <p className="mt-2 text-xs text-[#5d6d7a]/70 leading-relaxed">
                  You will be redirected automatically...
                </p>
              </div>
            </div>
          </FadeInView>
        </div>
      </div>
    </div>
  );
}
