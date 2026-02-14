'use client';

import { useCallback, useRef } from 'react';
import { useSidebar, MIN_WIDTH, MAX_WIDTH } from '../contexts/SidebarContext';

export default function SidebarResizeHandle() {
    const { setSidebarWidth, sidebarWidth } = useSidebar();
    const isDragging = useRef(false);
    const startX = useRef(0);
    const startWidth = useRef(0);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        isDragging.current = true;
        startX.current = e.clientX;
        startWidth.current = sidebarWidth;

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging.current) return;
            const delta = e.clientX - startX.current;
            const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth.current + delta));
            setSidebarWidth(newWidth);
        };

        const handleMouseUp = () => {
            isDragging.current = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }, [setSidebarWidth, sidebarWidth]);

    return (
        <div
            onMouseDown={handleMouseDown}
            className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize z-50 group hidden lg:block"
            title="Drag to resize sidebar"
        >
            {/* Visible hover indicator */}
            <div className="absolute inset-y-0 right-0 w-[3px] bg-transparent group-hover:bg-blue-400/40 transition-all duration-200 rounded-full" />
            {/* Wider hit area */}
            <div className="absolute inset-y-0 -right-1 w-3" />
        </div>
    );
}
