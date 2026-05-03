"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { SiteHeader } from "@/components/site-header"
import { ListingCard } from "@/components/listing-card"
import { MapPin, Phone, Mail, Calendar, ShieldCheck, Loader2 } from "lucide-react"

export default function PublicProfilePage() {
    const { id } = useParams()
    const [profile, setProfile] = useState<any>(null)
    const [listings, setListings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!id) return

            // Fetch Profile
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', id)
                .single()

            if (profileData) {
                setProfile(profileData)

                // Fetch their active listings
                const { data: listingsData } = await supabase
                    .from('listings')
                    .select('*, profiles(id, full_name, avatar_url, phone_number)')
                    .eq('user_id', id)
                    .eq('is_active', true)
                    .eq('status', 'published')
                    .order('created_at', { ascending: false })

                if (listingsData) setListings(listingsData)
            }
            setLoading(false)
        }

        fetchProfileData()
    }, [id])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center gap-4">
                <Loader2 size={40} className="animate-spin text-[#ff385c]" />
                <p className="text-neutral-500 font-medium">Fetching profile details...</p>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center gap-4">
                <h2 className="text-2xl font-bold text-white">Profile Not Found</h2>
                <a href="/" className="text-[#ff385c] hover:underline">Return to Home</a>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-[#0a0a0b] text-white">
            <SiteHeader />
            
            <div className="pt-28 pb-20 max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4">
                <div className="grid lg:grid-cols-4 gap-12">
                    {/* Sidebar - Profile Info */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-neutral-900 border border-white/10 rounded-[40px] p-8 shadow-2xl relative overflow-hidden text-center">
                            <div className="w-32 h-32 rounded-[32px] bg-neutral-800 border-2 border-white/5 mx-auto overflow-hidden flex items-center justify-center mb-6">
                                {profile.avatar_url ? (
                                    <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-4xl font-black text-[#ff385c]">{profile.full_name?.charAt(0)}</div>
                                )}
                            </div>
                            
                            <h1 className="text-2xl font-black uppercase tracking-tight">{profile.full_name}</h1>
                            <div className="flex items-center justify-center gap-2 mt-2 text-neutral-400 font-bold text-xs uppercase tracking-widest">
                                <ShieldCheck size={14} className="text-blue-500" />
                                Verified Lister
                            </div>

                            <div className="mt-8 space-y-4 text-left">
                                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-[#ff385c]/30 transition-all">
                                    <div className="p-2 bg-[#ff385c]/10 rounded-xl text-[#ff385c]">
                                        <Phone size={18} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-neutral-500 uppercase font-black tracking-widest leading-none">Phone</div>
                                        <div className="text-sm font-bold mt-1">{profile.phone_number || 'No phone listed'}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all">
                                    <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                                        <Calendar size={18} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-neutral-500 uppercase font-black tracking-widest leading-none">Member Since</div>
                                        <div className="text-sm font-bold mt-1">{new Date(profile.created_at).getFullYear()}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <button 
                                    onClick={() => window.location.href = `tel:${profile.phone_number}`}
                                    className="w-full bg-[#ff385c] hover:bg-[#e31c5f] text-white rounded-2xl h-14 font-black uppercase tracking-widest shadow-xl shadow-[#ff385c]/20 transition-all"
                                >
                                    Call now
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content - Listings */}
                    <div className="lg:col-span-3 space-y-12">
                        <div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
                                Properties by {profile.full_name?.split(' ')[0]}
                                <span className="text-[#ff385c] text-sm bg-[#ff385c]/10 px-3 py-1 rounded-full">{listings.length} active</span>
                            </h2>
                            <p className="text-neutral-500 mt-2 font-medium">Explore hand-picked properties listed by this verified agent/owner.</p>
                        </div>

                        {listings.length === 0 ? (
                            <div className="bg-neutral-900/50 border-2 border-dashed border-white/5 rounded-[40px] p-20 text-center flex flex-col items-center gap-6">
                                <div className="p-6 bg-white/5 rounded-full">
                                    <Loader2 size={32} className="text-neutral-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white uppercase tracking-wider">No Active Listings</h3>
                                    <p className="text-neutral-500 mt-2">This user currently has no active properties on the market.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-8">
                                {listings.map(item => (
                                    <ListingCard key={item.id} data={item} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    )
}
