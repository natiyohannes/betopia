"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, CheckCircle, ShieldCheck, ExternalLink } from "lucide-react"

// Hardcoded plans for reliability/demo purposes
const PLANS = [
    {
        id: 'standard',
        name: 'Standard Plan',
        price: 200,
        duration: 30,
        features: ['Visible for 30 days', 'Standard visibility', 'Up to 10 Photos', 'Email Support']
    },
    {
        id: 'premium',
        name: 'Premium Plan', // Featured
        price: 500,
        duration: 60,
        features: ['Visible for 60 days', 'Featured at top', 'Unlimited Photos', 'Priority Support', 'Video Tour']
    },
    {
        id: 'testing',
        name: 'Testing',
        price: 5,
        duration: 1,
        features: ['1 Day visibility', 'For system testing only']
    }
]

const PAYRIFY_LINKS: Record<string, string> = {
    'standard': 'https://payrify.et/pay/dPbpe75UJtnvNXhr',
    'premium': 'https://payrify.et/pay/yaIJDKfVApH1thVz',
    'testing': 'https://payrify.et/pay/ny9jlxFnpS0o9bNB'
}

export default function PaymentPage({ params }: { params: { listingId: string } }) {
    const router = useRouter()
    const [listing, setListing] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [selectedPlan, setSelectedPlan] = useState<string>("premium")
    const [success, setSuccess] = useState(false)
    const [transactionId, setTransactionId] = useState("")
    const [error, setError] = useState("")

    // Use hardcoded plans — pricing_plans table may be empty
    const plans = PLANS

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            const { data: listingData } = await supabase
                .from('listings')
                .select('*')
                .eq('id', params.listingId)
                .single()
            if (listingData) setListing(listingData)
            setLoading(false)
        }
        fetchData()
    }, [params.listingId])

    const handleOpenPayrify = () => {
        const plan = plans.find(p => p.id === selectedPlan) || PLANS.find(p => p.id === selectedPlan)
        if (plan) {
            const name = plan.name.toLowerCase()
            let link = PAYRIFY_LINKS['standard']
            if (name.includes('premium')) link = PAYRIFY_LINKS['premium']
            else if (name.includes('testing')) link = PAYRIFY_LINKS['testing']
            
            window.open(link, '_blank')
            setPaymentStep(2)
        }
    }

    const handleConfirmPayment = async () => {
        if (!transactionId.trim()) {
            setError("Please enter your Transaction ID.")
            return
        }

        setProcessing(true)
        setError("")
        const plan = plans.find(p => p.id === selectedPlan)

        if (!plan) {
            setProcessing(false)
            return
        }

        const { data: { user } } = await supabase.auth.getUser()

        if (user && listing) {
            // Record Payment
            const { error: paymentError } = await supabase.from('payments').insert({
                user_id: user.id,
                listing_id: params.listingId,
                amount: plan.price,
                provider: 'manual',
                status: 'pending',
                transaction_id: transactionId.trim()
            })

            if (paymentError) {
                console.error("Payment Error", paymentError)
                setError("Payment recording failed. Please try again.")
                setProcessing(false)
                return
            }

            // Set listing to pending admin approval
            await supabase.from('listings').update({
                status: 'paid',
            }).eq('id', params.listingId)

            setSuccess(true)
            setProcessing(false)

            // Redirect after delay
            setTimeout(() => {
                router.push('/dashboard/my-listings')
                router.refresh()
            }, 5000)
        } else {
            setError("Authentication error. Please ensure you are logged in.")
            setProcessing(false)
        }
    }

    if (loading) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )

    if (!listing) return <div className="p-10 text-center font-semibold text-lg max-w-lg mx-auto mt-10 rounded-xl bg-gray-50 border border-gray-100">Listing not found.</div>

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in fade-in zoom-in duration-500 px-4 text-center">
                <div className="rounded-full bg-amber-500/10 border-2 border-amber-500/30 p-8">
                    <ShieldCheck className="h-16 w-16 text-amber-400" />
                </div>
                <div className="space-y-3 max-w-md">
                    <h2 className="text-3xl font-black text-white uppercase tracking-wider">Pending Approval</h2>
                    <p className="text-neutral-300 text-lg leading-relaxed">
                        Your payment for <strong className="text-white">{listing.title}</strong> has been submitted successfully.
                    </p>
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mt-4">
                        <p className="text-amber-300 font-semibold text-sm">
                            ⏱️ You will receive approval within the next <strong>12 hours</strong>.
                        </p>
                        <p className="text-neutral-500 text-xs mt-1">Our team reviews all payments manually. We'll notify you once your listing goes live.</p>
                    </div>
                </div>
                <Button onClick={() => router.push('/dashboard/my-listings')} size="lg" className="bg-[#ff385c] hover:bg-[#e31c5f] text-white rounded-2xl px-10 h-14 text-lg font-black">
                    View My Listings
                </Button>
            </div>
        )
    }

    const activePlan = plans.find(p => p.id === selectedPlan) || PLANS[1]

    return (
        <div className="max-w-5xl mx-auto py-10 px-4">
            <div className="mb-8 text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">Select a Plan & Pay</h1>
                <p className="text-muted-foreground">Choose the best exposure for your property and checkout with Payrify.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
                {PLANS.filter(p => p.id !== 'testing').map((plan) => (
                    <Card
                        key={plan.id}
                        className={`cursor-pointer transition-all hover:shadow-lg relative overflow-hidden flex flex-col ${
                            selectedPlan === plan.id
                                ? 'border-[#ff385c] border-2 shadow-xl bg-[#ff385c]/5 scale-[1.02]'
                                : 'border-white/10 bg-neutral-900 text-white'
                        }`}
                        onClick={() => setSelectedPlan(plan.id)}
                    >
                        {selectedPlan === plan.id && (
                            <div className="absolute top-0 right-0 bg-[#ff385c] text-white px-3 py-1 text-xs font-bold rounded-bl-lg shadow-sm">
                                SELECTED
                            </div>
                        )}
                        <CardHeader>
                            <CardTitle className="text-white">{plan.name}</CardTitle>
                            <div className="mt-2">
                                <span className="text-3xl font-bold text-white">ETB {plan.price}</span>
                                <span className="text-neutral-400 text-sm"> / listing</span>
                            </div>
                            <CardDescription className="font-medium text-[#ff385c] mt-1">{plan.duration} days visibility</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <ul className="space-y-3 text-sm">
                                {plan.features.map((f, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />
                                        <span className="text-neutral-300">{f}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="max-w-md mx-auto">
                <Card className="border-t-4 border-t-[#ff385c] shadow-lg bg-neutral-950 border-white/10 text-white">
                    <CardHeader className="bg-white/5 pb-6 border-b border-white/10">
                        <CardTitle className="text-xl font-black uppercase tracking-wider text-white">Checkout</CardTitle>
                        <CardDescription className="text-neutral-400">Complete your payment manually via Telebirr</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/10">
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-medium text-neutral-400">Selected Plan</span>
                                <span className="font-bold text-white">{activePlan?.name}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-white/10 text-sm">
                                <span className="font-medium text-neutral-400">Total Amount</span>
                                <span className="font-bold text-xl text-[#ff385c]">ETB {activePlan?.price}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-sm leading-relaxed">
                                <p className="font-bold text-white mb-2 uppercase tracking-wider text-xs text-[#ff385c]">Payment Instructions</p>
                                <p className="text-neutral-300">
                                    Please transfer <strong className="text-white">ETB {activePlan?.price}</strong> to the Telebirr account below. After transferring, copy the <strong className="text-white">Transaction Reference ID</strong> (e.g. FT26...) from your confirmation SMS/app and paste it in the box below.
                                </p>
                            </div>

                            {/* Account Info */}
                            <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                                <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Telebirr (Phone Transfer)</p>
                                <p className="font-bold text-lg text-white mt-1">+251 930 614 550</p>
                                <p className="text-xs text-neutral-400">Account Name: Nathan Yohannes</p>
                            </div>

                            {/* QR Code */}
                            <div className="flex flex-col items-center justify-center p-6 rounded-2xl border border-white/10 bg-white/[0.01] gap-3">
                                <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Scan QR Code to Pay</span>
                                <div className="bg-white p-3 rounded-2xl w-48 h-48 overflow-hidden shadow-2xl">
                                    <img 
                                        src="/payment_qr.jpg" 
                                        alt="Telebirr Payment QR Code" 
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <span className="text-xs text-neutral-500">Nathan (+251930614550)</span>
                            </div>

                            {/* Transaction ID Input */}
                            <div className="space-y-2">
                                <label htmlFor="transactionId" className="text-xs font-black uppercase tracking-widest text-neutral-400">
                                    Transaction ID / Reference Number
                                </label>
                                <Input
                                    id="transactionId"
                                    placeholder="e.g. FT26..."
                                    value={transactionId}
                                    onChange={(e) => {
                                        setTransactionId(e.target.value)
                                        setError("")
                                    }}
                                    className="h-12 border-white/10 bg-white/5 focus-visible:ring-[#ff385c] text-white"
                                />
                                {error && <p className="text-red-500 text-sm font-medium animate-in fade-in">{error}</p>}
                            </div>

                            <div className="pt-2">
                                <Button
                                    className="w-full h-14 text-lg font-black uppercase tracking-widest bg-[#ff385c] hover:bg-[#d90b35] text-white rounded-2xl shadow-xl shadow-[#ff385c]/10"
                                    onClick={handleConfirmPayment}
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        "Submit Transaction ID"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                    <div className="text-center pb-6 text-[10px] font-black uppercase tracking-widest text-neutral-500 flex items-center justify-center gap-1.5 opacity-60">
                        <ShieldCheck size={14} className="text-neutral-500" /> Manual Payment Approval System
                    </div>
                </Card>
            </div>
        </div>
    )
}
