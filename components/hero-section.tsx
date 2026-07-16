"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n"

export function HeroSection() {
    const { t } = useTranslation()

    return (
        <div className="relative min-h-[650px] flex flex-col justify-center overflow-hidden">
            {/* Background Image & Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
                    alt="Modern Ethiopian Home"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-black/10" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
            </div>

            {/* Hero Content */}
            <div className="relative z-10 max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 pt-20">
                <div className="max-w-3xl">
                    <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-8 animate-in slide-in-from-left duration-1000 drop-shadow-2xl">
                        {t('hero_title').split(' HAS A ')[0]}
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff385c] via-[#ff385c] to-purple-500 drop-shadow-md">
                            {t('hero_title').includes(' HAS A ')
                                ? 'HAS A STORY.'
                                : t('hero_title').split('\n').slice(1).join(' ') || t('hero_title')}
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-neutral-100 font-medium max-w-xl mb-12 leading-relaxed animate-in fade-in duration-1000 delay-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        {t('hero_subtitle')}
                    </p>
                    <div className="flex flex-wrap gap-6 animate-in slide-in-from-bottom duration-1000 delay-500">
                        <Button asChild size="lg" className="h-16 bg-[#ff385c] hover:bg-[#e31c5f] text-white rounded-2xl px-10 text-xl font-black shadow-2xl shadow-[#ff385c]/20 transition-all hover:scale-105 active:scale-95">
                            <Link href="#listings">{t('btn_explore')}</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="h-16 bg-white/5 backdrop-blur-xl border-2 border-white/20 text-white rounded-2xl px-10 text-xl font-black hover:bg-white/10 transition-all hover:scale-105 active:scale-95">
                            <Link href="/dashboard/create-listing">{t('btn_list')}</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
