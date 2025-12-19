'use client';

import Link from 'next/link';

interface StoreSidebarProps {
    storeType: 'fixed' | 'consumable';
}

export default function StoreSidebar({ storeType }: StoreSidebarProps) {
    const isFixed = storeType === 'fixed';
    const basePath = isFixed
        ? '/procurement-management/store/fixed-material'
        : '/procurement-management/store/consumable-material';

    const menuItems = [
        { label: 'View requests from clerk', href: `${basePath}/requests` },
        { label: 'Employee data', href: `${basePath}/employee-data` },
        { label: `Add items / materials (${isFixed ? 'fixed assets only' : 'consumable items only'})`, href: `${basePath}/add-items` },
        { label: 'Materials list', href: `${basePath}/materials-list` },
        { label: 'Report data', href: `${basePath}/report-data` },
        { label: 'Messages', href: `${basePath}/messages` },
        { label: 'Request material to Managing Director', href: `${basePath}/request-md` },
        { label: 'Receive goods from exchange', href: `${basePath}/receive-goods` },
        { label: 'Return goods from receiver', href: `${basePath}/return-goods` },
        { label: 'Request journey', href: `${basePath}/request-journey` },
        { label: 'Clerk report', href: `${basePath}/clerk-report` },
        { label: 'Exchange report', href: `${basePath}/exchange-report` },
        { label: 'Settings', href: `${basePath}/settings`, subItems: ['Profile', 'Change Password', 'Properties'] },
    ];

    return (
        <div className="w-80 bg-gray-900 text-white min-h-screen flex flex-col shadow-xl">
            <div className="p-6 border-b border-gray-800">
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    Store Keeper
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                    {isFixed ? 'Fixed Assets' : 'Consumable Items'}
                </p>
            </div>

            <nav className="flex-1 overflow-y-auto py-6">
                <ul className="space-y-1">
                    {menuItems.map((item, index) => (
                        <li key={index}>
                            <Link
                                href={item.href}
                                className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors cursor-pointer group"
                            >
                                <div className="flex-1">
                                    {item.label}
                                    {item.subItems && (
                                        <div className="mt-2 ml-4 space-y-2 hidden group-hover:block">
                                            {item.subItems.map(sub => (
                                                <div key={sub} className="text-xs text-gray-500 hover:text-blue-400">{sub}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="p-4 border-t border-gray-800 text-xs text-gray-500 text-center">
                v1.0.0
            </div>
        </div>
    );
}
