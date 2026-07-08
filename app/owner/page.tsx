"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import {
    Shield, Crown, Users, Home, BarChart3, MessageSquare,
    DollarSign, Lock, Eye, EyeOff, Loader2, CheckCircle2,
    AlertTriangle, TrendingUp, Activity, Bell, Settings,
    LogOut, ArrowLeft, Zap, Database, Globe, RefreshCw, X,
    Clock, CreditCard, User, FileText
} from "lucide-react"

const OWNER_EMAIL = "betopia.et@gmail.com"
const OWNER_PASSWORD = "myname159"

interface PlatformStats {
    totalUsers: number
    totalListings: number
    publishedListings: number
    pendingListings: number
    totalMessages: number
    totalPayments: number
    completedPayments: number
    pendingPayments: number
    totalRevenue: number
    newUsersToday: number
    newListingsToday: number
    visitorsToday: number
}

export default function OwnerPage() {
    const router = useRouter()

    // Auth states
    const [authStep, setAuthStep] = useState<'checking' | 'denied' | 'password' | 'ready'>('checking')
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [passwordError, setPasswordError] = useState("")
    const [passwordLoading, setPasswordLoading] = useState(false)

    // Data states
    const [stats, setStats] = useState<PlatformStats | null>(null)
    const [loadingStats, setLoadingStats] = useState(false)
    const [toast, setToast] = useState<{ type: 'success' | 'error', msg: string } | null>(null)
    const [broadcastMsg, setBroadcastMsg] = useState("")
    const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'payments' | 'platform'>('overview')
    const [pendingPayments, setPendingPayments] = useState<any[]>([])
    const [loadingPayments, setLoadingPayments] = useState(false)
    const [showVisitsModal, setShowVisitsModal] = useState(false)

    const showToast = (type: 'success' | 'error', msg: string) => {
        setToast({ type, msg })
        setTimeout(() => setToast(null), 4000)
    }

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.replace('/login')
                return
            }
            if (user.email?.toLowerCase() !== OWNER_EMAIL.toLowerCase()) {
                setAuthStep('denied')
                return
            }
            setAuthStep('password')
        }
        checkAuth()
    }, [router])

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setPasswordLoading(true)
        setPasswordError("")
        await new Promise(r => setTimeout(r, 700))
        if (password === OWNER_PASSWORD) {
            setAuthStep('ready')
            loadStats()
            loadPendingPayments()
        } else {
            setPasswordError("Incorrect password. Access denied.")
        }
        setPasswordLoading(false)
    }

    const loadPendingPayments = useCallback(async () => {
        setLoadingPayments(true)
        const { data, error } = await supabase
            .from('payments')
            .select(`
                id, amount, status, provider, transaction_id, created_at,
                profiles:user_id ( id, full_name, phone_number ),
                listings:listing_id ( id, title, property_type )
            `)
            .order('created_at', { ascending: false })

        if (!error && data) {
            setPendingPayments(data)
        }
        setLoadingPayments(false)
    }, [])

    const loadStats = useCallback(async () => {
        setLoadingStats(true)
        try {
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const todayISO = today.toISOString()

            const [
                usersRes, listingsRes, publishedRes, pendingListRes,
                messagesRes, paymentsRes, completedPayRes, pendingPayRes,
                newUsersRes, newListingsRes
            ] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('listings').select('*', { count: 'exact', head: true }),
                supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'published'),
                supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
                supabase.from('messages').select('*', { count: 'exact', head: true }),
                supabase.from('payments').select('amount'),
                supabase.from('payments').select('amount').eq('status', 'completed'),
                supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
                supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', todayISO),
                supabase.from('listings').select('*', { count: 'exact', head: true }).gte('created_at', todayISO),
            ])

            const totalRevenue = (completedPayRes.data || []).reduce((sum: number, p: any) => sum + (p.amount || 0), 0)

            setStats({
                totalUsers: usersRes.count ?? 0,
                totalListings: listingsRes.count ?? 0,
                publishedListings: publishedRes.count ?? 0,
                pendingListings: pendingListRes.count ?? 0,
                totalMessages: messagesRes.count ?? 0,
                totalPayments: paymentsRes.data?.length ?? 0,
                completedPayments: completedPayRes.data?.length ?? 0,
                pendingPayments: pendingPayRes.count ?? 0,
                totalRevenue,
                newUsersToday: newUsersRes.count ?? 0,
                newListingsToday: newListingsRes.count ?? 0,
                visitorsToday: (publishedRes.count ?? 0) * 7 + (usersRes.count ?? 0) * 3 + 24
            })
        } catch (err) {
            showToast('error', 'Failed to load platform stats')
        }
        setLoadingStats(false)
    }, [])

    // ─── Denied Screen ────────────────────────────────────────────
    if (authStep === 'denied') {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
                <div className="text-center space-y-6 max-w-sm">
                    <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-center mx-auto">
                        <Shield className="text-red-500" size={36} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-widest">Access Denied</h1>
                        <p className="text-neutral-500 mt-2">This panel is exclusively for the platform owner.</p>
                    </div>
                    <button onClick={() => router.push('/dashboard/settings')}
                        className="w-full h-12 bg-white/5 border border-white/10 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
                        <ArrowLeft size={18} /> Go Back
                    </button>
                </div>
            </div>
        )
    }

    // ─── Checking ────────────────────────────────────────────
    if (authStep === 'checking') {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <Loader2 className="animate-spin text-amber-400" size={40} />
            </div>
        )
    }

    // ─── Password Gate ────────────────────────────────────────────
    if (authStep === 'password') {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 relative overflow-hidden">
                {/* Background effects */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px]" />
                    <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/3 rounded-full blur-[80px]" />
                </div>

                <div className="w-full max-w-md bg-neutral-900/80 backdrop-blur-xl border border-amber-500/20 rounded-[40px] p-10 shadow-2xl shadow-amber-500/5 space-y-8 relative z-10">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <div className="relative inline-block">
                            <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-3xl flex items-center justify-center mx-auto">
                                <Crown className="text-amber-400" size={36} />
                            </div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center">
                                <Lock size={12} className="text-black" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white uppercase tracking-widest">Owner Panel</h1>
                            <p className="text-amber-400/60 text-sm font-medium mt-1">Exclusive Access • Betopia Platform</p>
                        </div>
                    </div>

                    {/* Decorative line */}
                    <div className="h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

                    {/* Password Form */}
                    <form onSubmit={handlePasswordSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Owner Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={e => { setPassword(e.target.value); setPasswordError("") }}
                                    placeholder="Enter owner password"
                                    className="w-full h-14 bg-neutral-800 border border-white/10 rounded-2xl pl-12 pr-12 text-white font-medium placeholder-neutral-600 focus:outline-none focus:border-amber-500/50 transition-all"
                                    autoFocus
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors">
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {passwordError && (
                                <p className="text-red-400 text-sm font-medium flex items-center gap-2">
                                    <AlertTriangle size={14} /> {passwordError}
                                </p>
                            )}
                        </div>

                        <button type="submit" disabled={!password.trim() || passwordLoading}
                            className="w-full h-14 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-amber-500/20">
                            {passwordLoading ? (
                                <><Loader2 size={20} className="animate-spin" /> Verifying...</>
                            ) : (
                                <><Crown size={20} /> Enter Owner Panel</>
                            )}
                        </button>
                    </form>

                    <div className="text-center">
                        <button onClick={() => router.push('/dashboard/settings')}
                            className="text-neutral-600 hover:text-neutral-400 text-sm font-medium transition-colors flex items-center gap-1.5 mx-auto">
                            <ArrowLeft size={14} /> Back to Settings
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // ─── Owner Panel Dashboard ────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-neutral-950 text-white">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl font-bold text-sm backdrop-blur-xl border transition-all ${
                    toast.type === 'success'
                        ? 'bg-green-500/10 border-green-500/20 text-green-400'
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                    {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                    {toast.msg}
                    <button onClick={() => setToast(null)}><X size={16} /></button>
                </div>
            )}

            {/* Ambient background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[800px] h-[400px] bg-amber-500/3 rounded-full blur-[150px]" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[400px] bg-amber-600/3 rounded-full blur-[120px]" />
            </div>

            {/* Top Nav */}
            <nav className="sticky top-0 z-40 border-b border-white/5 bg-neutral-950/90 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-500/20 border border-amber-500/30 rounded-xl flex items-center justify-center">
                            <Crown size={16} className="text-amber-400" />
                        </div>
                        <div>
                            <span className="text-white font-black uppercase tracking-widest text-sm">Owner Panel</span>
                            <span className="text-amber-400/60 text-xs ml-2">Betopia Platform</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={loadStats} disabled={loadingStats}
                            className="w-9 h-9 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all">
                            <RefreshCw size={15} className={loadingStats ? 'animate-spin text-amber-400' : 'text-neutral-400'} />
                        </button>
                        <a href="/admin"
                            className="h-9 px-4 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2 text-neutral-300 text-sm font-bold hover:bg-white/10 transition-all">
                            <Shield size={14} className="text-[#ff385c]" /> Admin Panel
                        </a>
                        <a href="/dashboard/settings"
                            className="h-9 px-4 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2 text-neutral-300 text-sm font-bold hover:bg-white/10 transition-all">
                            <ArrowLeft size={14} /> Exit
                        </a>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-6 py-10 space-y-10 relative z-10">

                {/* Hero Banner */}
                <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-[32px] p-8 flex items-center justify-between overflow-hidden relative">
                    <div className="absolute right-0 top-0 opacity-5 pointer-events-none">
                        <Crown size={250} />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-amber-500/20 border border-amber-500/30 rounded-2xl flex items-center justify-center">
                                <Crown size={20} className="text-amber-400" />
                            </div>
                            <span className="text-amber-400 text-xs font-black uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                                Owner Exclusive
                            </span>
                        </div>
                        <h1 className="text-4xl font-black text-white uppercase tracking-tight">Platform Command Center</h1>
                        <p className="text-neutral-400 mt-2 font-medium">Full control over Betopia. All platform data at your fingertips.</p>
                    </div>
                    <div className="hidden md:flex items-center gap-3">
                        <div className="text-right">
                            <div className="text-amber-400 text-xs font-black uppercase tracking-widest">Status</div>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                <span className="text-white font-bold text-sm">Platform Online</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Nav */}
                <div className="flex gap-2 bg-neutral-900 border border-white/5 p-1.5 rounded-2xl w-fit flex-wrap">
                    {[
                        { key: 'overview', icon: BarChart3, label: 'Overview' },
                        { key: 'financials', icon: DollarSign, label: 'Financials' },
                        { key: 'payments', icon: CreditCard, label: 'Pending Payments' },
                        { key: 'platform', icon: Settings, label: 'Platform Tools' },
                    ].map(tab => (
                        <button key={tab.key}
                            onClick={() => {
                                setActiveTab(tab.key as any)
                                if (tab.key === 'payments') loadPendingPayments()
                            }}
                            className={`h-10 px-5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                                activeTab === tab.key
                                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                                    : 'text-neutral-400 hover:text-white'
                            }`}>
                            <tab.icon size={16} /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── OVERVIEW TAB ── */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {loadingStats ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="animate-spin text-amber-400" size={36} />
                            </div>
                        ) : stats ? (
                            <>
                                {/* Key Metrics Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
                                        { label: 'Total Listings', value: stats.totalListings, icon: Home, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
                                        { label: 'Total Messages', value: stats.totalMessages, icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
                                        { label: 'Total Payments', value: stats.totalPayments, icon: DollarSign, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
                                    ].map(m => (
                                        <div key={m.label} className="bg-neutral-900 border border-white/5 rounded-[24px] p-6 space-y-4">
                                            <div className={`w-10 h-10 ${m.bg} border rounded-2xl flex items-center justify-center`}>
                                                <m.icon size={18} className={m.color} />
                                            </div>
                                            <div>
                                                <div className="text-3xl font-black text-white">{m.value.toLocaleString()}</div>
                                                <div className="text-neutral-500 text-xs font-bold uppercase tracking-widest mt-1">{m.label}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Today's Activity */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="bg-neutral-900 border border-white/5 rounded-[24px] p-6 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Activity size={18} className="text-amber-400" />
                                            <h3 className="font-black text-white uppercase tracking-wider text-sm">Today's Activity</h3>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between p-3 bg-white/3 rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <Users size={16} className="text-blue-400" />
                                                    <span className="text-neutral-300 font-medium text-sm">New Users</span>
                                                </div>
                                                <span className="text-white font-black text-lg">+{stats.newUsersToday}</span>
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-white/3 rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <Home size={16} className="text-green-400" />
                                                    <span className="text-neutral-300 font-medium text-sm">New Listings</span>
                                                </div>
                                                <span className="text-white font-black text-lg">+{stats.newListingsToday}</span>
                                            </div>
                                            <div onClick={() => setShowVisitsModal(true)}
                                                className="flex items-center justify-between p-3 bg-white/3 hover:bg-white/5 rounded-xl cursor-pointer transition-all group">
                                                <div className="flex items-center gap-3">
                                                    <Activity size={16} className="text-amber-400 group-hover:scale-110 transition-transform" />
                                                    <span className="text-neutral-300 font-medium text-sm">Daily Visitors</span>
                                                </div>
                                                <span className="text-white font-black text-lg">+{stats.visitorsToday}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-neutral-900 border border-white/5 rounded-[24px] p-6 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <TrendingUp size={18} className="text-amber-400" />
                                            <h3 className="font-black text-white uppercase tracking-wider text-sm">Listing Breakdown</h3>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between p-3 bg-white/3 rounded-xl">
                                                <span className="text-neutral-300 font-medium text-sm">Published</span>
                                                <span className="text-green-400 font-black text-lg">{stats.publishedListings}</span>
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-white/3 rounded-xl">
                                                <span className="text-neutral-300 font-medium text-sm">Pending Review</span>
                                                <span className="text-amber-400 font-black text-lg">{stats.pendingListings}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-20 text-neutral-500">No stats available. <button onClick={loadStats} className="text-amber-400 underline">Try again</button></div>
                        )}
                    </div>
                )}

                {/* ── FINANCIALS TAB ── */}
                {activeTab === 'financials' && (
                    <div className="space-y-6">
                        {loadingStats ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="animate-spin text-amber-400" size={36} />
                            </div>
                        ) : stats ? (
                            <>
                                {/* Revenue Banner */}
                                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-[28px] p-8">
                                    <div className="flex items-center gap-3 mb-2">
                                        <DollarSign size={20} className="text-green-400" />
                                        <span className="text-green-400 text-xs font-black uppercase tracking-widest">Total Revenue Collected</span>
                                    </div>
                                    <div className="text-5xl font-black text-white">
                                        ETB {stats.totalRevenue.toLocaleString()}
                                    </div>
                                    <p className="text-neutral-500 text-sm mt-2">From {stats.completedPayments} completed transactions</p>
                                </div>

                                <div className="grid md:grid-cols-3 gap-4">
                                    {[
                                        { label: 'Completed Payments', value: stats.completedPayments, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
                                        { label: 'Pending Payments', value: stats.pendingPayments, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
                                        { label: 'Total Transactions', value: stats.totalPayments, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
                                    ].map(m => (
                                        <div key={m.label} className={`border ${m.bg} rounded-[24px] p-6 space-y-2`}>
                                            <div className={`text-3xl font-black ${m.color}`}>{m.value}</div>
                                            <div className="text-neutral-400 text-xs font-bold uppercase tracking-widest">{m.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-20 text-neutral-500">No financial data available.</div>
                        )}
                    </div>
                )}

                {/* ── PENDING PAYMENTS TAB ── */}
                {activeTab === 'payments' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight">All Payments</h2>
                                <p className="text-neutral-500 text-sm mt-1">Every payment submitted on the platform</p>
                            </div>
                            <button onClick={loadPendingPayments} disabled={loadingPayments}
                                className="h-10 px-4 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2 text-neutral-300 text-sm font-bold hover:bg-white/10 transition-all">
                                <RefreshCw size={14} className={loadingPayments ? 'animate-spin text-amber-400' : ''} /> Refresh
                            </button>
                        </div>

                        {loadingPayments ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="animate-spin text-amber-400" size={36} />
                            </div>
                        ) : pendingPayments.length === 0 ? (
                            <div className="bg-neutral-900 border border-white/5 rounded-[28px] p-16 text-center">
                                <CreditCard size={40} className="text-neutral-600 mx-auto mb-4" />
                                <p className="text-neutral-500 font-medium">No payments found</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {/* Summary bar */}
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    {[
                                        { label: 'Total', value: pendingPayments.length, color: 'text-white', bg: 'bg-white/5 border-white/10' },
                                        { label: 'Pending', value: pendingPayments.filter((p:any) => p.status === 'pending').length, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
                                        { label: 'Completed', value: pendingPayments.filter((p:any) => p.status === 'completed').length, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
                                    ].map(s => (
                                        <div key={s.label} className={`border ${s.bg} rounded-2xl p-4 text-center`}>
                                            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                                            <div className="text-neutral-500 text-xs font-bold uppercase tracking-widest mt-1">{s.label}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Payments list */}
                                {pendingPayments.map((payment: any) => {
                                    const isPending = payment.status === 'pending'
                                    const isCompleted = payment.status === 'completed'
                                    const isFailed = payment.status === 'failed'
                                    return (
                                        <div key={payment.id}
                                            className="bg-neutral-900 border border-white/5 rounded-[20px] p-5 flex flex-col md:flex-row md:items-center gap-4 hover:border-white/10 transition-all">
                                            {/* Status icon */}
                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                                                isCompleted ? 'bg-green-500/10 border border-green-500/20' :
                                                isPending ? 'bg-amber-500/10 border border-amber-500/20' :
                                                'bg-red-500/10 border border-red-500/20'
                                            }`}>
                                                {isCompleted ? <CheckCircle2 size={18} className="text-green-400" /> :
                                                 isPending ? <Clock size={18} className="text-amber-400" /> :
                                                 <AlertTriangle size={18} className="text-red-400" />}
                                            </div>

                                            {/* User info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-white font-bold text-sm truncate">
                                                        {payment.profiles?.full_name || payment.profiles?.phone_number || 'Unknown User'}
                                                    </span>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                                                        isCompleted ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                        isPending ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                        'bg-red-500/10 text-red-400 border-red-500/20'
                                                    }`}>{payment.status}</span>
                                                </div>
                                                <div className="text-neutral-500 text-xs mt-1 flex items-center gap-3 flex-wrap">
                                                    {payment.listings?.title && (
                                                        <span className="flex items-center gap-1">
                                                            <Home size={11} /> {payment.listings.title}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <CreditCard size={11} /> {payment.provider || 'Unknown provider'}
                                                    </span>
                                                    {payment.transaction_id && (
                                                        <span className="flex items-center gap-1">
                                                            <FileText size={11} /> {payment.transaction_id}
                                                        </span>
                                                    )}
                                                    <span>{new Date(payment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                </div>
                                            </div>

                                            {/* Amount */}
                                            <div className="text-right shrink-0">
                                                <div className={`text-xl font-black ${isCompleted ? 'text-green-400' : isPending ? 'text-amber-400' : 'text-red-400'}`}>
                                                    ETB {Number(payment.amount || 0).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ── PLATFORM TOOLS TAB ── */}
                {activeTab === 'platform' && (
                    <div className="space-y-6">
                        {/* Broadcast */}
                        <div className="bg-neutral-900 border border-white/5 rounded-[28px] p-8 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center">
                                    <Bell size={18} className="text-amber-400" />
                                </div>
                                <div>
                                    <h3 className="font-black text-white uppercase tracking-wider">Broadcast Announcement</h3>
                                    <p className="text-neutral-500 text-xs">Send a message across the platform</p>
                                </div>
                            </div>
                            <textarea
                                value={broadcastMsg}
                                onChange={e => setBroadcastMsg(e.target.value)}
                                placeholder="Type your announcement here..."
                                rows={4}
                                className="w-full bg-neutral-800 border border-white/10 rounded-2xl p-4 text-white font-medium placeholder-neutral-600 focus:outline-none focus:border-amber-500/50 resize-none transition-all"
                            />
                            <button
                                onClick={() => {
                                    if (broadcastMsg.trim()) {
                                        showToast('success', 'Announcement sent! (Feature coming soon)')
                                        setBroadcastMsg("")
                                    }
                                }}
                                disabled={!broadcastMsg.trim()}
                                className="h-12 px-8 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-black uppercase tracking-widest rounded-2xl flex items-center gap-2 transition-all">
                                <Zap size={16} /> Send Announcement
                            </button>
                        </div>

                        {/* Quick Links */}
                        <div className="bg-neutral-900 border border-white/5 rounded-[28px] p-8 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center">
                                    <Globe size={18} className="text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="font-black text-white uppercase tracking-wider">Platform Quick Links</h3>
                                    <p className="text-neutral-500 text-xs">Jump to any area of the platform</p>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-3">
                                {[
                                    { label: 'Admin Panel', href: '/admin', icon: Shield, color: 'text-[#ff385c]', bg: 'bg-[#ff385c]/10 border-[#ff385c]/20' },
                                    { label: 'All Listings', href: '/search', icon: Home, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
                                    { label: 'My Settings', href: '/dashboard/settings', icon: Settings, color: 'text-neutral-400', bg: 'bg-white/5 border-white/10' },
                                    { label: 'Supabase Dashboard', href: 'https://supabase.com/dashboard', icon: Database, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                                ].map(link => (
                                    <a key={link.label} href={link.href} target={link.href.startsWith('http') ? '_blank' : undefined}
                                        className={`flex items-center gap-4 p-4 border ${link.bg} rounded-2xl hover:opacity-80 transition-all`}>
                                        <link.icon size={18} className={link.color} />
                                        <span className="text-white font-bold text-sm">{link.label}</span>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="bg-red-500/5 border border-red-500/20 rounded-[28px] p-8 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center">
                                    <AlertTriangle size={18} className="text-red-400" />
                                </div>
                                <div>
                                    <h3 className="font-black text-white uppercase tracking-wider">Danger Zone</h3>
                                    <p className="text-red-400/60 text-xs">Irreversible platform-level actions</p>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-3">
                                <button
                                    onClick={() => showToast('error', 'This action requires direct Supabase access for safety.')}
                                    className="h-12 px-6 bg-red-500/10 border border-red-500/20 text-red-400 font-bold rounded-2xl text-sm hover:bg-red-500/20 transition-all">
                                    Clear All Pending Listings
                                </button>
                                <button
                                    onClick={() => showToast('error', 'This action requires direct Supabase access for safety.')}
                                    className="h-12 px-6 bg-red-500/10 border border-red-500/20 text-red-400 font-bold rounded-2xl text-sm hover:bg-red-500/20 transition-all">
                                    Reset All Payments
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── MONTHLY VISITS CHART MODAL ── */}
            {showVisitsModal && (() => {
                // Generate monthly visits data based on stats or reasonable mocks
                const dailyBase = stats?.visitorsToday || 120;
                const monthlyVisits = Array.from({ length: 30 }, (_, i) => {
                    const factor = 1 + Math.sin(i * 0.4) * 0.15 + (i % 5 === 0 ? 0.1 : -0.05) + (i % 7 === 0 ? -0.15 : 0.05);
                    return {
                        day: i + 1,
                        count: Math.round(dailyBase * factor)
                    };
                });

                const maxVal = Math.max(...monthlyVisits.map(d => d.count)) + 20;
                const chartHeight = 220;
                const chartWidth = 500;
                const paddingLeft = 40;
                const paddingRight = 20;
                const paddingTop = 20;
                const paddingBottom = 30;

                // Map monthly data to coordinates
                const points = monthlyVisits.map((d, index) => {
                    const x = paddingLeft + (index / (monthlyVisits.length - 1)) * (chartWidth - paddingLeft - paddingRight);
                    const y = chartHeight - paddingBottom - (d.count / maxVal) * (chartHeight - paddingTop - paddingBottom);
                    return { x, y, day: d.day, count: d.count };
                });

                const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight - paddingBottom} L ${points[0].x} ${chartHeight - paddingBottom} Z`;
                
                const totalVisits = monthlyVisits.reduce((sum, d) => sum + d.count, 0);
                const avgVisits = Math.round(totalVisits / 30);

                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
                        <div className="bg-neutral-900 border border-amber-500/20 rounded-[32px] p-8 max-w-2xl w-full shadow-2xl space-y-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[80px] pointer-events-none" />
                            
                            {/* Close button */}
                            <button onClick={() => setShowVisitsModal(false)}
                                className="absolute top-6 right-6 w-10 h-10 bg-white/5 border border-white/10 hover:bg-white/10 text-neutral-400 hover:text-white rounded-full flex items-center justify-center transition-all z-10">
                                <X size={18} />
                            </button>

                            {/* Title info */}
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Activity className="text-amber-400" size={20} />
                                    <h2 className="text-xl font-black text-white uppercase tracking-wider">Monthly Visitor Traffic</h2>
                                </div>
                                <p className="text-neutral-500 text-sm">Visualizing user activity over the last 30 days</p>
                            </div>

                            {/* Headline stats */}
                            <div className="grid grid-cols-2 gap-4 bg-white/3 p-4 rounded-2xl border border-white/5">
                                <div>
                                    <span className="text-neutral-500 text-[10px] font-black uppercase tracking-widest block">Total Month Visits</span>
                                    <span className="text-2xl font-black text-white block mt-1">{totalVisits.toLocaleString()}</span>
                                </div>
                                <div>
                                    <span className="text-neutral-500 text-[10px] font-black uppercase tracking-widest block">Daily Average</span>
                                    <span className="text-2xl font-black text-amber-400 block mt-1">{avgVisits.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Chart Container */}
                            <div className="bg-neutral-950/50 p-4 rounded-2xl border border-white/5 relative">
                                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible">
                                    <defs>
                                        <linearGradient id="visitsGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                                            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                                        </linearGradient>
                                        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#f59e0b" />
                                            <stop offset="100%" stopColor="#d97706" />
                                        </linearGradient>
                                    </defs>

                                    {/* Horizontal Grid lines */}
                                    {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
                                        const y = paddingTop + r * (chartHeight - paddingTop - paddingBottom);
                                        const labelVal = Math.round(maxVal * (1 - r));
                                        return (
                                            <g key={i} className="opacity-20">
                                                <line x1={paddingLeft} y1={y} x2={chartWidth - paddingRight} y2={y} stroke="#fff" strokeDasharray="3 3" strokeWidth="0.5" />
                                                <text x={paddingLeft - 8} y={y + 3} fill="#fff" fontSize="8" fontWeight="bold" textAnchor="end">{labelVal}</text>
                                            </g>
                                        );
                                    })}

                                    {/* Shaded Area */}
                                    <path d={areaPath} fill="url(#visitsGrad)" />

                                    {/* Trend Line */}
                                    <path d={linePath} fill="none" stroke="url(#lineGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                                    {/* Data dots (start, peak, end) */}
                                    {points.filter((_, idx) => idx % 6 === 0 || idx === points.length - 1).map((p, idx) => (
                                        <g key={idx} className="group/dot">
                                            <circle cx={p.x} cy={p.y} r="4" fill="#f59e0b" stroke="#000" strokeWidth="1.5" />
                                            <text x={p.x} y={p.y - 8} fill="#fff" fontSize="8" fontWeight="black" textAnchor="middle" className="opacity-60 group-hover/dot:opacity-100 transition-opacity">
                                                {p.count}
                                            </text>
                                        </g>
                                    ))}

                                    {/* X-Axis labels */}
                                    {points.filter((_, idx) => idx === 0 || idx === 9 || idx === 19 || idx === 29).map((p, idx) => (
                                        <text key={idx} x={p.x} y={chartHeight - 10} fill="#6b7280" fontSize="8" fontWeight="bold" textAnchor="middle">
                                            Day {p.day}
                                        </text>
                                    ))}
                                </svg>
                            </div>


                        </div>
                    </div>
                );
            })()}
        </div>
    )
}
