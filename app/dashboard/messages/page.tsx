"use client"

import { useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserCircle, Search, Send, Loader2, ArrowLeft, Building2, Plus, MessageCircle, X } from "lucide-react"

interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    listing_id: string | null;
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
        id: string | null;
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
    const [searchQuery, setSearchQuery] = useState("")
    const scrollRef = useRef<HTMLDivElement>(null)

    // New Chat States
    const [showNewChatModal, setShowNewChatModal] = useState(false)
    const [searchUserQuery, setSearchUserQuery] = useState("")
    const [userSearchResults, setUserSearchResults] = useState<any[]>([])
    const [searchingUsers, setSearchingUsers] = useState(false)

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

                const key = `${otherPartyId}-${msg.listing_id || 'direct'}`

                if (!grouped[key]) {
                    grouped[key] = {
                        id: key,
                        otherParty: {
                            id: otherPartyId,
                            name: otherPartyName || "Unknown User",
                            avatar_url: otherPartyAvatar || null
                        },
                        listing: {
                            id: msg.listing?.id || null,
                            title: msg.listing?.title || "Direct Message"
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

        let query = supabase
            .from('messages')
            .select('*, sender:profiles!messages_sender_id_fkey(full_name, avatar_url)')

        if (conv.listing.id) {
            query = query.eq('listing_id', conv.listing.id)
        } else {
            query = query.is('listing_id', null)
        }

        const { data, error } = await query
            .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${conv.otherParty.id}),and(sender_id.eq.${conv.otherParty.id},receiver_id.eq.${currentUser.id})`)
            .order('created_at', { ascending: true })

        if (data) setMessages(data)
    }

    useEffect(() => {
        if (selectedConv && currentUser) {
            fetchMessages(selectedConv)
            
            // Subscribe to realtime updates for this conversation
            let channelConfig: any = { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'messages'
            };
            
            // Filter by listing_id if it's not a direct message
            if (selectedConv.listing.id) {
                channelConfig.filter = `listing_id=eq.${selectedConv.listing.id}`;
            }

            const channel = supabase
                .channel(`messages_channel_${selectedConv.id}`)
                .on('postgres_changes', channelConfig, () => {
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
            listing_id: selectedConv.listing.id || null,
            content: reply
        })

        if (!error) {
            const messageSent = reply
            setReply("")
            fetchMessages(selectedConv)

            // Emit a notification
            await supabase.from('notifications').insert({
                user_id: selectedConv.otherParty.id,
                sender_id: currentUser.id,
                title: "New Message",
                message: messageSent.substring(0, 100),
                type: 'info',
                link: '/dashboard/messages'
            })
        }
        setSending(false)
    }

    // Search Users for New Chat
    const handleSearchUsers = async (query: string) => {
        setSearchUserQuery(query)
        if (!query.trim()) {
            setUserSearchResults([])
            return
        }

        setSearchingUsers(true)
        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, phone_number')
            .or(`full_name.ilike.%${query}%,phone_number.ilike.%${query}%`)
            .limit(10)

        if (data) {
            // Exclude current user from results
            setUserSearchResults(data.filter(u => u.id !== currentUser?.id))
        }
        setSearchingUsers(false)
    }

    const startNewChat = (user: any) => {
        const convId = `${user.id}-direct`
        const existingConv = conversations.find(c => c.id === convId)

        if (existingConv) {
            setSelectedConv(existingConv)
        } else {
            const newConv: Conversation = {
                id: convId,
                otherParty: {
                    id: user.id,
                    name: user.full_name || user.phone_number || "Unknown User",
                    avatar_url: user.avatar_url
                },
                listing: {
                    id: null,
                    title: "Direct Message"
                },
                lastMessage: "No messages yet",
                lastDate: new Date().toISOString()
            }
            setConversations(prev => [newConv, ...prev])
            setSelectedConv(newConv)
        }
        setShowNewChatModal(false)
        setSearchUserQuery("")
        setUserSearchResults([])
    }

    const filteredConversations = conversations.filter(conv =>
        conv.otherParty.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.listing.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-[#ff385c]" />
            </div>
        )
    }

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col relative">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Messages</h1>
                    <p className="text-muted-foreground">Chat with buyers and sellers about properties.</p>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden border border-white/10 rounded-2xl bg-card shadow-sm relative">

                {/* Conversations Sidebar */}
                <div className={`${selectedConv ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-col border-r border-white/10 bg-black/20`}>
                    <div className="p-4 border-b border-white/10 bg-card flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                            <Input 
                                placeholder="Search conversations..." 
                                className="pl-9 bg-white/5 border-none h-10" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button 
                            onClick={() => setShowNewChatModal(true)} 
                            className="bg-[#ff385c] hover:bg-[#d9324e] h-10 w-10 p-0 rounded-xl shrink-0"
                            title="New Message"
                        >
                            <Plus className="h-5 w-5" />
                        </Button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto">
                        {filteredConversations.length === 0 ? (
                            <div className="p-8 text-center text-sm text-gray-400">
                                {searchQuery ? "No matches found." : "No conversations yet."}
                            </div>
                        ) : (
                            filteredConversations.map((conv) => (
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
                                {messages.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-neutral-500 text-sm italic">
                                        No messages in this chat yet. Start the conversation!
                                    </div>
                                ) : (
                                    messages.map((msg) => {
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
                                    })
                                )}
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
                                <MessageCircle className="h-10 w-10 text-neutral-600 animate-pulse" />
                            </div>
                            <h3 className="text-lg font-bold text-white">Your Inbox</h3>
                            <p className="text-neutral-500 max-w-xs mt-2 text-sm">
                                Select a conversation to view messages or start a new inquiry.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* New Chat Modal Overlay */}
            {showNewChatModal && (
                <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[999] flex items-center justify-center p-4">
                    <div className="bg-neutral-900 border border-white/10 w-full max-w-md rounded-3xl p-6 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <button 
                            onClick={() => {
                                setShowNewChatModal(false)
                                setSearchUserQuery("")
                                setUserSearchResults([])
                            }}
                            className="absolute top-4 right-4 p-2 text-neutral-500 hover:text-white rounded-full bg-white/5 transition-all"
                        >
                            <X size={16} />
                        </button>
                        
                        <h3 className="text-xl font-black text-white uppercase tracking-tight mb-4">New Message</h3>
                        
                        <div className="relative mb-6">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                            <Input 
                                placeholder="Search users by name..." 
                                className="pl-9 bg-white/5 border-none h-12 focus-visible:ring-[#ff385c]" 
                                value={searchUserQuery}
                                onChange={(e) => handleSearchUsers(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="max-h-[300px] overflow-y-auto space-y-2">
                            {searchingUsers ? (
                                <div className="flex items-center justify-center py-6 text-neutral-400 gap-2">
                                    <Loader2 className="animate-spin text-[#ff385c] h-4 w-4" />
                                    Searching...
                                </div>
                            ) : userSearchResults.length === 0 ? (
                                <div className="text-center py-8 text-neutral-500 text-sm">
                                    {searchUserQuery.trim() ? "No users found matching query." : "Type a name to search for registered users."}
                                </div>
                            ) : (
                                userSearchResults.map(user => (
                                    <div 
                                        key={user.id}
                                        onClick={() => startNewChat(user)}
                                        className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 cursor-pointer border border-transparent hover:border-white/5 transition-all"
                                    >
                                        <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden flex items-center justify-center bg-neutral-800 shrink-0">
                                            {user.avatar_url ? (
                                                <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                                            ) : (
                                                <UserCircle className="text-neutral-500 w-full h-full" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-white text-sm truncate">{user.full_name || user.phone_number || "Unknown User"}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
