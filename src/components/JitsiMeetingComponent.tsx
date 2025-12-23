'use client';

import React, { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { useAuth } from '../contexts/AuthContext';
import { FaVideo } from 'react-icons/fa';

interface JitsiMeetingComponentProps {
    roomName?: string;
}

const JitsiMeetingComponent: React.FC<JitsiMeetingComponentProps> = ({
    roomName = 'PropertyManagementExecutiveMeeting'
}) => {
    const jitsiContainerRef = useRef<HTMLDivElement>(null);
    const [api, setApi] = useState<any>(null);
    const { user, userRole } = useAuth();
    const domain = 'meet.ffmuc.net';
    const computedDisplayName = user?.displayName || user?.email?.split('@')[0] || 'Executive User';

    const normalizedRole = userRole?.toLowerCase() || '';
    const isChief = normalizedRole === 'chief' || normalizedRole === 'managing_director' || normalizedRole === 'managing_director_leader';
    const connectionStatus = isChief ? 'Starting Meeting...' : 'Joining Meeting...';

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            if (api) {
                api.dispose();
            }
        };
    }, [api]);

    const loadJitsiScript = () => {
        if (!jitsiContainerRef.current || typeof window === 'undefined' || !(window as any).JitsiMeetExternalAPI) return;

        if (api) api.dispose();

        const options = {
            roomName: roomName,
            width: '100%',
            height: '100%',
            parentNode: jitsiContainerRef.current,
            configOverwrite: {
                startWithAudioMuted: true,
                startWithVideoMuted: true,
                prejoinPageEnabled: false,
            },
            interfaceConfigOverwrite: {
                TOOLBAR_BUTTONS: [
                    'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                    'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                    'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                    'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                    'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
                    'security'
                ],
            },
            userInfo: {
                displayName: `${computedDisplayName} (${userRole || 'Executive'})`,
                email: user?.email || '',
            }
        };

        const newApi = new (window as any).JitsiMeetExternalAPI(domain, options);
        setApi(newApi);
    };

    return (
        <div className="w-full h-[600px] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl relative border border-slate-800">
            <Script
                src="https://meet.ffmuc.net/external_api.js"
                onLoad={loadJitsiScript}
            />
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent z-10 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white pointer-events-auto">
                        <FaVideo />
                    </div>
                    <div>
                        <h3 className="text-white font-bold tracking-tight">Executive Live Video Conference</h3>
                        <p className="text-slate-300 text-xs font-medium uppercase tracking-widest">
                            Room: {roomName}
                        </p>
                    </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest pointer-events-auto ${isChief ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>
                    {connectionStatus}
                </div>
            </div>

            <div ref={jitsiContainerRef} className="w-full h-full" />
        </div>
    );
};

export default JitsiMeetingComponent;
