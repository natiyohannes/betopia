"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Home, Building2, Warehouse, Tent, Trees, Castle, Mountain } from "lucide-react"
import { cn } from "@/lib/utils"

const categories = [
    { label: 'House', icon: Home, value: 'house' },
    { label: 'Apartment', icon: Building2, value: 'apartment' },
    { label: 'Commercial', icon: Warehouse, value: 'commercial' },
    { label: 'Land', icon: Trees, value: 'land' },
    { label: 'Mansions', icon: Castle, value: 'mansion' },
    { label: 'Cabins', icon: Tent, value: 'cabin' },
    { label: 'Views', icon: Mountain, value: 'view' },
]

interface CategoriesBarProps {
    variant?: 'light' | 'dark';
}

export function CategoriesBar({ variant = 'dark' }: CategoriesBarProps) {
    const params = useSearchParams()
    const router = useRouter()
    const currentCategory = params.get('type')

    const handleClick = (category: string) => {
        let currentQuery = {}

        if (params) {
            // Parse current params
            // @ts-ignore
            currentQuery = Object.fromEntries(params.entries())
        }

        const updatedQuery: any = {
            ...currentQuery,
            type: category
        }

        // Toggle functionality
        if (params.get('type') === category) {
            delete updatedQuery.type
        }

        // Construct URL (A bit manual without qs library, but fine)
        const url = new URL(window.location.href)
        url.search = new URLSearchParams(updatedQuery).toString()

        router.push(url.toString())
    }

    return (
        <div className="w-full">
            <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4">
                <div className="pt-4 flex flex-row items-center justify-between overflow-x-auto gap-8 no-scrollbar pb-2">
                    {categories.map((item) => (
                        <div
                            key={item.label}
                            onClick={() => handleClick(item.value)}
                            className={cn(
                                "flex flex-col items-center justify-center gap-2 p-2 border-b-2 hover:opacity-80 transition cursor-pointer min-w-[64px]",
                                currentCategory === item.value
                                    ? (variant === 'light' ? "border-white text-white" : "border-neutral-800 text-neutral-800")
                                    : (variant === 'light' ? "border-transparent text-white/60" : "border-transparent text-neutral-500")
                            )}
                        >
                            <item.icon size={26} />
                            <div className="font-medium text-xs">
                                {item.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
