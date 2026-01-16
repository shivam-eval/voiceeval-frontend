/**
 * Check if the authentication token is still valid
 * @returns {boolean} True if token exists and hasn't expired
 */
export const isTokenValid = () => {
    const token = localStorage.getItem("authToken");
    const expirationTime = localStorage.getItem("tokenExpiration");

    if (!token || !expirationTime) {
        return false;
    }

    const now = Date.now();
    const expiration = parseInt(expirationTime, 10);

    // Check if token has expired
    if (now >= expiration) {
        return false;
    }

    return true;
};

/**
 * Clear all authentication data from localStorage
 */
export const clearAuthData = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("tokenExpiration");
    localStorage.removeItem("tenantId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
};

/**
 * Get time remaining until token expires (in milliseconds)
 * @returns {number} Time remaining in milliseconds, or 0 if expired/invalid
 */
export const getTokenTimeRemaining = () => {
    const expirationTime = localStorage.getItem("tokenExpiration");

    if (!expirationTime) {
        return 0;
    }

    const now = Date.now();
    const expiration = parseInt(expirationTime, 10);
    const remaining = expiration - now;

    return remaining > 0 ? remaining : 0;
};
