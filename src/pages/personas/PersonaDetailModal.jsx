import { useState } from "react";
import Button from "../../components/Button";
import Badge from "../../components/Badge";

const PersonaDetailModal = ({ persona, isOpen, onClose, onSelect }) => {
    const [activeTab, setActiveTab] = useState("about");

    if (!isOpen || !persona) return null;

    const tabs = [
        { id: "about", label: "About", icon: "📋" },
        { id: "voice", label: "Voice Profile", icon: "🎤" },
        { id: "behavior", label: "Behavior", icon: "🧠" },
    ];

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-800">
                {/* Header */}
                <div className="p-6 border-b border-gray-800">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="text-5xl">
                                {persona.gender === 'male' ? '👨' : persona.gender === 'female' ? '👩' : '👤'}
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
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-4 mt-6">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === tab.id
                                        ? 'bg-teal-400 text-gray-900'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                    }`}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
                    {/* About Tab */}
                    {activeTab === "about" && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                                <p className="text-gray-300">{persona.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Age Group</h4>
                                    <p className="text-white">{persona.age_group?.replace('_', ' ')}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Occupation</h4>
                                    <p className="text-white">{persona.occupation?.replace('_', ' ')}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Education Level</h4>
                                    <p className="text-white">{persona.education_level?.replace('_', ' ')}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Confidence Score</h4>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-gray-800 rounded-full h-2">
                                            <div
                                                className="bg-teal-400 h-2 rounded-full"
                                                style={{ width: `${(persona.confidence_score || 0) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-white">{((persona.confidence_score || 0) * 100).toFixed(0)}%</span>
                                    </div>
                                </div>
                            </div>

                            {persona.suitable_for_path_types && persona.suitable_for_path_types.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Suitable for Path Types</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {persona.suitable_for_path_types.map((type, idx) => (
                                            <Badge key={idx} variant="success" size="sm">
                                                {type.replace('_', ' ')}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {persona.tags && persona.tags.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Tags</h4>
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
                    )}

                    {/* Voice Profile Tab */}
                    {activeTab === "voice" && persona.voice_profile && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Provider</h4>
                                    <p className="text-white">{persona.voice_profile.provider}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Voice ID</h4>
                                    <p className="text-white">{persona.voice_profile.voice_id}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Language Code</h4>
                                    <p className="text-white">{persona.voice_profile.language_code || 'N/A'}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Accent Type</h4>
                                    <p className="text-white">{persona.voice_profile.accent_type?.replace('_', ' ')}</p>
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-lg p-6">
                                <h4 className="text-lg font-semibold text-white mb-4">Voice Controls</h4>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-gray-300">Pace</span>
                                            <span className="text-teal-400 font-semibold">{persona.voice_profile.pace}x</span>
                                        </div>
                                        <div className="bg-gray-700 rounded-full h-2">
                                            <div
                                                className="bg-teal-400 h-2 rounded-full"
                                                style={{ width: `${(persona.voice_profile.pace / 2) * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-gray-300">Pitch</span>
                                            <span className="text-teal-400 font-semibold">{persona.voice_profile.pitch}</span>
                                        </div>
                                        <div className="bg-gray-700 rounded-full h-2">
                                            <div
                                                className="bg-teal-400 h-2 rounded-full"
                                                style={{ width: `${((persona.voice_profile.pitch + 1) / 2) * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    {persona.voice_profile.loudness && (
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-gray-300">Loudness</span>
                                                <span className="text-teal-400 font-semibold">{persona.voice_profile.loudness}</span>
                                            </div>
                                            <div className="bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="bg-teal-400 h-2 rounded-full"
                                                    style={{ width: `${(persona.voice_profile.loudness / 2) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Behavior Tab */}
                    {activeTab === "behavior" && persona.behavior_traits && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-gray-800 rounded-lg p-4">
                                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Patience Level</h4>
                                    <Badge
                                        variant={
                                            persona.behavior_traits.patience_level === 'high'
                                                ? 'success'
                                                : persona.behavior_traits.patience_level === 'low'
                                                    ? 'danger'
                                                    : 'default'
                                        }
                                    >
                                        {persona.behavior_traits.patience_level}
                                    </Badge>
                                </div>

                                <div className="bg-gray-800 rounded-lg p-4">
                                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Verbosity</h4>
                                    <Badge variant="default">{persona.behavior_traits.verbosity}</Badge>
                                </div>

                                <div className="bg-gray-800 rounded-lg p-4">
                                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Tech Savviness</h4>
                                    <Badge variant="info">{persona.behavior_traits.tech_savviness}</Badge>
                                </div>

                                <div className="bg-gray-800 rounded-lg p-4">
                                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Formality</h4>
                                    <Badge variant="default">{persona.behavior_traits.formality}</Badge>
                                </div>

                                <div className="bg-gray-800 rounded-lg p-4">
                                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Communication Style</h4>
                                    <Badge variant="default">{persona.behavior_traits.communication_style}</Badge>
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-lg p-6">
                                <h4 className="text-lg font-semibold text-white mb-4">Special Behaviors</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-300">Interrupts Frequently</span>
                                        <span className={persona.behavior_traits.interrupts_frequently ? 'text-red-400' : 'text-green-400'}>
                                            {persona.behavior_traits.interrupts_frequently ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-300">Provides Incomplete Info</span>
                                        <span className={persona.behavior_traits.provides_incomplete_info ? 'text-red-400' : 'text-green-400'}>
                                            {persona.behavior_traits.provides_incomplete_info ? 'Yes' : 'No'}
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
                        </div>
                    )}
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
