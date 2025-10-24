'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState, useRef } from 'react'
import Modal from '../components/Modal'

export default function ComingSoon() {
    const [message, setMessage] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const emailInputRef = useRef<HTMLInputElement>(null)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const form = e.currentTarget
        const emailInput = form.elements.namedItem('email') as HTMLInputElement
        const email = emailInput.value
        setMessage('Submitting...')

        try {
            const formData = new FormData()
            formData.append('email', email)

            const response = await fetch('/comingsoon_submit.php', {
                method: 'POST',
                body: formData,
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'An error occurred')
            }

            setMessage(data.message || 'Submission successful')
            setIsSubmitted(true)
            if (emailInputRef.current) {
                emailInputRef.current.value = ''
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
            setMessage(errorMessage)
            setIsModalOpen(true)
            console.error('Error:', error)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <motion.h2
                    className='mt-6 text-center text-3xl font-extrabold text-gray-900'
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    RUSH Platform Coming Soon
                </motion.h2>
                <motion.p
                    className='mt-2 text-center text-sm text-gray-600'
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2  }}
                >
                    We&apos;re working hard to bring you on-demand in-home healthcare.
                </motion.p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {!isSubmitted ? (
                        <motion.form
                            className='space-y-6'
                            onSubmit={handleSubmit}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email address
                                </label>
                                <div className="mt-1">
                                    <input 
                                        id='email'
                                        name='email'
                                        type='email'
                                        autoComplete='email'
                                        required
                                        ref={emailInputRef}
                                        className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type='submit'
                                    className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1586D6] hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                >
                                    Notify me when RUSH launches
                                </button>
                            </div>
                        </motion.form>
                    ) : (
                        <motion.div
                            className='space-y-6'
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <p className="text-center text-sm text-gray-600">{message}</p>
                            <Link href="/" className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1586D6] hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'>
                                Go Back Home
                            </Link>
                        </motion.div>
                    )}
                </div>
            </div>

            <motion.div
                className='mt-8 text-center'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
            >
                <Link href="/survey/provider" className='text-[#1586D6] hover:text-blue-500'>
                    Sign up as a healthcare professional
                </Link>
            </motion.div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
                <p className="text-sm text-gray-500">{message}</p>
            </Modal>
        </div>
    )
}