import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useRef,
    useCallback
} from 'react';

const EventsContext = createContext(null);

export const useEvents = () => {
    const ctx = useContext(EventsContext);
    if (!ctx) {
        throw new Error('useEvents must be used within an EventsProvider');
    }
    return ctx;
};

export const EventsProvider = ({ children }) => {
    const [queueStats, setQueueStats] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    // eventName -> [callbacks]
    const listenersRef = useRef({});

    useEffect(() => {
        const eventsUrl =
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api/v1'}/events/stream`;

        let eventSource;
        let retryTimeout;

        const connect = () => {
            const connectionId = `sse_${Date.now()}`;
            console.log(`🔌 [${connectionId}] Connecting to SSE`, eventsUrl);

            eventSource = new EventSource(eventsUrl);

            eventSource.onopen = () => {
                console.log(`📡 [${connectionId}] SSE connected`);
                setIsConnected(true);
            };

            const dispatch = (eventName) => (e) => {
                try {
                    const payload = JSON.parse(e.data);

                    console.log(`📨 SSE [${eventName}]`, payload);
                    const listeners = listenersRef.current[eventName] || [];

                    if (eventName === 'queue_update') {
                        setQueueStats(payload);
                    }

                    listeners.forEach((cb, idx) => {
                        try {
                            cb(payload);
                        } catch (err) {
                            console.error(
                                `❌ Error in ${eventName} listener #${idx + 1}`,
                                err
                            );
                        }
                    });
                } catch (err) {
                    console.error('❌ Failed to parse SSE payload:', e.data, err);
                }
            };

            // ✅ Proper SSE event routing
            eventSource.addEventListener(
                'evaluation_update',
                dispatch('evaluation_update')
            );
            eventSource.addEventListener(
                'simulation_update',
                dispatch('simulation_update')
            );
            eventSource.addEventListener(
                'queue_update',
                dispatch('queue_update')
            );

            eventSource.onerror = (err) => {
                console.error(`❌ [${connectionId}] SSE error`, err);
                setIsConnected(false);
                eventSource.close();

                retryTimeout = setTimeout(connect, 3000);
            };
        };

        connect();

        return () => {
            if (eventSource) eventSource.close();
            if (retryTimeout) clearTimeout(retryTimeout);
        };
    }, []);

    const subscribe = useCallback((eventName, callback) => {
        listenersRef.current[eventName] = [
            ...(listenersRef.current[eventName] || []),
            callback
        ];

        console.log(
            `➕ Subscribed to '${eventName}' (${listenersRef.current[eventName].length})`
        );

        return () => {
            listenersRef.current[eventName] =
                (listenersRef.current[eventName] || []).filter(
                    (cb) => cb !== callback
                );

            console.log(
                `➖ Unsubscribed from '${eventName}' (${listenersRef.current[eventName].length})`
            );
        };
    }, []);

    return (
        <EventsContext.Provider
            value={{
                isConnected,
                queueStats,
                subscribe
            }}
        >
            {children}
        </EventsContext.Provider>
    );
};
