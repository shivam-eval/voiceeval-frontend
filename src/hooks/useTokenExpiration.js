import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { isTokenValid, getTokenTimeRemaining, clearAuthData } from '../utils/auth';

/**
 * Hook to monitor token expiration and handle automatic logout
 * @param {Object} options - Configuration options
 * @param {boolean} options.enabled - Whether to enable monitoring (default: true)
 * @param {boolean} options.showWarning - Whether to show a warning before expiration (default: true)
 * @param {number} options.warningTime - Time in milliseconds before expiration to show warning (default: 5 minutes)
 * @returns {Object} Token status information
 */
export const useTokenExpiration = (options = {}) => {
    const {
        enabled = true,
        showWarning = true,
        warningTime = 5 * 60 * 1000, // 5 minutes default
    } = options;

    const [timeRemaining, setTimeRemaining] = useState(getTokenTimeRemaining());
    const [hasShownWarning, setHasShownWarning] = useState(false);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        // Check token validity immediately
        if (!isTokenValid()) {
            clearAuthData();
            window.location.href = '/';
            return;
        }

        // Set up interval to check token expiration every minute
        const interval = setInterval(() => {
            const remaining = getTokenTimeRemaining();
            setTimeRemaining(remaining);

            // Show warning if enabled and approaching expiration
            if (showWarning && !hasShownWarning && remaining > 0 && remaining <= warningTime) {
                const minutesRemaining = Math.floor(remaining / (60 * 1000));
                toast.warning(
                    `Your session will expire in ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}. Please save your work.`,
                    { autoClose: 10000 }
                );
                setHasShownWarning(true);
            }

            // Token has expired
            if (remaining <= 0) {
                clearAuthData();
                toast.error('Your session has expired. Please login again.');
                window.location.href = '/';
            }
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [enabled, showWarning, warningTime, hasShownWarning]);

    return {
        timeRemaining,
        isValid: timeRemaining > 0,
        expiresAt: localStorage.getItem('tokenExpiration')
            ? new Date(parseInt(localStorage.getItem('tokenExpiration'), 10))
            : null,
    };
};
