export interface Profile {
    id: string;
    full_name: string | null;
    email: string | null;
    phone_number: string | null;
    avatar_url: string | null;
    role: 'user' | 'admin' | 'moderator';
    created_at: string;
}

export interface Listing {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    price: number;
    property_type: 'house' | 'apartment' | 'land' | 'commercial';
    bedrooms: number | null;
    bathrooms: number | null;
    sqft: number | null;
    floor_number: number | null;
    is_furnished: boolean;
    is_rent: boolean;
    street_address: string | null;
    nearby_places: string | null;
    rules: string | null;
    location_city: string;
    location_neighborhood: string | null;
    latitude: number | null;
    longitude: number | null;
    amenities: Record<string, boolean>;
    images: string[];
    video_url: string | null;
    status: 'draft' | 'pending_payment' | 'paid' | 'published' | 'expired' | 'rejected' | 'sold';
    featured: boolean;
    views_count: number;
    created_at: string;
    updated_at: string;
    profiles?: Profile; // Joined host info
}

export interface Payment {
    id: string;
    user_id: string;
    listing_id: string | null;
    plan_id: string | null;
    amount: number;
    currency: string;
    provider: string; // 'telebirr'
    status: 'pending' | 'completed' | 'failed';
    transaction_id: string | null;
    created_at: string;
    listings?: { title: string };
    profiles?: { full_name: string };
}

export interface PricingPlan {
    id: string;
    name: string;
    price: number;
    duration_days: number;
    is_featured: boolean;
    active: boolean;
}
