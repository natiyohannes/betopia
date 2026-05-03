"use client"

import { Heart, ShieldCheck, Zap, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ContactSection } from '@/components/contact-section'

export default function AboutUsPage() {
    return (
        <div className="max-w-7xl mx-auto py-24 px-4 space-y-24 bg-white min-h-screen">
            {/* Mission Hero */}
            <div className="flex flex-col md:flex-row items-center gap-16 px-4 md:px-0">
                <div className="flex-1 space-y-8 animate-in slide-in-from-left duration-1000">
                    <h1 className="text-8xl md:text-9xl font-black text-neutral-900 leading-[0.8] tracking-tighter">
                        WE REDEFINE <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff385c] via-[#ff385c] to-purple-500">
                        SPACE in ETHIOPIA.
                        </span>
                    </h1>
                    <p className="text-2xl text-neutral-600 font-medium max-w-2xl leading-relaxed">
                        At <span className="text-[#ff385c] font-black">BETOPIA</span>, we believe every real estate transaction is a transformation. We are here to make finding your next space simple, transparent, and premium.
                    </p>
                    <div className="flex gap-4">
                        <Button asChild size="lg" className="h-16 px-10 rounded-2xl bg-neutral-900 text-white font-black hover:bg-black transition-all hover:scale-105 active:scale-95">
                            <Link href="/">Explore Listings</Link>
                        </Button>
                    </div>
                </div>
                <div className="flex-1 relative aspect-square md:aspect-auto w-full md:h-[700px] overflow-hidden rounded-[60px] shadow-2xl animate-in fade-in duration-2000">
                    <img 
                        src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb" 
                        alt="Modern Ethiopian Architecture" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
            </div>

            {/* Values Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4 md:px-0">
                <ValueCard 
                    icon={<ShieldCheck className="text-[#ff385c]" size={32} />} 
                    title="UNYIELDING TRUST" 
                    description="Every property is verified by our dedicated team to ensure you get exactly what you see."
                />
                <ValueCard 
                    icon={<Zap className="text-[#ff385c]" size={32} />} 
                    title="SPEED & AGILITY" 
                    description="Our 60-second automated cleanup ensures you only see the most active and valid listings."
                />
                <ValueCard 
                    icon={<UserCheck className="text-[#ff385c]" size={32} />} 
                    title="NATIVE FOCUS" 
                    description="Built by locals, for locals. We understand the unique needs of the Ethiopian property market."
                />
                <ValueCard 
                    icon={<Heart className="text-[#ff385c]" size={32} />} 
                    title="PASSIONATE TEAM" 
                    description="We don't just list spaces; we list stories, homes, and futures."
                />
            </div>

            <ContactSection />
        </div>
    )
}

function ValueCard({ icon, title, description }: any) {
    return (
        <div className="bg-neutral-50 p-12 rounded-[50px] border border-neutral-100 space-y-6 hover:bg-neutral-100/50 transition-all hover:scale-105">
            <div className="w-16 h-16 bg-white rounded-3xl shadow-lg flex items-center justify-center border border-neutral-100">
                {icon}
            </div>
            <h3 className="text-2xl font-black text-neutral-900 tracking-tight">{title}</h3>
            <p className="text-neutral-500 font-medium leading-relaxed">{description}</p>
        </div>
    )
}
