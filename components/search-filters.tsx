"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"

export function SearchFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [filters, setFilters] = useState({
        city: searchParams.get("city") || "",
        type: searchParams.get("type") || "",
        minPrice: searchParams.get("minPrice") || "",
        maxPrice: searchParams.get("maxPrice") || "",
        beds: searchParams.get("beds") || "",
        sort: searchParams.get("sort") || "latest",
    })

    // Update state when URL changes
    useEffect(() => {
        setFilters({
            city: searchParams.get("city") || "",
            type: searchParams.get("type") || "",
            minPrice: searchParams.get("minPrice") || "",
            maxPrice: searchParams.get("maxPrice") || "",
            beds: searchParams.get("beds") || "",
            sort: searchParams.get("sort") || "latest",
        })
    }, [searchParams])

    const handleApply = () => {
        const params = new URLSearchParams()
        if (filters.city) params.set("city", filters.city)
        if (filters.type) params.set("type", filters.type)
        if (filters.minPrice) params.set("minPrice", filters.minPrice)
        if (filters.maxPrice) params.set("maxPrice", filters.maxPrice)
        if (filters.beds) params.set("beds", filters.beds)
        if (filters.sort && filters.sort !== 'latest') params.set("sort", filters.sort)

        router.push(`/search?${params.toString()}`)
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-4">Filters</h3>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Location (City)</Label>
                        <Input
                            placeholder="Addis Ababa"
                            value={filters.city}
                            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Property Type</Label>
                        <Select
                            value={filters.type}
                            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                        >
                            <option value="">Any</option>
                            <option value="house">House</option>
                            <option value="apartment">Apartment</option>
                            <option value="commercial">Commercial</option>
                            <option value="land">Land</option>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Price Range (ETB)</Label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Min"
                                type="number"
                                value={filters.minPrice}
                                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                            />
                            <Input
                                placeholder="Max"
                                type="number"
                                value={filters.maxPrice}
                                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Bedrooms</Label>
                        <Select
                            value={filters.beds}
                            onChange={(e) => setFilters({ ...filters, beds: e.target.value })}
                        >
                            <option value="">Any</option>
                            <option value="1">1+</option>
                            <option value="2">2+</option>
                            <option value="3">3+</option>
                            <option value="4">4+</option>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Sort By</Label>
                        <Select
                            value={filters.sort}
                            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                        >
                            <option value="latest">Latest</option>
                            <option value="oldest">Oldest</option>
                            <option value="highest_rating">Highest Rating</option>
                        </Select>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                        <Button className="w-full bg-white text-black hover:bg-neutral-200 font-bold" onClick={handleApply}>
                            Apply Filters
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
