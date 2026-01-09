import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const EventsContext = createContext(null);

export const useEvents = () => {
    const context = useContext(EventsContext);
    if (!context) {
        throw new Error('useEvents must be used within an EventsProvider');
    }
    return context;
};

export const EventsProvider = ({ children }) => {
    const [queueStats, setQueueStats] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    // Event listeners
    const [listeners, setListeners] = useState({});

    useEffect(() => {
        const eventsUrl = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8001/api/v1"}/events/stream`;
        let eventSource = null;
        let retryTimeout = null;

        const connect = () => {
            eventSource = new EventSource(eventsUrl);

            eventSource.onopen = () => {
                console.log('📡 SSE Connected');
                setIsConnected(true);
            };

            eventSource.onmessage = (event) => {
                try {
                    const parsed = JSON.parse(event.data);

                    // Handle Internal Keep-alive/Comments
                    if (parsed.comment) return;

                    handleEvent(parsed);
                } catch (err) {
                    console.warn('Failed to parse SSE message:', event.data);
                }
            };

            eventSource.onerror = (err) => {
                console.error('SSE Error:', err);
                setIsConnected(false);
                eventSource.close();

                // Retry connection
                retryTimeout = setTimeout(connect, 3000);
            };
        };

        const handleEvent = (message) => {
            const { event, data } = message;
            const parsedData = typeof data === 'string' ? JSON.parse(data) : data;

            // Global handlers
            if (event === 'queue_update') {
                setQueueStats(parsedData);
            }

            // Dispatch to registered listeners
            if (listeners[event]) {
                listeners[event].forEach(callback => callback(parsedData));
            }

            // Dispatch generic for debug
            console.debug(`Event received: ${event}`, parsedData);
        };

        connect();

        return () => {
            if (eventSource) eventSource.close();
            if (retryTimeout) clearTimeout(retryTimeout);
        };
    }, [listeners]); // Re-bind if listeners change (optimization: use ref for listeners if frequent updates)

    const subscribe = (event, callback) => {
        setListeners(prev => ({
            ...prev,
            [event]: [...(prev[event] || []), callback]
        }));

        return () => {
            setListeners(prev => ({
                ...prev,
                [event]: (prev[event] || []).filter(cb => cb !== callback)
            }));
        };
    };

    return (
        <EventsContext.Provider value={{
            isConnected,
            queueStats,
            subscribe
        }}>
            {children}
        </EventsContext.Provider>
    );
};
