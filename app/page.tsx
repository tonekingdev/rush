import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { FaSearch, FaPhone, FaUserMd } from "react-icons/fa"
import { TbUserHeart } from "react-icons/tb"
import { RiCoinsLine, RiHomeHeartLine, RiMoneyDollarCircleLine, RiSecurePaymentLine } from "react-icons/ri"
import { IoTimeOutline } from "react-icons/io5"
import { LuCalendarCheck, LuShieldCheck } from "react-icons/lu"
import { FadeInView } from "./components/FadeInView"
import { SlideInView } from "./components/SlideInView"
import { DropInView } from "./components/DropInView"
import MaintenanceAlert from "./components/maintenance-alert"
import PricingSection from "./components/PricingSection"
import { Container } from "@/components/ui/container"

export const metadata: Metadata = {
  title: "On-Demand Home Healthcare Services",
  description:
    "Connect with certified healthcare professionals for in-home care. RUSH Healthcare provides fast, safe, and convenient on-demand medical services including nursing, physical therapy, and more.",
  openGraph: {
    title: "RUSH Healthcare - On-Demand Home Healthcare Services",
    description:
      "Connect with certified healthcare professionals for in-home care. Fast, safe, and convenient on-demand healthcare services.",
  },
}

export default function Home() {
  return (
    <>
      <MaintenanceAlert />
      <article>
        {/* Hero Section */}
        <section
          id="hero"
          className="bg-secondary py-16 dark:bg-card"
          aria-labelledby="hero-heading"
        >
          <Container size="default">
            <div className="grid items-center gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <FadeInView>
                  <h1
                    id="hero-heading"
                    className="text-balance font-heading text-4xl font-bold text-foreground md:text-5xl"
                  >
                    On-Demand Healthcare, Right to Your Doorstep
                  </h1>
                </FadeInView>
                <FadeInView>
                  <p className="text-lg text-muted-foreground">
                    Connecting you with certified healthcare professionals for
                    in-home care - fast, safe, and convenient.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-4 sm:justify-start">
                    <Link
                      href="/comingsoon"
                      className="group relative overflow-hidden whitespace-nowrap rounded-full bg-[#1586D6] px-4 py-2 text-base font-semibold text-white"
                    >
                      <span className="relative z-10 block transition-transform duration-650 ease-in-out group-hover:-translate-y-full">
                        Get Immediate Care
                      </span>
                      <span className="absolute inset-0 flex translate-y-full items-center justify-center bg-blue-600 transition-transform duration-650 ease-in-out group-hover:translate-y-0">
                        Get Started
                      </span>
                    </Link>
                    <Link
                      href="/survey/provider"
                      className="group relative overflow-hidden whitespace-nowrap rounded-full border border-[#1586D6] bg-background px-4 py-2 text-base font-semibold text-[#1586D6]"
                    >
                      <span className="relative z-10 block transition-transform duration-650 ease-in-out group-hover:-translate-y-full">
                        Become a Provider
                      </span>
                      <span className="absolute inset-0 flex translate-y-full items-center justify-center bg-secondary transition-transform duration-650 ease-in-out group-hover:translate-y-0">
                        Sign Up
                      </span>
                    </Link>
                  </div>
                  {/* NP Intake Portal Link */}
                  <div className="mt-4 flex items-center justify-center sm:justify-start">
                    <div className="flex items-center rounded-full bg-background px-4 py-2 shadow-sm dark:bg-card">
                      <FaUserMd
                        className="mr-2 text-[#1586D6]"
                        aria-hidden="true"
                      />
                      <span className="mr-2 text-foreground">
                        Nurse Practitioner Intake:
                      </span>
                      <a
                        href="/portal/np-intake"
                        className="text-sm font-medium text-[#1586D6] hover:underline"
                      >
                        Click Here
                      </a>
                    </div>
                  </div>
                  {/* Contact Phone */}
                  <div className="mt-4 flex items-center justify-center sm:justify-start">
                    <div className="flex items-center rounded-full bg-background px-4 py-2 shadow-sm dark:bg-card">
                      <FaPhone
                        className="mr-2 text-[#1586D6]"
                        aria-hidden="true"
                      />
                      <span className="mr-2 text-foreground">
                        Contact us at:
                      </span>
                      <a
                        href="tel:8006771790"
                        className="font-medium text-[#1586D6] hover:underline"
                      >
                        (800) 677-1790
                      </a>
                    </div>
                  </div>
                </FadeInView>
              </div>
              <SlideInView>
                <Image
                  src="/img/landing.jpg"
                  alt="Healthcare professional providing care to a patient at home"
                  width={500}
                  height={500}
                  className="rounded-lg shadow-lg"
                  priority
                />
              </SlideInView>
            </div>
          </Container>
        </section>

        {/* How It Works Section */}
        <section
          id="how-it-works"
          className="bg-background py-16"
          aria-labelledby="how-it-works-heading"
        >
          <Container size="default" className="text-center">
            <DropInView>
              <h2
                id="how-it-works-heading"
                className="font-heading text-3xl font-bold text-foreground"
              >
                How RUSH Works
              </h2>
            </DropInView>
            <FadeInView>
              <p className="mt-2 text-muted-foreground">
                Getting quality healthcare at home is just a few clicks away.
              </p>
            </FadeInView>
            <FadeInView>
              <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
                {/* Step 1 */}
                <div className="flex flex-col items-center">
                  <div className="rounded-full bg-blue-100 p-4 dark:bg-blue-900/30">
                    <FaSearch
                      className="text-4xl text-[#1586D6]"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-foreground">
                    Search for Care
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    Browse available services tailored to your health needs.
                  </p>
                </div>
                {/* Step 2 */}
                <div className="flex flex-col items-center">
                  <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/30">
                    <TbUserHeart
                      className="text-4xl text-green-600"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-foreground">
                    Select a Professional
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    Choose from verified and certified healthcare providers.
                  </p>
                </div>
                {/* Step 3 */}
                <div className="flex flex-col items-center">
                  <div className="rounded-full bg-yellow-100 p-4 dark:bg-yellow-900/30">
                    <RiHomeHeartLine
                      className="text-4xl text-yellow-500"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-foreground">
                    Receive Care at Home
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    Enjoy quality healthcare right at your doorstep.
                  </p>
                </div>
              </div>
              <div className="mx-auto mt-6 flex flex-col items-center justify-center">
                <Link
                  href="/videos/demo"
                  className="group relative overflow-hidden whitespace-nowrap rounded-full border border-[#1586D6] bg-background px-4 py-2 text-base font-semibold text-[#1586D6]"
                >
                  <span className="relative z-10 block transition-transform duration-650 ease-in-out group-hover:-translate-y-full">
                    See Demo
                  </span>
                  <span className="absolute inset-0 flex translate-y-full items-center justify-center bg-[#1586D6] text-white transition-transform duration-650 ease-in-out group-hover:translate-y-0">
                    Watch video
                  </span>
                </Link>
              </div>
            </FadeInView>
          </Container>
        </section>

        {/* Pricing Section */}
        <PricingSection />

        {/* Benefits Section */}
        <section
          id="benefits"
          className="bg-secondary py-16 dark:bg-card"
          aria-labelledby="benefits-heading"
        >
          <Container size="default" className="text-center">
            <DropInView>
              <h2
                id="benefits-heading"
                className="font-heading text-3xl font-bold text-foreground"
              >
                Why Choose RUSH
              </h2>
            </DropInView>
            <FadeInView>
              <p className="mt-2 text-muted-foreground">
                Experience healthcare that&apos;s convenient, reliable, and
                affordable.
              </p>
              <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
                {/* Benefit 1 */}
                <div className="flex flex-col items-center">
                  <div className="rounded-full bg-blue-100 p-4 dark:bg-blue-900/30">
                    <IoTimeOutline
                      className="text-4xl text-[#1586D6]"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-foreground">
                    Convenience
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    Get non-emergency healthcare services from the comfort of
                    your home.
                  </p>
                </div>
                {/* Benefit 2 */}
                <div className="flex flex-col items-center">
                  <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/30">
                    <LuShieldCheck
                      className="text-4xl text-green-600"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-foreground">
                    Quality Care
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    Certified and trusted healthcare professionals to ensure
                    your well-being.
                  </p>
                </div>
                {/* Benefit 3 */}
                <div className="flex flex-col items-center">
                  <div className="rounded-full bg-yellow-100 p-4 dark:bg-yellow-900/30">
                    <RiMoneyDollarCircleLine
                      className="text-4xl text-yellow-500"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-foreground">
                    Flexible Payment
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    Affordable options with or without insurance.
                  </p>
                </div>
              </div>
            </FadeInView>
          </Container>
        </section>

        {/* For Professionals Section */}
        <section
          id="for-professionals"
          className="bg-background py-16"
          aria-labelledby="professionals-heading"
        >
          <Container size="default" className="text-center">
            <DropInView>
              <h2
                id="professionals-heading"
                className="font-heading text-3xl font-bold text-foreground"
              >
                For Healthcare Professionals
              </h2>
            </DropInView>
            <FadeInView>
              <p className="mt-2 text-muted-foreground">
                Empowering you to provide care on your own terms.
              </p>
            </FadeInView>
            <FadeInView>
              <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
                {/* Feature 1 */}
                <div className="flex flex-col items-center">
                  <div className="rounded-full bg-blue-100 p-4 dark:bg-blue-900/30">
                    <LuCalendarCheck
                      className="text-4xl text-[#1586D6]"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-foreground">
                    Flexible Scheduling
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    Work when and where you want, on your own terms.
                  </p>
                </div>
                {/* Feature 2 */}
                <div className="flex flex-col items-center">
                  <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/30">
                    <RiCoinsLine
                      className="text-4xl text-green-600"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-foreground">
                    Extra Income
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    Earn more by providing quality at-home healthcare services.
                  </p>
                </div>
                {/* Feature 3 */}
                <div className="flex flex-col items-center">
                  <div className="rounded-full bg-yellow-100 p-4 dark:bg-yellow-900/30">
                    <RiSecurePaymentLine
                      className="text-4xl text-yellow-500"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-foreground">
                    Quick Payouts
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    Fast and secure payouts for your services.
                  </p>
                </div>
              </div>
            </FadeInView>
          </Container>
        </section>

        {/* Compliance Section */}
        <section
          id="compliance"
          className="bg-secondary py-16 dark:bg-card"
          aria-labelledby="compliance-heading"
        >
          <Container size="sm" className="text-center">
            <DropInView>
              <h2
                id="compliance-heading"
                className="font-heading text-2xl font-bold text-foreground"
              >
                Regulatory Compliance and Security
              </h2>
            </DropInView>
            <FadeInView>
              <p className="mt-4 text-muted-foreground">
                We prioritize your privacy and data security. RUSH is fully
                HIPAA compliant, ensuring your personal information is
                protected.
              </p>
            </FadeInView>
          </Container>
        </section>

        {/* CTA Section */}
        <section
          className="bg-[#1586D6] py-16"
          aria-labelledby="cta-heading"
        >
          <Container size="default" className="text-center">
            <DropInView>
              <h2
                id="cta-heading"
                className="font-heading text-3xl font-bold text-white"
              >
                Get Started with RUSH Today
              </h2>
            </DropInView>
            <FadeInView>
              <p className="mt-2 text-blue-200">
                Revolutionize your healthcare experience. Join RUSH for
                on-demand care at your doorstep.
              </p>
            </FadeInView>
            <div className="mt-6">
              <FadeInView>
                <div className="flex flex-col justify-center gap-4 md:flex-row">
                  <Link
                    href="/comingsoon"
                    className="rounded-full bg-white px-6 py-3 font-semibold text-[#1586d6] duration-500 hover:bg-blue-50"
                  >
                    Download on App Store
                  </Link>
                  <Link
                    href="/comingsoon"
                    className="rounded-full bg-white px-6 py-3 font-semibold text-[#1586d6] duration-500 hover:bg-blue-50"
                  >
                    Get it on Google Play
                  </Link>
                </div>
                <div className="mt-6 flex items-center justify-center">
                  <Image
                    src="/img/for-screen/nvidia-inception-program-badge-rgb-for-screen.png"
                    alt="NVIDIA Inception Program Member"
                    height={136}
                    width={250}
                    className="rounded-lg shadow-lg"
                  />
                </div>
              </FadeInView>
            </div>
          </Container>
        </section>
      </article>
    </>
  )
}
