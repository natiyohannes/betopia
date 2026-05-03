"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, ExternalLink } from "lucide-react"

interface MapViewProps {
    lat: number | null;
    lng: number | null;
    address?: string;
}

export default function MapView({ lat, lng, address }: MapViewProps) {
    const mapRef = useRef<HTMLDivElement>(null)
    const [mapLoaded, setMapLoaded] = useState(false)

    useEffect(() => {
        if (!lat || !lng) return

        // Check if Leaflet is already loaded
        if (typeof window !== "undefined" && !(window as any).L) {
            const link = document.createElement("link")
            link.rel = "stylesheet"
            link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
            document.head.appendChild(link)

            const script = document.createElement("script")
            script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
            script.async = true
            script.onload = () => {
                initMap()
            }
            document.head.appendChild(script)
        } else if ((window as any).L) {
            initMap()
        }

        function initMap() {
            if (!mapRef.current) return
            const L = (window as any).L

            // Avoid double initialization
            if ((mapRef.current as any)._leaflet_id) return

            const map = L.map(mapRef.current).setView([lat, lng], 15)

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map)

            L.marker([lat, lng]).addTo(map)
                .bindPopup(address || 'Property Location')
                .openPopup()

            setMapLoaded(true)
        }

        return () => {
            // Cleanup would go here if needed
        }
    }, [lat, lng, address])

    if (!lat || !lng) {
        return (
            <Card className="bg-gray-50 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <MapPin className="h-10 w-10 text-gray-400 mb-2" />
                    <h3 className="text-lg font-medium text-black">Location not specified</h3>
                    <p className="text-sm text-muted-foreground">The owner hasn't provided coordinates for this property.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            <Card className="overflow-hidden border-2 border-gray-100">
                <div
                    ref={mapRef}
                    className="w-full h-[400px] bg-gray-100 z-0"
                    style={{ minHeight: '400px' }}
                />
            </Card>
            <div className="flex justify-between items-center px-1">
                <span className="text-sm font-medium text-black">
                    Coordinates: {lat.toFixed(4)}, {lng.toFixed(4)}
                </span>
                <a
                    href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                    Open in Google Maps <ExternalLink className="h-3 w-3" />
                </a>
            </div>
        </div>
    )
}
