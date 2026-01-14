import React, { useState, useMemo } from "react";
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { usePersonasLibrary } from "../../hooks/usePersonasLibrary";
import PersonaCard from "./PersonaCard";
import PersonaDetailModal from "./PersonaDetailModal";
import Button from "../../components/Button";
import GenericDropdown from "../../components/DropDown";

const PersonasPage = () => {
    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [regionFilter, setRegionFilter] = useState(null);
    const [languageFilter, setLanguageFilter] = useState(null);
    const [ageGroupFilter, setAgeGroupFilter] = useState(null);
    const [genderFilter, setGenderFilter] = useState(null);
    const [hasNoiseFilter, setHasNoiseFilter] = useState(null);

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
        has_noise: hasNoiseFilter,
    });

    const personas = data?.personas || [];
    const regions = data?.regions || [];
    const languages = data?.languages || [];

    // Filter Options
    const regionOptions = useMemo(() => [
        { label: "All", value: "" },
        ...regions.map(r => ({ label: r.replace('_', ' ').toUpperCase(), value: r }))
    ], [regions]);

    const languageOptions = useMemo(() => [
        { label: "All", value: "" },
        ...languages.map(l => ({ label: l.charAt(0).toUpperCase() + l.slice(1), value: l }))
    ], [languages]);

    const ageOptions = [
        { label: "All", value: "" },
        { label: "Young Adult", value: "young_adult" },
        { label: "Middle Aged", value: "middle_aged" },
        { label: "Senior", value: "senior" }
    ];

    const genderOptions = [
        { label: "All", value: "" },
        { label: "Male", value: "male" },
        { label: "Female", value: "female" }
    ];

    const noiseOptions = [
        { label: "All", value: "" },
        { label: "With Noise", value: "true" },
        { label: "Without Noise", value: "false" }
    ];

    const handlePersonaClick = (persona) => {
        setSelectedPersona(persona);
        setShowDetailModal(true);
    };

    return (
        <div className="p-8 bg-dark-bg min-h-screen text-white">
            <div className="w-full max-w-screen-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Personas Library</h1>
                    <p className="text-gray-400">Pre-configured user personas for realistic testing scenarios</p>
                </div>

                {/* Header Controls */}
                <div className="flex flex-col gap-6 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <input
                                    type="text"
                                    placeholder="Search personas..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-dark-panel border border-gray-800 rounded-lg py-3 px-5 text-base focus:outline-none focus:border-teal-500 transition-colors text-white placeholder-gray-500"
                                />
                            </div>
                            <button className="bg-dark-panel border border-gray-800 text-white px-8 py-3 rounded-lg text-base font-semibold hover:bg-gray-800 transition-colors shadow-lg">
                                Search
                            </button>
                        </div>

                        {(searchQuery || regionFilter || languageFilter || ageGroupFilter || genderFilter || hasNoiseFilter !== null) && (
                            <button
                                onClick={() => {
                                    setSearchQuery("");
                                    setRegionFilter(null);
                                    setLanguageFilter(null);
                                    setAgeGroupFilter(null);
                                    setGenderFilter(null);
                                    setHasNoiseFilter(null);
                                }}
                                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
                            >
                                <X className="w-4 h-4" />
                                Clear All Filters
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {/* Region Filter */}
                        <div className="flex items-center gap-2 bg-dark-panel border border-gray-800 rounded-lg px-4 py-2 w-56">
                            <span className="text-gray-500 text-sm font-medium whitespace-nowrap">Region:</span>
                            <GenericDropdown
                                options={regionOptions}
                                value={regionFilter || ""}
                                onChange={(val) => setRegionFilter(val || null)}
                                className="flex-1"
                            />
                        </div>

                        {/* Language Filter */}
                        <div className="flex items-center gap-2 bg-dark-panel border border-gray-800 rounded-lg px-4 py-2 w-56">
                            <span className="text-gray-500 text-sm font-medium whitespace-nowrap">Language:</span>
                            <GenericDropdown
                                options={languageOptions}
                                value={languageFilter || ""}
                                onChange={(val) => setLanguageFilter(val || null)}
                                className="flex-1"
                            />
                        </div>

                        {/* Age Group Filter */}
                        <div className="flex items-center gap-2 bg-dark-panel border border-gray-800 rounded-lg px-4 py-2 w-44">
                            <span className="text-gray-500 text-sm font-medium whitespace-nowrap">Age:</span>
                            <GenericDropdown
                                options={ageOptions}
                                value={ageGroupFilter || ""}
                                onChange={(val) => setAgeGroupFilter(val || null)}
                                className="flex-1"
                            />
                        </div>

                        {/* Gender Filter */}
                        <div className="flex items-center gap-2 bg-dark-panel border border-gray-800 rounded-lg px-4 py-2 w-44">
                            <span className="text-gray-500 text-sm font-medium whitespace-nowrap">Gender:</span>
                            <GenericDropdown
                                options={genderOptions}
                                value={genderFilter || ""}
                                onChange={(val) => setGenderFilter(val || null)}
                                className="flex-1"
                            />
                        </div>

                        {/* Noise Filter */}
                        <div className="flex items-center gap-2 bg-dark-panel border border-gray-800 rounded-lg px-4 py-2 w-48">
                            <span className="text-gray-500 text-sm font-medium whitespace-nowrap">Noise:</span>
                            <GenericDropdown
                                options={noiseOptions}
                                value={hasNoiseFilter === null ? "" : String(hasNoiseFilter)}
                                onChange={(val) => setHasNoiseFilter(val === "" || val === null ? null : val === "true")}
                                className="flex-1"
                            />
                        </div>
                    </div>
                </div>

                {/* Results Count */}
                <div className="mb-6 flex items-center justify-between">
                    <p className="text-gray-400">
                        Showing <span className="text-teal-400 font-semibold">{personas.length}</span> of{" "}
                        <span className="text-gray-400 font-semibold">{data?.total_library || 0}</span> personas
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
