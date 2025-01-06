import './globals.css'
import { Inter, Poppins } from 'next/font/google'
import Header from './components/header'
import BackToTop from './components/BackToTop'
import Footer from './components/footer'
import LaunchNotification from './components/LaunchNotification'

const inter = Inter({ subsets: ['latin'] })
const poppins = Poppins({ 
  weight: ['400', '600', '700'], 
  subsets: ['latin'],
  variable: '--font-poppins'
})

export const metadata = {
  title: 'RUSH - On-Demand In-Home Healthcare',
  description: 'Connecting you with certified healthcare professionals for in-home care - fast, safe, and convenient.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${poppins.variable}`}>
        <LaunchNotification />
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className={`${poppins.className} flex-grow`}>{children}</main>
          <BackToTop />
          <Footer />
        </div>
      </body>
    </html>
  )
}
