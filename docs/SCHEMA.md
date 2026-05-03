# Betoch Platform: Database & API Documentation

This document outlines the core data structures and "API" (Supabase Tables) used in the Betoch platform.

## Tables & Models

### `listings`
Core table for all property listings.
- `id` (uuid, PK)
- `user_id` (uuid, FK to auth.users)
- `title` (text)
- `description` (text)
- `price` (numeric)
- `property_type` (text: house, apartment, commercial, land)
- `bedrooms`, `bathrooms`, `sqft` (integer/numeric)
- `location_city`, `location_neighborhood` (text)
- `latitude`, `longitude` (float8) - For Map integration
- `amenities` (jsonb) - Key-value store of features
- `images` (text[]) - Array of image URLs
- `status` (text: draft, pending_payment, published, expired, rejected)
- `created_at`, `updated_at` (timestamptz)

### `profiles`
User profile information.
- `id` (uuid, PK, references auth.users)
- `full_name` (text)
- `phone_number` (text)
- `email` (text)
- `role` (text: user, admin)

### `payments`
Transaction records for listing publications.
- `id` (uuid, PK)
- `user_id` (uuid, FK)
- `listing_id` (uuid, FK)
- `amount` (numeric)
- `plan_name` (text)
- `status` (text: pending, completed, failed)
- `transaction_id` (text, unique)
- `created_at` (timestamptz)

### `pricing_plans`
Available publication plans.
- `id` (uuid, PK)
- `name` (text)
- `price` (numeric)
- `duration_days` (integer)
- `is_featured` (boolean)
- `active` (boolean)

## State Transitions
1.  **Creation**: User submits form -> Status: `draft`.
2.  **Payment**: User pays -> Payment record `completed` -> Status: `published`.
3.  **Moderation**: Admin reviews -> Status: `published` OR `rejected`.
4.  **Expiry**: Time elapsed -> Status: `expired`.

## Security (RLS)
The platform uses Supabase Row Level Security:
- `listings`: Users can only `UPDATE`/`DELETE` their own listings.
- `profiles`: Users can only manage their own profile.
- `admin`: Role-based policies allow admins to view all data and edit all listings.
