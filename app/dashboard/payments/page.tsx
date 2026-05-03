"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Calendar, CheckCircle2, AlertCircle } from "lucide-react"

export default function PaymentsPage() {
    const [payments, setPayments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPayments = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data } = await supabase
                .from('payments')
                .select('*, listings(title)')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (data) setPayments(data)
            setLoading(false)
        }
        fetchPayments()
    }, [])

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff385c]"></div>
        </div>
    )

    return (
        <div className="max-w-4xl mx-auto space-y-8 py-4">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-black">Payments & Billing</h1>
                <p className="text-muted-foreground mt-2">Manage your subscription plans and view transaction details.</p>
            </div>

            <Card className="border-none shadow-sm bg-gray-50/50">
                <CardHeader className="bg-white rounded-t-xl border-b">
                    <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-[#ff385c]" />
                        <CardTitle className="text-xl">Transaction History</CardTitle>
                    </div>
                    <CardDescription>Recent payments made for your property listings.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {payments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-b-xl">
                            <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <CreditCard className="h-8 w-8 text-gray-200" />
                            </div>
                            <p className="text-muted-foreground font-medium">No transactions yet.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 bg-white rounded-b-xl">
                            {payments.map((payment) => (
                                <div key={payment.id} className="group p-6 hover:bg-rose-50/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-[#ff385c]/10 transition-colors">
                                            <Building2 className="h-5 w-5 text-gray-500 group-hover:text-[#ff385c]" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-bold text-gray-900 group-hover:text-[#ff385c] transition-colors">{payment.listings?.title || 'System Payment'}</p>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                                                <span className="flex items-center gap-1.5 font-medium">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(payment.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                                <span className="font-mono bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">TX: {payment.transaction_id || 'LOCAL-TRX'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between md:flex-col md:items-end gap-2">
                                        <p className="text-xl font-black text-black">ETB {payment.amount.toLocaleString()}</p>
                                        <Badge
                                            variant={payment.status === 'completed' ? 'default' : 'secondary'}
                                            className={payment.status === 'completed' ? 'bg-green-500 text-white hover:bg-green-600' : ''}
                                        >
                                            {payment.status === 'completed' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                            {payment.status === 'pending' && <AlertCircle className="h-3 w-3 mr-1" />}
                                            {payment.status.toUpperCase()}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

function Building2(props: any) {
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
            <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
            <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
            <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
            <path d="M10 6h4" />
            <path d="M10 10h4" />
            <path d="M10 14h4" />
            <path d="M10 18h4" />
        </svg>
    )
}
