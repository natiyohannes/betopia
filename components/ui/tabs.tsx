"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsContextProps {
    value: string
    onValueChange: (value: string) => void
}

const TabsContext = React.createContext<TabsContextProps | undefined>(undefined)

export function Tabs({ defaultValue, value, onValueChange, children, className }: any) {
    const [currentValue, setCurrentValue] = React.useState(value || defaultValue)

    const handleValueChange = (val: string) => {
        if (!value) setCurrentValue(val)
        if (onValueChange) onValueChange(val)
    }

    React.useEffect(() => {
        if (value) setCurrentValue(value)
    }, [value])

    return (
        <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
            <div className={cn("w-full", className)}>{children}</div>
        </TabsContext.Provider>
    )
}

export function TabsList({ children, className }: any) {
    return (
        <div className={cn("inline-flex items-center justify-center rounded-lg bg-gray-100 p-1 text-gray-500", className)}>
            {children}
        </div>
    )
}

export function TabsTrigger({ value, children, className }: any) {
    const context = React.useContext(TabsContext)
    const isActive = context?.value === value

    return (
        <button
            type="button"
            onClick={() => context?.onValueChange(value)}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                isActive ? "bg-white text-black shadow-sm" : "hover:text-gray-900",
                className
            )}
        >
            {children}
        </button>
    )
}

export function TabsContent({ value, children, className }: any) {
    const context = React.useContext(TabsContext)
    if (context?.value !== value) return null

    return <div className={cn("mt-4", className)}>{children}</div>
}
