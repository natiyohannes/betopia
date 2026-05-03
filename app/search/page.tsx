import { supabase } from "@/lib/supabaseClient"
import { SearchFilters } from "@/components/search-filters" // We can reuse or restyle this
import { ListingCard } from "@/components/listing-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Map } from "lucide-react"

export const dynamic = 'force-dynamic'

async function getListings(searchParams: { [key: string]: string | undefined }) {
    let query = supabase
        .from('listings')
        .select(`
            *,
            profiles (
                id,
                full_name,
                avatar_url,
                phone_number
            )
        `)
        .eq('status', 'published')

    if (searchParams.city) {
        query = query.ilike('location_city', `%${searchParams.city}%`)
    }
    // Add other filters...

    if (searchParams.sort === 'highest_rating') {
        query = query.order('average_rating', { ascending: false }).order('created_at', { ascending: false })
    } else if (searchParams.sort === 'oldest') {
        query = query.order('created_at', { ascending: true })
    } else {
        query = query.order('created_at', { ascending: false }) // Default to latest
    }

    const { data } = await query
    return data || []
}

export default async function SearchPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | undefined }
}) {
    const listings = await getListings(searchParams)

    return (
        <div className="flex h-[calc(100vh-80px)] mt-20">
            {/* 80px = header height */}

            {/* Left: Scrollable List */}
            <div className="w-full md:w-[60%] lg:w-[55%] xl:w-[840px] overflow-y-auto px-6 py-6 border-r border-white/10 bg-black">
                <div className="mb-6 flex justify-between items-center">
                    <div className="text-sm font-medium text-neutral-400">
                        {listings.length} properties found
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {listings.map((listing) => (
                        <Link href={`/listings/${listing.id}`} key={listing.id}>
                            <ListingCard data={listing} />
                        </Link>
                    ))}
                </div>

                {listings.length === 0 && (
                    <div className="mt-20 text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                        <h3 className="text-2xl font-black text-white">NO EXACT MATCHES</h3>
                        <p className="text-neutral-500 mt-2">Try changing or removing some of your filters.</p>
                    </div>
                )}
            </div>

            {/* Right: Fixed Map */}
            <div className="hidden md:block flex-1 bg-black relative h-full">
                {/* Map Placeholder */}
                <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-neutral-600 flex-col gap-4 border-l border-white/10">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-2">
                        <Map size={40} className="text-neutral-700" />
                    </div>
                    <span className="font-black text-xl tracking-widest uppercase">Interactive Map</span>
                    <span className="text-sm text-neutral-500">Map integration coming soon</span>
                </div>

                {/* Show Map Button (Mobile Float - Optional but good for Airbnb feel) */}
            </div>
        </div>
    )
}
