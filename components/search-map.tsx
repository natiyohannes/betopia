"use client"

import { useEffect, useRef } from "react"

interface Listing {
    id: string
    title: string
    price: number
    latitude: number | null
    longitude: number | null
    location_neighborhood?: string
    location_city?: string
    images?: string[]
}

interface SearchMapProps {
    listings: Listing[]
    onListingClick?: (id: string) => void
}

export function SearchMap({ listings, onListingClick }: SearchMapProps) {
    const mapRef = useRef<HTMLDivElement>(null)
    const mapInstanceRef = useRef<any>(null)

    useEffect(() => {
        if (typeof window === "undefined") return

        const init = () => {
            if (!mapRef.current) return
            const L = (window as any).L
            if (!L) return

            // Destroy old map if re-initializing
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
                mapInstanceRef.current = null
            }

            // Center on Addis Ababa by default
            const map = L.map(mapRef.current).setView([9.0107, 38.7612], 12)
            mapInstanceRef.current = map

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "&copy; OpenStreetMap contributors"
            }).addTo(map)

            const validListings = listings.filter(l => l.latitude && l.longitude)

            validListings.forEach(listing => {
                const priceTag = L.divIcon({
                    className: "",
                    html: `<div style="
                        background: #ff385c;
                        color: white;
                        font-weight: 900;
                        font-size: 13px;
                        padding: 6px 12px;
                        border-radius: 999px;
                        white-space: nowrap;
                        box-shadow: 0 4px 16px rgba(255,56,92,0.4);
                        cursor: pointer;
                        border: 2px solid white;
                    ">ETB ${listing.price.toLocaleString()}</div>`,
                    iconAnchor: [50, 20]
                })

                const marker = L.marker([listing.latitude!, listing.longitude!], { icon: priceTag })
                    .addTo(map)
                    .bindPopup(`
                        <div style="font-family:sans-serif; min-width:180px;">
                            ${listing.images?.[0] ? `<img src="${listing.images[0]}" style="width:100%;height:100px;object-fit:cover;border-radius:8px;margin-bottom:8px;" />` : ""}
                            <strong style="font-size:14px;">${listing.title}</strong><br/>
                            <span style="color:#ff385c;font-weight:700;">ETB ${listing.price.toLocaleString()}</span><br/>
                            <span style="color:#666;font-size:12px;">${listing.location_neighborhood || ""}, ${listing.location_city || ""}</span><br/>
                            <a href="/listings/${listing.id}" style="display:inline-block;margin-top:8px;background:#ff385c;color:white;padding:4px 12px;border-radius:8px;text-decoration:none;font-size:12px;font-weight:700;">View Property</a>
                        </div>
                    `)

                if (onListingClick) {
                    marker.on("click", () => onListingClick(listing.id))
                }
            })

            // Auto-fit bounds if multiple listings have coords
            if (validListings.length > 1) {
                const bounds = L.latLngBounds(
                    validListings.map(l => [l.latitude!, l.longitude!])
                )
                map.fitBounds(bounds, { padding: [40, 40] })
            } else if (validListings.length === 1) {
                map.setView([validListings[0].latitude!, validListings[0].longitude!], 15)
            }
        }

        if (!(window as any).L) {
            const link = document.createElement("link")
            link.rel = "stylesheet"
            link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
            document.head.appendChild(link)

            const script = document.createElement("script")
            script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
            script.async = true
            script.onload = init
            document.head.appendChild(script)
        } else {
            init()
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
                mapInstanceRef.current = null
            }
        }
    }, [listings])

    return (
        <div
            ref={mapRef}
            className="w-full h-full"
            style={{ minHeight: "100%" }}
        />
    )
}
