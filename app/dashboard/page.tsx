"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle, Home, Eye, Heart, CreditCard, Clock, CheckCircle2, FileEdit, Shield, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { Listing, Payment } from "@/types"
import { ActivityOverview } from "@/components/activity-overview"
import { useRouter } from "next/navigation"

const SUPER_ADMIN_EMAIL = "betopia.et@gmail.com"

export default function DashboardPage() {
    const router = useRouter()
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchStats() {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            
            if (!user) {
                router.push("/login")
                return
            }

            // Fetch Listings
            const { data: listings } = await supabase
                .from('listings')
                .select('id, status, views_count, created_at, title')
                .eq('user_id', user.id)

            // Fetch Profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            // Fetch Saved
            const { count: savedCount } = await supabase
                .from('saved_listings')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)

            // Fetch Payments
            const { data: payments } = await supabase
                .from('payments')
                .select('amount')
                .eq('user_id', user.id)

            const totalSpent = (payments as Payment[] | null)?.reduce((acc: number, curr: Payment) => acc + Number(curr.amount), 0) || 0

            setStats({
                listings: (listings as Listing[] | null) || [],
                savedCount: savedCount || 0,
                totalSpent,
                activeCount: (listings as Listing[] | null)?.filter((l: Listing) => l.status === 'published').length || 0,
                draftCount: (listings as Listing[] | null)?.filter((l: Listing) => l.status === 'draft').length || 0,
                pendingCount: (listings as Listing[] | null)?.filter((l: Listing) => l.status === 'pending_payment').length || 0,
                totalViews: (listings as Listing[] | null)?.reduce((acc: number, curr: Listing) => acc + (curr.views_count || 0), 0) || 0,
                userEmail: user.email || '',
                isAdmin: profile?.role === 'admin' || user.email === SUPER_ADMIN_EMAIL
            })
            setLoading(false)
        }
        fetchStats()
    }, [router])

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-[#ff385c]" />
            </div>
        )
    }

    if (!stats) return null

    const isAdmin = stats.isAdmin

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Overview</h1>
                    <p className="text-muted-foreground">Welcome back! Here&apos;s what&apos;s happening with your properties.</p>
                </div>
                <Button asChild className="bg-[#ff385c] hover:bg-[#e31c5f] text-white">
                    <Link href="/dashboard/create-listing">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create New Listing
                    </Link>
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-none shadow-md bg-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-400 uppercase tracking-wider">Total Listings</CardTitle>
                        <Home className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{stats.listings.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.activeCount} active, {stats.draftCount} drafts
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-md bg-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-400 uppercase tracking-wider">Total Views</CardTitle>
                        <Eye className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{stats.totalViews}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Across all published properties
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-md bg-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-400 uppercase tracking-wider">Saved Items</CardTitle>
                        <Heart className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{stats.savedCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Properties you favorited
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-md bg-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-400 uppercase tracking-wider">Total Investment</CardTitle>
                        <CreditCard className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">ETB {stats.totalSpent.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Spent on premium visibility
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4 border-none shadow-md bg-card">
                    <CardHeader>
                        <CardTitle className="text-white">Recent Property Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats.listings.length === 0 ? (
                            <p className="text-sm text-neutral-400">No listings yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {stats.listings.slice(0, 5).map((listing: Listing) => (
                                    <div key={listing.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${listing.status === 'published' ? 'bg-green-500/20 text-green-500' :
                                                listing.status === 'pending_payment' ? 'bg-amber-500/20 text-amber-500' :
                                                    'bg-white/5 text-neutral-400'
                                                }`}>
                                                {listing.status === 'published' ? <CheckCircle2 size={16} /> :
                                                    listing.status === 'pending_payment' ? <Clock size={16} /> :
                                                        <FileEdit size={16} />}
                                            </div>
                                            <div className="max-w-[200px] md:max-w-xs truncate">
                                                <p className="font-medium text-white truncate">{listing.title}</p>
                                                <p className="text-xs text-muted-foreground">Created {new Date(listing.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${listing.status === 'published' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                listing.status === 'pending_payment' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                                    'bg-white/5 text-neutral-400 border border-white/10'
                                                }`}>
                                                {listing.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <Button variant="ghost" className="w-full mt-4 text-white font-semibold hover:bg-white/5" asChild>
                            <Link href="/dashboard/my-listings">View all listings</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3 border-none shadow-md bg-card">
                    <CardHeader>
                        <CardTitle className="text-white">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Link href="/dashboard/messages" className="flex items-center p-3 rounded-xl border border-white/5 hover:border-white/20 transition group">
                            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg group-hover:bg-purple-500/20 mr-4">
                                💬
                            </div>
                            <div>
                                <p className="font-semibold text-white">Messages</p>
                                <p className="text-xs text-neutral-400">Check buyer inquiries</p>
                            </div>
                        </Link>
                        <Link href="/dashboard/payments" className="flex items-center p-3 rounded-xl border border-white/5 hover:border-white/20 transition group">
                            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg group-hover:bg-blue-500/20 mr-4">
                                🧾
                            </div>
                            <div>
                                <p className="font-semibold text-white">Payments</p>
                                <p className="text-xs text-neutral-400">History and receipts</p>
                            </div>
                        </Link>
                        <Link href="/dashboard/settings" className="flex items-center p-3 rounded-xl border border-white/5 hover:border-white/20 transition group">
                            <div className="p-3 bg-white/5 text-neutral-400 rounded-lg group-hover:bg-white/10 mr-4">
                                ⚙️
                            </div>
                            <div>
                                <p className="font-semibold text-white">Settings</p>
                                <p className="text-xs text-neutral-400">Update profile info</p>
                            </div>
                        </Link>

                        {/* Admin Panel — only visible to super admin */}
                        {isAdmin && (
                            <Link
                                href="/admin"
                                className="flex items-center p-3 rounded-xl border border-[#ff385c]/20 bg-[#ff385c]/5 hover:border-[#ff385c]/40 hover:bg-[#ff385c]/10 transition group"
                            >
                                <div className="p-3 bg-[#ff385c]/10 text-[#ff385c] rounded-lg group-hover:bg-[#ff385c]/20 mr-4">
                                    <Shield size={20} />
                                </div>
                                <div>
                                    <p className="font-semibold text-[#ff385c]">Admin Panel</p>
                                    <p className="text-xs text-neutral-400">Manage users & permissions</p>
                                </div>
                            </Link>
                        )}
                    </CardContent>
                </Card>
            </div>
            
            {/* Betopia Themed Activity Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 mb-10">
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-white mb-4">Account Activity</h2>
                    <ActivityOverview />
                </div>
            </div>
        </div>
    )
}
