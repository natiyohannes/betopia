import { supabase } from "@/lib/supabaseClient"
import { ListingCard } from "@/components/listing-card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { ContactSection } from "@/components/contact-section"
import { HeroSection } from "@/components/hero-section"
import { FeaturedHeading } from "@/components/featured-heading"

// Force dynamic rendering to handle search params
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
        .eq('status', 'published') // Only show approved/published listings publicly

    if (searchParams.sort === 'highest_rating') {
        query = query.order('average_rating', { ascending: false }).order('created_at', { ascending: false })
    } else if (searchParams.sort === 'oldest') {
        query = query.order('created_at', { ascending: true })
    } else {
        query = query.order('created_at', { ascending: false })
    }

    const { data, error } = await query
    return data || []
}

export default async function Home({
    searchParams,
}: {
    searchParams: { [key: string]: string | undefined }
}) {
    const listings = await getListings(searchParams)

    return (
        <main className="bg-black min-h-screen text-white">


            {/* Hero Section - client component for language switching */}
            <HeroSection />

            <div id="listings" className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 pt-24 pb-32">
                <div className="flex flex-col gap-12">
                    {/* Section Header - client component for language switching */}
                    <div className="flex items-end justify-between">
                        <FeaturedHeading />
                    </div>
                    
                    <div className="flex-1 mt-8">
                        {listings.length === 0 ? (
                            <div className="min-h-[400px] flex flex-col gap-6 justify-center items-center text-center bg-white/5 rounded-[40px] border border-dashed border-white/10">
                                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center">
                                    <Search className="text-neutral-400" size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white">NO MATCHES FOUND</h3>
                                    <p className="text-neutral-500 mt-2 font-medium">There are currently no homes available to display.</p>
                                </div>
                                <Button asChild variant="outline" className="rounded-2xl px-8 h-12 font-bold mt-4">
                                    <Link href="/dashboard/create-listing">List The First Property!</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-10">
                                {listings.map((listing: any) => (
                                    <Link href={`/listings/${listing.id}`} key={listing.id} className="group">
                                        <ListingCard data={listing} />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Added Contact Section at the Bottom */}
            <ContactSection />
        </main>
    )
}
