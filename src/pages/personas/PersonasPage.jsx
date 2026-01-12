import { useState } from "react";
import { usePersonasLibrary } from "../../hooks/usePersonasLibrary";
import PersonaCard from "./PersonaCard";
import PersonaDetailModal from "./PersonaDetailModal";
import Button from "../../components/Button";

const PersonasPage = () => {
    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [regionFilter, setRegionFilter] = useState(null);
    const [languageFilter, setLanguageFilter] = useState(null);
    const [ageGroupFilter, setAgeGroupFilter] = useState(null);
    const [genderFilter, setGenderFilter] = useState(null);

    // Modal state
    const [selectedPersona, setSelectedPersona] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Fetch personas with filters
    const { data, isLoading, error } = usePersonasLibrary({
        search: searchQuery,
        region: regionFilter,
        language: languageFilter,
        age_group: ageGroupFilter,
        gender: genderFilter,
    });

    const personas = data?.personas || [];
    const regions = data?.regions || [];
    const languages = data?.languages || [];

    const handlePersonaClick = (persona) => {
        setSelectedPersona(persona);
        setShowDetailModal(true);
    };

    return (
        <div className="p-8">
            <div className="w-full max-w-screen-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Personas Library</h1>
                    <p className="text-gray-400">
                        Pre-configured user personas for realistic testing scenarios
                    </p>
                </div>

                {/* Filters Bar */}
                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800/50 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2 relative">
                            <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search personas..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-400"
                            />
                        </div>

                        {/* Region Filter */}
                        <select
                            value={regionFilter || ""}
                            onChange={(e) => setRegionFilter(e.target.value || null)}
                            className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:border-teal-400"
                        >
                            <option value="">All Regions</option>
                            {regions.map((region) => (
                                <option key={region} value={region}>
                                    {region.replace('_', ' ').toUpperCase()}
                                </option>
                            ))}
                        </select>

                        {/* Language Filter */}
                        <select
                            value={languageFilter || ""}
                            onChange={(e) => setLanguageFilter(e.target.value || null)}
                            className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:border-teal-400"
                        >
                            <option value="">All Languages</option>
                            {languages.map((lang) => (
                                <option key={lang} value={lang}>
                                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                                </option>
                            ))}
                        </select>

                        {/* Age Group Filter */}
                        <select
                            value={ageGroupFilter || ""}
                            onChange={(e) => setAgeGroupFilter(e.target.value || null)}
                            className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:border-teal-400"
                        >
                            <option value="">All Age Groups</option>
                            <option value="young_adult">Young Adult</option>
                            <option value="middle_aged">Middle Aged</option>
                            <option value="senior">Senior</option>
                        </select>

                        {/* Gender Filter */}
                        <select
                            value={genderFilter || ""}
                            onChange={(e) => setGenderFilter(e.target.value || null)}
                            className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:border-teal-400"
                        >
                            <option value="">All Genders</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>

                    {/* Active Filters Summary */}
                    {(searchQuery || regionFilter || languageFilter || ageGroupFilter || genderFilter) && (
                        <div className="mt-4 flex items-center gap-2 flex-wrap">
                            <span className="text-sm text-gray-400">Active filters:</span>
                            {searchQuery && (
                                <span className="px-3 py-1 bg-teal-400/20 text-teal-400 rounded-full text-sm">
                                    Search: "{searchQuery}"
                                </span>
                            )}
                            {regionFilter && (
                                <span className="px-3 py-1 bg-teal-400/20 text-teal-400 rounded-full text-sm">
                                    Region: {regionFilter}
                                </span>
                            )}
                            {languageFilter && (
                                <span className="px-3 py-1 bg-teal-400/20 text-teal-400 rounded-full text-sm">
                                    Language: {languageFilter}
                                </span>
                            )}
                            {ageGroupFilter && (
                                <span className="px-3 py-1 bg-teal-400/20 text-teal-400 rounded-full text-sm">
                                    Age Group: {ageGroupFilter.replace('_', ' ')}
                                </span>
                            )}
                            {genderFilter && (
                                <span className="px-3 py-1 bg-teal-400/20 text-teal-400 rounded-full text-sm">
                                    Gender: {genderFilter}
                                </span>
                            )}
                            <button
                                onClick={() => {
                                    setSearchQuery("");
                                    setRegionFilter(null);
                                    setLanguageFilter(null);
                                    setAgeGroupFilter(null);
                                    setGenderFilter(null);
                                }}
                                className="text-sm text-gray-400 hover:text-white transition-colors underline"
                            >
                                Clear all
                            </button>
                        </div>
                    )}
                </div>

                {/* Results Count */}
                <div className="mb-6 flex items-center justify-between">
                    <p className="text-gray-400">
                        Showing <span className="text-white font-semibold">{personas.length}</span> of{" "}
                        <span className="text-white font-semibold">{data?.total_library || 0}</span> personas
                    </p>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-gray-900 rounded-xl p-6 border border-gray-800 animate-pulse">
                                <div className="h-6 bg-gray-800 rounded mb-4"></div>
                                <div className="h-4 bg-gray-800 rounded mb-2"></div>
                                <div className="h-4 bg-gray-800 rounded w-2/3"></div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6">
                        <p className="text-red-400">Error loading personas: {error.message}</p>
                    </div>
                )}

                {/* Personas Grid */}
                {!isLoading && !error && personas.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {personas.map((persona) => (
                            <PersonaCard
                                key={persona.persona_id}
                                persona={persona}
                                onClick={() => handlePersonaClick(persona)}
                            />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !error && personas.length === 0 && (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">👤</div>
                        <h3 className="text-2xl font-semibold text-gray-300 mb-2">No personas found</h3>
                        <p className="text-gray-500 mb-6">
                            Try adjusting your filters or search query
                        </p>
                    </div>
                )}
            </div>

            {/* Persona Detail Modal */}
            {selectedPersona && (
                <PersonaDetailModal
                    persona={selectedPersona}
                    isOpen={showDetailModal}
                    onClose={() => {
                        setShowDetailModal(false);
                        setSelectedPersona(null);
                    }}
                />
            )}
        </div>
    );
};

export default PersonasPage;
