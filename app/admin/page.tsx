"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import {
    Shield, Eye, Crown, User, X, Home, LogOut,
    Search, ChevronRight, Loader2, CheckCircle2, AlertTriangle,
    Lock, Mail, RefreshCw, MoreVertical, KeyRound
} from "lucide-react"
import Link from "next/link"

const SUPER_ADMIN_EMAIL = "betopia.et@gmail.com"
const SUPER_ADMIN_CODE = "myname159"

interface UserRow {
    id: string
    email: string
    created_at: string
    last_sign_in_at: string | null
    full_name: string | null
    phone_number: string | null
    role: string
    subscription_status: string
    listing_count: number
}

interface UserListing {
    id: string
    title: string
    status: string
    price: number
    location_city: string
    created_at: string
    images?: any
    property_type?: string
    user_id?: string
    profiles?: any
}

type AdminView = 'users' | 'user_listings' | 'all_listings'

// ── Modal: Set Security Code when granting admin ────────────────
function AdminCodeModal({
    user,
    onConfirm,
    onClose,
}: {
    user: UserRow
    onConfirm: (userId: string, code: string, adminConfirm: string) => void
    onClose: () => void
}) {
    const [newUserCode, setNewUserCode] = useState("")
    const [adminConfirmCode, setAdminConfirmCode] = useState("")
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-neutral-950 border border-white/10 rounded-[40px] p-10 max-w-md w-full shadow-2xl space-y-8">
                <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-[#ff385c]/10 border border-[#ff385c]/20 rounded-3xl flex items-center justify-center mx-auto">
                        <KeyRound className="text-[#ff385c]" size={28} />
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-widest">Elevate to Admin</h2>
                    <p className="text-neutral-500 text-sm font-medium">
                        Promoting <span className="text-white font-bold">{user.full_name || user.email}</span>
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Confirmation Input */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-500">
                            Confirm Your Admin Code
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirm ? "text" : "password"}
                                value={adminConfirmCode}
                                onChange={e => setAdminConfirmCode(e.target.value)}
                                placeholder="Verify your own code"
                                className="w-full bg-white/5 border border-white/10 focus:border-[#ff385c]/50 outline-none rounded-2xl h-14 px-5 pr-14 text-white font-mono tracking-widest transition-all"
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors text-xs font-black uppercase"
                            >
                                {showConfirm ? "hide" : "show"}
                            </button>
                        </div>
                    </div>

                    {/* New User Code Input */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[#ff385c]">
                            Set A Security Code For Them
                        </label>
                        <div className="relative">
                            <input
                                type={showNew ? "text" : "password"}
                                value={newUserCode}
                                onChange={e => setNewUserCode(e.target.value)}
                                placeholder="Create a code for them"
                                className="w-full bg-white/5 border border-[#ff385c]/30 focus:border-[#ff385c]/50 outline-none rounded-2xl h-14 px-5 pr-14 text-white font-mono tracking-widest transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew(!showNew)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors text-xs font-black uppercase"
                            >
                                {showNew ? "hide" : "show"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                    <button
                        onClick={onClose}
                        className="flex-1 h-12 border border-white/10 hover:bg-white/5 text-neutral-400 font-bold rounded-2xl transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => { if (newUserCode.trim() && adminConfirmCode) onConfirm(user.id, newUserCode.trim(), adminConfirmCode.trim()) }}
                        disabled={!newUserCode.trim() || !adminConfirmCode.trim()}
                        className="flex-1 h-12 bg-[#ff385c] hover:bg-[#e31c5f] text-white font-black rounded-2xl shadow-xl shadow-[#ff385c]/20 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                    >
                        <Crown size={16} /> Confirm Promotion
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function AdminPage() {
    const router = useRouter()

    // Auth state
    const [authStep, setAuthStep] = useState<'checking' | 'denied' | 'verify' | 'ready'>('checking')
    const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null)
    const [isSuperAdmin, setIsSuperAdmin] = useState(false)

    // Verification
    const [verifyCode, setVerifyCode] = useState("")
    const [verifyError, setVerifyError] = useState("")
    const [verifyLoading, setVerifyLoading] = useState(false)

    // Data state
    const [users, setUsers] = useState<UserRow[]>([])
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [allListings, setAllListings] = useState<UserListing[]>([])
    const [loadingAllListings, setLoadingAllListings] = useState(false)
    const [view, setView] = useState<AdminView>('users')
    const [selectedUser, setSelectedUser] = useState<UserRow | null>(null)
    const [userListings, setUserListings] = useState<UserListing[]>([])
    const [loadingListings, setLoadingListings] = useState(false)
    const [roleUpdateLoading, setRoleUpdateLoading] = useState<string | null>(null)
    const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)
    const [actionMenu, setActionMenu] = useState<string | null>(null)
    const [adminCodeModal, setAdminCodeModal] = useState<UserRow | null>(null)

    // Check auth on mount
    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.replace('/login')
                return
            }

            const superAdmin = user.email === SUPER_ADMIN_EMAIL

            if (superAdmin) {
                setIsSuperAdmin(true)
                setCurrentUserEmail(user.email ?? null)
                setAuthStep('verify')
                return
            }

            // Check if they're an admin in profiles
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            if (profile?.role === 'admin') {
                setCurrentUserEmail(user.email ?? null)
                setAuthStep('verify')
            } else {
                setAuthStep('denied')
            }
        }
        checkAuth()
    }, [router])

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        setVerifyLoading(true)
        setVerifyError("")

        await new Promise(r => setTimeout(r, 600))

        if (isSuperAdmin) {
            // Super admin uses hardcoded code
            if (verifyCode === SUPER_ADMIN_CODE) {
                setAuthStep('ready')
                loadUsers()
            } else {
                setVerifyError("Invalid security code. Access denied.")
            }
        } else {
            // Other admins verify against their stored code in DB
            const { data, error } = await supabase.rpc('verify_admin_code', { code: verifyCode })
            if (!error && data === true) {
                setAuthStep('ready')
                loadUsers()
            } else {
                setVerifyError("Invalid security code. Access denied.")
            }
        }

        setVerifyLoading(false)
    }

    const loadUsers = useCallback(async () => {
        setLoading(true)
        const { data, error } = await supabase.rpc('get_all_users')
        if (error) {
            showToast('error', "Failed to load users: " + error.message)
        } else {
            setUsers(data || [])
        }
        setLoading(false)
    }, [])

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message })
        setTimeout(() => setToast(null), 4000)
    }

    const handleSetRole = async (userId: string, role: string, securityCode?: string, adminConfirmCode?: string) => {
        setRoleUpdateLoading(userId)
        setActionMenu(null)
        setAdminCodeModal(null)

        // Verify current admin's authority first
        let isAuthorized = false
        if (isSuperAdmin) {
            isAuthorized = adminConfirmCode === SUPER_ADMIN_CODE
        } else {
            const { data, error: vError } = await supabase.rpc('verify_admin_code', { code: adminConfirmCode })
            isAuthorized = !vError && data === true
        }

        if (!isAuthorized) {
            showToast('error', "Unauthorized. Your admin code is incorrect.")
            setRoleUpdateLoading(null)
            return
        }

        const { error } = await supabase.rpc('set_user_role', {
            target_user_id: userId,
            new_role: role,
            security_code: securityCode || null
        })
        if (error) {
            showToast('error', "Failed to update role: " + error.message)
        } else {
            showToast('success', `Role updated to ${role} successfully`)
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u))
            if (selectedUser?.id === userId) {
                setSelectedUser(prev => prev ? { ...prev, role } : null)
            }
        }
        setRoleUpdateLoading(null)
    }

    // When promoting to admin, show code modal first
    const handleRoleAction = (user: UserRow, role: string, securityCode?: string, adminConfirm?: string) => {
        if (role === 'admin' && user.role !== 'admin') {
            setActionMenu(null)
            setAdminCodeModal(user)
        } else {
            handleSetRole(user.id, role, securityCode, adminConfirm)
        }
    }

    const [showFixModal, setShowFixModal] = useState(false)

    const fetchAllListings = async () => {
        setLoadingAllListings(true)
        
        // 1. Try RPC first (Bypasses RLS if defined)
        const { data: rpcData, error: rpcError } = await supabase
            .rpc('get_all_listings_admin')
        
        if (!rpcError && rpcData) {
            setAllListings(rpcData)
            setLoadingAllListings(false)
            return
        }

        // 2. Try Backend Proxy (Bypasses RLS if Backend has Service Key)
        try {
            const response = await fetch('http://localhost:3002/api/v1/admin/listings')
            const result = await response.json()
            if (result.status === 'success' && result.data?.length > 0) {
                setAllListings(result.data)
                setLoadingAllListings(false)
                return
            }
        } catch (err) {
            console.log('Backend proxy unreachable or failed.')
        }

        // 3. Fallback to direct select
        const { data, error } = await supabase
            .from('listings')
            .select(`
                id,
                title,
                status,
                price,
                location_city,
                created_at,
                images,
                property_type,
                user_id,
                profiles (
                   full_name,
                   email,
                   phone_number
                )
            `)
            .order('created_at', { ascending: false })
        
        if (!error) {
            setAllListings(data || [])
        } else {
            console.error('Error fetching all listings:', error)
            showToast('error', "Database Access Restricted (RLS)")
            setShowFixModal(true)
        }
        setLoadingAllListings(false)
    }

    const handleViewListings = async (user: UserRow) => {
        setSelectedUser(user)
        setView('user_listings')
        setLoadingListings(true)
        console.log('Fetching listings for user:', user.id)
        
        // Use RPC to ensure we bypass RLS correctly on the client
        const { data, error } = await supabase
            .rpc('get_user_listings_admin', { target_user_id: user.id })
            
        if (error) {
            console.error('RPC Error:', error)
            setToast({ type: 'error', message: 'Database Error: ' + error.message })
            setUserListings([])
        } else {
            console.log('Fetched data:', data)
            setUserListings(data || [])
        }
        setLoadingListings(false)
    }

    const filteredUsers = users.filter(u =>
        (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase())
    )

    // ── GATE: Checking ──────────────────────────────────────
    if (authStep === 'checking') {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="animate-spin text-[#ff385c]" size={48} />
            </div>
        )
    }

    // ── GATE: Denied ────────────────────────────────────────
    if (authStep === 'denied') {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto">
                        <Shield className="text-red-500" size={48} />
                    </div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-widest">Access Denied</h1>
                    <p className="text-neutral-500 font-medium">You do not have permission to access this area.</p>
                    <Link href="/" className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white font-bold px-8 py-4 rounded-2xl hover:bg-white/10 transition-all">
                        <Home size={18} /> Go Home
                    </Link>
                </div>
            </div>
        )
    }

    // ── GATE: Verify ────────────────────────────────────────
    if (authStep === 'verify') {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-950/20 via-black to-black" />
                <div className="max-w-md w-full relative z-10">
                    <div className="bg-neutral-950 border border-white/10 rounded-[40px] p-10 shadow-[0_40px_80px_-20px_rgba(255,56,92,0.15)] space-y-8">
                        <div className="text-center space-y-4">
                            <div className="w-20 h-20 bg-[#ff385c]/10 border border-[#ff385c]/20 rounded-3xl flex items-center justify-center mx-auto">
                                <Lock className="text-[#ff385c]" size={36} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-white uppercase tracking-widest">Admin Verification</h1>
                                <p className="text-neutral-500 text-sm mt-2 font-medium">Enter your personal security code to proceed</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
                            <Mail size={18} className="text-neutral-600 shrink-0" />
                            <span className="text-neutral-400 font-mono text-sm">{currentUserEmail}</span>
                        </div>

                        <form onSubmit={handleVerify} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-500 px-1">Security Code</label>
                                <input
                                    type="password"
                                    value={verifyCode}
                                    onChange={e => { setVerifyCode(e.target.value); setVerifyError("") }}
                                    placeholder="Enter your security code"
                                    className="w-full bg-white/5 border border-white/10 focus:border-[#ff385c]/50 outline-none rounded-2xl h-14 px-5 text-white font-mono tracking-widest text-lg transition-all"
                                    required
                                    autoFocus
                                />
                                {verifyError && (
                                    <p className="text-red-500 text-xs font-bold flex items-center gap-2 px-1">
                                        <AlertTriangle size={14} /> {verifyError}
                                    </p>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={verifyLoading}
                                className="w-full h-14 bg-[#ff385c] hover:bg-[#e31c5f] text-white font-black rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-[#ff385c]/20 transition-all disabled:opacity-60 uppercase tracking-widest text-sm"
                            >
                                {verifyLoading ? <Loader2 className="animate-spin" size={20} /> : <Shield size={20} />}
                                {verifyLoading ? "Verifying..." : "Verify & Enter"}
                            </button>
                        </form>

                        <div className="text-center">
                            <Link href="/dashboard" className="text-neutral-600 hover:text-neutral-400 text-xs font-bold uppercase tracking-widest transition-colors">
                                ← Back to Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // ── MAIN ADMIN PANEL ────────────────────────────────────
    return (
        <div className="min-h-screen bg-black text-white">
            {/* Admin Code Modal */}
            {adminCodeModal && (
                <AdminCodeModal
                    user={adminCodeModal}
                    onConfirm={(userId, code, confirm) => handleSetRole(userId, 'admin', code, confirm)}
                    onClose={() => setAdminCodeModal(null)}
                />
            )}

            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border font-bold text-sm transition-all ${
                    toast.type === 'success'
                        ? 'bg-green-500/10 border-green-500/20 text-green-400'
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                    {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                    {toast.message}
                </div>
            )}

            {/* Header */}
            <header className="border-b border-white/10 bg-black/80 backdrop-blur-xl sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-[#ff385c] font-black text-xl tracking-tight">betopia</Link>
                        <span className="text-white/20 text-2xl font-thin">|</span>
                        <div className="flex items-center gap-2 bg-[#ff385c]/10 border border-[#ff385c]/20 px-3 py-1.5 rounded-full">
                            <Shield size={14} className="text-[#ff385c]" />
                            <span className="text-[#ff385c] font-black text-[10px] uppercase tracking-widest">Admin Panel</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={loadUsers}
                            className="p-2 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-neutral-400 hover:text-white"
                            title="Refresh"
                        >
                            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        </button>
                        <Link href="/dashboard" className="flex items-center gap-2 text-neutral-400 hover:text-white font-bold text-sm transition-colors">
                            <LogOut size={16} /> Exit
                        </Link>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-10">
                {/* Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    {[
                        { label: "Total Users", value: users.length, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
                        { label: "Admins", value: users.filter(u => u.role === 'admin').length, color: "text-[#ff385c]", bg: "bg-[#ff385c]/10 border-[#ff385c]/20" },
                        { label: "Active Members", value: users.filter(u => u.subscription_status === 'active').length, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
                        { label: "Total Listings", value: users.reduce((a, u) => a + Number(u.listing_count), 0), color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
                    ].map(stat => (
                        <div key={stat.label} className={`border ${stat.bg} rounded-3xl p-6 flex flex-col gap-2`}>
                            <span className={`text-3xl font-black ${stat.color}`}>{stat.value}</span>
                            <span className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">{stat.label}</span>
                        </div>
                    ))}
                </div>

                {/* Navigation Tabs */}
                <div className="flex items-center gap-8 mb-8 border-b border-white/5">
                    <button
                        onClick={() => setView('users')}
                        className={`text-xs font-black uppercase tracking-[0.2em] pb-4 transition-all relative ${view === 'users' || view === 'user_listings' ? 'text-white' : 'text-neutral-500 hover:text-white'}`}
                    >
                        Users
                        {(view === 'users' || view === 'user_listings') && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff385c]" />}
                    </button>
                    <button
                        onClick={() => { setView('all_listings'); fetchAllListings(); }}
                        className={`text-xs font-black uppercase tracking-[0.2em] pb-4 transition-all relative ${view === 'all_listings' ? 'text-white' : 'text-neutral-500 hover:text-white'}`}
                    >
                        All Listings
                        {view === 'all_listings' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff385c]" />}
                    </button>
                </div>

                {/* Sub-Breadcrumb for User Detail */}
                {view === 'user_listings' && selectedUser && (
                    <div className="flex items-center gap-2 mb-6 text-sm">
                        <button onClick={() => setView('users')} className="text-neutral-500 hover:text-white font-bold transition-colors">Users</button>
                        <ChevronRight size={16} className="text-neutral-700" />
                        <span className="text-[#ff385c] font-bold">
                            {selectedUser.full_name || selectedUser.email}
                        </span>
                    </div>
                )}

                {/* ── VIEW: USER LISTINGS ── */}
                {view === 'user_listings' && selectedUser && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                                    {selectedUser.full_name || selectedUser.email}&apos;s Listings
                                </h2>
                                <p className="text-neutral-500 text-sm mt-1">{selectedUser.email} · {userListings.length} listing{userListings.length !== 1 ? 's' : ''}</p>
                            </div>
                            <button
                                onClick={() => { setView('users'); setSelectedUser(null) }}
                                className="flex items-center gap-2 border border-white/10 hover:bg-white/5 text-neutral-400 hover:text-white font-bold text-sm px-5 py-3 rounded-2xl transition-all"
                            >
                                <X size={16} /> Close
                            </button>
                        </div>

                        {loadingListings ? (
                            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#ff385c]" size={36} /></div>
                        ) : userListings.length === 0 ? (
                            <div className="text-center py-20 text-neutral-500 font-bold uppercase tracking-widest text-sm">
                                No listings found for this user
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {userListings.map(listing => (
                                    <div key={listing.id} className="bg-neutral-950 border border-white/10 rounded-3xl p-6 flex items-center justify-between hover:border-white/20 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-2 h-2 rounded-full ${
                                                listing.status === 'published' ? 'bg-green-500' :
                                                listing.status === 'pending_payment' ? 'bg-amber-500' : 'bg-neutral-600'
                                            }`} />
                                            <div>
                                                <p className="font-bold text-white">{listing.title}</p>
                                                <p className="text-xs text-neutral-500 mt-0.5">{listing.location_city} · ETB {Number(listing.price).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                                                listing.status === 'published' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                listing.status === 'paid' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                listing.status === 'pending_payment' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                'bg-white/5 text-neutral-400 border-white/10'
                                            }`}>
                                                {listing.status.replace('_', ' ')}
                                            </span>
                                            {listing.status !== 'published' && (
                                                <button
                                                    onClick={async () => {
                                                        const { error } = await supabase.from('listings').update({ status: 'published' }).eq('id', listing.id)
                                                        if (!error) setUserListings(prev => prev.map(l => l.id === listing.id ? {...l, status: 'published'} : l))
                                                        else showToast('error', 'Failed to publish: ' + error.message)
                                                    }}
                                                    className="px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20 font-bold text-xs rounded-xl transition-colors"
                                                >
                                                    Publish
                                                </button>
                                            )}
                                            {listing.status !== 'rejected' && (
                                                <button
                                                    onClick={async () => {
                                                        const { error } = await supabase.from('listings').update({ status: 'rejected' }).eq('id', listing.id)
                                                        if (!error) setUserListings(prev => prev.map(l => l.id === listing.id ? {...l, status: 'rejected'} : l))
                                                        else showToast('error', 'Failed to reject: ' + error.message)
                                                    }}
                                                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-bold text-xs rounded-xl transition-colors"
                                                >
                                                    Reject
                                                </button>
                                            )}
                                            <Link
                                                href={`/listings/${listing.id}`}
                                                className="text-neutral-400 hover:text-white border border-white/10 hover:bg-white/5 p-2 rounded-xl transition-all"
                                                title="View listing"
                                            >
                                                <Eye size={16} />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── VIEW: ALL LISTINGS ── */}
                {view === 'all_listings' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                             <div className="flex items-center gap-4">
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Global Listings</h2>
                                <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[10px] font-black text-neutral-500 uppercase tracking-widest">
                                    {allListings.length} total properties
                                </span>
                             </div>
                             <button 
                                onClick={fetchAllListings}
                                className="p-2 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-neutral-400 hover:text-white"
                             >
                                <RefreshCw size={16} className={loadingAllListings ? "animate-spin" : ""} />
                             </button>
                        </div>

                        {loadingAllListings ? (
                           <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#ff385c]" size={36} /></div>
                        ) : allListings.length === 0 ? (
                           <div className="text-center py-20 bg-neutral-950 border border-white/10 rounded-[32px] space-y-6">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                                    <Home className="text-neutral-700" size={24} />
                                </div>
                                <div>
                                    <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs">No listings visible</p>
                                    <p className="text-neutral-700 text-[10px] mt-2 max-w-sm mx-auto leading-relaxed">
                                        If listings exist but aren&apos;t appearing, your database policies (RLS) are blocking access.
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setShowFixModal(true)}
                                    className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-[10px] px-6 py-3 rounded-xl uppercase tracking-widest transition-all"
                                >
                                    Fix Database Permissions
                                </button>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {allListings.map((listing: any) => (
                                    <div key={listing.id} className="group bg-neutral-950 border border-white/10 rounded-3xl p-5 flex flex-col md:flex-row items-center gap-6 hover:border-white/20 transition-all">
                                        {/* Simple Image or Placeholder */}
                                        <div className="w-24 h-24 rounded-2xl bg-neutral-900 border border-white/5 overflow-hidden shrink-0">
                                            {listing.images?.[0] ? (
                                                <img src={listing.images[0]} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-700 font-bold uppercase">No Pic</div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <div className={`w-2 h-2 rounded-full ${
                                                    listing.status === 'published' ? 'bg-green-500' :
                                                    listing.status === 'paid' ? 'bg-blue-500' :
                                                    listing.status === 'pending_payment' ? 'bg-amber-500' : 'bg-neutral-600'
                                                }`} />
                                                <h3 className="font-bold text-white truncate text-lg leading-none">{listing.title}</h3>
                                            </div>
                                            
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
                                                <span className="text-[10px] text-neutral-500 font-black uppercase tracking-widest flex items-center gap-1">
                                                    📍 {listing.location_city || 'No City'}
                                                </span>
                                                <span className="text-[10px] text-neutral-500 font-black uppercase tracking-widest flex items-center gap-1">
                                                    💰 ETB {Number(listing.price).toLocaleString()}
                                                </span>
                                                <span className="text-[10px] text-[#ff385c] font-black uppercase tracking-widest flex items-center gap-1 bg-[#ff385c]/5 px-2 py-0.5 rounded border border-[#ff385c]/10">
                                                    👤 {listing.profiles?.full_name || listing.profiles?.email || 'Unknown Owner'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                             <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${
                                                listing.status === 'published' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                listing.status === 'paid' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                listing.status === 'pending_payment' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                listing.status === 'draft' ? 'bg-white/5 text-neutral-500 border-white/5' :
                                                'bg-white/5 text-neutral-400 border-white/10'
                                            }`}>
                                                {listing.status.replace('_', ' ')}
                                            </span>
                                            
                                            <div className="flex items-center gap-1 border border-white/5 rounded-xl p-1 bg-white/5">
                                                <Link
                                                    href={`/listings/${listing.id}`}
                                                    className="p-2 rounded-lg text-neutral-500 hover:text-white hover:bg-white/10 transition-all"
                                                    title="View Detail"
                                                >
                                                    <Eye size={16} />
                                                </Link>
                                                {listing.status !== 'published' && (
                                                    <button
                                                        onClick={async () => {
                                                            const { error } = await supabase.from('listings').update({ status: 'published' }).eq('id', listing.id)
                                                            if (!error) {
                                                                showToast('success', "Listing Published")
                                                                fetchAllListings()
                                                            } else {
                                                                showToast('error', error.message)
                                                            }
                                                        }}
                                                        className="p-2 rounded-lg text-green-500 hover:text-green-400 hover:bg-green-500/10 transition-all"
                                                        title="Approve & Publish"
                                                    >
                                                        <CheckCircle2 size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={async () => {
                                                        if (confirm("Permanently delete this listing?")) {
                                                            const { error } = await supabase.from('listings').delete().eq('id', listing.id)
                                                            if (!error) {
                                                                showToast('success', "Listing Deleted")
                                                                fetchAllListings()
                                                            }
                                                        }
                                                    }}
                                                    className="p-2 rounded-lg text-neutral-700 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                                    title="Delete"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── VIEW: ALL USERS ── */}
                {view === 'users' && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Registered Users</h2>
                            <div className="relative w-full sm:w-80">
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search by name or email..."
                                    className="w-full bg-white/5 border border-white/10 focus:border-[#ff385c]/50 outline-none rounded-2xl h-12 pl-10 pr-4 text-white font-medium text-sm transition-all"
                                />
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#ff385c]" size={36} /></div>
                        ) : (
                            <div className="bg-neutral-950 border border-white/10 rounded-[32px] overflow-hidden">
                                {/* Table header */}
                                <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600">
                                    <div className="col-span-4">User</div>
                                    <div className="col-span-2 hidden md:block">Joined</div>
                                    <div className="col-span-2 hidden lg:block">Last Seen</div>
                                    <div className="col-span-1 text-center">Listings</div>
                                    <div className="col-span-2 text-center">Role</div>
                                    <div className="col-span-1 text-right">Actions</div>
                                </div>

                                {filteredUsers.length === 0 ? (
                                    <div className="text-center py-16 text-neutral-600 font-bold uppercase tracking-widest text-xs">
                                        No users found
                                    </div>
                                ) : (
                                    filteredUsers.map((user, idx) => (
                                        <div
                                            key={user.id}
                                            className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors relative ${idx !== filteredUsers.length - 1 ? 'border-b border-white/5' : ''}`}
                                        >
                                            {/* User Info */}
                                            <div className="col-span-4 flex items-center gap-3 min-w-0">
                                                <div className="w-10 h-10 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-center shrink-0">
                                                    {user.role === 'admin'
                                                        ? <Crown size={18} className="text-[#ff385c]" />
                                                        : <User size={18} className="text-neutral-600" />
                                                    }
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-white text-sm truncate">{user.full_name || '—'}</p>
                                                    <p className="text-xs text-neutral-500 truncate font-mono">{user.email}</p>
                                                </div>
                                            </div>

                                            {/* Joined */}
                                            <div className="col-span-2 hidden md:block text-xs text-neutral-500 font-medium">
                                                {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>

                                            {/* Last Login */}
                                            <div className="col-span-2 hidden lg:block text-xs text-neutral-500 font-medium">
                                                {user.last_sign_in_at
                                                    ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                                    : 'Never'
                                                }
                                            </div>

                                            {/* Listings */}
                                            <div className="col-span-1 text-center text-white font-black">{user.listing_count}</div>

                                            {/* Role Badge */}
                                            <div className="col-span-2 flex justify-center">
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${
                                                    user.role === 'admin'
                                                        ? 'bg-[#ff385c]/10 text-[#ff385c] border-[#ff385c]/20'
                                                        : user.role === 'agent'
                                                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                                        : 'bg-white/5 text-neutral-500 border-white/10'
                                                }`}>
                                                    {user.role}
                                                </span>
                                            </div>

                                            {/* Actions */}
                                            <div className="col-span-1 flex justify-end items-center gap-2 relative">
                                                {roleUpdateLoading === user.id ? (
                                                    <Loader2 size={18} className="animate-spin text-[#ff385c]" />
                                                ) : (
                                                    <>
                                                                <button
                                                                    onClick={() => handleViewListings(user)}
                                                                    className="p-2 rounded-xl border border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-all flex items-center gap-2"
                                                                    title="View Listings"
                                                                >
                                                                    <Eye size={16} />
                                                                </button>
                                                                {user.role !== 'admin' && (
                                                                    <button
                                                                        onClick={() => handleRoleAction(user, 'admin')}
                                                                        className="p-2 rounded-xl border border-[#ff385c]/20 bg-[#ff385c]/10 hover:bg-[#ff385c]/20 text-[#ff385c] hover:text-white transition-all flex items-center gap-2"
                                                                        title="Promote to Admin"
                                                                    >
                                                                        <Shield size={16} />
                                                                    </button>
                                                                )}
                                                        <button
                                                            onClick={() => setActionMenu(actionMenu === user.id ? null : user.id)}
                                                            className="p-2 rounded-xl border border-white/10 hover:bg-white/10 text-neutral-400 hover:text-white transition-all"
                                                        >
                                                            <MoreVertical size={16} />
                                                        </button>
                                                    </>
                                                )}
                                                {actionMenu === user.id && (
                                                    <div className="absolute right-0 top-10 z-50 bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 p-2 w-60 space-y-1 max-h-72 overflow-y-auto">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-600 px-4 py-1">Set Role</p>
                                                        {(['user', 'admin', 'agent'] as const).map(role => (
                                                            <button
                                                                key={role}
                                                                onClick={() => handleRoleAction(user, role)}
                                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-left text-sm font-bold transition-colors ${
                                                                    user.role === role ? 'text-[#ff385c]' : 'text-neutral-400'
                                                                }`}
                                                            >
                                                                {role === 'admin' ? <Crown size={16} className="text-[#ff385c]" />
                                                                    : role === 'agent' ? <Shield size={16} className="text-purple-400" />
                                                                    : <User size={16} className="text-neutral-500" />}
                                                                Make {role.charAt(0).toUpperCase() + role.slice(1)}
                                                                {role === 'admin' && user.role !== 'admin' && (
                                                                    <KeyRound size={13} className="ml-auto text-neutral-600" />
                                                                )}
                                                                {user.role === role && <CheckCircle2 size={14} className="ml-auto text-[#ff385c]" />}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Overlay to close action menu */}
            {actionMenu && (
                <div className="fixed inset-0 z-30" onClick={() => setActionMenu(null)} />
            )}
        </div>
    )
}
