import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useRef,
    useCallback
} from 'react';
import { EventSourcePolyfill } from 'event-source-polyfill';

import { API_BASE_URL } from '../config/constants';

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
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'}/events/stream`;

        let eventSource;
        let retryTimeout;
        let retryCount = 0;
        const maxRetryDelay = 30000; // 30 seconds

        const connect = () => {
            const token = localStorage.getItem("authToken");
            const rawTenantId = localStorage.getItem("tenantId");
            const tenantId = (rawTenantId === 'undefined' || rawTenantId === 'null') ? null : rawTenantId;

            if (!token) {
                console.log("⏭️ SSE: No auth token found, skipping connection");
                return;
            }

            // Use EventSourcePolyfill to send headers (native EventSource doesn't support headers)
            const eventsUrl = `${API_BASE_URL}/events/stream`;
            const connectionId = `sse_${Date.now()}`;

            console.log(`🔌 [${connectionId}] Connecting to SSE`, eventsUrl);

            // Build headers object
            const headers = {
                'Authorization': `Bearer ${token}`
            };

            if (tenantId) {
                headers['X-Tenant-ID'] = tenantId;
            }

            const startTime = Date.now();
            eventSource = new EventSourcePolyfill(eventsUrl, {
                headers: headers,
                heartbeatTimeout: 120000, // 2 minutes
                withCredentials: false
            });

            eventSource.onopen = () => {
                console.log(`📡 [${connectionId}] SSE connected`);
                setIsConnected(true);
                retryCount = 0; // Reset retry count on successful connection
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
                            console.error(`❌ Error in ${eventName} listener #${idx + 1}`, err);
                        }
                    });
                } catch (err) {
                    console.error('❌ Failed to parse SSE payload:', e.data, err);
                }
            };

            eventSource.addEventListener('evaluation_update', dispatch('evaluation_update'));
            eventSource.addEventListener('simulation_update', dispatch('simulation_update'));
            eventSource.addEventListener('queue_update', dispatch('queue_update'));

            eventSource.onerror = (err) => {
                const duration = Date.now() - startTime;
                console.error(`❌ [${connectionId}] SSE error (after ${duration}ms)`, err);
                setIsConnected(false);
                eventSource.close();

                // If it fails immediately (less than 2 seconds) and we've tried many times,
                // it's likely a persistent auth error. Stop retrying to avoid flooding.
                if (duration < 2000 && retryCount > 5) {
                    console.error("🛑 SSE: Persistent failure detected. Stopping retries.");
                    return;
                }

                // Implement exponential backoff for retries
                const delay = Math.min(1000 * Math.pow(2, retryCount), maxRetryDelay);
                console.log(`🔄 SSE: Retrying in ${delay}ms (attempt ${retryCount + 1})`);

                retryTimeout = setTimeout(() => {
                    retryCount++;
                    connect();
                }, delay);
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
