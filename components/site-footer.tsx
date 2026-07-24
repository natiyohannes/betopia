"use client"

import React, { useState } from 'react'
import { X, Globe, Check } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

const ETHIOPIAN_LANGUAGES = [
    { code: 'am', name: 'Amharic', native: 'አማርኛ' },
    { code: 'om', name: 'Oromo', native: 'Afaan Oromoo' },
    { code: 'ti', name: 'Tigrinya', native: 'ትግርኛ' },
    { code: 'so', name: 'Somali', native: 'Af-Soomaali' },
    { code: 'wo', name: 'Wolaytta', native: 'Wolaitta' },
    { code: 'sid', name: 'Sidama', native: 'Sidaamu Afoo' },
    { code: 'aa', name: 'Afar', native: 'Qafaraf' },
    { code: 'gu', name: 'Gurage', native: 'ጉራጊኛ' },
    { code: 'ha', name: 'Hadiyya', native: 'Hadiyyisa' },
    { code: 'gmy', name: 'Gamo', native: 'Gamotho' },
]

const WORLD_LANGUAGES = [
    { code: 'en', name: 'English (US)', native: 'English (US)' },
    { code: 'zh', name: 'Chinese', native: '中文' },
    { code: 'es', name: 'Spanish', native: 'Español' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'ar', name: 'Arabic', native: 'العربية' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    { code: 'pt', name: 'Portuguese', native: 'Português' },
    { code: 'ru', name: 'Russian', native: 'Русский' },
    { code: 'ja', name: 'Japanese', native: '日本語' },
    { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
    { code: 'mr', name: 'Marathi', native: 'मराठी' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'wuu', name: 'Wu Chinese', native: '吴语' },
    { code: 'fr', name: 'French', native: 'Français' },
    { code: 'tr', name: 'Turkish', native: 'Türkçe' },
]

export function SiteFooter() {
    const { language: selectedLang, setLanguage, t } = useTranslation()
    const [isOpen, setIsOpen] = useState(false)

    const handleSelect = (langName: string) => {
        setLanguage(langName)
        setIsOpen(false)
    }

    return (
        <footer className="bg-black border-t border-white/10 mt-12 text-sm text-neutral-400 relative">
            <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 py-20">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="space-y-6">
                        <h5 className="font-black text-white uppercase tracking-widest text-xs">{t('footer_support')}</h5>
                        <ul className="space-y-4 font-medium">
                            <li><a href="/about" className="hover:text-white transition-colors">{t('footer_help')}</a></li>
                            <li><a href="/about" className="hover:text-white transition-colors">{t('footer_safety')}</a></li>
                            <li><a href="/about" className="hover:text-white transition-colors">{t('footer_cancellation')}</a></li>
                            <li><a href="/about" className="hover:text-white transition-colors">{t('footer_covid')}</a></li>
                            <li><a href="/about" className="hover:text-white transition-colors">{t('footer_report')}</a></li>
                        </ul>
                    </div>
                    <div className="space-y-6">
                        <h5 className="font-black text-white uppercase tracking-widest text-xs">{t('footer_hosting')}</h5>
                        <ul className="space-y-4 font-medium">
                            <li><a href="/dashboard/create-listing" className="hover:text-white transition-colors">{t('footer_list_prop')}</a></li>
                            <li><a href="/about" className="hover:text-white transition-colors">{t('footer_aircover')}</a></li>
                            <li><a href="/about" className="hover:text-white transition-colors">{t('footer_hosting_res')}</a></li>
                            <li><a href="/dashboard/messages" className="hover:text-white transition-colors">{t('footer_forum')}</a></li>
                            <li><a href="/about" className="hover:text-white transition-colors">{t('footer_responsibly')}</a></li>
                        </ul>
                    </div>
                    <div className="space-y-6">
                        <h5 className="font-black text-white uppercase tracking-widest text-xs">{t('footer_betopia')}</h5>
                        <ul className="space-y-4 font-medium">
                            <li><a href="/about" className="hover:text-white transition-colors">{t('footer_newsroom')}</a></li>
                            <li><a href="/about" className="hover:text-white transition-colors">{t('footer_features')}</a></li>
                            <li><a href="/about" className="hover:text-white transition-colors">{t('footer_founders')}</a></li>
                            <li><a href="/about" className="hover:text-white transition-colors">{t('footer_careers')}</a></li>
                            <li><a href="/about" className="hover:text-white transition-colors">{t('footer_investors')}</a></li>
                        </ul>
                    </div>
                    <div className="space-y-6">
                        <h5 className="font-black text-white uppercase tracking-widest text-xs">{t('footer_regions')}</h5>
                        <ul className="space-y-4 font-medium">
                            <li><a href="/search?city=Addis Ababa" className="hover:text-white transition-colors">{t('footer_addis')}</a></li>
                            <li><a href="/search?city=Hawassa" className="hover:text-white transition-colors">{t('footer_hawassa')}</a></li>
                            <li><a href="/search?city=Bahir Dar" className="hover:text-white transition-colors">{t('footer_bahirdar')}</a></li>
                            <li><a href="/search?city=Adama" className="hover:text-white transition-colors">{t('footer_adama')}</a></li>
                            <li><a href="/search" className="hover:text-white transition-colors">{t('footer_more_cities')}</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 mt-16 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-8 font-medium">
                        <span className="text-neutral-500">{t('footer_copyright')}</span>
                        <div className="flex gap-4">
                            <a href="/about" className="hover:text-white transition-colors">{t('footer_privacy')}</a>
                            <a href="/about" className="hover:text-white transition-colors">{t('footer_terms')}</a>
                            <a href="/search" className="hover:text-white transition-colors">{t('footer_sitemap')}</a>
                        </div>
                    </div>
                    <div className="flex gap-8 font-bold text-white">
                        <button
                            onClick={() => setIsOpen(true)}
                            className="hover:text-[#ff385c] transition-colors flex items-center gap-2 outline-none"
                        >
                            <Globe size={16} />
                            <span>{selectedLang}</span>
                        </button>
                        <span className="cursor-pointer hover:text-[#ff385c] transition-colors">ETB</span>
                    </div>
                </div>
            </div>

            {/* Language Picker Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-neutral-900 border border-white/10 rounded-[32px] max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-black text-white uppercase tracking-wider">Select Language</h3>
                                <p className="text-neutral-500 text-xs mt-0.5">Choose your preferred language for Betopia</p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-10 h-10 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white rounded-full flex items-center justify-center border border-white/5 transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Scrollable content */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            {/* Ethiopian Languages */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest border-b border-amber-500/10 pb-2">
                                    Languages in Ethiopia
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {ETHIOPIAN_LANGUAGES.map(lang => {
                                        const isSelected = selectedLang === lang.name
                                        return (
                                            <button
                                                key={lang.code}
                                                onClick={() => handleSelect(lang.name)}
                                                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all group ${
                                                    isSelected
                                                        ? 'bg-amber-500/10 border-amber-500 text-white'
                                                        : 'bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-white/10 text-neutral-300'
                                                }`}
                                            >
                                                <div>
                                                    <span className="block text-sm font-semibold">{lang.name}</span>
                                                    <span className="block text-[11px] text-neutral-500 group-hover:text-neutral-400 mt-0.5">{lang.native}</span>
                                                </div>
                                                {isSelected && <Check size={14} className="text-amber-500 shrink-0 ml-2" />}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* World Languages */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest border-b border-blue-400/10 pb-2">
                                    Popular World Languages
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {WORLD_LANGUAGES.map(lang => {
                                        const isSelected = selectedLang === lang.name
                                        return (
                                            <button
                                                key={lang.code}
                                                onClick={() => handleSelect(lang.name)}
                                                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all group ${
                                                    isSelected
                                                        ? 'bg-blue-500/10 border-blue-500 text-white'
                                                        : 'bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-white/10 text-neutral-300'
                                                }`}
                                            >
                                                <div>
                                                    <span className="block text-sm font-semibold">{lang.name}</span>
                                                    <span className="block text-[11px] text-neutral-500 group-hover:text-neutral-400 mt-0.5">{lang.native}</span>
                                                </div>
                                                {isSelected && <Check size={14} className="text-blue-500 shrink-0 ml-2" />}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </footer>
    )
}
