"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MapPickerProps {
    lat: number | null
    lng: number | null
    onChange: (lat: number, lng: number) => void
}

export function MapPicker({ lat, lng, onChange }: MapPickerProps) {
    const mapRef = useRef<HTMLDivElement>(null)
    const markerRef = useRef<any>(null)
    const mapInstanceRef = useRef<any>(null)
    const [locating, setLocating] = useState(false)

    // Default center: Addis Ababa (9.0107, 38.7612)
    const initialLat = lat || 9.0107
    const initialLng = lng || 38.7612

    useEffect(() => {
        if (typeof window === "undefined") return

        // Load Leaflet CSS and JS dynamically
        if (!(window as any).L) {
            const link = document.createElement("link")
            link.rel = "stylesheet"
            link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
            document.head.appendChild(link)

            const script = document.createElement("script")
            script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
            script.async = true
            script.onload = () => {
                initPicker()
            }
            document.head.appendChild(script)
        } else {
            initPicker()
        }

        function initPicker() {
            if (!mapRef.current) return
            const L = (window as any).L

            if ((mapRef.current as any)._leaflet_id) {
                // If map already initialized, just update view and marker position
                if (mapInstanceRef.current && lat && lng) {
                    mapInstanceRef.current.setView([lat, lng], 15)
                    if (markerRef.current) {
                        markerRef.current.setLatLng([lat, lng])
                    }
                }
                return
            }

            const map = L.map(mapRef.current).setView([initialLat, initialLng], 14)
            mapInstanceRef.current = map

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "&copy; OpenStreetMap contributors"
            }).addTo(map)

            const marker = L.marker([initialLat, initialLng], { draggable: true }).addTo(map)
            markerRef.current = marker

            marker.bindPopup("Drag pin to set exact property location").openPopup()

            // Update on drag end
            marker.on("dragend", () => {
                const position = marker.getLatLng()
                onChange(position.lat, position.lng)
            })

            // Update on map click
            map.on("click", (e: any) => {
                const { lat: clickLat, lng: clickLng } = e.latlng
                marker.setLatLng([clickLat, clickLng])
                onChange(clickLat, clickLng)
            })
        }
    }, [lat, lng])

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser")
            return
        }

        setLocating(true)
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const currentLat = pos.coords.latitude
                const currentLng = pos.coords.longitude

                onChange(currentLat, currentLng)

                if (mapInstanceRef.current && markerRef.current) {
                    const L = (window as any).L
                    mapInstanceRef.current.setView([currentLat, currentLng], 16)
                    markerRef.current.setLatLng([currentLat, currentLng])
                    markerRef.current.bindPopup("Property Location Pinned!").openPopup()
                }

                setLocating(false)
            },
            (err) => {
                console.error(err)
                alert("Unable to retrieve your location. Please tap/click on the map to pin your location manually.")
                setLocating(false)
            }
        )
    }

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm font-bold text-neutral-200">
                    <MapPin className="text-[#ff385c]" size={18} />
                    <span>Tap on the map or drag the pin to set location <span className="text-[#ff385c]">*</span></span>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={locating}
                    onClick={handleUseCurrentLocation}
                    className="text-xs gap-2 border-white/20 hover:bg-white/10"
                >
                    <Navigation size={14} className={locating ? "animate-spin" : ""} />
                    {locating ? "Locating..." : "Use Current Location"}
                </Button>
            </div>

            <div className="relative rounded-2xl overflow-hidden border-2 border-white/10 shadow-xl bg-neutral-900">
                <div
                    ref={mapRef}
                    className="w-full h-[320px] z-0"
                    style={{ minHeight: "320px" }}
                />
            </div>

            {lat && lng ? (
                <div className="text-xs text-neutral-400 font-mono flex gap-4 bg-white/5 p-3 rounded-xl border border-white/5">
                    <span>Latitude: <strong className="text-white">{lat.toFixed(6)}</strong></span>
                    <span>Longitude: <strong className="text-white">{lng.toFixed(6)}</strong></span>
                </div>
            ) : (
                <p className="text-xs text-[#ff385c] font-medium">⚠️ Location pin is mandatory before publishing.</p>
            )}
        </div>
    )
}
