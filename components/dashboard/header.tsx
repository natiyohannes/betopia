"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Avatar } from "@/components/ui/avatar" // We will need to create this or use a placeholder
import { Button } from "@/components/ui/button"

export function DashboardHeader() {
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()
    }, [])

    return (
        <header className="flex h-16 items-center border-b bg-background px-6">
            <div className="ml-auto flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                    {user?.email}
                </span>
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    {/* Avatar Placeholder */}
                    {user?.email?.[0].toUpperCase()}
                </div>
            </div>
        </header>
    )
}
