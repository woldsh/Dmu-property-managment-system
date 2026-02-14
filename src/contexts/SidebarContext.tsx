'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface SidebarContextType {
    isOpen: boolean;
    toggleSidebar: () => void;
    closeSidebar: () => void;
    sidebarWidth: number;
    setSidebarWidth: (width: number) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const DEFAULT_WIDTH = 320;
const MIN_WIDTH = 220;
const MAX_WIDTH = 480;

export { MIN_WIDTH, MAX_WIDTH, DEFAULT_WIDTH };

export function SidebarProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(true);
    const [sidebarWidth, setSidebarWidthState] = useState(DEFAULT_WIDTH);

    const toggleSidebar = () => setIsOpen(prev => !prev);
    const closeSidebar = () => setIsOpen(false);

    const setSidebarWidth = useCallback((width: number) => {
        setSidebarWidthState(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, width)));
    }, []);

    return (
        <SidebarContext.Provider value={{ isOpen, toggleSidebar, closeSidebar, sidebarWidth, setSidebarWidth }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
}
