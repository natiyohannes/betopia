"use client"

import Link from "next/link"
import { Home, Search, ArrowLeft } from "lucide-react"

export default function NotFound() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-950/20 via-black to-black" />

            <div className="relative z-10 text-center space-y-10 max-w-lg mx-auto">
                {/* 404 Number */}
                <div className="relative">
                    <div className="text-[180px] font-black text-white/[0.03] leading-none select-none tracking-tighter">404</div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-8xl font-black text-white tracking-tighter">404</span>
                    </div>
                </div>

                {/* Message */}
                <div className="space-y-4">
                    <h1 className="text-3xl font-black text-white uppercase tracking-widest">Page Not Found</h1>
                    <p className="text-neutral-500 font-medium leading-relaxed">
                        The property you&apos;re looking for has moved, been deleted, or never existed.
                        Let&apos;s get you back on track.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-3 bg-[#ff385c] hover:bg-[#e31c5f] text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-[#ff385c]/20 transition-all"
                    >
                        <Home size={20} />
                        Go Home
                    </Link>
                    <Link
                        href="/search"
                        className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold px-8 py-4 rounded-2xl transition-all"
                    >
                        <Search size={20} />
                        Browse Listings
                    </Link>
                </div>

                {/* Back link */}
                <button
                    onClick={() => window.history.back()}
                    className="flex items-center gap-2 text-neutral-600 hover:text-neutral-400 font-bold text-sm transition-colors mx-auto"
                >
                    <ArrowLeft size={16} /> Go Back
                </button>
            </div>
        </div>
    )
}
