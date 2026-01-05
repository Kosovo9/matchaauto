"use client"

import Link from 'next/link'
import { UserButton, SignedIn, SignedOut } from '@clerk/nextjs'
import { Button } from '@/components/ui/Button'

export function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold">M</span>
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Match-Auto
                            </span>
                        </Link>
                    </div>
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/listings" className="text-gray-600 dark:text-gray-300 hover:text-blue-600">Marketplace</Link>
                        <Link href="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-blue-600">Dashboard</Link>
                        <SignedIn>
                            <Link href="/listings/create" className="text-gray-600 dark:text-gray-300 hover:text-blue-600">Sell</Link>
                            <UserButton afterSignOutUrl="/" />
                        </SignedIn>
                        <SignedOut>
                            <Link href="/sign-in">
                                <Button variant="ghost">Login</Button>
                            </Link>
                            <Link href="/sign-up">
                                <Button>Sign Up</Button>
                            </Link>
                        </SignedOut>
                    </div>
                </div>
            </div>
        </nav>
    )
}
