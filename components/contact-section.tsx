"use client"

import { Phone, Mail } from 'lucide-react'

const TikTokIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className={className}
    >
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .8.11V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.51A6.3 6.3 0 0 0 13.84 15V9.4a8.21 8.21 0 0 0 5.75 2.21V8.16a4.83 4.83 0 0 1 0-1.47z"/>
    </svg>
);

export function ContactSection() {
    return (
        <div className="bg-neutral-900 rounded-[80px] p-20 flex flex-col items-center text-center gap-12 overflow-hidden relative shadow-2xl mx-4 md:mx-20 my-20">
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#ff385c]/10 rounded-full blur-[100px]" />
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />
            
            <h2 className="text-6xl md:text-8xl font-black text-white leading-none tracking-tighter">
                READY TO FIND <br />
                YOUR NEXT STORY?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-5xl mt-12 bg-white/5 backdrop-blur-3xl p-12 rounded-[50px] border border-white/10 z-10">
                <button 
                    onClick={() => {
                        navigator.clipboard.writeText("+251930614550");
                        alert("Phone number copied to clipboard!");
                    }}
                    className="transition-transform hover:scale-105"
                >
                    <ContactItem icon={<Phone size={24} className="text-[#ff385c]" />} title="CALL US" value="+251930614550" />
                </button>

                <button 
                    onClick={() => {
                        navigator.clipboard.writeText("betopia.et@gmail.com");
                        alert("Email address copied to clipboard!");
                    }}
                    className="transition-transform hover:scale-105"
                >
                    <ContactItem icon={<Mail size={24} className="text-[#ff385c]" />} title="EMAIL US" value="betopia.et@gmail.com" />
                </button>

                <a 
                    href="https://www.tiktok.com/@betopia.et?is_from_webapp=1&sender_device=pc" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="transition-transform hover:scale-105"
                >
                    <ContactItem icon={<TikTokIcon size={24} className="text-[#ff385c]" />} title="TIKTOK" value="Betopia.et" />
                </a>
            </div>
        </div>
    );
}

function ContactItem({ icon, title, value }: any) {
    return (
        <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-white/5 rounded-2xl">
                {icon}
            </div>
            <h4 className="text-xs font-black text-neutral-500 tracking-[0.2em]">{title}</h4>
            <p className="text-white text-lg font-bold">{value}</p>
        </div>
    )
}
