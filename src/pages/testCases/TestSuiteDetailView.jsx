import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTestSuite, useUpdateTestSuite, useDeleteTestSuite, useTestSuiteSimulationSummary } from "../../hooks/useTestSuites";
import { usePersonas } from "../../hooks/usePersonas";
import { useTestProfiles } from "../../hooks/useTestProfiles";
import Button from "../../components/Button";
import Badge from "../../components/Badge";
import ConfirmationModal from "../../components/ConfirmationModal";
import TestCaseEditorModal from "../../components/TestCaseEditorModal";
import RunSimulationModal from "../../components/RunSimulationModal";
import { extractNoiseFromSessionId, getNoiseProfileBadgeVariant } from "../../utils/noiseUtils";

// ============ Helper Components ============

const IconButton = ({ icon, onClick, title, variant = 'default', className = '' }) => {
    const variants = {
        default: 'text-gray-400 hover:text-white',
        danger: 'text-gray-400 hover:text-red-400',
    };

    return (
        <button
            onClick={onClick}
            className={`p-2 rounded hover:bg-gray-700 transition-colors ${variants[variant]} ${className}`}
            title={title}
        >
            {icon}
        </button>
    );
};

const MetricCard = ({ label, value, valueClassName = 'text-2xl font-bold text-white' }) => (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">{label}</div>
        <div className={valueClassName}>{value}</div>
    </div>
);

const EditableField = ({ value, isEditing, onEdit, onSave, onCancel, placeholder, multiline = false }) => {
    const [tempValue, setTempValue] = useState(value);

    useEffect(() => {
        if (isEditing) {
            setTempValue(value);
        }
    }, [isEditing, value]);

    if (isEditing) {
        const Component = multiline ? 'textarea' : 'input';
        return (
            <div className={`flex flex-col gap-2 ${multiline ? 'w-full' : ''}`}>
                <Component
                    type={multiline ? undefined : "text"}
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    onKeyPress={(e) => !multiline && e.key === 'Enter' && onSave(tempValue)}
                    autoFocus
                    rows={multiline ? 3 : undefined}
                    className={`${multiline ? 'w-full resize-none' : 'text-4xl font-bold'} text-white bg-gray-800 border border-teal-400 rounded px-3 py-${multiline ? '2' : '1'} focus:outline-none`}
                />
                <div className="flex gap-2">
                    <Button 
                        size="sm" 
                        onClick={() => onSave(tempValue)}
                        className="h-8 py-0"
                    >
                        Save
                    </Button>
                    <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={onCancel}
                        className="h-8 py-0"
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`${multiline ? 'text-gray-400' : 'text-4xl font-bold text-white'} cursor-pointer hover:text-teal-400 transition-colors`}
            onClick={onEdit}
        >
            {value || placeholder}
        </div>
    );
};

const LoadingState = () => (
    <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mb-4"></div>
            <p className="text-gray-400">Loading test case...</p>
        </div>
    </div>
);

const ErrorState = ({ message, onBack }) => (
    <div className="p-8">
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6">
            <p className="text-red-400">Error loading test case: {message || "Not found"}</p>
            <Button className="mt-4" onClick={onBack}>
                Back to Test Cases
            </Button>
        </div>
    </div>
);

const EmptyState = () => (
    <div className="p-12 text-center">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-semibold text-gray-300 mb-2">No test cases yet</h3>
        <p className="text-gray-500 mb-6">Test cases will appear here once they are generated from your agent</p>
    </div>
);

const ActionButtons = ({ onEdit, onDelete }) => (
    <div className="flex items-center justify-end gap-2">
        <IconButton
            icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            }
            onClick={onEdit}
            title="Edit"
        />
        <IconButton
            icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            }
            onClick={onDelete}
            title="Delete"
            variant="danger"
        />
    </div>
);

// Helper function to format persona fields
const formatPersonaField = (value) => {
    if (!value) return value;
    return value
        .toString()
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};
// utils/formatters.js
export const formatLabel = (value) => {
  if (!value) return '-';

  return value
    .toString()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
};


const TestCaseExpandedDetails = ({ testCase }) => {
    // Extract noise info from session_id if available
    const noiseInfo = testCase.session_status?.session_id 
        ? extractNoiseFromSessionId(testCase.session_status.session_id)
        : null;

    return (
        <div className="space-y-6">
            {/* Session Info - Show noise and session ID if test was run */}
            {testCase.session_status && (
                <div className="rounded-lg p-4 border border-teal-500/20">
                    <h4 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Simulation Session
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-xs text-gray-500 mb-1">Session ID</div>
                            <div className="text-sm text-white font-mono">{testCase.session_status.session_id}</div>
                        </div>
                        {noiseInfo && noiseInfo.profile_id !== 'none' && (
                            <div>
                                <div className="text-xs text-gray-500 mb-1">Noise Environment</div>
                                <Badge 
                                    variant={getNoiseProfileBadgeVariant(noiseInfo.profile_id)} 
                                    size="sm"
                                >
                                    <span className="flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m0 0a5 5 0 007.072 0" />
                                        </svg>
                                        {noiseInfo.displayName}
                                    </span>
                                </Badge>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Goal and Description */}
            {(testCase.goal || testCase.description) && (
                <div className="grid grid-cols-1 gap-4">
                    {testCase.goal && (
                        <div>
                            <h4 className="text-sm font-semibold text-teal-400 mb-2 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Goal
                            </h4>
                            <div className="bg-gray-800/30 rounded p-4 text-gray-300 text-sm">
                                {testCase.goal}
                            </div>
                        </div>
                    )}
                    {testCase.description && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                </svg>
                                Description
                            </h4>
                            <div className="bg-gray-800/30 rounded p-4 text-gray-300 text-sm">
                                {testCase.description}
                            </div>
                        </div>
                    )}
                </div>
            )}

        {/* Path Type and Steps Count */}
        <div className="grid grid-cols-3 gap-4">
            {testCase.path_type && (
                <div>
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Path Type</h4>
                    <Badge variant={testCase.path_type === 'happy_path' ? 'success' : testCase.path_type === 'edge_case' ? 'warning' : 'default'} size="md">
                        {testCase.path_type.replace('_', ' ')}
                    </Badge>
                </div>
            )}
            {testCase.steps && (
                <div>
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Total Steps</h4>
                    <div className="text-2xl font-bold text-white">{testCase.steps.length}</div>
                </div>
            )}
            {testCase.node_sequence && (
                <div>
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Flow Nodes</h4>
                    <div className="text-2xl font-bold text-white">{testCase.node_sequence.length}</div>
                </div>
            )}
        </div>

        {/* Node Sequence */}
        {testCase.node_sequence && testCase.node_sequence.length > 0 && (
            <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Conversation Flow
                </h4>
                <div className="bg-gray-800/30 rounded p-4">
                    <div className="flex flex-wrap gap-2">
                        {testCase.node_sequence.map((node, idx) => (
                            <div key={idx} className="flex items-center gap-1">
                                <Badge variant="info" size="sm">{formatLabel(node)}</Badge>
                                {idx < testCase.node_sequence.length - 1 && (
                                    <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}


        {/* Persona and Metrics */}
        <div className="grid grid-cols-2 gap-6">
            <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Persona</h4>
                {testCase.assigned_personas && testCase.assigned_personas.length > 0 ? (
                    <div className="space-y-2">
                        {testCase.assigned_personas.map((persona, idx) => (
                            <div key={idx} className="bg-gray-800/30 rounded p-3">
                                <div className="font-medium text-teal-400">{persona.name}</div>
                                <div className="text-sm text-gray-400 mt-1">
                                    {formatPersonaField(persona.region)} • {formatPersonaField(persona.age_group)} • {formatPersonaField(persona.gender)}
                                </div>
                                {persona.native_language && (
                                    <div className="text-xs text-gray-500 mt-1">
                                        Language: {formatPersonaField(persona.native_language)}
                                    </div>
                                )}
                                {persona.voice_profile && (
                                    <div className="mt-3 pt-3 border-t border-gray-800">
                                        <div className="text-xs font-semibold text-gray-400 mb-2">Voice Settings</div>
                                        <div className="flex items-center gap-3 flex-wrap">

                                            {persona.voice_profile.pitch !== undefined && (
                                                <div className="px-2 py-1 bg-gray-800 rounded text-xs">
                                                    <span className="text-gray-500">Pitch:</span>{' '}
                                                    <span className="text-white font-medium">{persona.voice_profile.pitch}</span>
                                                </div>
                                            )}
                                            {persona.voice_profile.pace !== undefined && (
                                                <div className="px-2 py-1 bg-gray-800 rounded text-xs">
                                                    <span className="text-gray-500">Pace:</span>{' '}
                                                    <span className="text-white font-medium">{persona.voice_profile.pace}x</span>
                                                </div>
                                            )}
                                            {persona.voice_profile.loudness !== undefined && (
                                                <div className="px-2 py-1 bg-gray-800 rounded text-xs">
                                                    <span className="text-gray-500">Loudness:</span>{' '}
                                                    <span className="text-white font-medium">{persona.voice_profile.loudness}</span>
                                                </div>
                                            )}
                                            <div className="px-2 py-1 bg-gray-800 rounded text-xs">
                                                <span className="text-gray-500">Interruption:</span>{' '}
                                                <span className={`${persona.behavior_traits?.interrupts_frequently ? 'text-teal-400' : 'text-white'} font-medium`}>
                                                    {persona.behavior_traits?.interrupts_frequently ? 'Yes' : 'No'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {/* Background Noise Profiles */}
                                {persona.background_noises && persona.background_noises.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gray-800">
                                        <div className="text-xs font-semibold text-gray-400 mb-2">Background Noise</div>
                                        <div className="flex flex-wrap gap-2">
                                            {persona.background_noises.map((noise, nIdx) => (
                                                <Badge key={nIdx} variant="info" size="sm">
                                                    {noise.profile_id} ({noise.snr_db}dB)
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-gray-500">No persona assigned</div>
                )}
            </div>

        </div>

        {/* Extra Instructions */}
        {testCase.extra_instructions && (
            <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Extra Instructions</h4>
                <div className="bg-gray-800/30 rounded p-4 text-gray-300 text-sm">
                    {testCase.extra_instructions}
                </div>
            </div>
        )}

        {/* Steps Summary */}
        {testCase.steps && testCase.steps.length > 0 && (
            <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Test Steps ({testCase.steps.length})
                </h4>
                <div className="bg-gray-800/30 rounded p-4 space-y-3 max-h-96 overflow-y-auto">
                    {testCase.steps.map((step, idx) => (
                        <div key={idx} className="border-l-2 border-teal-500 pl-4 py-2">
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant="info" size="sm">Step {step.step_number}</Badge>
                                <Badge variant="default" size="sm">{formatLabel(step.type)}</Badge>
                                {step.max_wait_ms != null && (
                                    <Badge variant="info" size="sm">
                                        Add Interruption
                                    </Badge>
                                )}
                            </div>
                            {step.utterance && (
                                <div className="text-sm text-gray-300 mt-2">
                                    <span className="text-gray-500">Utterance:</span> {step.utterance}
                                </div>
                            )}
                            {step.expected_response && (
                                <div className="text-sm text-gray-400 mt-1">
                                    <span className="text-gray-500">Expected Response:</span> {step.expected_response}
                                </div>
                            )}
                            {step.expected_action && (
                                <div className="text-sm text-teal-400 mt-1">
                                    <span className="text-gray-500">Expected Action:</span> {step.expected_action}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
    );
};

// ============ Main Component ============

import { API_BASE_URL } from "../../config/constants";

const TestSuiteDetailView = () => {
    const { suiteId } = useParams();
    const navigate = useNavigate();

    const truncate = (str, n) => {
        return (str.length > n) ? str.substr(0, n - 1) + '...' : str;
    };

    const [editingName, setEditingName] = useState(false);
    const [editingDescription, setEditingDescription] = useState(false);
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [showTestCaseModal, setShowTestCaseModal] = useState(false);
    const [editingTestCase, setEditingTestCase] = useState(null);
    const [showRunSimulationModal, setShowRunSimulationModal] = useState(false);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        variant: 'danger',
        confirmText: 'Confirm'
    });

    // Fetch data
    const { data: suite, isLoading, error } = useTestSuite(suiteId);
    const { data: personasData } = usePersonas({ limit: 500 });
    const { data: profilesData } = useTestProfiles({ limit: 500 });

    // Mutations
    const updateSuite = useUpdateTestSuite();
    const deleteSuite = useDeleteTestSuite();

    // Simulation summary for status display
    const { data: simulationSummary } = useTestSuiteSimulationSummary(suiteId);


    const handleInlineEdit = async (field, value) => {
        try {
            await updateSuite.mutateAsync({
                id: suiteId,
                data: { [field]: value },
            });
            field === 'name' ? setEditingName(false) : setEditingDescription(false);
            toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated`);
        } catch (error) {
            // Error handled by global interceptor
        }
    };

    const handleDelete = async () => {
        setConfirmModal({
            isOpen: true,
            title: "Delete Test Case",
            message: "Are you sure you want to delete this test case?",
            confirmText: "Delete",
            variant: "danger",
                onConfirm: async () => {
                try {
                    await deleteSuite.mutateAsync(suiteId);
                    toast.success("Test case deleted successfully");
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                    navigate("/testing/test-cases");
                } catch (error) {
                    // Error handled by global interceptor
                }
            }
        });
    };

    const handleEditTestCase = (testCase) => {
        // Unpack metadata for the editor
        const unpackedTestCase = {
            ...testCase,
            ...(testCase.metadata || {}),
            test_case_id: testCase.test_case_id || testCase.id
        };
        setEditingTestCase(unpackedTestCase);
        setShowTestCaseModal(true);
    };

    const handleSaveTestCase = (testCaseData) => {
        // Close modal immediately and show progress toast
        setShowTestCaseModal(false);
        const isEditing = !!editingTestCase;
        const currentEditingCase = editingTestCase; // Store for the mutation
        setEditingTestCase(null);
        if (isEditing) {
            toast.info("Updating test case...");
        }

        // Pack fields into metadata for V2 compliance
        const v2TestCaseData = {
            ...testCaseData,
            metadata: {
                ...(testCaseData.metadata || {}),
                priority: testCaseData.priority,
                metrics: testCaseData.metrics,
                success_criteria: testCaseData.success_criteria,
                tags: testCaseData.tags,
                extra_instructions: testCaseData.extra_instructions,
            }
        };

        if (isEditing) {
            // Update existing test case
            const updatedTestCases = testCases.map(tc =>
                (tc.test_case_id === currentEditingCase.test_case_id) ? { ...tc, ...v2TestCaseData } : tc
            );
            updateSuite.mutate({
                id: suiteId,
                data: { test_cases: updatedTestCases },
            }, {
                onSuccess: () => toast.success("Test case updated"),
                onError: () => toast.error("Failed to update test case")
            });
        }
    };

    const handleDeleteTestCase = async (testCaseId) => {
        setConfirmModal({
            isOpen: true,
            title: "Delete Test Case",
            message: "Are you sure you want to delete this test case?",
            confirmText: "Delete",
            variant: "danger",
            onConfirm: async () => {
                try {
                    const updatedTestCases = testCases.filter(tc => (tc.test_case_id || tc.id) !== testCaseId);
                    await updateSuite.mutateAsync({
                        id: suiteId,
                        data: { test_cases: updatedTestCases },
                    });
                    toast.success("Test case deleted");
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                } catch (error) {
                    // Error handled by global interceptor
                }
            }
        });
    };

    const toggleRow = (rowId) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(rowId)) {
            newExpanded.delete(rowId);
        } else {
            newExpanded.add(rowId);
        }
        setExpandedRows(newExpanded);
    };

    if (isLoading) {
        return <LoadingState />;
    }


    if (error || !suite) {
        return <ErrorState message={error?.message} onBack={() => navigate("/testing/test-cases")} />;
    }


    const testCases = suite.test_cases || [];

    return (
        <div className="p-8">
            <div className="w-full max-w-screen-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <button
                            onClick={() => navigate("/testing/test-cases")}
                            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        <EditableField
                            value={suite.name}
                            isEditing={editingName}
                            onEdit={() => setEditingName(true)}
                            onSave={(value) => handleInlineEdit('name', value)}
                            onCancel={() => setEditingName(false)}
                            placeholder="Test Case Name"
                        />


                        {/* Simulation Status Badge */}
                        <div className="flex items-center gap-3">
                            {simulationSummary ? (
                                simulationSummary.total_runs === 0 ? (
                                    <Badge variant="default" size="md">Not Tested</Badge>
                                ) : simulationSummary.has_active_simulation ? (
                                    <Badge variant="warning" size="md">
                                        <span className="flex items-center gap-1">
                                            <span className="animate-pulse">●</span> Running...
                                        </span>
                                    </Badge>
                                ) : simulationSummary.last_run?.status === 'completed' ? (
                                    <Badge
                                        variant={simulationSummary.last_run.failed === 0 ? 'success' : 'warning'}
                                        size="md"
                                    >
                                        {simulationSummary.last_run.completed}/{simulationSummary.last_run.total_sessions} Passed
                                        {simulationSummary.last_run.total_sessions > 0 && ` (${Math.round((simulationSummary.last_run.completed / simulationSummary.last_run.total_sessions) * 100)}%)`}
                                    </Badge>
                                ) : simulationSummary.last_run?.status === 'failed' ? (
                                    <Badge variant="danger" size="md">Last Run Failed</Badge>
                                ) : (
                                    <Badge variant="default" size="md">{simulationSummary.last_run?.status || 'Unknown'}</Badge>
                                )
                            ) : (
                                <Badge variant="default" size="md">Loading...</Badge>
                            )}
                            {simulationSummary?.total_runs > 0 && (
                                <span className="text-xs text-gray-500">
                                    {simulationSummary.total_runs} run{simulationSummary.total_runs > 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                    </div>

                    <EditableField
                        value={suite.description}
                        isEditing={editingDescription}
                        onEdit={() => setEditingDescription(true)}
                        onSave={(value) => handleInlineEdit('description', value)}
                        onCancel={() => setEditingDescription(false)}
                        placeholder="Click to add description..."
                        multiline
                    />


                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-6">
                        <Button
                            variant="premium"
                            onClick={() => setShowRunSimulationModal(true)}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Run Simulation
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => window.open(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'}/test-suites/${suiteId}/export?format=json`, '_blank')}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Export
                        </Button>
                        <IconButton
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            }
                            onClick={handleDelete}
                            title="Delete"
                            variant="danger"
                        />
                    </div>
                </div>

                {/* Metrics Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <MetricCard label="Total Test Cases" value={testCases.length} />
                    <MetricCard
                        label="Owner"
                        value={suite.owner || 'Unassigned'}
                        valueClassName="text-xl font-semibold text-teal-400"
                    />
                    <MetricCard
                        label="Created"
                        value={new Date(suite.created_at).toLocaleDateString()}
                        valueClassName="text-xl font-semibold text-white"
                    />
                    <MetricCard
                        label="Last Updated"
                        value={new Date(suite.updated_at).toLocaleDateString()}
                        valueClassName="text-xl font-semibold text-white"
                    />
                </div>


                {/* Test Cases Table */}
                <div className="bg-dark-panel rounded-xl overflow-hidden border border-gray-800/50 shadow-2xl">
                    <div className="p-6 border-b border-gray-800/50">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Test Cases</h2>
                        </div>
                    </div>

                    {testCases.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-900/50 text-gray-400 text-xs font-semibold border-b border-gray-800/50">
                                        <th className="px-4 py-3 w-12"></th>
                                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Name / ID</th>
                                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-gray-300">
                                    {testCases.map((testCase, index) => (
                                        <>
                                            <tr
                                                key={testCase.test_case_id || index}
                                                className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors group cursor-pointer"
                                                onClick={() => toggleRow(testCase.test_case_id || index)}
                                            >
                                                <td className="px-4 py-3">
                                                    <svg
                                                        className={`w-4 h-4 text-gray-500 transition-transform ${expandedRows.has(testCase.test_case_id || index) ? 'rotate-90' : ''}`}
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="font-medium text-white">{testCase.name || 'Untitled Case'}</div>
                                                    <div className="text-sm text-gray-500">{truncate(testCase.test_case_id || `TC-${index + 1}`, 12)}</div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        {testCase.session_status ? (
                                                            testCase.session_status.status === 'completed' ? (
                                                                <Badge variant="success" size="sm">Passed</Badge>
                                                            ) : testCase.session_status.status === 'failed' ? (
                                                                <Badge variant="danger" size="sm">Failed</Badge>
                                                            ) : testCase.session_status.status === 'running' ? (
                                                                <Badge variant="warning" size="sm">
                                                                    <span className="flex items-center gap-1">
                                                                        <span className="animate-pulse">●</span> Running
                                                                    </span>
                                                                </Badge>
                                                            ) : testCase.session_status.status === 'queued' ? (
                                                                <Badge variant="info" size="sm">Queued</Badge>
                                                            ) : testCase.session_status.status === 'timeout' ? (
                                                                <Badge variant="danger" size="sm">Timeout</Badge>
                                                            ) : (
                                                                <Badge variant="default" size="sm">{testCase.session_status.status}</Badge>
                                                            )
                                                        ) : (
                                                            <Badge variant="default" size="sm">Not Tested</Badge>
                                                        )}
                                                        {/* Display noise profile if present in session_id */}
                                                        {testCase.session_status?.session_id && (() => {
                                                            const noiseInfo = extractNoiseFromSessionId(testCase.session_status.session_id);
                                                            return noiseInfo && noiseInfo.profile_id !== 'none' ? (
                                                                <Badge 
                                                                    variant={getNoiseProfileBadgeVariant(noiseInfo.profile_id)} 
                                                                    size="sm"
                                                                    className="text-xs"
                                                                >
                                                                    <span className="flex items-center gap-1">
                                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m0 0a5 5 0 007.072 0" />
                                                                        </svg>
                                                                        {noiseInfo.displayName}
                                                                    </span>
                                                                </Badge>
                                                            ) : null;
                                                        })()}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <ActionButtons
                                                        onEdit={(e) => {
                                                            e.stopPropagation();
                                                            handleEditTestCase(testCase);
                                                        }}
                                                        onDelete={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteTestCase(testCase.test_case_id);
                                                        }}
                                                    />
                                                </td>

                                            </tr>

                                            {/* Expanded Row */}
                                            {expandedRows.has(testCase.test_case_id || index) && (
                                                <tr className="border-t border-gray-800 bg-gray-800/20">
                                                    <td colSpan="4" className="px-4 py-6">
                                                        <TestCaseExpandedDetails testCase={testCase} />
                                                    </td>
                                                </tr>
                                            )}

                                        </>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Test Case Editor Modal */}
            <TestCaseEditorModal
                isOpen={showTestCaseModal}
                onClose={() => {
                    setShowTestCaseModal(false);
                    setEditingTestCase(null);
                }}
                onSave={handleSaveTestCase}
                testCase={editingTestCase}
                personas={personasData?.personas || []}
                profiles={profilesData?.test_profiles || []}
            />

            {/* Run Simulation Modal */}
            <RunSimulationModal
                isOpen={showRunSimulationModal}
                onClose={() => setShowRunSimulationModal(false)}
                preSelectedTestSuiteId={suiteId}
                preSelectedAgentId={suite?.agent_id}
            />

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText}
                variant={confirmModal.variant}
                isLoading={updateSuite.isPending || deleteSuite.isPending}
            />
        </div>
    );
};

export default TestSuiteDetailView;