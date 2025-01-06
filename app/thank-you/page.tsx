import React from 'react'
import Link from 'next/link'

const ThankYouPage = () => {
  return (
    <div className="max-w-md mx-auto mt-10 text-center">
      <h1 className="text-2xl font-bold mb-5">Thank You!</h1>
      <p className="mb-5">Your survey has been submitted successfully. We appreciate your interest in RUSH Healthcare.</p>
      <Link href="/" className="text-blue-500 hover:underline">
        Return to Home
      </Link>
    </div>
  )
}

export default ThankYouPage

