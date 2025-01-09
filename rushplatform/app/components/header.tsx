'use client'

import Link from "next/link";
import { SlMenu } from "react-icons/sl";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault();
        const href = e.currentTarget.href;
        const targetId = href.replace(/.*\#/, "");
        const elem = document.getElementById(targetId);
        if (elem) {
            const offsetTop = elem.getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({
                top: offsetTop,
                behavior: "smooth"
            });
        }
        // Close mobile menu after clicking
        setIsMobileMenuOpen(false);
    };

    // Close mobile menu when window is resized to larger screen
    useEffect(() => {
        const handleResize = () => {
        if (window.innerWidth >= 768) { // md breakpoint
            setIsMobileMenuOpen(false);
        }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <header className="bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4 md:justify-start md:space-x-10">
                    <div className="flex justify-start lg:w-0 lg:flex-1">
                        <Link href="/">
                            <span className="sr-only">RUSH</span>
                            <Image 
                                src="/img/logo.png"
                                alt="RUSH Logo"
                                width={32}
                                height={40}
                                className="h-8 w-auto sm:h-10"
                            />
                        </Link>
                    </div>
                    <div className="-mr-2 -my-2 md:hidden">
                        <button
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <span className="sr-only">Open Menu</span>
                            <SlMenu className="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>
                    <nav className="hidden md:flex space-x-10">
                        <Link href="#how-it-works" className="text-base font-medium text-gray-500 hover:text-gray-900" onClick={handleScroll}>
                            How It Works
                        </Link>
                        <Link href="#benefits" className="text-base font-medium text-gray-500 hover:text-gray-900" onClick={handleScroll}>
                            Benefits
                        </Link>
                        <Link href="#for-professionals" className="text-base font-medium text-gray-500 hover:text-gray-900" onClick={handleScroll}>
                            For Professionals
                        </Link>
                        <Link href="#compliance" className="text-base font-medium text-gray-500 hover:text-gray-900" onClick={handleScroll}>
                            Compliance
                        </Link>
                    </nav>
                    <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0">
                        <Link href="/survey" className="ml-8 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-[#1586D6] hover:bg-blue-500">
                            Sign Up
                        </Link>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    <Link href="#how-it-works" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50" onClick={handleScroll}>
                        How It Works
                    </Link>
                    <Link href="#benefits" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50" onClick={handleScroll}>
                        Benefits
                    </Link>
                    <Link href="#for-professionals" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50" onClick={handleScroll}>
                        For Professionals
                    </Link>
                    <Link href="#compliance" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50" onClick={handleScroll}>
                        Compliance
                    </Link>
                    <Link href="/survey" className="block w-full text-center px-3 py-2 rounded-md text-base font-medium text-white bg-[#1586D6] hover:bg-blue-500" onClick={() => setIsMobileMenuOpen(false)}>
                        Sign Up
                    </Link>
                </div>
            </div>
        </header>
    )
}