import { supabase } from "@/lib/supabaseClient"
import { CategoriesBar } from "@/components/categories-bar"
import { ListingCard } from "@/components/listing-card"
import { SearchFilters } from "@/components/search-filters"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronDown, Search } from "lucide-react"
import { ContactSection } from "@/components/contact-section"

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

    // Fetching all listings regardless of status or active state as requested
    query = query.order('created_at', { ascending: false })

    // All properties will be shown always, no filtering applied.

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


            {/* Hero Section */}
            <div className="relative min-h-[650px] flex flex-col justify-center overflow-hidden">
                {/* Background Image & Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
                        alt="Modern Ethiopian Home"
                        className="w-full h-full object-cover"
                    />
                    {/* Darker gradient overlay to ensure text legibility */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-black/10" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                </div>

                {/* Hero Content */}
                <div className="relative z-10 max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 pt-20">
                    <div className="max-w-3xl">
                        <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-8 animate-in slide-in-from-left duration-1000 drop-shadow-2xl">
                            EVERY SPACE <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff385c] via-[#ff385c] to-purple-500 drop-shadow-md">
                                HAS A STORY.
                            </span>
                        </h1>
                        <p className="text-xl md:text-2xl text-neutral-100 font-medium max-w-xl mb-12 leading-relaxed animate-in fade-in duration-1000 delay-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                            Discover the most exclusive properties in Ethiopia.
                            From modern apartments in Bole to serene villas in Kazanchis.
                        </p>
                        <div className="flex flex-wrap gap-6 animate-in slide-in-from-bottom duration-1000 delay-500">
                            <Button asChild size="lg" className="h-16 bg-[#ff385c] hover:bg-[#e31c5f] text-white rounded-2xl px-10 text-xl font-black shadow-2xl shadow-[#ff385c]/20 transition-all hover:scale-105 active:scale-95">
                                <Link href="#listings">EXPLORE NOW</Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="h-16 bg-white/5 backdrop-blur-xl border-2 border-white/20 text-white rounded-2xl px-10 text-xl font-black hover:bg-white/10 transition-all hover:scale-105 active:scale-95">
                                <Link href="/dashboard/create-listing">LIST YOURS</Link>
                            </Button>
                        </div>
                    </div>
                </div>


            </div>

            <div id="listings" className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 pt-24 pb-32">
                <div className="flex flex-col gap-12">
                    {/* Section Header */}
                    <div className="flex items-end justify-between">
                        <div>
                            <h2 className="text-4xl font-black text-white tracking-tight">FEATURED HOMES</h2>
                            <p className="text-neutral-400 font-medium mt-2">Curated selection of premium properties across the city</p>
                        </div>
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
