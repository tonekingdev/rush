import Link from "next/link";
import { FadeInView } from "./FadeInView";

export default function Footer() {
    return (
        <footer className="bg-gray-800 text-gray-200 py-8">
            <div className="max-w-5xl mx-auto px-4 text-center">
                <FadeInView>
                    <div className="text-sm tex-center">
                        <Link
                            href="/privacy-policy"
                            className="hover:text-[#1586D6] transition-colors duration-300 font-medium"
                        >
                            Privacy Policy
                        </Link>
                    </div>
                    <p className="text-sm">
                        &copy; {new Date().getFullYear()} RUSH. All rights reserved. Developed by <a className='hover:text-blue-500 duration-500' href="https://tonekingdev.com/" target="_blank" rel="noopener noreferrer">Tone King Development</a>
                    </p>
                </FadeInView>
            </div>
        </footer>
    )
}