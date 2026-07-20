"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

const TRANSLATIONS: Record<string, Record<string, string>> = {
    'English (US)': {
        nav_find_home: "Find a Home",
        nav_list_home: "List Your Home",
        nav_bookings: "My Bookings",
        nav_about: "About Us",
        messages: "Messages",
        hero_title: "EVERY SPACE HAS A STORY.",
        hero_subtitle: "Discover the most exclusive properties in Ethiopia. From modern apartments in Bole to serene villas in Kazanchis.",
        btn_explore: "EXPLORE NOW",
        btn_list: "LIST YOURS",
        featured_homes: "FEATURED HOMES",
        featured_subtitle: "Curated selection of premium properties across the city",
        footer_support: "Support",
        footer_hosting: "Hosting",
        footer_betopia: "Betopia",
        footer_regions: "Regions",
        footer_privacy: "Privacy",
        footer_terms: "Terms",
        footer_sitemap: "Sitemap",
        expired: "Expired",
        for_rent: "For Rent",
        for_sale: "For Sale",
        listed_by: "Listed by",
        anonymous: "Anonymous User",
        beds: "Beds",
        baths: "Baths",
        sqm: "SQM",
        listed: "Listed",
        exp: "Exp",
        ready_to_find: "READY TO FIND YOUR NEXT STORY?",
        call_us: "CALL US",
        email_us: "EMAIL US",
        tiktok: "TIKTOK",
        phone_copied: "Phone number copied to clipboard!",
        email_copied: "Email address copied to clipboard!",
    },
    'Amharic': {
        nav_find_home: "ቤት ይፈልጉ",
        nav_list_home: "ቤትዎን ያስመዝግቡ",
        nav_bookings: "የእኔ ዝርዝሮች",
        nav_about: "ስለ እኛ",
        messages: "መልእክቶች",
        hero_title: "እያንዳንዱ ቦታ የራሱ ታሪክ አለው።",
        hero_subtitle: "በኢትዮጵያ ውስጥ ያሉ ምርጥ እና ተመራጭ ንብረቶችን ያግኙ። ከቦሌ ዘመናዊ አፓርታማዎች እስከ ካዛንቺስ አስደናቂ ቪላዎች።",
        btn_explore: "አሁን ይመልከቱ",
        btn_list: "የእርስዎን ያስመዝግቡ",
        featured_homes: "ተለይተው የቀረቡ ቤቶች",
        featured_subtitle: "በከተማዋ ውስጥ በጥንቃቄ የተመረጡ ልዩ ንብረቶች",
        footer_support: "እገዛ",
        footer_hosting: "አስተናጋጅነት",
        footer_betopia: "ቤቶፒያ",
        footer_regions: "ክልሎች",
        footer_privacy: "ግላዊነት",
        footer_terms: "ውሎች",
        footer_sitemap: "የጣቢያ ካርታ",
        expired: "ጊዜው ያለፈበት",
        for_rent: "የሚከራይ",
        for_sale: "የሚሸጥ",
        listed_by: "ያስመዘገበው",
        anonymous: "ያልታወቀ ተጠቃሚ",
        beds: "ኝታ ቤት",
        baths: "መታጠቢያ",
        sqm: "ካሬ ሜትር",
        listed: "የተመዘገበበት",
        exp: "የሚያበቃበት",
        ready_to_find: "የሚቀጥለውን ታሪክዎን ለማግኘት ዝግጁ ነዎት?",
        call_us: "ይደውሉልን",
        email_us: "ኢሜይል ያድርጉልን",
        tiktok: "ቲክቶክ",
        phone_copied: "የስልክ ቁጥር ወደ ቅንጥብ ሰሌዳ ተገልብጧል!",
        email_copied: "የኢሜይል አድራሻ ወደ ቅንጥብ ሰሌዳ ተገልብጧል!",
    },
    'Oromo': {
        nav_find_home: "Mana Barbaadi",
        nav_list_home: "Mana Galmeessi",
        nav_bookings: "Kireeffannaa Koo",
        nav_about: "Waa'ee Keenya",
        messages: "Ergaawwan",
        hero_title: "IDDOON HUNDUU SEENAA QABA.",
        hero_subtitle: "Qabeenya addaa fi filatamaa Itoophiyaa keessatti argadhu. Boolee keessatti appartamaa ammayyaa irraa kaasee hanga Kazanchis keessatti viillaa bareedaa.",
        btn_explore: "AMMA BARBAADI",
        btn_list: "KEE GALMEESSI",
        featured_homes: "MANNEEN FILATAMAN",
        featured_subtitle: "Dizayinii filatamaa magaalaa guutuu keessaa",
        footer_support: "Gargaarsa",
        footer_hosting: "Keessummummaa",
        footer_betopia: "Betopia",
        footer_regions: "Naannolee",
        footer_privacy: "Dhuunfummaa",
        footer_terms: "Waliigaltee",
        footer_sitemap: "Kaartaa Marsariitii",
        expired: "Yeroon dhumate",
        for_rent: "Kiraaf",
        for_sale: "Gurgurtaaf",
        listed_by: "Kaniin galmeesse",
        anonymous: "Fayyadamaa Ibsamne",
        beds: "Siree",
        baths: "Dhiqannaa",
        sqm: "SQM",
        listed: "Galmeeffame",
        exp: "Dhumata",
        ready_to_find: "SEENAA KEE ISA ITTI ANU ARGACHUUF QOPHAA'TEETTAA?",
        call_us: "NII BILBILAAN",
        email_us: "NII ERGAA",
        tiktok: "TIKTOK",
        phone_copied: "Lakkoofsi bilbilaa waraabameera!",
        email_copied: "Imeeyiliin waraabameera!",
    },
    'Tigrinya': {
        nav_find_home: "ገዛ ድለይ",
        nav_list_home: "ገዛኻ መዝግብ",
        nav_bookings: "ምዝገባታተይ",
        nav_about: "ብዛዕባና",
        messages: "መልእኽታት",
        hero_title: "ኩሉ ቦታ ናቱ ዛንታ ኣለዎ።",
        hero_subtitle: "ኣብ ኢትዮጵያ ዝበለጹን ፍሉያትን ንብረታት ክትረክብ ትኽእል። ኣብ ቦሌ ዘመናዊ አፓርታማታት፤ ኣብ ካዛንቺስ ድማ ፍሉይ ቪላታት።",
        btn_explore: "ሕጂ ድለይ",
        btn_list: "ናትካ መዝግብ",
        featured_homes: "ፍሉያት ኣባይቲ",
        featured_subtitle: "ኣብ መላእ ከተማ ዝተመርጹ ፍሉያት ንብረታት",
        footer_support: "ደገፍ",
        footer_hosting: "ኣአንግዶት",
        footer_betopia: "ቤቶፒያ",
        footer_regions: "ዞባታት",
        footer_privacy: "ውልቃውነት",
        footer_terms: "ውዕላት",
        footer_sitemap: "ካርታ መርበብ",
        expired: "እዋኑ ዝሓለፎ",
        for_rent: "ዝካረ",
        for_sale: "ዝሽየጥ",
        listed_by: "ዝመዝገቦ",
        anonymous: "ዘይተፈልጠ ተጠቃሚ",
        beds: "መደቀሲ",
        baths: "መሕጸቢ",
        sqm: "ካሬ ሜትር",
        listed: "ዝተመዝገበሉ",
        exp: "ዝውድኣሉ",
        ready_to_find: "ንቕልጡፍ መሸጣ/ክራይ ድሉው ዲኻ?",
        call_us: "ደውሉልና",
        email_us: "ኢሜይል ጸሓፉልና",
        tiktok: "ቲክቶክ",
        phone_copied: "ቑፅሪ ስልኪ ተገሊቢጡ ኣሎ!",
        email_copied: "ኢሜይል ኣድራሻ ተገሊቢጡ ኣሎ!",
    }
}

interface LanguageContextType {
    language: string
    setLanguage: (lang: string) => void
    t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState('English (US)')

    useEffect(() => {
        const saved = localStorage.getItem('user_language')
        if (saved) {
            setLanguageState(saved)
        }
    }, [])

    const setLanguage = (lang: string) => {
        setLanguageState(lang)
        localStorage.setItem('user_language', lang)
        // Dispatch custom event to sync across other component tabs if needed
        window.dispatchEvent(new Event('language_changed'))
    }

    const t = (key: string): string => {
        // Fallback to English (US) if language not fully translated
        const dict = TRANSLATIONS[language] || TRANSLATIONS['English (US)']
        return dict[key] || TRANSLATIONS['English (US)'][key] || key
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useTranslation() {
    const context = useContext(LanguageContext)
    if (!context) {
        throw new Error('useTranslation must be used within a LanguageProvider')
    }
    return context
}
