import re

with open('app/admin/page.tsx', 'r') as f:
    content = f.read()

# Remove min-w-[800px]
content = content.replace('<div className="min-w-[800px] md:min-w-0">', '<div>')

# Hide table header on mobile
content = content.replace(
    '<div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600">',
    '<div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600">'
)

# Fix user rows
content = content.replace(
    'className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors relative ${idx !== filteredUsers.length - 1 ? \'border-b border-white/5\' : \'\'}`}',
    'className={`flex flex-col md:grid md:grid-cols-12 gap-4 px-6 py-4 items-start md:items-center hover:bg-white/[0.02] transition-colors relative ${idx !== filteredUsers.length - 1 ? \'border-b border-white/5\' : \'\'}`}'
)

content = content.replace(
    '<div className="col-span-4 flex items-center gap-3 min-w-0">',
    '<div className="w-full md:w-auto md:col-span-4 flex items-center justify-between md:justify-start gap-3 min-w-0">'
)

content = content.replace(
    '<div className="col-span-2 hidden md:block text-xs text-neutral-500 font-medium">',
    '<div className="w-full md:w-auto flex justify-between md:block md:col-span-2 text-xs text-neutral-500 font-medium"><span className="md:hidden font-black uppercase tracking-widest text-[10px] text-neutral-600">Joined</span>'
)
content = content.replace(
    'numeric\' })}\n                                            </div>',
    'numeric\' })}\n                                            </div>'
)

content = content.replace(
    '<div className="col-span-2 hidden lg:block text-xs text-neutral-500 font-medium">',
    '<div className="w-full md:w-auto hidden lg:block md:col-span-2 text-xs text-neutral-500 font-medium">'
)

content = content.replace(
    '<div className="col-span-1 text-center text-white font-black">{user.listing_count}</div>',
    '<div className="w-full md:w-auto flex justify-between md:justify-center md:col-span-1 text-white font-black text-sm"><span className="md:hidden text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600">Listings</span><span>{user.listing_count}</span></div>'
)

content = content.replace(
    '<div className="col-span-2 flex justify-center">',
    '<div className="w-full md:w-auto flex justify-between md:justify-center md:col-span-2 items-center"><span className="md:hidden text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600">Role</span>'
)

content = content.replace(
    '<div className="col-span-1 flex justify-end items-center gap-2 relative">',
    '<div className="w-full md:w-auto flex justify-end md:justify-end md:col-span-1 items-center gap-2 relative mt-2 pt-4 border-t border-white/5 md:mt-0 md:pt-0 md:border-0">'
)

with open('app/admin/page.tsx', 'w') as f:
    f.write(content)

