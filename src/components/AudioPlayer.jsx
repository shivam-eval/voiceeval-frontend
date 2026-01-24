import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Loader } from 'lucide-react';

// Get GCP Storage base URL from environment or default
const GCP_STORAGE_BASE_URL = import.meta.env.VITE_GCP_STORAGE_BASE_URL || 'https://storage.googleapis.com/voiceeval-public';

/**
 * Simple audio player component for audio playback
 * 
 * @param {string} audioUrl - URL to the audio file (can be relative or absolute)
 * @param {string} label - Label to display (optional)
 * @param {boolean} compact - Whether to show compact version
 */
const AudioPlayer = ({ audioUrl, label, compact = false }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const audioRef = useRef(null);

    const [audioSrc, setAudioSrc] = useState(null);

    // Construct full URL if audioUrl is relative
    const fullAudioUrl = audioUrl?.startsWith('http')
        ? audioUrl
        : `${GCP_STORAGE_BASE_URL}/${audioUrl?.startsWith('/') ? audioUrl.slice(1) : audioUrl}`;

    useEffect(() => {
        // Reset state when URL changes
        setAudioSrc(null);
        setIsLoading(true);
        setDuration(0);
        setCurrentTime(0);

        if (!fullAudioUrl) return;

        let active = true;
        let objectUrl = null;

        const fetchAudio = async () => {
            try {
                console.log('AudioPlayer: Original URL:', audioUrl);
                console.log('AudioPlayer: Constructed full URL:', fullAudioUrl);

                // If it's an external URL (GCP Storage), just use it directly without auth
                if (fullAudioUrl.startsWith('http')) {
                    console.log('AudioPlayer: Using external URL directly (GCP Storage)');
                    if (active) {
                        setAudioSrc(fullAudioUrl);
                        setIsLoading(false);
                    }
                    return;
                }

                // Internal API request with auth
                console.log('AudioPlayer: Fetching with auth headers');
                const token = localStorage.getItem("authToken");
                const headers = {};
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const response = await fetch(fullAudioUrl, { headers });

                if (!response.ok) {
                    throw new Error(`Failed to load audio: ${response.status} ${response.statusText}`);
                }

                const blob = await response.blob();
                console.log('AudioPlayer: Audio blob loaded, size:', blob.size, 'type:', blob.type);

                if (active) {
                    objectUrl = URL.createObjectURL(blob);
                    console.log('AudioPlayer: Created blob URL:', objectUrl);
                    setAudioSrc(objectUrl);
                    setIsLoading(false);
                }
            } catch (err) {
                console.error('AudioPlayer: Error fetching audio:', err);
                console.error('AudioPlayer: Failed URL:', fullAudioUrl);
                if (active) {
                    setIsLoading(false);
                    // Fallback to direct URL in case some auth isn't needed or strictly fails
                    // But usually, we just show error state or don't play.
                    // For now, let's just leave it null or maybe try direct:
                    // setAudioSrc(fullAudioUrl); 
                }
            }
        };

        fetchAudio();

        return () => {
            active = false;
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [fullAudioUrl]);

    // Audio Event Handlers
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onPlay = () => {
            setIsPlaying(true);
            setIsLoading(false);
        };

        const onPause = () => {
            setIsPlaying(false);
            setIsLoading(false);
        };

        const onWaiting = () => {
            // Only show loading if we are trying to play
            if (audio.paused === false && !audio.ended) {
                setIsLoading(true);
            }
        };

        const onCanPlay = () => {
            // If we have a source, we are ready
            if (audioSrc) setIsLoading(false);
        };

        const onEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
            setIsLoading(false);
        };

        const onTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
        };

        const onLoadedMetadata = () => {
            setDuration(audio.duration);
            setIsLoading(false);
        };

        const onError = (e) => {
            console.error("Audio error:", e);
            setIsLoading(false);
            setIsPlaying(false);
        };

        audio.addEventListener('play', onPlay);
        audio.addEventListener('playing', onPlay);
        audio.addEventListener('pause', onPause);
        audio.addEventListener('waiting', onWaiting);
        audio.addEventListener('canplay', onCanPlay);
        audio.addEventListener('ended', onEnded);
        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('loadedmetadata', onLoadedMetadata);
        audio.addEventListener('error', onError);

        return () => {
            audio.removeEventListener('play', onPlay);
            audio.removeEventListener('playing', onPlay);
            audio.removeEventListener('pause', onPause);
            audio.removeEventListener('waiting', onWaiting);
            audio.removeEventListener('canplay', onCanPlay);
            audio.removeEventListener('ended', onEnded);
            audio.removeEventListener('timeupdate', onTimeUpdate);
            audio.removeEventListener('loadedmetadata', onLoadedMetadata);
            audio.removeEventListener('error', onError);
        };
    }, [audioSrc]);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (audio.paused) {
            setIsLoading(true);
            audio.play().catch(err => {
                console.error('Error playing audio:', err);
                setIsLoading(false);
                setIsPlaying(false);
            });
        } else {
            audio.pause();
        }
    };

    const formatTime = (seconds) => {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    if (compact) {
        return (
            <div className="inline-flex items-center gap-2">
                <audio ref={audioRef} src={audioSrc} preload="metadata" />
                <button
                    onClick={togglePlay}
                    disabled={isLoading}
                    className="w-8 h-8 rounded-full bg-teal-500 hover:bg-teal-600 disabled:bg-gray-600 flex items-center justify-center text-white transition-colors"
                    title={isPlaying ? 'Pause' : 'Play preview'}
                >
                    {isLoading ? (
                        <Loader className="w-4 h-4 animate-spin" />
                    ) : isPlaying ? (
                        <Pause className="w-4 h-4" />
                    ) : (
                        <Play className="w-4 h-4 ml-0.5" />
                    )}
                </button>
                {label && <span className="text-xs text-gray-400">{label}</span>}
            </div>
        );
    }

    return (
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <audio ref={audioRef} src={audioSrc} preload="metadata" />

            <div className="flex items-center gap-4">
                {/* Play/Pause Button */}
                <button
                    onClick={togglePlay}
                    disabled={isLoading}
                    className="w-12 h-12 rounded-full bg-teal-500 hover:bg-teal-600 disabled:bg-gray-600 flex items-center justify-center text-white transition-colors flex-shrink-0"
                    title={isPlaying ? 'Pause' : 'Play preview'}
                >
                    {isLoading ? (
                        <Loader className="w-6 h-6 animate-spin" />
                    ) : isPlaying ? (
                        <Pause className="w-6 h-6" />
                    ) : (
                        <Play className="w-6 h-6 ml-1" />
                    )}
                </button>

                {/* Progress and Time */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Volume2 className="w-4 h-4 text-gray-400" />
                        {label && <span className="text-sm text-gray-300">{label}</span>}
                    </div>

                    {/* Progress Bar */}
                    <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className="absolute inset-y-0 left-0 bg-teal-500 transition-all duration-100"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Time Display */}
                    <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AudioPlayer;
