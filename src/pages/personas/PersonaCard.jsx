import Badge from "../../components/Badge";

const PersonaCard = ({ persona, onClick }) => {
    const getGenderIcon = (gender) => {
        if (gender === 'male') return '👨';
        if (gender === 'female') return '👩';
        return '👤';
    };

    const getPatienceBadgeVariant = (level) => {
        if (level === 'high') return 'success';
        if (level === 'low') return 'danger';
        return 'default';
    };

    return (
        <div
            onClick={onClick}
            className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-teal-400 transition-all duration-300 cursor-pointer group hover:shadow-lg hover:shadow-teal-400/20 hover:-translate-y-1"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{getGenderIcon(persona.gender)}</div>
                <Badge variant="info" size="sm">
                    {persona.region?.replace('_', ' ')}
                </Badge>
            </div>

            {/* Name */}
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-teal-400 transition-colors">
                {persona.name}
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                {persona.description}
            </p>

            {/* Demographics */}
            <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="default" size="sm">
                    {persona.native_language}
                </Badge>
                <Badge variant="default" size="sm">
                    {persona.age_group?.replace('_', ' ')}
                </Badge>
                {persona.occupation && (
                    <Badge variant="default" size="sm">
                        {persona.occupation.replace('_', ' ')}
                    </Badge>
                )}
            </div>

            {/* Voice Profile */}
            <div className="bg-gray-800 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 text-sm mb-1">
                    <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    <span className="text-gray-300 font-medium">{persona.voice_profile?.voice_id}</span>
                </div>
                <div className="text-xs text-gray-500">
                    Pace: {persona.voice_profile?.pace}x | Pitch: {persona.voice_profile?.pitch}
                </div>
            </div>

            {/* Behavior Traits */}
            <div className="flex items-center gap-2 mb-3">
                <Badge variant={getPatienceBadgeVariant(persona.behavior_traits?.patience_level)} size="sm">
                    {persona.behavior_traits?.patience_level} patience
                </Badge>
                <Badge variant="default" size="sm">
                    💻 {persona.behavior_traits?.tech_savviness}
                </Badge>
            </div>

            {/* Tags */}
            {persona.tags && persona.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {persona.tags.slice(0, 3).map((tag, idx) => (
                        <span
                            key={idx}
                            className="px-2 py-1 bg-teal-400/10 text-teal-400 rounded text-xs"
                        >
                            {tag}
                        </span>
                    ))}
                    {persona.tags.length > 3 && (
                        <span className="px-2 py-1 text-gray-500 text-xs">
                            +{persona.tags.length - 3} more
                        </span>
                    )}
                </div>
            )}

            {/* Hover Indicator */}
            <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-sm text-gray-400">Click to view details</span>
                <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </div>
    );
};

export default PersonaCard;
