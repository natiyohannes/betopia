"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Home } from "lucide-react"
import { Listing } from "@/types"

export default function MyListingsPage() {
    const router = useRouter()
    const [listings, setListings] = useState<Listing[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('all')

    useEffect(() => {
        const fetchListings = async () => {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push("/login")
                return
            }

            console.log('Fetching listings for user:', user.id)

            // Simplest query first to ensure we get data
            const { data, error } = await supabase
                .from('listings')
                .select(`
                    *,
                    profiles:user_id (
                        id,
                        full_name,
                        avatar_url,
                        phone_number
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching listings:', error)
            } else if (data) {
                console.log('Fetched listings:', data.length)
                setListings(data)
            }
            setLoading(false)
        }

        fetchListings()
    }, [router])

    const filteredListings = listings.filter((l: Listing) => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'active') return l.status === 'published';
        if (statusFilter === 'pending') return l.status === 'pending_payment' || l.status === 'paid';
        return l.status === statusFilter;
    })

    const tabs = [
        { id: 'all', label: 'All Listings' },
        { id: 'active', label: 'Active' },
        { id: 'pending', label: 'Pending' },
        { id: 'draft', label: 'Drafts' },
        { id: 'expired', label: 'Expired' },
    ]

    const handleRenew = (id: string) => {
        router.push(`/dashboard/payment/${id}`)
    }

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to permanently delete this listing? This action cannot be undone.")) {
            const { error } = await supabase
                .from('listings')
                .delete()
                .eq('id', id)

            if (error) {
                alert("Error deleting listing: " + error.message)
            } else {
                setListings(prev => prev.filter(l => l.id !== id))
            }
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground font-medium">Crunching your listings...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">My Listings</h1>
                    <p className="text-muted-foreground">Manage your properties and check their performance.</p>
                </div>
                <Button asChild className="bg-[#ff385c] hover:bg-[#e31c5f] text-white px-6">
                    <Link href="/dashboard/create-listing">Post New Property</Link>
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10 overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setStatusFilter(tab.id)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${statusFilter === tab.id
                            ? "border-[#ff385c] text-white"
                            : "border-transparent text-muted-foreground hover:text-white"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {filteredListings.length === 0 ? (
                <div className="text-center py-24 border border-white/10 rounded-[40px] bg-white/[0.02] flex flex-col items-center justify-center space-y-6">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                        <Home className="text-neutral-700" size={32} />
                    </div>
                    <div className="space-y-2">
                        <p className="text-xl font-bold text-white">No listings found here.</p>
                        <p className="text-neutral-500 max-w-sm mx-auto">
                            {statusFilter === 'all' 
                                ? "You haven't posted any properties yet. Your listings will appear here once you create them." 
                                : `You don't have any listings with the status "${statusFilter}".`}
                        </p>
                    </div>
                    {statusFilter === 'all' && (
                        <Button asChild className="bg-[#ff385c] hover:bg-[#e31c5f] text-white rounded-2xl px-8 h-12 shadow-xl shadow-[#ff385c]/20">
                            <Link href="/dashboard/create-listing">Create your first listing</Link>
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredListings.map((listing: Listing) => (
                        <Card key={listing.id} className="flex flex-col overflow-hidden border-white/10 bg-card hover:border-white/20 transition-all group">
                            <div className="relative h-48 bg-neutral-900 overflow-hidden">
                                {listing.images && listing.images[0] ? (
                                    <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-neutral-700 font-bold uppercase tracking-widest text-sm">No Image</div>
                                )}
                                <div className="absolute top-3 right-3">
                                    <Badge variant={
                                        listing.status === 'published' ? 'default' :
                                            listing.status === 'draft' ? 'secondary' :
                                                listing.status === 'expired' ? 'destructive' : 'outline'
                                    }>
                                        {listing.status.replace('_', ' ')}
                                    </Badge>
                                </div>
                            </div>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg truncate text-white" title={listing.title}>{listing.title}</CardTitle>
                                <div className="text-2xl font-bold text-white mt-1">ETB {listing.price.toLocaleString()}</div>
                            </CardHeader>
                            <CardContent className="flex-1 pb-4">
                                <p className="text-sm text-muted-foreground truncate">
                                    {listing.location_neighborhood ? `${listing.location_neighborhood}, ` : ''}{listing.location_city}
                                </p>
                                <div className="mt-4 flex items-center gap-4 text-xs font-medium text-neutral-400 bg-white/5 p-2 rounded-lg border border-white/5">
                                    <span className="flex items-center gap-1">🛏️ {listing.bedrooms} Beds</span>
                                    <span className="flex items-center gap-1">🚿 {listing.bathrooms} Baths</span>
                                    <span className="flex items-center gap-1">📐 {listing.sqft} sqft</span>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between border-t border-white/10 bg-white/[0.02] p-4">
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" asChild className="hover:bg-white/5 text-neutral-300 border-white/10">
                                        <Link href={`/dashboard/edit/${listing.id}`}>Edit Details</Link>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 font-medium"
                                        onClick={() => handleDelete(listing.id)}
                                    >
                                        Delete
                                    </Button>
                                </div>

                                {listing.status === 'expired' ? (
                                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => handleRenew(listing.id)}>
                                        Renew Listing
                                    </Button>
                                ) : (listing.status === 'draft' || listing.status === 'pending_payment') && (
                                    <Button size="sm" asChild className="bg-black text-white px-4">
                                        <Link href={`/dashboard/payment/${listing.id}`}>Pay & Publish</Link>
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
