export function SiteFooter() {
    return (
        <footer className="bg-black border-t border-white/10 mt-12 text-sm text-neutral-400">
            <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 py-20">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="space-y-6">
                        <h5 className="font-black text-white uppercase tracking-widest text-xs">Support</h5>
                        <ul className="space-y-4 font-medium">
                            <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Safety information</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Cancellation options</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Our COVID-19 Response</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Report neighborhood concern</a></li>
                        </ul>
                    </div>
                    <div className="space-y-6">
                        <h5 className="font-black text-white uppercase tracking-widest text-xs">Hosting</h5>
                        <ul className="space-y-4 font-medium">
                            <li><a href="#" className="hover:text-white transition-colors">List your property</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">AirCover for Hosts</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Hosting resources</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Community forum</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Hosting responsibly</a></li>
                        </ul>
                    </div>
                    <div className="space-y-6">
                        <h5 className="font-black text-white uppercase tracking-widest text-xs">Betopia</h5>
                        <ul className="space-y-4 font-medium">
                            <li><a href="#" className="hover:text-white transition-colors">Newsroom</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Learn about new features</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Letter from our founders</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Investors</a></li>
                        </ul>
                    </div>
                    <div className="space-y-6">
                        <h5 className="font-black text-white uppercase tracking-widest text-xs">Regions</h5>
                        <ul className="space-y-4 font-medium">
                            <li><a href="#" className="hover:text-white transition-colors">Addis Ababa</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Hawassa</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Bahir Dar</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Adama</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">More cities...</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 mt-16 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-8 font-medium">
                        <span className="text-neutral-500">© 2024 Betopia, Inc.</span>
                        <div className="flex gap-4">
                            <a href="#" className="hover:text-white transition-colors">Privacy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms</a>
                            <a href="#" className="hover:text-white transition-colors">Sitemap</a>
                        </div>
                    </div>
                    <div className="flex gap-8 font-bold text-white">
                        <span className="cursor-pointer hover:text-[#ff385c] transition-colors flex items-center gap-2">
                             English (US)
                        </span>
                        <span className="cursor-pointer hover:text-[#ff385c] transition-colors">ETB</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
