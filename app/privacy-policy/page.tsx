import Link from "next/link"
import { FaHome, FaShieldAlt, FaEnvelope, FaPhone } from "react-icons/fa"
import { FadeInView } from "../components/FadeInView"
import { SlideInView } from "../components/SlideInView"
import { DropInView } from "../components/DropInView"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <FadeInView>
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <FaShieldAlt className="text-6xl text-[#1586D6]" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-lg text-gray-600">
              Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </FadeInView>

        {/* Privacy Policy Content */}
        <SlideInView>
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
            {/* Introduction */}
            <DropInView>
              <section>
                <h2 className="text-2xl font-bold mb-4 text-[#1586D6]">Introduction</h2>
                <p className="text-gray-700 leading-relaxed">
                  RUSH Servicing LLC (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates the RUSH Healthcare
                  application and website. This Privacy Policy explains how we collect, use, disclose, and safeguard
                  your information when you use our mobile application and related services (collectively, the
                  &quot;Service&quot;). The RUSH Healthcare platform is an intellectual property of RUSH Servicing LLC,
                  developed and maintained by PC BRAINIACS LLC d.b.a. Tone King Development.
                </p>
              </section>
            </DropInView>

            {/* Information We Collect */}
            <DropInView>
              <section>
                <h2 className="text-2xl font-bold mb-4 text-[#1586D6]">Information We Collect</h2>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">Personal Information</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We may collect personal information that you provide directly to us, including:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
                  <li>Full name and contact information (email, phone number, address)</li>
                  <li>Professional credentials and license information</li>
                  <li>Healthcare provider qualifications and certifications</li>
                  <li>Employment history and references</li>
                  <li>Background check information</li>
                  <li>Financial information for payment processing</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">Automatically Collected Information</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Device information (device type, operating system, unique device identifiers)</li>
                  <li>Usage data (app features used, time spent, user interactions)</li>
                  <li>Location data (with your permission)</li>
                  <li>Log files and analytics data</li>
                </ul>
              </section>
            </DropInView>

            {/* How We Use Information */}
            <DropInView>
              <section>
                <h2 className="text-2xl font-bold mb-4 text-[#1586D6]">How We Use Your Information</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We use the collected information for the following purposes:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Process and manage healthcare provider applications</li>
                  <li>Verify professional credentials and conduct background checks</li>
                  <li>Facilitate communication between healthcare providers and facilities</li>
                  <li>Provide customer support and respond to inquiries</li>
                  <li>Improve our services and develop new features</li>
                  <li>Send important notifications and updates</li>
                  <li>Comply with legal obligations and regulatory requirements</li>
                  <li>Prevent fraud and ensure platform security</li>
                </ul>
              </section>
            </DropInView>

            {/* Information Sharing */}
            <DropInView>
              <section>
                <h2 className="text-2xl font-bold mb-4 text-[#1586D6]">Information Sharing and Disclosure</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We may share your information in the following circumstances:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>
                    <strong>Healthcare Facilities:</strong> With healthcare facilities for employment opportunities
                  </li>
                  <li>
                    <strong>Service Providers:</strong> With third-party vendors who assist in our operations
                  </li>
                  <li>
                    <strong>Legal Requirements:</strong> When required by law or to protect our rights
                  </li>
                  <li>
                    <strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales
                  </li>
                  <li>
                    <strong>Consent:</strong> With your explicit consent for specific purposes
                  </li>
                </ul>
              </section>
            </DropInView>

            {/* Data Security */}
            <DropInView>
              <section>
                <h2 className="text-2xl font-bold mb-4 text-[#1586D6]">Data Security</h2>
                <p className="text-gray-700 leading-relaxed">
                  We implement appropriate technical and organizational security measures to protect your personal
                  information against unauthorized access, alteration, disclosure, or destruction. These measures
                  include encryption, secure servers, access controls, and regular security assessments. However, no
                  method of transmission over the internet or electronic storage is 100% secure.
                </p>
              </section>
            </DropInView>

            {/* Data Retention */}
            <DropInView>
              <section>
                <h2 className="text-2xl font-bold mb-4 text-[#1586D6]">Data Retention</h2>
                <p className="text-gray-700 leading-relaxed">
                  We retain your personal information for as long as necessary to fulfill the purposes outlined in this
                  Privacy Policy, comply with legal obligations, resolve disputes, and enforce our agreements.
                  Healthcare-related information may be retained for longer periods as required by applicable
                  regulations.
                </p>
              </section>
            </DropInView>

            {/* Your Rights */}
            <DropInView>
              <section>
                <h2 className="text-2xl font-bold mb-4 text-[#1586D6]">Your Privacy Rights</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Depending on your location, you may have the following rights regarding your personal information:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Access and obtain a copy of your personal information</li>
                  <li>Correct inaccurate or incomplete information</li>
                  <li>Delete your personal information (subject to legal requirements)</li>
                  <li>Restrict or object to certain processing activities</li>
                  <li>Data portability (receive your data in a structured format)</li>
                  <li>Withdraw consent where processing is based on consent</li>
                </ul>
              </section>
            </DropInView>

            {/* Children's Privacy */}
            <DropInView>
              <section>
                <h2 className="text-2xl font-bold mb-4 text-[#1586D6]">Children&apos;s Privacy</h2>
                <p className="text-gray-700 leading-relaxed">
                  Our Service is not intended for individuals under the age of 18. We do not knowingly collect personal
                  information from children under 18. If we become aware that we have collected personal information
                  from a child under 18, we will take steps to delete such information.
                </p>
              </section>
            </DropInView>

            {/* International Transfers */}
            <DropInView>
              <section>
                <h2 className="text-2xl font-bold mb-4 text-[#1586D6]">International Data Transfers</h2>
                <p className="text-gray-700 leading-relaxed">
                  Your information may be transferred to and processed in countries other than your country of
                  residence. We ensure that such transfers comply with applicable data protection laws and implement
                  appropriate safeguards to protect your information.
                </p>
              </section>
            </DropInView>

            {/* Third-Party Services */}
            <DropInView>
              <section>
                <h2 className="text-2xl font-bold mb-4 text-[#1586D6]">Third-Party Services</h2>
                <p className="text-gray-700 leading-relaxed">
                  Our Service may contain links to third-party websites or services. We are not responsible for the
                  privacy practices of these third parties. We encourage you to review their privacy policies before
                  providing any personal information.
                </p>
              </section>
            </DropInView>

            {/* Updates to Privacy Policy */}
            <DropInView>
              <section>
                <h2 className="text-2xl font-bold mb-4 text-[#1586D6]">Updates to This Privacy Policy</h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by
                  posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. Your
                  continued use of the Service after such modifications constitutes acceptance of the updated Privacy
                  Policy.
                </p>
              </section>
            </DropInView>

            {/* Contact Information */}
            <DropInView>
              <section>
                <h2 className="text-2xl font-bold mb-4 text-[#1586D6]">Contact Us</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have any questions about this Privacy Policy or our privacy practices, please contact us:
                </p>
                <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                  <div className="flex items-center">
                    <FaEnvelope className="text-[#1586D6] mr-3" />
                    <span className="text-gray-700">Email: privacy@rushhealthc.com</span>
                  </div>
                  <div className="flex items-center">
                    <FaPhone className="text-[#1586D6] mr-3" />
                    <span className="text-gray-700">Phone: (586) 344-4567</span>
                  </div>
                  <div className="text-gray-700">
                    <strong>RUSH Servicing LLC</strong>
                    <br />
                    Privacy Officer
                    {/* <br />
                    [Your Business Address]
                    <br />
                    [City, State, ZIP Code] */}
                  </div>
                  <div className="text-sm text-gray-600 mt-4 pt-4 border-t border-gray-200">
                    <em>Platform developed and maintained by PC BRAINIACS LLC d.b.a. Tone King Development</em>
                  </div>
                </div>
              </section>
            </DropInView>

            {/* Compliance */}
            <DropInView>
              <section>
                <h2 className="text-2xl font-bold mb-4 text-[#1586D6]">Regulatory Compliance</h2>
                <p className="text-gray-700 leading-relaxed">
                  This Privacy Policy is designed to comply with applicable privacy laws, including but not limited to
                  the California Consumer Privacy Act (CCPA), General Data Protection Regulation (GDPR), and Health
                  Insurance Portability and Accountability Act (HIPAA) where applicable to our healthcare-related
                  services.
                </p>
              </section>
            </DropInView>
          </div>
        </SlideInView>

        {/* Back to Home CTA */}
        <FadeInView>
          <div className="text-center mt-12">
            <Link
              href="/"
              className="bg-[#1586D6] text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition duration-300 font-semibold inline-flex items-center"
            >
              <FaHome className="mr-2" />
              Return to Home
            </Link>
          </div>
        </FadeInView>
      </main>

    </div>
  )
}