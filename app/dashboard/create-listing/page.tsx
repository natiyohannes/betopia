import ListingForm from "@/components/dashboard/listing-form"

export default function CreateListingPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Post a Property</h1>
                <p className="text-muted-foreground">
                    Fill in the details below to list your property. Payment is required before publishing.
                </p>
            </div>
            <ListingForm />
        </div>
    )
}
