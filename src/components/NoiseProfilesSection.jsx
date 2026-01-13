import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import Badge from './Badge';
import AudioPlayer from './AudioPlayer';

/**
 * Component to display background noise profiles with consistent styling
 * 
 * @param {Array} noises - Array of noise configuration objects with profile_id, snr_db, enabled
 * @param {boolean} compact - Whether to show compact version (badges only)
 * @param {Object} noiseProfiles - Optional map of noise profile metadata (from API)
 */
const NoiseProfilesSection = ({ noises = [], compact = false, noiseProfiles = null }) => {
    if (!noises || noises.length === 0) {
        return null;
    }

    // Helper to get profile name from metadata
    const getProfileName = (profileId) => {
        if (noiseProfiles && noiseProfiles[profileId]) {
            return noiseProfiles[profileId].name;
        }
        // Fallback: format profile_id (e.g., "cafe_busy" -> "Cafe Busy")
        return profileId
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // Helper to get audio URL from metadata
    const getAudioUrl = (profileId) => {
        if (noiseProfiles && noiseProfiles[profileId] && noiseProfiles[profileId].audio_url) {
            return noiseProfiles[profileId].audio_url;
        }
        return null;
    };

    // Compact mode: just badges
    if (compact) {
        return (
            <div className="flex flex-wrap gap-2">
                {noises.map((noise, idx) => {
                    const isEnabled = noise.enabled !== false;
                    return (
                        <Badge 
                            key={idx} 
                            variant={isEnabled ? "info" : "secondary"}
                            size="sm"
                        >
                            {isEnabled ? (
                                <Volume2 className="w-3 h-3 inline mr-1" />
                            ) : (
                                <VolumeX className="w-3 h-3 inline mr-1" />
                            )}
                            {getProfileName(noise.profile_id)}
                            {noise.snr_db && ` (${noise.snr_db}dB)`}
                        </Badge>
                    );
                })}
            </div>
        );
    }

    // Full mode: detailed cards
    return (
        <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
                <Volume2 className="w-5 h-5 text-teal-400" />
                <h4 className="text-lg font-semibold text-white">Background Noise Profiles</h4>
                <span className="text-xs text-gray-400">
                    ({noises.length} variant{noises.length !== 1 ? 's' : ''})
                </span>
            </div>
            <div className="space-y-3">
                {noises.map((noise, idx) => {
                    const isEnabled = noise.enabled !== false;
                    const profileName = getProfileName(noise.profile_id);
                    const audioUrl = getAudioUrl(noise.profile_id);
                    
                    return (
                        <div 
                            key={idx} 
                            className={`p-3 rounded transition-colors space-y-3 ${
                                isEnabled 
                                    ? 'bg-gray-900 border border-gray-700' 
                                    : 'bg-gray-900/50 border border-gray-800'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {isEnabled ? (
                                        <Volume2 className="w-4 h-4 text-teal-400" />
                                    ) : (
                                        <VolumeX className="w-4 h-4 text-gray-600" />
                                    )}
                                    <div>
                                        <span className={`font-medium ${isEnabled ? 'text-white' : 'text-gray-500'}`}>
                                            {profileName}
                                        </span>
                                        <div className="text-xs text-gray-500 mt-0.5">
                                            {noise.profile_id}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {noise.snr_db !== undefined && noise.snr_db !== null && (
                                        <div className="text-right">
                                            <div className="text-xs text-gray-400">SNR</div>
                                            <div className="text-sm font-semibold text-teal-400">
                                                {noise.snr_db} dB
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <span 
                                            className={`text-xs px-2 py-1 rounded ${
                                                isEnabled 
                                                    ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' 
                                                    : 'bg-gray-800 text-gray-500 border border-gray-700'
                                            }`}
                                        >
                                            {isEnabled ? '✓ Enabled' : '✗ Disabled'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Audio Player */}
                            {audioUrl && isEnabled && (
                                <div className="pl-7">
                                    <AudioPlayer 
                                        audioUrl={audioUrl} 
                                        label="Preview sample"
                                        compact={true}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <div className="mt-4 p-3 bg-gray-900 rounded border border-gray-700">
                <p className="text-xs text-gray-400">
                    <span className="font-semibold text-gray-300">Note:</span> Each noise profile creates a separate test variant. 
                    This persona will be tested under {noises.filter(n => n.enabled !== false).length} different noise conditions.
                </p>
            </div>
        </div>
    );
};

export default NoiseProfilesSection;
