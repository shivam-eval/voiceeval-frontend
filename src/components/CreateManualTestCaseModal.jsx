import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "./Button";
import { Play, Pause } from "lucide-react";
import { useNoiseProfiles } from "../hooks/useNoiseProfiles";
import { useAgentParams } from "../hooks/useParams";
import { scenarioConfigsApi } from "../utils/api";
import { API_BASE_URL } from "../config/constants";

const SARVAM_VOICES = [
    { name: "Anushka", gender: "Female" },
    { name: "Manisha", gender: "Female" },
    { name: "Vidya", gender: "Female" },
    { name: "Arya", gender: "Male" },
    { name: "Abhilash", gender: "Male" },
    { name: "Karun", gender: "Male" },
    { name: "Hitesh", gender: "Male" },
];

const SARVAM_LANGUAGES = [
    { code: "bn-IN", label: "Bengali" },
    { code: "en-IN", label: "English" },
    { code: "gu-IN", label: "Gujarati" },
    { code: "hi-IN", label: "Hindi" },
    { code: "kn-IN", label: "Kannada" },
    { code: "ml-IN", label: "Malayalam" },
    { code: "mr-IN", label: "Marathi" },
    { code: "od-IN", label: "Odia" },
    { code: "pa-IN", label: "Punjabi" },
    { code: "ta-IN", label: "Tamil" },
    { code: "te-IN", label: "Telugu" },
];

const INTERRUPTION_LEVELS = [
    { value: "low", label: "Low", description: "Rare interruptions" },
    { value: "medium", label: "Medium", description: "Occasional interruptions" },
    { value: "high", label: "High", description: "Frequent interruptions" },
];

const CreateManualTestCaseModal = ({ isOpen, onClose, agentId, onCreated }) => {
    const [formData, setFormData] = useState({
        speaker_name: "",
        primary_language: "hi-IN",
        secondary_language: "",
        code_switching: false,
        interruption_level: "medium",
        noise_profile_id: "",
        noise_multiplier: 0.5,
        objective: "",
        input_params: {},
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [playingProfileId, setPlayingProfileId] = useState(null);
    const audioRef = useRef(null);
    const audioBlobUrlRef = useRef(null);

    const { data: noiseData } = useNoiseProfiles();
    const noiseProfiles = noiseData?.profiles || [];

    const { data: paramsData } = useAgentParams(agentId);
    const agentParams = paramsData || [];

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData({
                speaker_name: "",
                primary_language: "hi-IN",
                secondary_language: "",
                code_switching: false,
                interruption_level: "medium",
                noise_profile_id: "",
                noise_multiplier: 0.5,
                objective: "",
                input_params: {},
            });
            setPlayingProfileId(null);
        }
    }, [isOpen]);

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if (audioBlobUrlRef.current) {
                URL.revokeObjectURL(audioBlobUrlRef.current);
            }
        };
    }, []);

    const handleChange = (field, value) => {
        setFormData((prev) => {
            const next = { ...prev, [field]: value };
            if (field === "secondary_language") {
                next.code_switching = !!value;
            }
            return next;
        });
    };

    const handleParamChange = (paramId, value) => {
        setFormData((prev) => ({
            ...prev,
            input_params: { ...prev.input_params, [paramId]: value },
        }));
    };

    const playNoiseAudio = async (profileId, audioUrl) => {
        // If already playing this profile, stop it
        if (playingProfileId === profileId) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            setPlayingProfileId(null);
            return;
        }

        // Stop any current playback
        if (audioRef.current) {
            audioRef.current.pause();
        }
        if (audioBlobUrlRef.current) {
            URL.revokeObjectURL(audioBlobUrlRef.current);
            audioBlobUrlRef.current = null;
        }

        try {
            const token = localStorage.getItem("authToken");
            const baseOrigin = new URL(API_BASE_URL).origin;
            const res = await fetch(`${baseOrigin}${audioUrl}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (!res.ok) throw new Error("Failed to fetch audio");
            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            audioBlobUrlRef.current = blobUrl;

            const audio = new Audio(blobUrl);
            audioRef.current = audio;
            audio.onended = () => setPlayingProfileId(null);
            audio.play();
            setPlayingProfileId(profileId);
        } catch (e) {
            console.error("Audio playback error:", e);
            toast.error("Failed to play audio");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.speaker_name || !formData.noise_profile_id || !formData.objective) {
            toast.error("Please fill all required fields");
            return;
        }

        setIsSubmitting(true);
        onClose();
        toast.info("Creating manual test case...");

        try {
            await scenarioConfigsApi.createManual({
                agent_id: agentId,
                speaker_name: formData.speaker_name,
                primary_language: formData.primary_language,
                secondary_language: formData.secondary_language || null,
                code_switching: formData.code_switching,
                demography: "india",
                interruption_level: formData.interruption_level,
                noise_profile_id: formData.noise_profile_id,
                noise_multiplier: formData.noise_multiplier,
                objective: formData.objective,
                input_params: formData.input_params,
            });
            toast.success("Manual test case created successfully");
            if (onCreated) onCreated();
        } catch (err) {
            console.error("Manual test case creation failed:", err);
            toast.error("Failed to create manual test case");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isValid = formData.speaker_name && formData.primary_language && formData.noise_profile_id && formData.objective;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-gray-800">
                {/* Header */}
                <div className="p-6 border-b border-gray-800">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white">Create Manual Test Case</h2>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                        Define the objective, input values, voice, and environment settings. The scenario name and system prompt will be auto-generated.
                    </p>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] space-y-6">
                    {/* Objective */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Objective <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            value={formData.objective}
                            onChange={(e) => handleChange("objective", e.target.value)}
                            placeholder="e.g., Customer calls to check their loan EMI status and asks about prepayment options"
                            rows={3}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-400 resize-none"
                            required
                        />
                    </div>

                    {/* Input Parameters */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                            Input Parameters
                        </label>
                        {agentParams.length > 0 ? (
                            <div className="space-y-3">
                                {agentParams.map((param) => (
                                    <div key={param.param_id} className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <label className="text-sm text-gray-400">{param.key}</label>
                                            <span className="text-xs text-gray-600">({param.value_type})</span>
                                        </div>
                                        {param.description && (
                                            <p className="text-xs text-gray-500">{param.description}</p>
                                        )}
                                        <input
                                            type={param.value_type === "number" ? "number" : "text"}
                                            value={formData.input_params[param.param_id] ?? ""}
                                            onChange={(e) => {
                                                let val = e.target.value;
                                                if (param.value_type === "number" && val !== "") {
                                                    val = Number(val);
                                                } else if (param.value_type === "boolean") {
                                                    val = val.toLowerCase() === "true";
                                                }
                                                handleParamChange(param.param_id, val);
                                            }}
                                            placeholder={`Enter ${param.key}...`}
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-teal-400"
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No input parameters defined for this agent.</p>
                        )}
                    </div>

                    {/* Speaker Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Speaker Voice <span className="text-red-400">*</span>
                        </label>
                        <select
                            value={formData.speaker_name}
                            onChange={(e) => handleChange("speaker_name", e.target.value)}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-400"
                            required
                        >
                            <option value="">Select a voice...</option>
                            {SARVAM_VOICES.map((v) => (
                                <option key={v.name} value={v.name}>
                                    {v.name} ({v.gender})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Primary Language */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Primary Language <span className="text-red-400">*</span>
                        </label>
                        <select
                            value={formData.primary_language}
                            onChange={(e) => handleChange("primary_language", e.target.value)}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-400"
                            required
                        >
                            {SARVAM_LANGUAGES.map((l) => (
                                <option key={l.code} value={l.code}>
                                    {l.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Secondary Language (optional) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Secondary Language <span className="text-gray-500">(optional, enables code switching)</span>
                        </label>
                        <select
                            value={formData.secondary_language}
                            onChange={(e) => handleChange("secondary_language", e.target.value)}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-400"
                        >
                            <option value="">None</option>
                            {SARVAM_LANGUAGES.filter((l) => l.code !== formData.primary_language).map((l) => (
                                <option key={l.code} value={l.code}>
                                    {l.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Demography (fixed) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Demography</label>
                        <div className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-400">
                            India
                        </div>
                    </div>

                    {/* Interruption Level */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                            Interruption Level <span className="text-red-400">*</span>
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {INTERRUPTION_LEVELS.map((level) => (
                                <button
                                    key={level.value}
                                    type="button"
                                    onClick={() => handleChange("interruption_level", level.value)}
                                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                                        formData.interruption_level === level.value
                                            ? "border-teal-400 bg-teal-400/10"
                                            : "border-gray-700 bg-gray-800 hover:border-gray-600"
                                    }`}
                                >
                                    <div className="text-sm font-semibold text-white">{level.label}</div>
                                    <div className="text-xs text-gray-400 mt-1">{level.description}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Background Noise Profile */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                            Background Noise <span className="text-red-400">*</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                            {noiseProfiles.map((profile) => (
                                <div
                                    key={profile.profile_id}
                                    onClick={() => handleChange("noise_profile_id", profile.profile_id)}
                                    className={`p-3 rounded-lg border-2 transition-all cursor-pointer flex items-start gap-3 ${
                                        formData.noise_profile_id === profile.profile_id
                                            ? "border-teal-400 bg-teal-400/10"
                                            : "border-gray-700 bg-gray-800 hover:border-gray-600"
                                    }`}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold text-white truncate">{profile.name}</div>
                                        {profile.description && (
                                            <div className="text-xs text-gray-400 mt-1 line-clamp-2">{profile.description}</div>
                                        )}
                                    </div>
                                    {profile.audio_url && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                playNoiseAudio(profile.profile_id, profile.audio_url);
                                            }}
                                            className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
                                        >
                                            {playingProfileId === profile.profile_id ? (
                                                <Pause className="w-4 h-4" />
                                            ) : (
                                                <Play className="w-4 h-4" />
                                            )}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="p-6 border-t border-gray-800 flex items-center justify-end gap-3">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        onClick={handleSubmit}
                        loading={isSubmitting}
                        disabled={!isValid || isSubmitting}
                    >
                        Create Test Case
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CreateManualTestCaseModal;
