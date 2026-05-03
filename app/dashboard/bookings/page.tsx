"use client"

import { useState, useEffect } from 'react'
import { Calendar, MapPin, Clock, ChevronRight, Home, Search, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export default function MyBookingsPage() {
    const [bookings, setBookings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)

            if (user) {
                const { data, error } = await supabase
                    .from('bookings')
                    .select(`
                        id,
                        status,
                        visit_date,
                        owner_id,
                        user_id,
                        listing:listing_id (
                            id,
                            title,
                            images,
                            location_city,
                            location_neighborhood
                        ),
                        guest:user_id (
                            full_name,
                            phone_number
                        ),
                        owner:owner_id (
                            full_name,
                            phone_number
                        )
                    `)
                    .or(`user_id.eq.${user.id},owner_id.eq.${user.id}`)
                    .order('visit_date', { ascending: true })

                if (data) setBookings(data)
                if (error) console.error("Error fetching bookings:", error)
            }
            setLoading(false)
        }
        fetchData()
    }, [])

    const removeBooking = async (id: string) => {
        if (confirm("Are you sure you want to permanently delete this booking?")) {
            const { error } = await supabase
                .from('bookings')
                .delete()
                .eq('id', id)

            if (error) {
                alert("Error deleting booking: " + error.message)
            } else {
                setBookings(prev => prev.filter(b => b.id !== id))
            }
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 size={40} className="animate-spin text-[#ff385c]" />
                <p className="text-neutral-400 font-medium">Loading your bookings...</p>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto space-y-12 py-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-5xl font-black text-white tracking-tighter">MY BOOKINGS</h1>
                    <p className="text-neutral-400 mt-2 font-medium">Manage your viewing appointments and property visits</p>
                </div>
                <Button asChild className="bg-[#ff385c] hover:bg-[#e31c5f] text-white rounded-2xl h-14 px-8 font-bold shadow-2xl shadow-[#ff385c]/20">
                    <Link href="/">Book More Viewings</Link>
                </Button>
            </div>

            {bookings.length === 0 ? (
                <div className="bg-neutral-900/50 border-2 border-dashed border-white/5 rounded-[40px] p-20 text-center flex flex-col items-center gap-6">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                        <Calendar size={32} className="text-neutral-500" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white uppercase tracking-wider">No Bookings Yet</h3>
                        <p className="text-neutral-500 mt-2">You haven't scheduled any property viewings yet.</p>
                    </div>
                    <Button asChild variant="outline" className="h-14 px-10 rounded-2xl border-white/10 hover:bg-white/5 text-white font-bold">
                        <Link href="/">Explore Properties</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6">
                    {bookings.map((booking) => (
                        <div 
                            key={booking.id} 
                            className="bg-neutral-900 border border-white/10 rounded-[32px] overflow-hidden group hover:border-[#ff385c]/40 transition-all shadow-2xl"
                        >
                            <div className="flex flex-col md:flex-row">
                                <div className="md:w-72 h-48 relative overflow-hidden">
                                    <img 
                                        src={booking.listing?.images?.[0] || 'https://images.unsplash.com/photo-1518780664697-55e3ad937233'} 
                                        alt={booking.listing?.title} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                            booking.status === 'Confirmed' ? 'bg-[#4ade80] text-black' : 'bg-yellow-500 text-black'
                                        }`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-1 p-8 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                                                    booking.owner_id === user?.id 
                                                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                                                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                }`}>
                                                    {booking.owner_id === user?.id ? 'Host' : 'Guest'}
                                                </span>
                                            </div>
                                            <h3 className="text-2xl font-bold text-white group-hover:text-[#ff385c] transition-colors">{booking.listing?.title}</h3>
                                            <div className="flex items-center gap-2 text-neutral-400">
                                                <MapPin size={16} className="text-[#ff385c]" />
                                                <span className="text-sm">
                                                    {booking.listing?.location_neighborhood ? `${booking.listing.location_neighborhood}, ` : ''}{booking.listing?.location_city}
                                                </span>
                                            </div>
                                            <div className="text-sm text-neutral-300 mt-2">
                                                {booking.owner_id === user?.id ? (
                                                    <span><span className="text-neutral-500">Booked by:</span> {booking.guest?.full_name || 'Guest'} {booking.guest?.phone_number && `(${booking.guest.phone_number})`}</span>
                                                ) : (
                                                    <span><span className="text-neutral-500">Hosted by:</span> {booking.owner?.full_name || 'Host'} {booking.owner?.phone_number && `(${booking.owner.phone_number})`}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-2 text-white font-bold">
                                                <Calendar size={18} className="text-neutral-500" />
                                                {booking.visit_date ? new Date(booking.visit_date).toLocaleDateString() : 'TBD'}
                                            </div>
                                            <div className="flex items-center gap-2 text-neutral-400 text-sm mt-1">
                                                <Clock size={16} />
                                                {booking.visit_date ? new Date(booking.visit_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'TBD'}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-8 flex justify-between items-center bg-white/5 rounded-2xl p-4">
                                        <div className="flex gap-4">
                                            <Button variant="link" className="text-neutral-400 hover:text-white p-0 h-auto font-bold text-sm">Reschedule</Button>
                                            <button 
                                                onClick={() => removeBooking(booking.id)}
                                                className="text-red-500/80 hover:text-red-500 p-0 h-auto font-bold text-sm flex items-center gap-1.5 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                                Cancel Booking (Permanent)
                                            </button>
                                        </div>
                                        <Button asChild className="bg-white/10 text-white hover:bg-white/20 rounded-xl px-6 font-bold h-10 border border-white/10">
                                            <Link href={`/listings/${booking.listing?.id}`}>
                                                View Listing <ChevronRight size={14} className="ml-1" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
