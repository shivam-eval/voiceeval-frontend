import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Loader } from 'lucide-react';

// Get API base URL from environment or default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

/**
 * Simple audio player component for noise profile previews
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

    // Construct full URL if audioUrl is relative
    const fullAudioUrl = audioUrl?.startsWith('http') 
        ? audioUrl 
        : `${API_BASE_URL.replace('/api/v1', '')}${audioUrl}`;

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
            setIsLoading(false);
        };

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };

        const handleCanPlay = () => {
            setIsLoading(false);
        };

        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('canplay', handleCanPlay);

        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('canplay', handleCanPlay);
        };
    }, []);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            setIsLoading(true);
            audio.play().catch(err => {
                console.error('Error playing audio:', err);
                setIsLoading(false);
            });
        }
        setIsPlaying(!isPlaying);
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
                <audio ref={audioRef} src={fullAudioUrl} preload="metadata" />
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
            <audio ref={audioRef} src={fullAudioUrl} preload="metadata" />
            
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
