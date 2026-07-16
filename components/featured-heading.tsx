"use client"

import { useTranslation } from "@/lib/i18n"

export function FeaturedHeading() {
    const { t } = useTranslation()
    return (
        <div>
            <h2 className="text-4xl font-black text-white tracking-tight">{t('featured_homes')}</h2>
            <p className="text-neutral-400 font-medium mt-2">{t('featured_subtitle')}</p>
        </div>
    )
}
