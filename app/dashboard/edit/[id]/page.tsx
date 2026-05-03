"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import ListingForm from "@/components/dashboard/listing-form"
import { Loader2 } from "lucide-react"

export default function EditListingPage() {
    const { id } = useParams()
    const router = useRouter()
    const [listing, setListing] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchListing = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push("/login")
                return
            }

            const { data, error } = await supabase
                .from("listings")
                .select("*")
                .eq("id", id)
                .eq("user_id", user.id)
                .single()

            if (error || !data) {
                console.error("Error fetching listing:", error)
                alert("Listing not found or you don't have permission to edit it.")
                router.push("/dashboard/my-listings")
                return
            }

            setListing(data)
            setLoading(false)
        }

        if (id) fetchListing()
    }, [id, router])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground font-medium">Loading listing details...</p>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-black">Edit Property</h1>
                <p className="text-muted-foreground">
                    Update the information for "{listing.title}".
                </p>
            </div>
            <ListingForm initialData={listing} listingId={id as string} isEditing={true} />
        </div>
    )
}
