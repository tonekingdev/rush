import React from 'react'
import { FadeInView } from '../components/FadeInView'
import { FaUserMd, FaUsers } from 'react-icons/fa'
import Link from 'next/link'

const SurveyPage = () => {
  return (
    <div>
        <section className="max-w-5xl mx-auto py-21 text-center">
            <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <FadeInView>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 font-poppins">
                            RUSH Healthcare Platform
                        </h2>
                        <p className="mt-2 text-xl text-gray-600">
                            Thank you for choosing RUSH for your on-demand healthcare service.
                        </p>
                    </FadeInView>
                    <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FadeInView>
                            <div className="flex flex-col items-center">
                                <div className="p-4 bg-blue-100 rounded-full">
                                    <FaUsers className='text-4xl text-[#1586d6]' />
                                </div>
                                <h3 className="mt-4 text-xl font-semibold">
                                    Get Immediate Care
                                </h3>
                                <Link
                                    href='/survey/patient'
                                    className='px-6 py-3 mt-4 shadow-md bg-white text-[#1586d6] rounded-full text-lg font-semibold hover:bg-blue-200 duration-500'
                                >
                                    Sign Up
                                </Link>
                            </div>
                        </FadeInView>
                        <FadeInView>
                            <div className="flex flex-col items-center">
                                <div className="p-4 bg-green-100 rounded-full">
                                    <FaUserMd className='text-4xl text-green-600' />
                                </div>
                                <h3 className="mt-4 text-xl font-semibold">
                                    Become a Provider
                                </h3>
                                <Link
                                    href='/survey/provider'
                                    className='px-6 py-3 mt-4 shadow-md bg-white text-[#1586d6] rounded-full text-lg font-semibold hover:bg-blue-200 duration-500'
                                >
                                    Sign Up
                                </Link>
                            </div>
                        </FadeInView>
                    </div>
                </div>
            </div>
        </section>
    </div>
  )
}

export default SurveyPage