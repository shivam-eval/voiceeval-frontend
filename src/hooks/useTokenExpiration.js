import { useEffect, useState } from 'react';
import { isTokenValid, getTokenTimeRemaining, clearAuthData } from '../utils/auth';

/**
 * Hook to monitor token expiration and handle automatic logout
 * @param {Object} options - Configuration options
 * @param {boolean} options.enabled - Whether to enable monitoring (default: true)
 * @param {Function} options.onExpire - Callback function to call when token expires
 * @returns {Object} Token status information
 */
export const useTokenExpiration = (options = {}) => {
    const {
        enabled = true,
        onExpire,
    } = options;

    const [timeRemaining, setTimeRemaining] = useState(getTokenTimeRemaining());

    useEffect(() => {
        if (!enabled) {
            return;
        }

        // Check token validity immediately
        if (!isTokenValid()) {
            clearAuthData();
            if (onExpire) {
                onExpire();
            }
            return;
        }

        // Set up interval to check token expiration every minute
        const interval = setInterval(() => {
            const remaining = getTokenTimeRemaining();
            setTimeRemaining(remaining);

            // Token has expired
            if (remaining <= 0) {
                clearAuthData();
                if (onExpire) {
                    onExpire();
                }
            }
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [enabled, onExpire]);

    return {
        timeRemaining,
        isValid: timeRemaining > 0,
        expiresAt: localStorage.getItem('tokenExpiration')
            ? new Date(parseInt(localStorage.getItem('tokenExpiration'), 10))
            : null,
    };
};
