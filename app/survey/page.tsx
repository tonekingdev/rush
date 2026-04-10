import type { Metadata } from "next"
import { FadeInView } from "../components/FadeInView"
import { FaUserMd, FaUsers } from "react-icons/fa"
import Link from "next/link"
import { Container } from "@/components/ui/container"

export const metadata: Metadata = {
  title: "Sign Up - Patient or Healthcare Provider",
  description:
    "Join RUSH Healthcare as a patient seeking in-home care or as a certified healthcare professional looking to provide services. Start your journey today.",
  openGraph: {
    title: "Sign Up for RUSH Healthcare",
    description:
      "Join RUSH Healthcare as a patient or healthcare provider. Get started with on-demand home healthcare services.",
  },
}

export default function SurveyPage() {
  return (
    <section
      className="bg-background py-16"
      aria-labelledby="survey-heading"
    >
      <Container size="default" className="text-center">
        <div className="mx-auto max-w-md py-12">
          <FadeInView>
            <h1
              id="survey-heading"
              className="text-balance font-heading text-3xl font-extrabold text-foreground"
            >
              RUSH Healthcare Platform
            </h1>
            <p className="mt-2 text-xl text-muted-foreground">
              Thank you for choosing RUSH for your on-demand healthcare
              service.
            </p>
          </FadeInView>
          <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-2">
            <FadeInView>
              <div className="flex flex-col items-center">
                <div className="rounded-full bg-blue-100 p-4 dark:bg-blue-900/30">
                  <FaUsers
                    className="text-4xl text-[#1586d6]"
                    aria-hidden="true"
                  />
                </div>
                <h2 className="mt-4 text-xl font-semibold text-foreground">
                  Get Immediate Care
                </h2>
                <Link
                  href="/survey/patient"
                  className="mt-4 rounded-full bg-background px-6 py-3 text-lg font-semibold text-[#1586d6] shadow-md duration-500 hover:bg-blue-100 dark:bg-card dark:hover:bg-blue-900/30"
                >
                  Sign Up
                </Link>
              </div>
            </FadeInView>
            <FadeInView>
              <div className="flex flex-col items-center">
                <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/30">
                  <FaUserMd
                    className="text-4xl text-green-600"
                    aria-hidden="true"
                  />
                </div>
                <h2 className="mt-4 text-xl font-semibold text-foreground">
                  Become a Provider
                </h2>
                <Link
                  href="/survey/provider"
                  className="mt-4 rounded-full bg-background px-6 py-3 text-lg font-semibold text-[#1586d6] shadow-md duration-500 hover:bg-blue-100 dark:bg-card dark:hover:bg-blue-900/30"
                >
                  Sign Up
                </Link>
              </div>
            </FadeInView>
          </div>
        </div>
      </Container>
    </section>
  )
}
