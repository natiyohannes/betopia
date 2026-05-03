import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Share, UserCircle, Sparkles } from "lucide-react"
import { Ai3DViewer } from "@/components/ai-3d-viewer"
import { ContactOwnerForm } from "@/components/contact-owner-form"
import { HeartButton } from "@/components/heart-button"
import MapView from "@/components/map-view"
import { StarRating } from "@/components/star-rating"

export default async function ListingPage({ params }: { params: { id: string } }) {
    const { data: listing, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', params.id)
        .single()

    if (error || !listing) {
        return (
            <div className="flex h-[50vh] items-center justify-center flex-col gap-4">
                <h1 className="text-2xl font-black text-white uppercase tracking-widest">Listing Not Found</h1>
                <p className="text-neutral-500 font-medium tracking-tight">The property you are looking for does not exist or has been removed.</p>
            </div>
        )
    }

    const { data: host } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', listing.user_id)
        .single()

    const amenities = typeof listing.amenities === 'object' ? listing.amenities : {}
    const images = listing.images || []

    return (
        <div className="max-w-[1120px] mx-auto px-4 xl:px-0 py-10">
            {/* Title Section */}
            <div className="mb-10">
                <h1 className="text-4xl font-black mb-4 text-white tracking-tight">{listing.title}</h1>
                <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2 font-medium text-white/80">
                        {(listing.average_rating ?? 0) > 0 ? (
                            <span className="flex items-center gap-1 font-black text-[#ff385c]">
                                ★ {Number(listing.average_rating).toFixed(1)}
                                <span className="text-neutral-500 font-normal ml-1">({listing.total_ratings} reviews)</span>
                            </span>
                        ) : (
                            <span className="text-neutral-500 flex items-center gap-1"><Star size={14} className="fill-current" /> New</span>
                        )}
                        <span className="text-neutral-700 mx-1">·</span>
                        <span className="hover:text-white transition-colors cursor-pointer">{listing.location_neighborhood}, {listing.location_city}, Ethiopia</span>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 hover:bg-white/5 px-4 py-2 rounded-xl cursor-pointer transition-all font-bold text-white border border-white/5 bg-white/[0.02]">
                            <Share size={16} /> Share
                        </div>
                        <div className="flex items-center gap-2 hover:bg-white/5 px-4 py-2 rounded-xl cursor-pointer transition-all font-bold text-white border border-white/5 bg-white/[0.02]">
                            <HeartButton listingId={listing.id} /> Save
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-4 grid-rows-2 gap-3 h-[500px] rounded-3xl overflow-hidden mb-12 shadow-2xl shadow-black/50 border border-white/10 relative">
                <div className="col-span-2 row-span-2 bg-neutral-900 relative group cursor-pointer overflow-hidden">
                    {images[0] ? (
                        <img src={images[0]} alt={listing.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
                    ) : (
                        <div className="w-full h-full bg-neutral-900 flex items-center justify-center text-neutral-600 font-black uppercase tracking-widest text-xl">
                            No Main Image
                        </div>
                    )}
                </div>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-neutral-900 relative group cursor-pointer overflow-hidden border border-white/5">
                        {images[i] ? (
                            <img src={images[i]} alt="Room image" className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                        ) : (
                            <div className="w-full h-full bg-neutral-900" />
                        )}
                        <div className="absolute inset-0 bg-black/10 hidden group-hover:block transition" />
                        {i === 4 && (
                            <Button variant="secondary" size="sm" className="absolute bottom-6 right-6 shadow-2xl bg-white text-black hover:bg-neutral-200 border-none font-black text-xs px-6 py-6 rounded-2xl">
                                SHOW ALL PHOTOS
                            </Button>
                        )}
                    </div>
                ))}
            </div>

            {/* AI 3D Tour Section */}
            <div className="mb-16 border-b border-white/10 pb-16">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-white uppercase tracking-widest">
                    <Sparkles className="text-[#ff385c]" size={28} />
                    AI 3D Tour
                </h2>
                <div className="w-full rounded-[40px] overflow-hidden border border-white/10 shadow-3xl shadow-purple-500/10">
                    <Ai3DViewer />
                </div>
            </div>

            {/* Content Split */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
                <div className="col-span-2 space-y-12">
                    <div className="flex justify-between items-center border-b border-white/10 pb-10">
                        <div>
                            <h2 className="text-3xl font-black mb-2 text-white tracking-tight">
                                {listing.property_type} hosted by {host?.full_name?.split(' ')[0] || 'Host'}
                            </h2>
                            <div className="flex gap-2 text-neutral-400 font-medium">
                                <span>{listing.bedrooms} bedrooms</span>
                                <span className="text-neutral-700">·</span>
                                <span>{listing.bathrooms} baths</span>
                                <span className="text-neutral-700">·</span>
                                <span>{listing.sqft} sqft</span>
                            </div>
                        </div>
                        <div className="h-16 w-16 rounded-full bg-neutral-900 flex items-center justify-center overflow-hidden border border-white/10 shadow-xl">
                            <UserCircle size={48} className="text-neutral-700" />
                        </div>
                    </div>

                    <div className="border-b border-white/10 pb-8 space-y-4">
                        <div className="flex gap-6 text-white bg-white/5 p-6 rounded-[32px] border border-white/5">
                            <MapPin size={28} className="text-[#ff385c] mt-1 shrink-0" />
                            <div>
                                <div className="font-black text-xl tracking-tight uppercase">{listing.street_address || "Great location"}</div>
                                <div className="text-neutral-400 font-medium mt-1">
                                    {listing.location_neighborhood ? `${listing.location_neighborhood}, ` : ''}{listing.location_city}
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-y-8 gap-x-12 pt-8 px-4">
                            <div className="flex items-center gap-4">
                                <span className="text-3xl filter grayscale opacity-80">🏢</span>
                                <div>
                                    <p className="text-xs font-black text-white uppercase tracking-widest mb-1 opacity-50">Floor Level</p>
                                    <p className="font-bold text-white text-lg">{listing.floor_number ? `Floor ${listing.floor_number}` : 'Ground Floor'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-3xl filter grayscale opacity-80">🛋️</span>
                                <div>
                                    <p className="text-xs font-black text-white uppercase tracking-widest mb-1 opacity-50">Furnished</p>
                                    <p className="font-bold text-white text-lg">{listing.is_furnished ? 'Yes' : 'No'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-3xl filter grayscale opacity-80">🏷️</span>
                                <div>
                                    <p className="text-xs font-black text-white uppercase tracking-widest mb-1 opacity-50">Listing Type</p>
                                    <p className="font-bold text-white text-lg">{listing.is_rent ? 'For Rent' : 'For Sale'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-3xl filter grayscale opacity-80">📏</span>
                                <div>
                                    <p className="text-xs font-black text-white uppercase tracking-widest mb-1 opacity-50">Property Size</p>
                                    <p className="font-bold text-white text-lg">{listing.sqft} sqft</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-b border-white/10 pb-8">
                        <h3 className="text-xl font-black text-white uppercase tracking-widest mb-6">Description</h3>
                        <p className="leading-loose text-neutral-400 whitespace-pre-line font-medium text-lg">
                            {listing.description}
                        </p>
                    </div>

                    {listing.nearby_places && (
                        <div className="border-b border-white/10 pb-8">
                            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-6">Nearby Places</h3>
                            <p className="text-neutral-400 leading-loose italic font-medium p-6 bg-white/5 rounded-[32px] border border-white/5">
                                "{listing.nearby_places}"
                            </p>
                        </div>
                    )}

                    <div className="border-b border-white/10 pb-8">
                        <h3 className="text-xl font-black text-white uppercase tracking-widest mb-6">What this place offers</h3>
                        <div className="grid grid-cols-2 gap-6">
                            {Object.entries(amenities as object).map(([key, value]) => (
                                value ? (
                                    <div key={key} className="flex items-center gap-4 text-neutral-300 capitalize font-bold">
                                        <div className="h-2 w-2 rounded-full bg-[#ff385c] shadow-lg shadow-[#ff385c]/50" />
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </div>
                                ) : null
                            ))}
                        </div>
                    </div>

                    {listing.rules && (
                        <div className="border-b border-white/10 pb-8">
                            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-6">House Rules</h3>
                            <p className="text-neutral-400 font-medium leading-loose p-6 bg-white/5 rounded-[32px] border border-white/5">
                                {listing.rules}
                            </p>
                        </div>
                    )}

                    <div className="pb-10">
                        <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-8">Where you'll be</h3>
                        <div className="rounded-[40px] overflow-hidden border border-white/10 shadow-2xl">
                            <MapView
                                lat={listing.latitude}
                                lng={listing.longitude}
                                address={`${listing.location_neighborhood}, ${listing.location_city}`}
                            />
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <div className="sticky top-32 border border-white/10 rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] p-8 bg-card backdrop-blur-3xl">
                        <div className="flex justify-between items-end mb-8 text-white">
                            <div className="flex items-end gap-1">
                                <span className="text-3xl font-black">ETB {listing.price.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <ContactOwnerForm
                                ownerName={host?.full_name || 'Host'}
                                ownerPhone={host?.phone_number}
                                listingId={listing.id}
                                ownerId={listing.user_id}
                            />
                        </div>

                        <div className="mt-10 pt-10 border-t border-white/10">
                            <h3 className="font-black text-white mb-6 text-xs uppercase tracking-[0.2em] opacity-50">Rate this property</h3>
                            <StarRating listingId={listing.id} />
                        </div>
                        
                        <div className="mt-8 pt-8 border-t border-white/10 space-y-3">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-neutral-500">
                                <span>Date Published:</span>
                                <span className="text-white">{new Date(listing.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-neutral-500">
                                <span>Expires on:</span>
                                <span className="text-[#ff385c]">{new Date(new Date(listing.created_at).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
