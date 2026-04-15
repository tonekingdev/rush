'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ComingSoon() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <motion.h2
          className="mt-6 text-center text-3xl font-extrabold text-gray-900"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          We&apos;re in Closed Testing!
        </motion.h2>
        <motion.p
          className="mt-4 text-center text-base text-gray-600"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          R.U.S.H. is entering its final phase. We need your feedback to help us
          cross the finish line and launch on the public app stores.
        </motion.p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <p className="text-center font-semibold text-gray-700 mb-4">
              Join the testing team:
            </p>

            {/* Android Button */}
            <a
              href="https://play.google.com/store/apps/details?id=com.rushhealthc.rushhealthcare"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#A4C639] hover:bg-[#8eb02f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A4C639]"
            >
              Download for Android (Google Play)
            </a>

            {/* iOS Button */}
            <a
              href="https://testflight.apple.com/join/VEAVKDXH"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#007AFF] hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Download for iOS (TestFlight)
            </a>

            <p className="mt-4 text-xs text-center text-gray-500 italic">
              Android users: Please remember to leave a private review in the
              Play Store to help us go public!
            </p>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="mt-8 text-center space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div>
          <Link
            href="/survey/provider"
            className="text-[#1586D6] hover:text-blue-500 font-medium"
          >
            Sign up as a healthcare professional
          </Link>
        </div>
        <div>
          <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
