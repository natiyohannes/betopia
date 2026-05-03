"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, User, Phone, Mail, Shield, CheckCircle2, List, Heart, Crown } from "lucide-react"

const SUPER_ADMIN_EMAIL = "betopia.et@gmail.com"

export default function SettingsPage() {
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [stats, setStats] = useState({ listings: 0, saved: 0 })
    const [profile, setProfile] = useState<any>({ full_name: '', phone_number: '', role: 'user', subscription_status: 'inactive' })
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    useEffect(() => {
        const getProfileData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setIsAdmin(user.email === SUPER_ADMIN_EMAIL)
                setUser(user)
                
                // Fetch Profile
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                if (profileData) {
                    setProfile(profileData)
                    if (profileData.role === 'admin') setIsAdmin(true)
                }

                // Fetch Stats
                const [listingsRes, savedRes] = await Promise.all([
                    supabase.from('listings').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
                    supabase.from('saved_listings').select('id', { count: 'exact', head: true }).eq('user_id', user.id)
                ])

                setStats({
                    listings: listingsRes.count || 0,
                    saved: savedRes.count || 0
                })
            }
            setLoading(false)
        }
        getProfileData()
    }, [])

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setUpdating(true)
        setMessage(null)

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: profile.full_name,
                    phone_number: profile.phone_number,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id)

            if (error) throw error
            setMessage({ type: 'success', text: 'Profile updated successfully!' })
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Error updating profile' })
        } finally {
            setUpdating(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 size={40} className="animate-spin text-[#ff385c]" />
                <p className="text-neutral-500 font-medium">Preparing your workspace...</p>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto space-y-12 py-6">
            {/* Header with Stats */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-neutral-900 border border-white/10 p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff385c]/10 blur-[100px] pointer-events-none" />
                
                <div className="flex items-center gap-6 z-10">
                    <div className="w-24 h-24 bg-neutral-800 rounded-3xl flex items-center justify-center border-2 border-white/5 relative group">
                        <User size={40} className="text-neutral-500 group-hover:text-white transition-colors" />
                        {profile.subscription_status === 'active' && (
                            <div className="absolute -top-2 -right-2 bg-gradient-to-tr from-yellow-400 to-yellow-600 rounded-full p-1 border-2 border-neutral-900">
                                <Shield size={16} className="text-black" />
                            </div>
                        )}
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tight uppercase">
                            {profile.full_name || 'Your Profile'}
                        </h1>
                        <div className="flex items-center gap-3 mt-2">
                             <span className="bg-[#ff385c]/20 text-[#ff385c] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-[#ff385c]/20">
                                {isAdmin ? 'Admin' : (profile.role || 'User')}
                             </span>
                             <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                                isAdmin || profile.subscription_status === 'active' ? 'bg-green-500/20 text-green-500 border border-green-500/20' : 'bg-neutral-800 text-neutral-400 border border-white/5'
                             }`}>
                                {isAdmin ? (
                                    <> <Crown size={12} /> Admin Account</>
                                ) : profile.subscription_status === 'active' ? (
                                    <> <CheckCircle2 size={12} /> PRO Member</>
                                ) : (
                                    'Free Account'
                                )}
                             </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 md:gap-8 z-10 w-full md:w-auto">
                    <div className="bg-white/5 backdrop-blur-sm p-4 rounded-3xl flex-1 md:w-32 text-center border border-white/5">
                        <div className="text-2xl font-black text-white">{stats.listings}</div>
                        <div className="text-[10px] text-neutral-500 uppercase font-black tracking-widest mt-1">Listings</div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm p-4 rounded-3xl flex-1 md:w-32 text-center border border-white/5">
                        <div className="text-2xl font-black text-white">{stats.saved}</div>
                        <div className="text-[10px] text-neutral-500 uppercase font-black tracking-widest mt-1">Saved</div>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Settings */}
                <Card className="lg:col-span-2 bg-neutral-900 border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
                    <CardHeader className="p-8 pb-4">
                        <CardTitle className="text-xl font-bold text-white uppercase tracking-wider">Profile Information</CardTitle>
                        <CardDescription className="text-neutral-500">Update your details that appear on property listings</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleUpdate}>
                        <CardContent className="p-8 space-y-8">
                            {message && (
                                <div className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-3 ${
                                    message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                }`}>
                                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                                    {message.text}
                                </div>
                            )}

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-neutral-400 px-1">Email Address</Label>
                                    <div className="relative group">
                                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" />
                                        <Input id="email" value={user?.email || ''} disabled className="bg-neutral-800 border-white/5 h-14 pl-12 rounded-2xl text-neutral-500 font-medium" />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="fullName" className="text-xs font-black uppercase tracking-widest text-neutral-400 px-1">Full Name</Label>
                                    <div className="relative">
                                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" />
                                        <Input
                                            id="fullName"
                                            value={profile.full_name}
                                            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                            className="bg-neutral-950 border-white/10 hover:border-[#ff385c]/50 focus:ring-[#ff385c]/20 h-14 pl-12 rounded-2xl text-white font-medium transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="phone" className="text-xs font-black uppercase tracking-widest text-neutral-400 px-1">Phone Number</Label>
                                    <div className="relative">
                                        <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" />
                                        <Input
                                            id="phone"
                                            value={profile.phone_number}
                                            onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                                            className="bg-neutral-950 border-white/10 hover:border-[#ff385c]/50 focus:ring-[#ff385c]/20 h-14 pl-12 rounded-2xl text-white font-medium transition-all"
                                            placeholder="+251 911 234 567"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="p-8 bg-white/5 border-t border-white/5">
                            <Button type="submit" disabled={updating} className="bg-[#ff385c] hover:bg-[#e31c5f] text-white rounded-2xl h-14 px-10 font-black uppercase tracking-widest shadow-xl shadow-[#ff385c]/20 transition-all disabled:opacity-50">
                                {updating && <Loader2 className="mr-3 h-5 w-5 animate-spin" />}
                                Save Profile Changes
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                {/* Account Sidebar */}
                <div className="space-y-6">
                    <Card className="bg-neutral-900 border-white/10 rounded-[32px] overflow-hidden shadow-2xl p-8 space-y-6 border-t-4 border-t-[#ff385c]">
                        <h3 className="text-lg font-bold text-white uppercase tracking-wider">Quick Actions</h3>
                        <div className="space-y-3">
                            <Button asChild variant="outline" className="w-full h-14 border-white/10 hover:bg-white/5 rounded-2xl justify-start gap-4 text-neutral-300 font-bold px-6">
                                <a href="/dashboard/my-listings">
                                    <List size={20} className="text-[#ff385c]" />
                                    Manage My Listings
                                </a>
                            </Button>
                            <Button asChild variant="outline" className="w-full h-14 border-white/10 hover:bg-white/5 rounded-2xl justify-start gap-4 text-neutral-300 font-bold px-6">
                                <a href="/dashboard/saved">
                                    <Heart size={20} className="text-[#ff385c]" />
                                    View Saved Items
                                </a>
                            </Button>
                            {isAdmin && (
                                <Button asChild className="w-full h-14 bg-[#ff385c]/10 border border-[#ff385c]/20 hover:bg-[#ff385c]/20 rounded-2xl justify-start gap-4 text-[#ff385c] font-black px-6">
                                    <a href="/admin">
                                        <Crown size={20} />
                                        Admin Panel
                                    </a>
                                </Button>
                            )}
                        </div>
                    </Card>

                    <div className="p-8 bg-gradient-to-br from-[#ff385c] to-[#e31c5f] rounded-[32px] text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-4 -translate-y-4 group-hover:scale-150 transition-transform">
                            <Shield size={120} />
                        </div>
                        <h3 className="font-black text-2xl uppercase tracking-tighter">Support</h3>
                        <p className="text-white/80 text-sm mt-2 leading-relaxed font-medium">Need help with your listings or account? Our premium support is here for you.</p>
                        <Button className="mt-6 bg-white text-black hover:bg-neutral-200 rounded-xl font-black uppercase tracking-widest text-xs h-10 px-6">
                            Contact Us
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function AlertTriangle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  )
}
