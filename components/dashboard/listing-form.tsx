"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Camera, Trash2, ArrowRight, ArrowLeft } from "lucide-react"

interface ListingFormProps {
    initialData?: any;
    listingId?: string;
    isEditing?: boolean;
}

export default function ListingForm({ initialData, listingId, isEditing = false }: ListingFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState(1)

    // Form State
    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        description: initialData?.description || "",
        price: initialData?.price?.toString() || "",
        property_type: initialData?.property_type || "house",
        bedrooms: initialData?.bedrooms?.toString() || "",
        bathrooms: initialData?.bathrooms?.toString() || "",
        sqft: initialData?.sqft?.toString() || "",
        location_city: initialData?.location_city || "",
        location_neighborhood: initialData?.location_neighborhood || "",
        street_address: initialData?.street_address || "",
        floor_number: initialData?.floor_number?.toString() || "",
        is_furnished: initialData?.is_furnished || false,
        is_rent: initialData?.is_rent ?? true,
        nearby_places: initialData?.nearby_places || "",
        rules: initialData?.rules || "",
        latitude: initialData?.latitude?.toString() || "",
        longitude: initialData?.longitude?.toString() || "",
        amenities: initialData?.amenities || {
            parking: false,
            wifi: false,
            pool: false,
            gym: false
        }
    })

    const [images, setImages] = useState<File[]>([])
    const [previews, setPreviews] = useState<string[]>(initialData?.images || [])

    // Sync state if initialData changes (useful for dynamic loading)
    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || "",
                description: initialData.description || "",
                price: initialData.price?.toString() || "",
                property_type: initialData.property_type || "house",
                bedrooms: initialData.bedrooms?.toString() || "",
                bathrooms: initialData.bathrooms?.toString() || "",
                sqft: initialData.sqft?.toString() || "",
                location_city: initialData.location_city || "",
                location_neighborhood: initialData.location_neighborhood || "",
                street_address: initialData.street_address || "",
                floor_number: initialData.floor_number?.toString() || "",
                is_furnished: initialData.is_furnished || false,
                is_rent: initialData.is_rent ?? true,
                nearby_places: initialData.nearby_places || "",
                rules: initialData.rules || "",
                latitude: initialData.latitude?.toString() || "",
                longitude: initialData.longitude?.toString() || "",
                amenities: initialData.amenities || {
                    parking: false,
                    wifi: false,
                    pool: false,
                    gym: false
                }
            })
            setPreviews(initialData.images || [])
        }
    }, [initialData])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleAmenityChange = (key: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            amenities: {
                ...prev.amenities,
                [key]: checked
            }
        }))
    }

    const handlePasteCoordinates = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        if (!value) return

        // Try to split by comma or space
        const parts = value.split(/[\s,]+/).map(p => p.trim()).filter(p => p !== "")
        if (parts.length >= 2) {
            const lat = parts[0]
            const lng = parts[1]
            if (!isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
                setFormData(prev => ({
                    ...prev,
                    latitude: lat,
                    longitude: lng
                }))
            }
        }
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files)
            const validFiles = files.filter(file => {
                const isValidSize = file.size < 5 * 1024 * 1024
                if (!isValidSize) alert(`File ${file.name} is too large (>5MB)`)
                return isValidSize
            })

            setImages(prev => [...prev, ...validFiles])
            const newPreviews = validFiles.map(file => URL.createObjectURL(file))
            setPreviews(prev => [...prev, ...newPreviews])
        }
    }

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index))
        setPreviews(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent, shouldPublish: boolean = false) => {
        if (e) e.preventDefault()
        if (step < 2) {
            setStep(step + 1)
            return
        }

        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("You must be logged in")

            // Check if admin
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            const isAdmin = profile?.role === 'admin' || user.email === 'betopia.et@gmail.com'

            // 1. Upload Images (Simulated)
            const imageUrls = previews.length > 0 ? previews : ["https://images.unsplash.com/photo-1518780664697-55e3ad937233"]

            // 2. Insert or Update DB
            const payload = {
                user_id: user.id,
                title: formData.title,
                description: formData.description,
                price: parseFloat(formData.price),
                property_type: formData.property_type,
                bedrooms: parseInt(formData.bedrooms) || 0,
                bathrooms: parseInt(formData.bathrooms) || 0,
                sqft: parseFloat(formData.sqft) || 0,
                floor_number: parseInt(formData.floor_number) || null,
                is_furnished: formData.is_furnished,
                is_rent: formData.is_rent,
                street_address: formData.street_address,
                nearby_places: formData.nearby_places,
                rules: formData.rules,
                location_city: formData.location_city,
                location_neighborhood: formData.location_neighborhood,
                latitude: formData.latitude ? parseFloat(formData.latitude) : null,
                longitude: formData.longitude ? parseFloat(formData.longitude) : null,
                amenities: formData.amenities,
                images: imageUrls,
                status: shouldPublish ? (isAdmin ? 'published' : 'pending_payment') : (isEditing ? (initialData?.status || 'draft') : 'draft'),
                updated_at: new Date().toISOString()
            }

            let result;
            if (isEditing && listingId) {
                result = await supabase
                    .from('listings')
                    .update(payload)
                    .eq('id', listingId)
                    .select()
                    .single()
            } else {
                result = await supabase
                    .from('listings')
                    .insert(payload)
                    .select()
                    .single()
            }

            if (result.error) throw result.error

            if (shouldPublish) {
                if (isAdmin) {
                    router.push(`/dashboard/my-listings`)
                } else {
                    router.push(`/dashboard/payment/${result.data.id}`)
                }
            } else {
                router.push(`/dashboard/my-listings`)
            }
            router.refresh()
        } catch (error: any) {
            console.error(error)
            alert(error.message || "Error saving listing")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit}>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>{isEditing ? "Edit Listing" : "Create New Listing"}</CardTitle>
                            <CardDescription>
                                {isEditing ? "Update your property details." : "Fill out the details to get your property listed."}
                            </CardDescription>
                        </div>
                        <div className="text-sm font-medium bg-secondary px-3 py-1 rounded-full text-black">
                            Step {step} of 2
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-8">

                    {step === 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
                            <div className="space-y-2 col-span-2 text-black">
                                <Label htmlFor="title" className="text-black">Listing Title</Label>
                                <Input id="title" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g. Modern Apartment in Bole" />
                            </div>

                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="desc">Description</Label>
                                <Textarea id="desc" name="description" value={formData.description} onChange={handleChange} required placeholder="Describe the property..." className="min-h-[120px]" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="price">Price (ETB)</Label>
                                <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} required placeholder="e.g. 50000" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type">Property Type</Label>
                                <select
                                    id="type"
                                    name="property_type"
                                    value={formData.property_type}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="house">House</option>
                                    <option value="apartment">Apartment</option>
                                    <option value="commercial">Commercial</option>
                                    <option value="land">Land</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="listing_type">Listing Type</Label>
                                <select
                                    id="listing_type"
                                    name="is_rent"
                                    value={formData.is_rent ? "true" : "false"}
                                    onChange={(e) => setFormData(prev => ({ ...prev, is_rent: e.target.value === "true" }))}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="true">For Rent</option>
                                    <option value="false">For Sale</option>
                                </select>
                            </div>

                            <div className="flex items-center space-x-2 pt-8">
                                <input
                                    type="checkbox"
                                    id="is_furnished"
                                    checked={formData.is_furnished}
                                    onChange={(e) => setFormData(prev => ({ ...prev, is_furnished: e.target.checked }))}
                                    className="h-4 w-4 rounded border-gray-300 text-[#ff385c]"
                                />
                                <Label htmlFor="is_furnished" className="text-sm font-medium cursor-pointer">Property is Furnished</Label>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bed">Bedrooms</Label>
                                <Input id="bed" name="bedrooms" type="number" value={formData.bedrooms} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bath">Bathrooms</Label>
                                <Input id="bath" name="bathrooms" type="number" value={formData.bathrooms} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="floor">Floor Number</Label>
                                <Input id="floor" name="floor_number" type="number" value={formData.floor_number} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sqft">Sq Ft</Label>
                                <Input id="sqft" name="sqft" type="number" value={formData.sqft} onChange={handleChange} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input id="city" name="location_city" value={formData.location_city} onChange={handleChange} required placeholder="e.g. Addis Ababa" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="neighborhood">Neighborhood</Label>
                                <Input id="neighborhood" name="location_neighborhood" value={formData.location_neighborhood} onChange={handleChange} required placeholder="e.g. Bole" />
                            </div>

                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="street">Street Address</Label>
                                <Input id="street" name="street_address" value={formData.street_address} onChange={handleChange} placeholder="e.g. Ring Road, near Edna Mall" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nearby">Nearby Places</Label>
                                <Input id="nearby" name="nearby_places" value={formData.nearby_places} onChange={handleChange} placeholder="e.g. Schools, Hospitals, Roads" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="rules">House Rules</Label>
                                <Input id="rules" name="rules" value={formData.rules} onChange={handleChange} placeholder="e.g. No pets, No smoking" />
                            </div>

                            <div className="space-y-4 col-span-2 pt-4">
                                <Label className="text-lg font-semibold">Amenities</Label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {Object.keys(formData.amenities).map((key) => (
                                        <div key={key} className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-gray-50 transition">
                                            <input
                                                type="checkbox"
                                                id={key}
                                                checked={formData.amenities[key as keyof typeof formData.amenities]}
                                                onChange={(e) => handleAmenityChange(key, e.target.checked)}
                                                className="h-4 w-4 rounded border-gray-300 text-[#ff385c]"
                                            />
                                            <label htmlFor={key} className="text-sm font-medium capitalize cursor-pointer">
                                                {key}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                            <div className="space-y-2">
                                <Label className="text-lg font-semibold">Media Upload</Label>
                                <CardDescription>Add photos to attract more buyers. (Up to 10 photos)</CardDescription>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {previews.map((preview, index) => (
                                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden group border">
                                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}

                                {previews.length < 10 && (
                                    <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 hover:border-black transition text-gray-400">
                                        <Camera className="w-8 h-8 mb-2" />
                                        <span className="text-xs font-medium">Add Photo</span>
                                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                                    </label>
                                )}
                            </div>

                            <div className="space-y-4 pt-6">
                                <Label className="text-lg font-semibold">Location (Optional Pin)</Label>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="paste_coords" className="text-xs text-muted-foreground">Paste coordinates (e.g. 9.02, 38.75) to split at once</Label>
                                        <Input
                                            id="paste_coords"
                                            placeholder="Paste Lat, Lng here..."
                                            onChange={handlePasteCoordinates}
                                            className="bg-muted/50 border-dashed"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="lat">Latitude</Label>
                                            <Input id="lat" name="latitude" type="number" step="any" value={formData.latitude} onChange={handleChange} placeholder="9.005..." />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lng">Longitude</Label>
                                            <Input id="lng" name="longitude" type="number" step="any" value={formData.longitude} onChange={handleChange} placeholder="38.76..." />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </CardContent>
                <CardFooter className="flex justify-between border-t p-6 mt-8">
                    {step === 1 ? (
                        <Button variant="ghost" type="button" onClick={() => router.back()}>Cancel</Button>
                    ) : (
                        <Button variant="outline" type="button" onClick={() => setStep(step - 1)}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                    )}

                    <div className="flex gap-3">
                        {step === 2 && (
                            <Button
                                type="button"
                                variant="outline"
                                disabled={loading}
                                onClick={() => handleSubmit(null as any, false)}
                            >
                                {isEditing ? "Save Changes" : "Save as Draft"}
                            </Button>
                        )}
                        <Button
                            type="button"
                            disabled={loading}
                            className="bg-[#ff385c] hover:bg-[#e31c5f] text-white px-8"
                            onClick={(e) => {
                                if (step < 2) {
                                    setStep(2);
                                } else {
                                    handleSubmit(null as any, true);
                                }
                            }}
                        >
                            {loading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : step === 1 ? (
                                <>Next <ArrowRight className="ml-2 h-4 w-4" /></>
                            ) : (
                                "Publish & Continue"
                            )}
                        </Button>
                    </div>
                </CardFooter>
            </form>
        </Card>
    )
}

