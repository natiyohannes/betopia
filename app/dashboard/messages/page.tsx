"use client"

import { useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserCircle, Search, Send, Loader2, ArrowLeft, Building2 } from "lucide-react"

interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    listing_id: string;
    content: string;
    created_at: string;
    sender?: { full_name: string };
    listing?: { title: string };
}

interface Conversation {
    id: string; // Combined ID or just the listing/user pair
    otherParty: {
        id: string;
        name: string;
        avatar_url: string | null;
    };
    listing: {
        id: string;
        title: string;
    };
    lastMessage: string;
    lastDate: string;
}

export default function MessagesPage() {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [selectedConv, setSelectedConv] = useState<Conversation | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [reply, setReply] = useState("")
    const [currentUser, setCurrentUser] = useState<any>(null)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setCurrentUser(user)
            if (user) {
                fetchConversations(user.id)
            }
        }
        init()
    }, [])

    // Scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const fetchConversations = async (userId: string) => {
        const { data, error } = await supabase
            .from('messages')
            .select('*, sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url), receiver:profiles!messages_receiver_id_fkey(id, full_name, avatar_url), listing:listings(id, title)')
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
            .order('created_at', { ascending: false })

        if (data) {
            // Group into unique conversations by (other party ID + listing ID)
            const grouped: { [key: string]: Conversation } = {}

            data.forEach((msg: any) => {
                const otherPartyId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id
                const otherPartyName = msg.sender_id === userId ? msg.receiver?.full_name : msg.sender?.full_name
                const otherPartyAvatar = msg.sender_id === userId ? msg.receiver?.avatar_url : msg.sender?.avatar_url

                const key = `${otherPartyId}-${msg.listing_id}`

                if (!grouped[key]) {
                    grouped[key] = {
                        id: key,
                        otherParty: {
                            id: otherPartyId,
                            name: otherPartyName || "Unknown User",
                            avatar_url: otherPartyAvatar || null
                        },
                        listing: {
                            id: msg.listing?.id,
                            title: msg.listing?.title || "Unknown Property"
                        },
                        lastMessage: msg.content,
                        lastDate: msg.created_at
                    }
                }
            })

            setConversations(Object.values(grouped))
        }
        setLoading(false)
    }

    const fetchMessages = async (conv: Conversation) => {
        if (!currentUser) return

        const { data, error } = await supabase
            .from('messages')
            .select('*, sender:profiles!messages_sender_id_fkey(full_name, avatar_url)')
            .eq('listing_id', conv.listing.id)
            .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${conv.otherParty.id}),and(sender_id.eq.${conv.otherParty.id},receiver_id.eq.${currentUser.id})`)
            .order('created_at', { ascending: true })

        if (data) setMessages(data)
    }

    useEffect(() => {
        if (selectedConv && currentUser) {
            fetchMessages(selectedConv)
            
            // Subscribe to realtime updates for this conversation
            const channel = supabase
                .channel(`messages_channel_${selectedConv.listing.id}`)
                .on('postgres_changes', { 
                    event: 'INSERT', 
                    schema: 'public', 
                    table: 'messages',
                    filter: `listing_id=eq.${selectedConv.listing.id}`
                }, () => {
                    fetchMessages(selectedConv)
                })
                .subscribe()

            return () => {
                supabase.removeChannel(channel)
            }
        }
    }, [selectedConv, currentUser])

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!reply.trim() || !selectedConv || !currentUser) return

        setSending(true)
        const { error } = await supabase.from('messages').insert({
            sender_id: currentUser.id,
            receiver_id: selectedConv.otherParty.id,
            listing_id: selectedConv.listing.id,
            content: reply
        })

        if (!error) {
            setReply("")
            fetchMessages(selectedConv)

            // Emit a notification
            await supabase.from('notifications').insert({
                user_id: selectedConv.otherParty.id,
                sender_id: currentUser.id,
                title: "New Message",
                message: reply.substring(0, 100),
                type: 'info',
                link: '/dashboard/messages'
            })
        }
        setSending(false)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-[#ff385c]" />
            </div>
        )
    }

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight text-white">Messages</h1>
                <p className="text-muted-foreground">Chat with buyers and sellers about properties.</p>
            </div>

            <div className="flex-1 flex overflow-hidden border border-white/10 rounded-2xl bg-card shadow-sm">

                {/* Conversations Sidebar */}
                <div className={`${selectedConv ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-col border-r border-white/10 bg-black/20`}>
                    <div className="p-4 border-b border-white/10 bg-card">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                            <Input placeholder="Search messages..." className="pl-9 bg-white/5 border-none h-10" />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {conversations.length === 0 ? (
                            <div className="p-8 text-center text-sm text-gray-400">No conversations yet.</div>
                        ) : (
                            conversations.map((conv) => (
                                <div
                                    key={conv.id}
                                    onClick={() => setSelectedConv(conv)}
                                    className={`p-4 border-b border-white/5 cursor-pointer transition flex gap-3 hover:bg-white/5 ${selectedConv?.id === conv.id ? 'bg-white/10 border-r-4 border-r-[#ff385c]' : ''}`}
                                >
                                    <div className="h-12 w-12 rounded-full border border-white/10 shrink-0 flex items-center justify-center bg-neutral-900 overflow-hidden relative">
                                        {conv.otherParty.avatar_url ? (
                                            <img src={conv.otherParty.avatar_url} alt={conv.otherParty.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <UserCircle className="text-neutral-500 w-full h-full p-1" />
                                        )}
                                        {selectedConv?.id === conv.id && (
                                            <div className="absolute right-0 bottom-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-0.5">
                                            <span className="font-semibold text-sm text-white truncate">{conv.otherParty.name}</span>
                                            <span className="text-[10px] text-neutral-500 whitespace-nowrap">{new Date(conv.lastDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="text-xs text-neutral-400 font-medium mb-1 flex items-center gap-1">
                                            <Building2 className="h-3 w-3" />
                                            <span className="truncate">{conv.listing.title}</span>
                                        </div>
                                        <p className="text-xs text-neutral-500 truncate italic">"{conv.lastMessage}"</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Message Pane */}
                <div className={`${!selectedConv ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-black`}>
                    {selectedConv ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-white/10 flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur-md z-10">
                                <div className="flex items-center gap-3">
                                    <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedConv(null)}>
                                        <ArrowLeft className="h-5 w-5" />
                                    </Button>
                                    <div className="h-10 w-10 rounded-full border border-white/10 overflow-hidden shrink-0 flex items-center justify-center bg-neutral-900 border-white/10">
                                        {selectedConv.otherParty.avatar_url ? (
                                            <img src={selectedConv.otherParty.avatar_url} alt={selectedConv.otherParty.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <UserCircle className="text-neutral-500 w-full h-full p-1" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-white">{selectedConv.otherParty.name}</h3>
                                        <p className="text-[10px] text-neutral-500 font-medium">Discussion on: {selectedConv.listing.title}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-black/20">
                                {messages.map((msg) => {
                                    const isMe = msg.sender_id === currentUser?.id
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] rounded-2xl p-3 text-sm ${isMe
                                                    ? 'bg-[#ff385c] text-white rounded-tr-none'
                                                    : 'bg-white/5 border border-white/10 text-white rounded-tl-none shadow-sm'
                                                }`}>
                                                {!isMe && <p className="text-[10px] font-bold opacity-60 mb-1 capitalize text-neutral-400">{msg.sender?.full_name}</p>}
                                                <p className="leading-relaxed">{msg.content}</p>
                                                <p className={`text-[9px] mt-1 ${isMe ? 'text-white/70 text-right' : 'text-neutral-500'}`}>
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Reply Area */}
                            <div className="p-4 border-t border-white/10 bg-card">
                                <form onSubmit={handleSend} className="flex gap-2">
                                    <Input
                                        placeholder="Type your message..."
                                        value={reply}
                                        onChange={(e) => setReply(e.target.value)}
                                        className="flex-1 bg-white/5 border-none focus-visible:ring-[#ff385c]"
                                    />
                                    <Button type="submit" size="icon" disabled={sending || !reply.trim()} className="bg-[#ff385c] hover:bg-[#d9324e]">
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-black/40">
                            <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                <MessageCircleIcon className="h-10 w-10 text-neutral-600" />
                            </div>
                            <h3 className="text-lg font-bold text-white">Your Inbox</h3>
                            <p className="text-neutral-500 max-w-xs mt-2 text-sm">
                                Select a conversation to view messages or start a new inquiry.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function MessageCircleIcon(props: any) {
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
            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
        </svg>
    )
}
