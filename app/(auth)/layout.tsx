export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-zinc-900 section-padding">
            <div className="w-full max-w-md space-y-8 px-4 sm:px-0">
                {children}
            </div>
        </div>
    )
}
