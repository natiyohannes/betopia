"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    PlusCircle,
    List,
    Heart,
    Settings,
    CreditCard,
    LogOut
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

const sidebarItems = [
    {
        title: "Overview",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "My Listings",
        href: "/dashboard/my-listings",
        icon: List,
    },
    {
        title: "Create Listing",
        href: "/dashboard/create-listing",
        icon: PlusCircle,
    },
    {
        title: "Saved Homes",
        href: "/dashboard/saved",
        icon: Heart,
    },
    {
        title: "Payments",
        href: "/dashboard/payments",
        icon: CreditCard,
    },
    {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
    },
]

export function DashboardSidebar() {
    const pathname = usePathname()
    const router = useRouter()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push("/login")
        router.refresh()
    }

    return (
        <div className="flex flex-col h-full border-r bg-gray-50/40 dark:bg-zinc-900/40 w-64">
            <div className="p-6">
                <h2 className="text-2xl font-bold tracking-tight text-primary">Betopia</h2>
            </div>
            <div className="flex-1 px-4 space-y-2">
                {sidebarItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:text-primary",
                            pathname === item.href
                                ? "bg-gray-100 text-primary dark:bg-zinc-800"
                                : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                        )}
                    >
                        <item.icon className="h-4 w-4" />
                        {item.title}
                    </Link>
                ))}
            </div>
            <div className="p-4 border-t">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleSignOut}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </Button>
            </div>
        </div>
    )
}
