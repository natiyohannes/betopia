"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            console.error('Login Error:', error)
            let msg = error.message
            if (msg === 'Failed to fetch') {
                msg = 'Connection Error: Unable to reach the authentication server. Please check your internet connection or project settings.'
            }
            setError(msg)
            setLoading(false)
        } else {
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
        if (error) {
            setError(error.message)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl shadow-2xl border border-white/10 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10 relative">
                    <div className="absolute left-4 cursor-pointer text-white" onClick={() => router.push('/')}>
                        <X size={16} />
                    </div>
                    <div className="flex-1 text-center font-bold text-white">Log in or sign up</div>
                </div>

                {/* Content */}
                <div className="p-8 text-white">
                    <h3 className="text-2xl font-black mb-8">Welcome to Betopia</h3>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm p-4 rounded-xl">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
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
                            We&apos;ll call or text you to confirm your number. <a href="#" className="underline">Privacy Policy</a>
                        </div>

                        <Button className="w-full bg-[#ff385c] hover:bg-[#d9324e] h-14 text-lg font-black rounded-xl mt-6 shadow-xl shadow-[#ff385c]/20" disabled={loading}>
                            Continue
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
                            <span className="text-neutral-400 text-sm">Don&apos;t have an account? </span>
                            <Link href="/register" className="font-bold text-[#ff385c] hover:underline">Sign up</Link>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
