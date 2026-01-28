import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Play, Pause, Volume2, Loader } from 'lucide-react';

// Get GCP Storage base URL from environment or default
const GCP_STORAGE_BASE_URL = import.meta.env.VITE_GCP_STORAGE_BASE_URL || 'https://storage.googleapis.com/voiceeval-public';

/**
 * Simple audio player component for audio playback
 * 
 * @param {string} audioUrl - URL to the audio file (can be relative or absolute)
 * @param {string} label - Label to display (optional)
 * @param {boolean} compact - Whether to show compact version
 * @param {function} onTimeUpdate - Callback for current time updates
 * @param {function} onLoadedMetadata - Callback for metadata loaded
 */
const AudioPlayer = forwardRef(({ audioUrl, label, compact = false, onTimeUpdate, onLoadedMetadata }, ref) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const audioRef = useRef(null);

    const [audioSrc, setAudioSrc] = useState(null);

    // Expose methods to parent components
    useImperativeHandle(ref, () => ({
        seek: (time) => {
            if (audioRef.current) {
                audioRef.current.currentTime = time;
                setCurrentTime(time);
            }
        },
        togglePlay: () => {
            togglePlay();
        },
        play: () => {
            if (audioRef.current && audioRef.current.paused) {
                audioRef.current.play();
            }
        },
        pause: () => {
            if (audioRef.current && !audioRef.current.paused) {
                audioRef.current.pause();
            }
        }
    }));

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
                // ... same fetch logic ...
                if (fullAudioUrl.startsWith('http')) {
                    if (active) {
                        setAudioSrc(fullAudioUrl);
                        setIsLoading(false);
                    }
                    return;
                }

                const token = localStorage.getItem("authToken");
                const headers = {};
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const response = await fetch(fullAudioUrl, { headers });
                if (!response.ok) throw new Error(`Failed to load audio: ${response.status}`);
                const blob = await response.blob();

                if (active) {
                    objectUrl = URL.createObjectURL(blob);
                    setAudioSrc(objectUrl);
                    setIsLoading(false);
                }
            } catch (err) {
                console.error('AudioPlayer: Error fetching audio:', err);
                if (active) setIsLoading(false);
            }
        };

        fetchAudio();

        return () => {
            active = false;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [fullAudioUrl]);

    // Audio Event Handlers
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
            if (onTimeUpdate) onTimeUpdate(audio.currentTime);
        };
        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
            if (onLoadedMetadata) onLoadedMetadata(audio.duration);
        };

        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handlePause);

        return () => {
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handlePause);
        };
    }, [audioSrc, onTimeUpdate, onLoadedMetadata]);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (audio.paused) audio.play();
        else audio.pause();
    };

    const handleSliderChange = (e) => {
        const val = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = val;
            setCurrentTime(val);
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
                    {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                {label && <span className="text-xs text-gray-400">{label}</span>}
            </div>
        );
    }

    return (
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <audio ref={audioRef} src={audioSrc} preload="metadata" />

            <div className="flex items-center gap-4">
                <button
                    onClick={togglePlay}
                    disabled={isLoading}
                    className="w-12 h-12 rounded-full bg-teal-500 hover:bg-teal-600 disabled:bg-gray-600 flex items-center justify-center text-white transition-colors flex-shrink-0"
                >
                    {isLoading ? <Loader className="w-6 h-6 animate-spin" /> : isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                </button>

                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Volume2 className="w-4 h-4 text-gray-400" />
                        {label && <span className="text-sm text-gray-300">{label}</span>}
                    </div>

                    <div className="relative flex items-center h-2 bg-gray-800 rounded-full group">
                        {/* Interactive Slider */}
                        <input
                            type="range"
                            min="0"
                            max={duration || 0}
                            step="0.01"
                            value={currentTime}
                            onChange={handleSliderChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        {/* Custom Track */}
                        <div
                            className="h-full bg-teal-500 rounded-full relative transition-all duration-100"
                            style={{ width: `${progress}%` }}
                        >
                            {/* Draggable handle (visible on hover) */}
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-teal-500 shadow-md transform scale-0 group-hover:scale-100 transition-transform" />
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default AudioPlayer;
