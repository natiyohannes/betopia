import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { NotificationProvider } from "@/components/notification-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Betopia - Find your next home",
    description: "Rent or Buy properties in Ethiopia",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className} suppressHydrationWarning>
                <NotificationProvider>
                    <SiteHeader />
                    <div className="pb-20 pt-28 min-h-screen">
                        {children}
                    </div>
                    <SiteFooter />
                </NotificationProvider>
            </body>
        </html>
    );
}
