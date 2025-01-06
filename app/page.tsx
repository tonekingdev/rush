import Link from 'next/link'
import Image from 'next/image'
import { FaSearch } from 'react-icons/fa'
import { TbUserHeart } from 'react-icons/tb'
import { RiCoinsLine, RiHomeHeartLine, RiMoneyDollarCircleLine, RiSecurePaymentLine } from 'react-icons/ri'
import { IoTimeOutline } from 'react-icons/io5'
import { LuCalendarCheck, LuShieldCheck } from 'react-icons/lu'
import { FadeInView } from './components/FadeInView'
import { SlideInView } from './components/SlideInView'
import { DropInView } from './components/DropInView'

export default function Home() {
  return (
    <main>
      <section id='hero' className="bg-gray-100 py-16">
        <div className="grid md:grid-cols-2 grid-cols-1 max-w-5xl mx-auto items-center gap-3">
          <div className="max-w-5xl mx-auto px-4">
            <FadeInView>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 font-poppins">On-Demand Healthcare, Right to Your Doorstep</h1>
            </FadeInView>
            <FadeInView>
              <p className="mt-4 text-lg text-gray-600">Connecting you with certified healthcare professionals for in-home care - fast, safe, and convenient.</p>
              <div className="mt-6 flex justify-center space-x-4">
                <Link 
                  href="/comingsoon" 
                  className="px-4 py-2 bg-[#1586D6] text-white rounded-full text-base font-semibold relative overflow-hidden group whitespace-nowrap"
                >
                  <span className="relative z-10 transition-transform duration-650 ease-in-out group-hover:-translate-y-full block">
                    Get Immediate Care
                  </span>
                  <span className="absolute inset-0 bg-blue-600 flex items-center justify-center transition-transform duration-650 ease-in-out translate-y-full group-hover:translate-y-0">
                    Get Started →
                  </span>
                </Link>
                <Link 
                  href="/survey/provider"
                  className='px-4 py-2 bg-white text-[#1586D6] border border-[#1586D6] rounded-full text-base font-semibold relative overflow-hidden group whitespace-nowrap'
                >
                  <span className="relative z-10 transition-transform duration-650 ease-in-out group-hover:-translate-y-full block">
                    Become a Provider
                  </span>
                  <span className="absolute inset-0 bg-gray-200 flex items-center justify-center transition-transform duration-650 ease-in-out translate-y-full group-hover:translate-y-0">
                    Sign Up
                  </span>
                </Link>
              </div>
            </FadeInView>
          </div>
          <SlideInView>
            <Image 
              src="/img/landing.jpg" 
              alt="Healthcare professional" 
              width={500} 
              height={500} 
              className="rounded-lg shadow-lg"
            />
          </SlideInView>
        </div>
      </section>
      
      {/* How it works section */}
      <section id="how-it-works" className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <DropInView>
            <h2 className='text-3xl font-bold font-poppins text-gray-800'>How RUSH Works</h2>
          </DropInView>
          <FadeInView>
            <p className='mt-2 text-gray-600'>Getting quality healthcare at home is just a few clicks away.</p>
          </FadeInView>
          <FadeInView>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="flex flex-col items-center">
                <div className="p-4 bg-blue-100 rounded-full">
                  <FaSearch 
                    className='text-4xl text-[#1586D6]'
                  />
                </div>
                <h3 className="mt-4 text-xl font-semibold">Search for Care</h3>
                <p className="text-gray-600 mt-2">
                  Browse available services tailored to your health needs.
                </p>
              </div>
              {/* Step 2 */}
              <div className="flex flex-col items-center">
                <div className="p-4 bg-green-100 rounded-full">
                  <TbUserHeart 
                    className='text-4xl text-green-600'
                  />
                </div>
                <h3 className="mt-4 text-xl font-semibold">Select a Professional</h3>
                <p className="text-gray-600 mt-2">
                  Choose from verified and certified healthcare providers.
                </p>
              </div>
              {/* Step 3 */}
              <div className="flex flex-col items-center">
                <div className="p-4 bg-yellow-100 rounded-full">
                  <RiHomeHeartLine 
                    className='text-4xl text-yellow-500'
                  />
                </div>
                <h3 className="mt-4 text-xl font-semibold">Receive Care at Home</h3>
                <p className="text-gray-600 mt-2">
                  Enjoy quality healthcare right at your doorstep.
                </p>
              </div>
            </div>
          </FadeInView>
        </div>
      </section>

      {/* Benefits section */}
      <section id="benefits" className="bg-gray-100 py-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <DropInView>
            <h2 className='text-3xl font-bold font-poppins text-gray-800'>Why Choose RUSH</h2>
          </DropInView>
          <FadeInView>
            <p className='mt-2 text-gray-600'>
              Experience healthcare that&apos;s convenient, reliable, and affordable.
            </p>
            <div className='mt-12 grid grid-cols-1 md:grid-cols-3 gap-8'>
              {/* Benefit 1 */}
              <div className="flex flex-col items-center">
                <div className="p-4 bg-blue-100 rounded-full">
                  <IoTimeOutline 
                    className='text-4xl text-[#1586D6]'
                  />
                </div>
                <h3 className="mt-4 text-xl font-semibold">Convenience</h3>
                <p className="text-gray-600 mt-2">
                  Get non-emergency healthcare services from the comfort of your home.
                </p>
              </div>
              {/* Benefit 2 */}
              <div className="flex flex-col items-center">
                <div className="p-4 bg-green-100 rounded-full">
                  <LuShieldCheck 
                    className='text-4xl text-green-600'
                  />
                </div>
                <h3 className="mt-4 text-xl font-semibold">
                  Quality Care
                </h3>
                <p className="text-gray-600 mt-2">
                  Certified and trusted healthcare professionals to ensure your well-being.
                </p>
              </div>
              {/* Benefit 3 */}
              <div className="flex flex-col items-center">
                <div className="p-4 bg-yellow-100 rounded-full">
                  <RiMoneyDollarCircleLine 
                    className='text-4xl text-yellow-500'
                  />
                </div>
                <h3 className="mt-4 text-xl font-semibold">
                  Flexible Payment
                </h3>
                <p className="text-gray-600 mt-2">
                  Affordable options with or without insurance.
                </p>
              </div>
            </div>
          </FadeInView>
        </div>
      </section>
      
      {/* For Professionals section */}
      <section id="for-professionals" className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <DropInView>
            <h2 className='text-3xl font-bold font-poppins text-gray-800'>
              For Healthcare Professionals
            </h2>
          </DropInView>
          <FadeInView>
            <p className='mt-2 text-gray-600'>
              Empowering you to provide care on your own terms.
            </p>
          </FadeInView>
          <FadeInView>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="flex flex-col items-center">
                <div className="p-4 bg-blue-100 rounded-full">
                  <LuCalendarCheck 
                    className='text-4xl text-[#1586D6]'
                  />
                </div>
                <h3 className="mt-4 text-xl font-semibold">
                  Flexible Scheduling
                </h3>
                <p className="text-gray-600 mt-2">
                  Work when and where you want, on your own terms.
                </p>
              </div>
              {/* Feature 2 */}
              <div className="flex flex-col items-center">
                <div className="p-4 bg-green-100 rounded-full">
                  <RiCoinsLine 
                    className='text-4xl text-green-600'
                  />
                </div>
                <h3 className="mt-4 text-xl font-semibold">
                  Extra Income
                </h3>
                <p className="text-gray-600 mt-2">
                  Earn more by providing quality at-home healthcare services.
                </p>
              </div>
              {/* Feature 3 */}
              <div className="flex flex-col items-center">
                <div className="p-4 bg-yellow-100 rounded-full">
                  <RiSecurePaymentLine 
                    className='text-4xl text-yellow-500'
                  />
                </div>
                <h3 className="mt-4 text-xl font-semibold">
                  Quick Payouts
                </h3>
                <p className="text-gray-600 mt-2">
                  Fast and secure payouts for your services.
                </p>
              </div>
            </div>
          </FadeInView>
        </div>
      </section>

      {/* Compliance section */}
      <section id="compliance" className="bg-gray-100 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <DropInView>
            <h2 className='text-2xl font-bold font-poppins text-gray-800'>Regulatory Compliance and Security</h2>
          </DropInView>
          <FadeInView>
            <p className='mt-4 text-gray-600'>
              We prioritize your privacy and data security. RUSH is fully HIPAA compliant, ensuring your personal information is protected.
            </p>
          </FadeInView>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#1586D6]">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <DropInView>
            <h2 className='text-3xl font-bold text-white font-poppins'>
              Get Started with RUSH Today
            </h2>
          </DropInView>
          <FadeInView>
            <p className='mt-2 text-blue-200'>
              Revolutionize your healthcare experience. Join RUSH for on-demand care at your doorstep.
            </p>
          </FadeInView>
          <div className="mt-6">
            <FadeInView>
              <div className="space-x-4 space-y-4 md:space-y-0 flex flex-col md:flex-row justify-center">
                <Link
                  href='/comingsoon'
                  className='px-6 py-3 bg-white text-[#1586d6] rounded-full font-semibold hover:bg-blue-50 duration-500'
                >
                  Download on App Store
                </Link>
                <Link
                  href='/comingsoon'
                  className='px-6 py-3 bg-white text-[#1586d6] rounded-full font-semibold hover:bg-blue-50 duration-500'
                >
                  Get it on Google Play
                </Link>
              </div>
            </FadeInView>
          </div>
        </div>
      </section>
    </main>
  )
}
