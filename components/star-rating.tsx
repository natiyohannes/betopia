"use client"

import { useState, useEffect } from "react"
import { Star } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { cn } from "@/lib/utils"

interface StarRatingProps {
    listingId: string
    initialRating?: number
    readOnly?: boolean
    onRate?: (rating: number) => void
}

export function StarRating({ listingId, initialRating = 0, readOnly = false, onRate }: StarRatingProps) {
    const [rating, setRating] = useState(initialRating)
    const [hoverRating, setHoverRating] = useState(0)
    const [loading, setLoading] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUserId(user.id)
                // Fetch existing rating
                const { data } = await supabase
                    .from('ratings')
                    .select('rating')
                    .eq('listing_id', listingId)
                    .eq('user_id', user.id)
                    .single()

                if (data) {
                    setRating(data.rating)
                }
            }
        }
        if (!readOnly) {
            getUser()
        }
    }, [listingId, readOnly])

    const handleRate = async (value: number) => {
        if (readOnly || loading || !userId) return

        setLoading(true)
        try {
            const { error } = await supabase
                .from('ratings')
                .upsert({
                    listing_id: listingId,
                    user_id: userId,
                    rating: value
                }, { onConflict: 'user_id, listing_id' })

            if (!error) {
                setRating(value)
                if (onRate) onRate(value)
            }
        } catch (error) {
            console.error("Error rating:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={readOnly || loading || !userId}
                    className={cn(
                        "transition-all",
                        (readOnly || !userId) ? "cursor-default" : "cursor-pointer hover:scale-110",
                        loading && "opacity-50"
                    )}
                    onMouseEnter={() => !readOnly && setHoverRating(star)}
                    onMouseLeave={() => !readOnly && setHoverRating(0)}
                    onClick={() => handleRate(star)}
                >
                    <Star
                        size={24}
                        className={cn(
                            "transition-colors",
                            (hoverRating || rating) >= star
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-transparent text-gray-300"
                        )}
                    />
                </button>
            ))}
            {!userId && !readOnly && (
                <span className="text-xs text-gray-500 ml-2">Log in to rate</span>
            )}
        </div>
    )
}
