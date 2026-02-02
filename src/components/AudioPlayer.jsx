import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle
} from 'react';
import { Play, Pause, Volume2, Loader } from 'lucide-react';

const GCP_STORAGE_BASE_URL =
  import.meta.env.VITE_GCP_STORAGE_BASE_URL ||
  'https://storage.googleapis.com/voiceeval-public';

const AudioPlayer = forwardRef(
  ({ audioUrl, label }, ref) => {
    const audioRef = useRef(null);

    const [audioSrc, setAudioSrc] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    /* ---------------------------------------------
       Resolve URL
    ---------------------------------------------- */
    const fullAudioUrl = audioUrl?.startsWith('http')
      ? audioUrl
      : `${GCP_STORAGE_BASE_URL}/${audioUrl?.replace(/^\//, '')}`;

    /* ---------------------------------------------
       Load audio
    ---------------------------------------------- */
    useEffect(() => {
      if (!fullAudioUrl) return;

      setIsLoading(true);
      setCurrentTime(0);
      setDuration(0);
      setAudioSrc(fullAudioUrl);
    }, [fullAudioUrl]);

    /* ---------------------------------------------
       Audio event wiring
    ---------------------------------------------- */
    useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;

      const onLoadedMetadata = () => {
        if (Number.isFinite(audio.duration)) {
          setDuration(audio.duration);
          setIsLoading(false);
        }
      };

      const onTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };

      const onPlay = () => setIsPlaying(true);
      const onPause = () => setIsPlaying(false);

      audio.addEventListener('loadedmetadata', onLoadedMetadata);
      audio.addEventListener('timeupdate', onTimeUpdate);
      audio.addEventListener('play', onPlay);
      audio.addEventListener('pause', onPause);

      return () => {
        audio.removeEventListener('loadedmetadata', onLoadedMetadata);
        audio.removeEventListener('timeupdate', onTimeUpdate);
        audio.removeEventListener('play', onPlay);
        audio.removeEventListener('pause', onPause);
      };
    }, []);

    /* ---------------------------------------------
       Public API (GRAPH → AUDIO)
    ---------------------------------------------- */
    useImperativeHandle(ref, () => ({
      seekAndPlay: async (seconds) => {
        const audio = audioRef.current;
        if (!audio || !Number.isFinite(seconds)) return;

        console.log('▶️ seekAndPlay', seconds);

        if (audio.readyState < 2) {
          await new Promise((res) =>
            audio.addEventListener('loadedmetadata', res, { once: true })
          );
        }

        audio.currentTime = seconds;
        setCurrentTime(seconds);

        try {
          await audio.play();
        } catch {
          // autoplay fallback
          audio.muted = true;
          await audio.play();
          audio.muted = false;
        }
      }
    }));

    /* ---------------------------------------------
       User play / pause
    ---------------------------------------------- */
    const togglePlay = async () => {
      const audio = audioRef.current;
      if (!audio) return;

      if (audio.paused) {
        try {
          await audio.play();
        } catch {}
      } else {
        audio.pause();
      }
    };

    /* ---------------------------------------------
       UI helpers
    ---------------------------------------------- */
    const formatTime = (s) => {
      if (!Number.isFinite(s)) return '0:00';
      const m = Math.floor(s / 60);
      const sec = Math.floor(s % 60);
      return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    const progress =
      duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

    /* ---------------------------------------------
       UI
    ---------------------------------------------- */
    return (
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
        <audio ref={audioRef} src={audioSrc} preload="metadata" />

        <div className="flex items-center gap-4">
          <button
            onClick={togglePlay}
            disabled={isLoading}
            className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center text-white"
          >
            {isLoading ? (
              <Loader className="w-6 h-6 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-1" />
            )}
          </button>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Volume2 className="w-4 h-4 text-gray-400" />
              {label && <span className="text-sm text-gray-300">{label}</span>}
            </div>

            <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-teal-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default AudioPlayer;
