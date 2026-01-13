/**
 * Utility functions for handling noise profile information
 */

/**
 * Extract noise profile information from session_id
 * Session IDs are formatted as: sess_{uuid}_{noise_profile_id}
 * Example: sess_abc123def456_cafe_busy
 * 
 * @param {string} sessionId - The session ID to parse
 * @returns {Object|null} - Object with profile_id or null if no noise detected
 */
export const extractNoiseFromSessionId = (sessionId) => {
    if (!sessionId || typeof sessionId !== 'string') {
        return null;
    }

    // Session ID format: sess_{uuid}_{noise_profile_id}
    // Split by underscore and look for known noise patterns
    const parts = sessionId.split('_');
    
    // Need at least 3 parts: ['sess', 'uuid', 'noise_profile']
    if (parts.length < 3) {
        return null;
    }

    // Known noise profiles (must match backend noise_profiles.json)
    const knownNoiseProfiles = [
        'cafe_busy',
        'cafe_ambient',
        'restaurant_ambient',
        'restaurant_busy',
        'street_crowd',
        'street_traffic',
        'park_traffic',
        'park_construction',
        'office_busy',
        'office_quiet',
        'none'
    ];

    // Check if any known noise profile appears at the end
    // Handle multi-part noise names like 'cafe_busy'
    for (let i = parts.length - 1; i >= 2; i--) {
        const potentialNoise = parts.slice(i).join('_');
        if (knownNoiseProfiles.includes(potentialNoise)) {
            return {
                profile_id: potentialNoise,
                displayName: formatNoiseProfileName(potentialNoise)
            };
        }
    }

    return null;
};

/**
 * Format noise profile ID to display name
 * Example: 'cafe_busy' -> 'Busy Cafe'
 * 
 * @param {string} profileId - The noise profile ID
 * @returns {string} - Formatted display name
 */
export const formatNoiseProfileName = (profileId) => {
    if (!profileId || profileId === 'none') {
        return 'No Noise';
    }

    // Split by underscore, reverse parts, capitalize each word
    const parts = profileId.split('_');
    const formatted = parts.map(part => 
        part.charAt(0).toUpperCase() + part.slice(1)
    );
    
    // Reverse for better readability: 'cafe_busy' -> 'Busy Cafe'
    return formatted.reverse().join(' ');
};

/**
 * Get noise profile badge variant based on profile type
 * 
 * @param {string} profileId - The noise profile ID
 * @returns {string} - Badge variant name
 */
export const getNoiseProfileBadgeVariant = (profileId) => {
    if (!profileId || profileId === 'none') {
        return 'default';
    }

    // Map noise types to badge variants
    if (profileId.includes('cafe') || profileId.includes('restaurant')) {
        return 'warning'; // Orange/yellow for social environments
    }
    if (profileId.includes('street') || profileId.includes('traffic')) {
        return 'danger'; // Red for high noise
    }
    if (profileId.includes('park')) {
        return 'success'; // Green for outdoor
    }
    if (profileId.includes('office')) {
        return 'info'; // Blue for office
    }

    return 'default';
};

/**
 * Check if a session has noise applied
 * 
 * @param {string} sessionId - The session ID to check
 * @returns {boolean} - True if noise is detected
 */
export const hasNoise = (sessionId) => {
    const noiseInfo = extractNoiseFromSessionId(sessionId);
    return noiseInfo !== null && noiseInfo.profile_id !== 'none';
};

/**
 * Get all noise variants from a list of sessions for the same test case
 * 
 * @param {Array} sessions - Array of session objects with session_id field
 * @returns {Array} - Array of unique noise profiles found
 */
export const getNoiseVariants = (sessions) => {
    if (!sessions || !Array.isArray(sessions)) {
        return [];
    }

    const noiseProfiles = new Set();
    
    sessions.forEach(session => {
        const noiseInfo = extractNoiseFromSessionId(session.session_id);
        if (noiseInfo) {
            noiseProfiles.add(noiseInfo.profile_id);
        }
    });

    return Array.from(noiseProfiles).map(profileId => ({
        profile_id: profileId,
        displayName: formatNoiseProfileName(profileId),
        variant: getNoiseProfileBadgeVariant(profileId)
    }));
};
