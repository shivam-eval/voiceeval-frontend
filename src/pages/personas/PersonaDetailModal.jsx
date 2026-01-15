import { X, User, UserCircle2, Sparkles, Tag, Gauge, Music } from "lucide-react";
import Button from "../../components/Button";
import Badge from "../../components/Badge";
import NoiseProfilesSection from "../../components/NoiseProfilesSection";
import { useNoiseProfiles } from "../../hooks/useNoiseProfiles";

const PersonaDetailModal = ({ persona, isOpen, onClose, onSelect }) => {
    // Fetch noise profiles metadata for audio URLs (must be called before any early returns)
    const { data: noiseProfilesData } = useNoiseProfiles();

    // Convert array to map for easy lookup
    const noiseProfilesMap = noiseProfilesData?.profiles?.reduce((acc, profile) => {
        acc[profile.profile_id] = profile;
        return acc;
    }, {}) || null;

    // Gender icon helper
    const getGenderIcon = (gender) => {
        const iconClass = "w-8 h-8 transition-transform duration-300";

        if (gender === 'male') {
            return (
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-xl blur-md"></div>
                    <div className="relative bg-gray-800 border border-gray-700 p-4 rounded-xl border-blue-500/50">
                        <User className={`${iconClass} text-blue-400`} strokeWidth={2} />
                    </div>
                </div>
            );
        }

        if (gender === 'female') {
            return (
                <div className="relative">
                    <div className="absolute inset-0 bg-pink-500/20 rounded-xl blur-md"></div>
                    <div className="relative bg-gray-800 border border-gray-700 p-4 rounded-xl border-pink-500/50">
                        <UserCircle2 className={`${iconClass} text-pink-400`} strokeWidth={2} />
                    </div>
                </div>
            );
        }

        return (
            <div className="relative">
                <div className="absolute inset-0 bg-purple-500/20 rounded-xl blur-md"></div>
                <div className="relative bg-gray-800 border border-gray-700 p-4 rounded-xl border-purple-500/50">
                    <Sparkles className={`${iconClass} text-purple-400`} strokeWidth={2} />
                </div>
            </div>
        );
    };

    if (!isOpen || !persona) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-800">
                {/* Header */}
                <div className="p-6 border-b border-gray-800">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div>
                                {getGenderIcon(persona.gender)}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1">{persona.name}</h2>
                                <div className="flex items-center gap-2">
                                    <Badge variant="info" size="sm">{persona.region}</Badge>
                                    <Badge variant="default" size="sm">{persona.native_language}</Badge>
                                    <Badge variant="default" size="sm">{persona.gender}</Badge>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    <div className="space-y-6">
                        {/* Description */}
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                            <p className="text-gray-300">{persona.description}</p>
                        </div>

                        {/* Personal Info */}
                        <div className="grid grid-cols-1 gap-6">
                            <div className="bg-gray-800 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <User className="w-4 h-4 text-teal-400" />
                                    <h4 className="text-sm font-semibold text-gray-400">Age Group</h4>
                                </div>
                                <p className="text-white">{persona.age_group?.replace('_', ' ')}</p>
                            </div>
                        </div>

                        {/* Voice Controls */}
                        {persona.voice_profile && (
                            <div className="bg-gray-800 rounded-lg p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Music className="w-5 h-5 text-teal-400" />
                                    <h4 className="text-lg font-semibold text-white">Voice Profile</h4>
                                </div>
                                <div className="space-y-4">
                                    {persona.voice_profile.accent_type && (
                                        <div className="flex items-center justify-between pb-3 border-b border-gray-700">
                                            <span className="text-gray-300">Accent</span>
                                            <span className="text-white font-medium">{persona.voice_profile.accent_type?.replace('_', ' ')}</span>
                                        </div>
                                    )}

                                    {persona.voice_profile.pace && (
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex flex-col">
                                                    <span className="text-gray-300">Pace</span>
                                                    <span className="text-xs text-gray-500">0.3 (slowest) to 3.0 (fastest)</span>
                                                </div>
                                                <span className="text-teal-400 font-semibold">{persona.voice_profile.pace}x</span>
                                            </div>
                                            <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="bg-teal-400 h-2 rounded-full"
                                                    style={{ width: `${Math.max(0, Math.min(100, ((persona.voice_profile.pace - 0.3) / 2.7) * 100))}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {persona.voice_profile.pitch !== undefined && (
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex flex-col">
                                                    <span className="text-gray-300">Pitch</span>
                                                    <span className="text-xs text-gray-500">-0.75 (deeper voice) to 0.75 (sharper voice)</span>
                                                </div>
                                                <span className="text-teal-400 font-semibold">{persona.voice_profile.pitch}</span>
                                            </div>
                                            <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="bg-teal-400 h-2 rounded-full"
                                                    style={{ width: `${Math.max(0, Math.min(100, ((persona.voice_profile.pitch + 0.75) / 1.5) * 100))}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {persona.voice_profile.loudness !== undefined && (
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex flex-col">
                                                    <span className="text-gray-300">Loudness</span>
                                                    <span className="text-xs text-gray-500">0.1 (quietest) to 3.0 (loudest)</span>
                                                </div>
                                                <span className="text-teal-400 font-semibold">{persona.voice_profile.loudness}</span>
                                            </div>
                                            <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="bg-teal-400 h-2 rounded-full"
                                                    style={{ width: `${Math.max(0, Math.min(100, ((persona.voice_profile.loudness - 0.1) / 2.9) * 100))}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Special Behaviors */}
                        {persona.behavior_traits && (
                            <div className="bg-gray-800 rounded-lg p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Gauge className="w-5 h-5 text-teal-400" />
                                    <h4 className="text-lg font-semibold text-white">Special Behaviors</h4>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-300">Interrupts Frequently</span>
                                        <span className={persona.behavior_traits.interrupts_frequently ? 'text-red-400' : 'text-green-400'}>
                                            {persona.behavior_traits.interrupts_frequently ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-300">Asks Clarifying Questions</span>
                                        <span className={persona.behavior_traits.asks_clarifying_questions ? 'text-green-400' : 'text-red-400'}>
                                            {persona.behavior_traits.asks_clarifying_questions ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-300">Uses Colloquialisms</span>
                                        <span className={persona.behavior_traits.uses_colloquialisms ? 'text-green-400' : 'text-gray-400'}>
                                            {persona.behavior_traits.uses_colloquialisms ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Background Noise Profiles */}
                        {persona.background_noises && persona.background_noises.length > 0 && (
                            <NoiseProfilesSection
                                noises={persona.background_noises}
                                noiseProfiles={noiseProfilesMap}
                            />
                        )}

                        {/* Tags */}
                        {persona.tags && persona.tags.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Tag className="w-4 h-4 text-teal-400" />
                                    <h4 className="text-sm font-semibold text-gray-400">Tags</h4>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {persona.tags.map((tag, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-teal-400/10 text-teal-400 rounded-full text-sm">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-800 flex items-center justify-between">
                    <Button variant="secondary" onClick={onClose}>
                        Close
                    </Button>
                    {onSelect && (
                        <Button onClick={() => onSelect(persona)}>
                            Use This Persona
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PersonaDetailModal;
