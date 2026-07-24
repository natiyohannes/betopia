"use client"

import { useState } from "react"
import { Share, Check } from "lucide-react"

export function ShareButton() {
    const [copied, setCopied] = useState(false)

    const handleShare = async () => {
        try {
            if (typeof window !== "undefined") {
                await navigator.clipboard.writeText(window.location.href)
                setCopied(true)
                setTimeout(() => setCopied(false), 3000)
            }
        } catch (err) {
            console.error("Failed to copy link:", err)
        }
    }

    return (
        <button
            onClick={handleShare}
            className="flex items-center gap-2 hover:bg-white/10 px-4 py-2 rounded-xl cursor-pointer transition-all font-bold text-white border border-white/10 bg-white/5 active:scale-95"
        >
            {copied ? (
                <>
                    <Check size={16} className="text-green-400" />
                    <span className="text-green-400">Link Copied!</span>
                </>
            ) : (
                <>
                    <Share size={16} />
                    <span>Share</span>
                </>
            )}
        </button>
    )
}
