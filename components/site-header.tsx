"use client"

import Link from "next/link"
import { Bell, ChevronDown, User, X, AlertTriangle, Info } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { useEffect, useState, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useNotifications } from "./notification-provider"

export function SiteHeader() {
    const [user, setUser] = useState<any>(null)
    const [isOpen, setIsOpen] = useState(false)
    const [isNotifOpen, setIsNotifOpen] = useState(false)
    const { notifications, unreadCount, markAsRead, clearAll } = useNotifications()
    const dropdownRef = useRef<HTMLDivElement>(null)
    const notifRef = useRef<HTMLDivElement>(null)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setIsNotifOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()
    }, [])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
        setUser(null)
    }

    const navLinks = [
        { name: "Find a Home", href: "/" },
        { name: "My Bookings", href: "/dashboard/bookings" },
        { name: "Messages", href: "/dashboard/messages" },
        { name: "About Us", href: "/about" },
    ]

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-md border-b border-white/10 h-20 text-white">
            <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 h-full">
                <div className="flex flex-row items-center justify-between h-full relative">
                    {/* Logo (Hidden or small for now to match screenshot focus on center nav) */}
                    <Link href="/" className="md:flex items-center gap-1 cursor-pointer absolute left-0 hidden">
                        <div className="text-[#ff385c] font-bold text-2xl">
                            Betopia
                        </div>
                    </Link>

                    {/* Navigation - Centered */}
                    <nav className="flex items-center gap-8 mx-auto h-full">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`relative flex items-center h-full text-lg font-medium transition-colors hover:text-white/80 ${isActive ? 'text-white' : 'text-neutral-400'
                                        }`}
                                >
                                    {link.name}
                                    {isActive && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff385c]" />
                                    )}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Actions - Right */}
                    <div className="flex items-center gap-6 absolute right-0">
                        {/* Profile Dropdown */}
                        <div ref={dropdownRef} className="relative flex items-center gap-2 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                            <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center overflow-hidden border border-white/10">
                                {user?.user_metadata?.avatar_url ? (
                                    <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={20} className="text-neutral-400" />
                                )}
                            </div>
                            <ChevronDown size={14} className={`text-neutral-400 transition-colors ${isOpen ? 'text-white rotate-180' : ''}`} />

                            {/* Dropdown Menu */}
                            <div className={`absolute top-12 right-0 bg-neutral-900 border border-white/10 shadow-2xl rounded-xl w-[200px] overflow-hidden transition-all z-50 ${isOpen ? 'block animate-in fade-in zoom-in duration-200' : 'hidden'}`}>
                                {user ? (
                                    <>
                                        <Link href="/dashboard" className="block px-4 py-3 hover:bg-white/5 font-semibold text-sm">Dashboard</Link>
                                        <Link href="/dashboard/my-listings" className="block px-4 py-3 hover:bg-white/5 text-sm">My Listings</Link>
                                        <Link href="/dashboard/saved" className="block px-4 py-3 hover:bg-white/5 text-sm">Wishlist</Link>
                                        <div className="h-[1px] bg-white/10 my-1" />
                                        <Link href="/dashboard/settings" className="block px-4 py-3 hover:bg-white/5 text-sm font-medium text-[#ff385c]">My Profile</Link>
                                        <div onClick={handleSignOut} className="block px-4 py-3 hover:bg-white/5 text-sm cursor-pointer border-t border-white/5">Log out</div>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/login" className="block px-4 py-3 hover:bg-white/5 font-semibold text-sm">Log in</Link>
                                        <Link href="/register" className="block px-4 py-3 hover:bg-white/5 text-sm">Sign up</Link>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Notifications */}
                        <div className="relative" ref={notifRef}>
                            <div 
                                className="relative cursor-pointer p-2 hover:bg-white/5 rounded-full transition-colors"
                                onClick={() => setIsNotifOpen(!isNotifOpen)}
                            >
                                <Bell size={24} className="text-neutral-300" />
                                {unreadCount > 0 && (
                                    <div className="absolute top-2 right-2 w-5 h-5 bg-[#ff385c] rounded-full border-2 border-black flex items-center justify-center text-[10px] font-bold">
                                        {unreadCount}
                                    </div>
                                )}
                            </div>

                            {/* Notifications Dropdown */}
                            <div className={`absolute top-12 right-0 bg-neutral-900 border border-white/10 shadow-2xl rounded-2xl w-[350px] max-h-[500px] overflow-hidden transition-all z-[60] ${isNotifOpen ? 'block animate-in fade-in slide-in-from-top-2 duration-200' : 'hidden'}`}>
                                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                                    <h3 className="font-bold">Notifications</h3>
                                    {notifications.length > 0 && (
                                        <button onClick={clearAll} className="text-xs text-[#ff385c] hover:underline font-medium">Clear all</button>
                                    )}
                                </div>
                                <div className="overflow-y-auto max-h-[400px]">
                                    {notifications.length === 0 ? (
                                        <div className="p-10 text-center text-neutral-500 text-sm">
                                            No notifications yet
                                        </div>
                                    ) : (
                                        notifications.map(n => (
                                            <div 
                                                key={n.id} 
                                                className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors flex gap-4 cursor-pointer relative items-start ${!n.read ? 'bg-[#ff385c]/5' : ''}`}
                                            >
                                                {n.sender ? (
                                                    <div className="w-10 h-10 rounded-full bg-neutral-800 border-2 border-white/10 shrink-0 overflow-hidden relative">
                                                        {n.sender.avatar_url ? (
                                                            <img src={n.sender.avatar_url} alt={n.sender.full_name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center font-bold text-xs text-[#ff385c] uppercase">
                                                                {n.sender.full_name?.charAt(0) || 'U'}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className={`p-2 rounded-full h-fit shrink-0 ${
                                                        n.type === 'warning' ? 'bg-yellow-500/20 text-yellow-500' : 
                                                        'bg-blue-500/20 text-blue-500'
                                                    }`}>
                                                        {n.type === 'warning' ? <AlertTriangle size={16} /> : <Info size={16} />}
                                                    </div>
                                                )}

                                                <div className="flex-1 min-w-0 pr-4">
                                                    {n.sender && <div className="text-[10px] text-[#ff385c] font-black uppercase tracking-widest leading-none mb-1">{n.sender.full_name}</div>}
                                                    <h4 className={`text-sm ${!n.read ? 'font-bold text-white' : 'text-neutral-300'}`}>{n.title}</h4>
                                                    <p className="text-xs text-neutral-400 mt-1 leading-relaxed line-clamp-2">{n.message}</p>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="text-[10px] text-neutral-600 block">
                                                            {new Date(n.timestamp).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})}
                                                        </span>
                                                        {n.link && (
                                                            <Link href={n.link} onClick={() => markAsRead(n.id)} className="text-[10px] font-bold text-[#ff385c] hover:underline">
                                                                View detail →
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>

                                                {!n.read && (
                                                    <div className="w-2 h-2 bg-[#ff385c] rounded-full mt-2 shrink-0 absolute right-4 top-4" />
                                                )}
                                                
                                                {/* Hidden absolute link overlay unless n.link exists and we want to click the whole card */}
                                                {!n.link && <div className="absolute inset-0 z-10" onClick={() => markAsRead(n.id)} />}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
