"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { Bell, X, Info, AlertTriangle, MessageCircle } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

type NotificationType = 'info' | 'warning' | 'error' | 'success'

interface Notification {
    id: string
    title: string
    message: string
    type: NotificationType
    timestamp: Date
    read: boolean
    link?: string
    sender?: {
        full_name: string
        avatar_url: string
    }
}

interface NotificationContextType {
    notifications: Notification[]
    markAsRead: (id: string) => void
    clearAll: () => void
    unreadCount: number
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [userId, setUserId] = useState<string | null>(null)

    const fetchNotifications = async (uid: string) => {
        const { data, error } = await supabase
            .from('notifications')
            .select('*, sender:profiles!notifications_sender_id_fkey(full_name, avatar_url)')
            .eq('user_id', uid)
            .order('created_at', { ascending: false })
            .limit(20)

        if (data) {
            setNotifications(data.map(n => ({
                id: n.id,
                title: n.title,
                message: n.message,
                type: n.type as NotificationType,
                timestamp: new Date(n.created_at),
                read: n.is_read,
                link: n.link,
                sender: n.sender as any
            })))
        }
    }

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUserId(user.id)
                fetchNotifications(user.id)
            }
        }
        init()
    }, [])

    useEffect(() => {
        if (!userId) return

        const channel = supabase.channel('realtime_notifications')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, (payload) => {
                // Fetch the new notification individually to get the joined sender profile
                const fetchSingle = async () => {
                    const { data } = await supabase.from('notifications').select('*, sender:profiles!notifications_sender_id_fkey(full_name, avatar_url)').eq('id', payload.new.id).single()
                    if (data) {
                        const newNotif = {
                            id: data.id,
                            title: data.title,
                            message: data.message,
                            type: data.type as NotificationType,
                            timestamp: new Date(data.created_at),
                            read: data.is_read,
                            link: data.link,
                            sender: data.sender as any
                        }
                        setNotifications(prev => [newNotif, ...prev])

                        // Attempt to dismiss toast locally after 8s
                        setTimeout(() => {
                            setNotifications(current => {
                                const exists = current.find(n => n.id === newNotif.id)
                                // We don't remove from DB, we just rely on user marking read
                                return current
                            })
                        }, 8000)
                    }
                }
                fetchSingle()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId])

    const markAsRead = useCallback(async (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
        await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    }, [])

    const clearAll = useCallback(async () => {
        if (!userId) return
        setNotifications([])
        await supabase.from('notifications').delete().eq('user_id', userId)
    }, [userId])

    const unreadCount = notifications.filter(n => !n.read).length

    return (
        <NotificationContext.Provider value={{ notifications, markAsRead, clearAll, unreadCount }}>
            {children}
            
            {/* Toast Overlay for new notifications */}
            <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
                {notifications.filter(n => !n.read).slice(0, 3).map(n => (
                    <div 
                        key={n.id} 
                        className="pointer-events-auto bg-neutral-900 border border-white/10 p-4 rounded-xl shadow-2xl flex gap-4 animate-in slide-in-from-right duration-300 items-start overflow-hidden relative"
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
                                {n.type === 'warning' ? <AlertTriangle size={18} /> : <Info size={18} />}
                            </div>
                        )}

                        <div className="flex-1 min-w-0 pr-6">
                            {n.sender && <div className="text-[10px] text-[#ff385c] font-black uppercase tracking-widest">{n.sender.full_name}</div>}
                            <h4 className="font-bold text-sm text-white truncate">{n.title}</h4>
                            <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">{n.message}</p>
                            {n.link && (
                                <Link 
                                    href={n.link} 
                                    onClick={() => markAsRead(n.id)}
                                    className="text-xs font-bold text-white mt-3 inline-block bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/20 transition-all"
                                >
                                    View details
                                </Link>
                            )}
                        </div>
                        <button onClick={() => markAsRead(n.id)} className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors bg-neutral-800 rounded-full p-1">
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    )
}

export function useNotifications() {
    const context = useContext(NotificationContext)
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider')
    }
    return context
}
