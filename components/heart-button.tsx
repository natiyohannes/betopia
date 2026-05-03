"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

interface HeartButtonProps {
    listingId: string
}

export function HeartButton({ listingId }: HeartButtonProps) {
    const router = useRouter()
    const [isSaved, setIsSaved] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkStatus = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setLoading(false)
                return
            }

            const { data } = await supabase
                .from('saved_listings')
                .select('*')
                .eq('listing_id', listingId)
                .eq('user_id', user.id)
                .single()

            if (data) setIsSaved(true)
            setLoading(false)
        }

        checkStatus()
    }, [listingId])

    const toggleSave = async (e: React.MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push('/login')
            return
        }

        if (isSaved) {
            await supabase
                .from('saved_listings')
                .delete()
                .eq('listing_id', listingId)
                .eq('user_id', user.id)
            setIsSaved(false)
        } else {
            await supabase
                .from('saved_listings')
                .insert({ listing_id: listingId, user_id: user.id })
            setIsSaved(true)
        }
    }

    if (loading) return null

    return (
        <div
            onClick={toggleSave}
            className="relative hover:opacity-80 transition cursor-pointer"
        >
            <Heart
                className={`h-7 w-7 ${isSaved ? 'fill-rose-500 text-rose-500' : 'fill-neutral-500/70 text-white'}`}
            />
        </div>
    )
}
