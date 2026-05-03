"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"

export default function RegisterPage() {
    const router = useRouter()
    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        // 1. Sign up the user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName },
            },
        })

        if (authError) {
            setError(authError.message)
            setLoading(false)
            return
        }

        if (authData.user) {
            // 2. Update profile
            await supabase
                .from('profiles')
                .update({ full_name: fullName, phone_number: phoneNumber })
                .eq('id', authData.user.id)

            router.push("/dashboard")
            router.refresh()
        }
    }

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/dashboard`,
            },
        })
        if (error) setError(error.message)
    }

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl shadow-2xl border border-white/10 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10 relative">
                    <div className="absolute left-4 cursor-pointer text-white" onClick={() => router.push('/')}>
                        <X size={16} />
                    </div>
                    <div className="flex-1 text-center font-bold text-white">Finish signing up</div>
                </div>

                {/* Content */}
                <div className="p-8 py-8 h-[80vh] overflow-y-auto text-white">
                    <form onSubmit={handleRegister} className="space-y-6">
                        {error && (
                            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm p-4 rounded-xl">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <Input
                                placeholder="Full Name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="h-14 border-white/10 bg-white/5 rounded-xl text-lg focus:border-[#ff385c]/50"
                                required
                            />
                            <Input
                                type="tel"
                                placeholder="Phone Number"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="h-14 border-white/10 bg-white/5 rounded-xl text-lg focus:border-[#ff385c]/50"
                                required
                            />
                            <Input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-14 border-white/10 bg-white/5 rounded-xl text-lg focus:border-[#ff385c]/50"
                                required
                            />
                            <Input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-14 border-white/10 bg-white/5 rounded-xl text-lg focus:border-[#ff385c]/50"
                                required
                            />
                        </div>

                        <div className="text-xs text-neutral-500 mt-2">
                            By selecting <strong>Agree and continue</strong>, I agree to the Terms of Service and acknowledge the Privacy Policy.
                        </div>

                        <Button className="w-full bg-[#ff385c] hover:bg-[#d9324e] h-14 text-lg font-black rounded-xl mt-6 shadow-xl shadow-[#ff385c]/20" disabled={loading}>
                            Agree and continue
                        </Button>
                    </form>

                    <div className="flex items-center gap-4 my-8">
                        <div className="h-[1px] bg-white/10 flex-1" />
                        <div className="text-xs text-neutral-500 text-center uppercase tracking-widest font-bold">or</div>
                        <div className="h-[1px] bg-white/10 flex-1" />
                    </div>

                    <div className="space-y-4">
                        <Button
                            variant="outline"
                            className="w-full h-14 border-white/10 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10"
                            onClick={handleGoogleLogin}
                        >
                            Continue with Google
                        </Button>
                        <div className="text-center mt-6">
                            <span className="text-neutral-400 text-sm">Already have an account? </span>
                            <Link href="/login" className="font-bold text-[#ff385c] hover:underline">Log in</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
