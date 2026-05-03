"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Phone, MessageCircle, Send, CheckCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

interface ContactOwnerFormProps {
    ownerName: string
    ownerPhone?: string
    listingId?: string
    ownerId?: string
}

export function ContactOwnerForm({ ownerName, ownerPhone, listingId, ownerId }: ContactOwnerFormProps) {
    const [showPhone, setShowPhone] = useState(false)
    const [message, setMessage] = useState("")
    const [sent, setSent] = useState(false)
    const [sending, setSending] = useState(false)

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        setSending(true)

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            alert("Please login to send messages")
            setSending(false)
            return
        }

        if (!ownerId) {
            alert("Owner information missing")
            setSending(false)
            return
        }

        // Save to Supabase
        const { error } = await supabase.from('messages').insert({
            sender_id: user.id,
            receiver_id: ownerId,
            listing_id: listingId,
            content: message
        })

        if (error) {
            console.error("Message Error", error)
            alert("Error sending message: " + error.message)
        } else {
            setSent(true)
            setMessage("")
            
            // Add a push-notification in the new table
            await supabase.from('notifications').insert({
                user_id: ownerId,
                sender_id: user.id,
                title: "New Inquiry on Property",
                message: message.substring(0, 100),
                type: 'info',
                link: '/dashboard/messages'
            })
        }
        setSending(false)
    }

    return (
        <div className="space-y-6">
            <h3 className="font-black text-xl text-white uppercase tracking-widest">Contact {ownerName}</h3>

            <div className="flex flex-col gap-4">
                <Button
                    variant="outline"
                    className="w-full justify-start h-14 text-md gap-4 border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-2xl font-bold"
                    onClick={() => setShowPhone(!showPhone)}
                >
                    <Phone className="h-5 w-5 text-neutral-500" />
                    {showPhone ? (ownerPhone || "No phone listed") : "Show Phone Number"}
                </Button>

                <Button
                    className="w-full justify-start h-14 text-md gap-4 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-2xl font-bold shadow-xl shadow-green-500/10 border-none"
                    onClick={() => window.open(`https://wa.me/${ownerPhone?.replace(/\D/g, '')}`, '_blank')}
                >
                    <MessageCircle className="h-5 w-5" />
                    Chat on WhatsApp
                </Button>
            </div>

            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.3em]">
                    <span className="bg-[#0a0a0a] px-4 text-neutral-600">OR SEND MESSAGE</span>
                </div>
            </div>

            {sent ? (
                <div className="bg-green-500/10 text-green-500 p-6 rounded-[32px] border border-green-500/20 flex flex-col items-center text-center gap-4">
                    <CheckCircle className="h-10 w-10" />
                    <p className="font-black uppercase tracking-widest text-sm">Message sent successfully!</p>
                </div>
            ) : (
                <form onSubmit={handleSendMessage} className="space-y-4">
                    <Textarea
                        placeholder={`Hi ${ownerName}, I am interested in this property...`}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="min-h-[140px] bg-white/5 border-white/10 rounded-2xl focus:border-[#ff385c]/50 text-white font-medium"
                        required
                    />
                    <Button
                        type="submit"
                        disabled={sending}
                        className="w-full h-14 bg-[#ff385c] hover:bg-[#d9324e] text-lg font-black rounded-2xl shadow-xl shadow-[#ff385c]/20"
                    >
                        {sending ? (
                            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5 mr-3" />
                        )}
                        Send Message
                    </Button>
                </form>
            )}

            <div className="text-center text-[10px] text-neutral-600 font-bold uppercase tracking-widest mt-4">
                Sent directly to owner's inbox
            </div>
        </div>
    )
}
