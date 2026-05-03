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
    const [plans, setPlans] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [selectedPlan, setSelectedPlan] = useState<string>("")
    const [success, setSuccess] = useState(false)

    // Payrify specific state
    const [paymentStep, setPaymentStep] = useState<1 | 2>(1)
    const [transactionId, setTransactionId] = useState("")
    const [error, setError] = useState("")

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            // Fetch Listing
            const { data: listingData } = await supabase
                .from('listings')
                .select('*')
                .eq('id', params.listingId)
                .single()

            if (listingData) setListing(listingData)

            // Fetch Plans
            const { data: plansData } = await supabase
                .from('pricing_plans')
                .select('*')
                .eq('active', true)
                .order('price', { ascending: true })

            if (plansData) {
                setPlans(plansData)
                // Set default plan to "Standard" if found, else first one
                const standard = plansData.find(p => p.name.toLowerCase().includes('standard'))
                setSelectedPlan(standard ? standard.id : plansData[0]?.id)
            }
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
                plan_id: plan.id,
                amount: plan.price,
                provider: 'payrify',
                status: 'completed',
                transaction_id: transactionId.trim()
            })

            if (paymentError) {
                console.error("Payment Error", paymentError)
                setError("Payment recording failed. Please try again.")
                setProcessing(false)
                return
            }

            // Set Listing to Pending Approval (Admin will publish)
            const { error: updateError } = await supabase.from('listings').update({
                status: 'paid',
            }).eq('id', params.listingId)

            if (updateError) {
                console.error("Update Error", updateError)
            }

            setSuccess(true)
            setProcessing(false)

            // Redirect after delay
            setTimeout(() => {
                router.push('/dashboard/my-listings')
                router.refresh()
            }, 3000)
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
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="rounded-full bg-green-100 p-8">
                    <CheckCircle className="h-16 w-16 text-green-600" />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold">Payment Verified!</h2>
                    <p className="text-muted-foreground text-lg">Your property <strong>{listing.title}</strong> is now pending admin approval.</p>
                </div>
                <Button onClick={() => router.push('/dashboard/my-listings')} size="lg" className="mt-4">
                    Go to My Listings
                </Button>
            </div>
        )
    }

    const activePlan = plans.find(p => p.id === selectedPlan)

    return (
        <div className="max-w-5xl mx-auto py-10 px-4">
            <div className="mb-8 text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">Select a Plan & Pay</h1>
                <p className="text-muted-foreground">Choose the best exposure for your property and checkout with Payrify.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
                {plans.map((plan) => (
                    <Card
                        key={plan.id}
                        className={`cursor-pointer transition-all hover:shadow-lg relative overflow-hidden flex flex-col ${selectedPlan === plan.id ? 'border-[#ff385c] border-2 shadow-md bg-rose-50/50 scale-[1.02]' : 'border-gray-200'
                            }`}
                        onClick={() => { setSelectedPlan(plan.id); setPaymentStep(1); }}
                    >
                        {selectedPlan === plan.id && (
                            <div className="absolute top-0 right-0 bg-[#ff385c] text-white px-3 py-1 text-xs font-bold rounded-bl-lg shadow-sm">
                                SELECTED
                            </div>
                        )}
                        <CardHeader>
                            <CardTitle>{plan.name}</CardTitle>
                            <div className="mt-2 text-black">
                                <span className="text-3xl font-bold">ETB {plan.price}</span>
                                <span className="text-muted-foreground text-sm"> / listing</span>
                            </div>
                            <CardDescription className="font-medium text-[#ff385c] mt-1">{plan.duration_days} days visibility</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <p className="text-sm text-gray-600 mb-4 h-10">{plan.description}</p>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-2">
                                    <CheckCircle size={18} className="text-green-600 shrink-0" />
                                    <span>{plan.is_featured ? "Priority Featured Placement" : "Standard Placement"}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle size={18} className="text-green-600 shrink-0" />
                                    <span>{plan.duration_days} Days Live Status</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="max-w-md mx-auto">
                <Card className="border-t-4 border-t-[#ff385c] shadow-lg">
                    <CardHeader className="bg-gray-50/50 pb-6 border-b border-gray-100">
                        <CardTitle className="text-xl">Checkout</CardTitle>
                        <CardDescription>Complete your payment securely with Payrify</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-600">Selected Plan</span>
                                <span className="font-bold">{activePlan?.name}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                <span className="font-medium text-gray-600">Total Amount</span>
                                <span className="font-bold text-xl text-[#ff385c]">ETB {activePlan?.price}</span>
                            </div>
                        </div>

                        {paymentStep === 1 ? (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                <div className="space-y-4 animate-in fade-in duration-300">
                                    <div className="bg-rose-50 p-4 rounded-xl flex items-start gap-3 border border-rose-100">
                                        <ShieldCheck className="text-[#ff385c] h-6 w-6 shrink-0 mt-0.5" />
                                        <div className="text-sm">
                                            <p className="font-bold text-rose-950 mb-1">Payrify Secure Checkout</p>
                                            <p className="text-rose-800 leading-relaxed">
                                                Click below to securely pay via Payrify. Once completed, you'll enter your Transaction ID here to verify.
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full h-14 text-lg font-bold bg-[#ff385c] hover:bg-[#d90b35] transition-all shadow-lg hover:shadow-xl mt-2"
                                        onClick={handleOpenPayrify}
                                    >
                                        Proceed to Payrify
                                        <ExternalLink className="ml-2 h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                                <div className="bg-blue-50 p-4 rounded-xl flex flex-col gap-2 border border-blue-100">
                                    <p className="font-bold text-blue-950 text-sm">Waiting for verification</p>
                                    <p className="text-blue-800 text-sm leading-relaxed">
                                        Enter the Transaction ID provided by Payrify after your successful payment.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="transactionId" className="text-sm font-semibold text-gray-700">
                                        Transaction ID
                                    </label>
                                    <Input
                                        id="transactionId"
                                        placeholder="e.g. TXN-123456789"
                                        value={transactionId}
                                        onChange={(e) => {
                                            setTransactionId(e.target.value)
                                            setError("")
                                        }}
                                        className="h-12 border-gray-300 focus-visible:ring-[#ff385c]"
                                    />
                                    {error && <p className="text-red-500 text-sm font-medium animate-in fade-in">{error}</p>}
                                </div>

                                <div className="pt-2 flex flex-col gap-3">
                                    <Button
                                        className="w-full h-12 text-lg font-bold bg-[#ff385c] hover:bg-[#d90b35]"
                                        onClick={handleConfirmPayment}
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Verifying...
                                            </>
                                        ) : (
                                            "Confirm Payment"
                                        )}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="w-full text-sm text-gray-500 hover:text-gray-800"
                                        onClick={() => setPaymentStep(1)}
                                        disabled={processing}
                                    >
                                        &larr; Back to select payment method
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <div className="text-center pb-6 text-xs text-muted-foreground flex items-center justify-center gap-1.5 opacity-70">
                        <ShieldCheck size={14} className="text-gray-400" /> Powered by Payrify Secure
                    </div>
                </Card>
            </div>
        </div>
    )
}
