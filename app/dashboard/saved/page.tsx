"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { ListingCard } from "@/components/listing-card"
import Link from "next/link"

export default function SavedListingsPage() {
    const [listings, setListings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchSaved = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('saved_listings')
                .select('listing_id, listings(*, profiles(id, full_name, avatar_url, phone_number))')
                .eq('user_id', user.id)

            if (data) {
                // Flatten the results
                const flattened = data.map((item: any) => item.listings)
                setListings(flattened.filter(Boolean))
            }
            setLoading(false)
        }

        fetchSaved()
    }, [])

    if (loading) return <div className="p-10 text-center">Loading your wishlist...</div>

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Saved Homes</h1>
                <p className="text-muted-foreground">Properties you've saved for later.</p>
            </div>

            {listings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border rounded-lg bg-gray-50/50">
                    <p className="text-lg font-medium text-gray-500">You haven't saved any homes yet.</p>
                    <Link href="/" className="mt-4 text-primary font-semibold hover:underline">
                        Start browsing properties
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {listings.map((listing) => (
                        <Link href={`/listings/${listing.id}`} key={listing.id}>
                            <ListingCard data={listing} />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
