"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { HeartButton } from "./heart-button"
import { Bed, Bath, Maximize, Phone, MapPin, ChevronRight, Clock } from "lucide-react"

interface ListingCardProps {
    data: {
        id: string;
        title: string;
        price: number;
        property_type: string;
        location_city: string;
        location_neighborhood?: string;
        bedrooms: number;
        bathrooms: number;
        sqft: number;
        is_rent: boolean;
        images: string[];
        created_at: string;
        average_rating?: number;
        profiles?: {
            phone_number: string;
        } | any;
    }
}

export function ListingCard({ data }: ListingCardProps) {
    const [isExpired, setIsExpired] = useState(false);
    const mainImage = data.images?.[0] || "https://images.unsplash.com/photo-1518780664697-55e3ad937233";

    useEffect(() => {
        const checkExpiration = () => {
            const createdAt = new Date(data.created_at).getTime();
            const now = new Date().getTime();
            const oneMonth = 30 * 24 * 60 * 60 * 1000;
            const threshold = oneMonth - (24 * 60 * 60 * 1000); // 1 day remaining
            
            if (now - createdAt >= oneMonth) {
                setIsExpired(true);
                return;
            }

            // Warning timer (1 day before)
            if (now - createdAt < threshold) {
                const warningTimer = setTimeout(() => {
                    // Could notify here if we implemented push notifications
                }, threshold - (now - createdAt));
                
                const finalTimer = setTimeout(() => {
                    setIsExpired(true);
                }, oneMonth - (now - createdAt));

                return () => {
                    clearTimeout(warningTimer);
                    clearTimeout(finalTimer);
                };
            } else {
                // Already in warning zone (last 24 hours)
                const finalTimer = setTimeout(() => {
                    setIsExpired(true);
                }, oneMonth - (now - createdAt));
                return () => clearTimeout(finalTimer);
            }
        };

        return checkExpiration();
    }, [data.created_at, data.title]);

    // Permanent disappearance from UI
    // Show the listing even if expired (badge handles status)
    // if (isExpired) return null;

    return (
        <div className="bg-card rounded-3xl overflow-hidden border border-white/5 transition-all group hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10">
            {/* Image Container */}
            <div className="relative aspect-[4/3] overflow-hidden">
                <img
                    src={mainImage}
                    alt={data.title}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

                {/* Status Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {isExpired && (
                        <span className="bg-red-600 text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase">
                            Expired
                        </span>
                    )}
                    <span className={`
                        px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase
                        ${data.is_rent ? 'bg-[#ff385c] text-white' : 'bg-cyan-500 text-white'}
                    `}>
                        {data.is_rent ? 'For Rent' : 'For Sale'}
                    </span>
                </div>

                {/* Heart Button */}
                <div className="absolute top-4 right-4 z-10">
                    <HeartButton listingId={data.id} />
                </div>
            </div>

            {/* Content Container */}
            <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                    <div className="text-3xl font-bold text-white">
                        ETB {data.price.toLocaleString()}
                    </div>
                    <div className="flex gap-2">
                        {(data.average_rating ?? 0) > 0 && (
                            <div className="bg-yellow-500/20 px-2 py-1 rounded-md text-[10px] uppercase font-bold text-yellow-500 flex items-center gap-1 border border-yellow-500/30">
                                ★ {Number(data.average_rating).toFixed(1)}
                            </div>
                        )}
                        <div className="bg-gray-700/50 backdrop-blur-sm px-3 py-1 rounded-md text-[10px] uppercase font-bold text-gray-300 tracking-widest border border-gray-600">
                            {data.property_type}
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    <h3 className="text-xl font-bold text-white truncate">
                        {data.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                        <MapPin size={14} className="text-gray-500" />
                        <span className="truncate">
                            {data.location_neighborhood ? `${data.location_neighborhood}, ` : ''}{data.location_city}
                        </span>
                    </div>
                </div>

                {/* Lister Profile */}
                <Link href={`/profile/${data.profiles?.id || '#'}`} className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors border border-white/5 group/profile">
                    <div className="w-10 h-10 rounded-full bg-neutral-800 border border-white/10 overflow-hidden flex-shrink-0">
                        {data.profiles?.avatar_url ? (
                            <img src={data.profiles.avatar_url} alt={data.profiles.full_name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-[#ff385c]">
                                {data.profiles?.full_name?.charAt(0) || 'U'}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-[10px] text-neutral-500 uppercase font-black tracking-widest leading-none">Listed by</div>
                        <div className="text-sm font-bold text-white truncate group-hover/profile:text-[#ff385c] transition-colors">
                            {data.profiles?.full_name || 'Anonymous User'}
                        </div>
                    </div>
                    <ChevronRight size={16} className="text-neutral-600 group-hover/profile:text-white transition-all transform group-hover/profile:translate-x-1" />
                </Link>

                {/* Owner Phone */}
                {data.profiles?.phone_number && (
                    <div className="flex items-center gap-2 text-[#4ade80] font-semibold text-sm py-1 px-1">
                        <Phone size={16} fill="#4ade80" className="opacity-80" />
                        <span>{data.profiles.phone_number}</span>
                    </div>
                )}

                <div className="pt-4 border-t border-gray-800 flex justify-between items-center text-gray-400 text-[13px] font-medium">
                    <div className="flex items-center gap-1.5">
                        <Bed size={16} />
                        <span>{data.bedrooms} Beds</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Bath size={16} />
                        <span>{data.bathrooms} Baths</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Maximize size={16} />
                        <span>{data.sqft} SQM</span>
                    </div>
                </div>

                {/* Dates */}
                <div className="pt-3 flex justify-between items-center text-[10px] text-neutral-500 font-bold uppercase tracking-widest border-t border-gray-800/50">
                    <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-[#ff385c]" />
                        <span>Listed: {new Date(data.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div>
                        Exp: {new Date(new Date(data.created_at).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                </div>
            </div>
        </div>
    )
}
