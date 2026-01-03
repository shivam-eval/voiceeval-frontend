import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTestSuite, useUpdateTestSuite, useDeleteTestSuite, useAddTestCase, useCloneTestSuite, useUpdateTestSuiteStatus } from "../../hooks/useTestSuites";
import { usePersonas } from "../../hooks/usePersonas";
import { useTestProfiles } from "../../hooks/useTestProfiles";
import { testSuitesApi } from "../../utils/api";
import Button from "../../components/Button";
import Badge from "../../components/Badge";
import TestCaseEditorModal from "../../components/TestCaseEditorModal";

const TestSuiteDetailView = () => {
    const { suiteId } = useParams();
    const navigate = useNavigate();

    const [editingName, setEditingName] = useState(false);
    const [editingDescription, setEditingDescription] = useState(false);
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [showTestCaseModal, setShowTestCaseModal] = useState(false);
    const [editingTestCase, setEditingTestCase] = useState(null);

    // Fetch data
    const { data: suite, isLoading, error } = useTestSuite(suiteId);
    const { data: personasData } = usePersonas({ limit: 500 });
    const { data: profilesData } = useTestProfiles({ limit: 500 });

    // Mutations
    const updateSuite = useUpdateTestSuite();
    const deleteSuite = useDeleteTestSuite();
    const cloneSuite = useCloneTestSuite();
    const addTestCase = useAddTestCase();
    const updateStatus = useUpdateTestSuiteStatus();

    const handleStatusChange = async (newStatus) => {
        try {
            await updateStatus.mutateAsync({ id: suiteId, status: newStatus });
            toast.success(`Test suite status updated to ${newStatus}`);
        } catch (error) {
            // Handled by global interceptor
        }
    };

    const handleInlineEdit = async (field, value) => {
        try {
            await updateSuite.mutateAsync({
                id: suiteId,
                data: { [field]: value },
            });
            toast.success(`Test suite ${field} updated`);
            field === 'name' ? setEditingName(false) : setEditingDescription(false);
        } catch (error) {
            // Handled by global interceptor
        }
    };

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this test suite?")) {
            try {
                await deleteSuite.mutateAsync(suiteId);
                toast.success('Test suite deleted successfully');
                navigate("/test-cases");
            } catch (error) {
                // Handled by global interceptor
            }
        }
    };

    const handleClone = async () => {
        try {
            await cloneSuite.mutateAsync(suiteId);
            toast.success('Test suite cloned successfully');
        } catch (error) {
            // Handled by global interceptor
        }
    };

    const handleAddTestCase = () => {
        setEditingTestCase(null);
        setShowTestCaseModal(true);
    };

    const handleEditTestCase = (testCase) => {
        setEditingTestCase(testCase);
        setShowTestCaseModal(true);
    };

    const handleSaveTestCase = async (testCaseData) => {
        try {
            if (editingTestCase) {
                // Update existing test case
                const updatedTestCases = testCases.map(tc =>
                    tc.id === editingTestCase.id ? { ...tc, ...testCaseData } : tc
                );
                await updateSuite.mutateAsync({
                    id: suiteId,
                    data: { test_cases: updatedTestCases },
                });
            } else {
                // Add new test case
                await addTestCase.mutateAsync({
                    suiteId,
                    testCase: testCaseData,
                });
            }
            setShowTestCaseModal(false);
            setEditingTestCase(null);
            toast.success('Test case saved successfully');
        } catch (error) {
            // Handled by global interceptor
        }
    };

    const handleDeleteTestCase = async (testCaseId) => {
        if (confirm("Are you sure you want to delete this test case?")) {
            try {
                const updatedTestCases = testCases.filter(tc => tc.id !== testCaseId);
                await updateSuite.mutateAsync({
                    id: suiteId,
                    data: { test_cases: updatedTestCases },
                });
                toast.success('Test case deleted');
            } catch (error) {
                // Handled by global interceptor
            }
        }
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
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mb-4"></div>
                    <p className="text-gray-400">Loading test suite...</p>
                </div>
            </div>
        );
    }

    if (error || !suite) {
        return (
            <div className="p-8">
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6">
                    <p className="text-red-400">Error loading test suite: {error?.message || "Not found"}</p>
                    <Button className="mt-4" onClick={() => navigate("/test-cases")}>
                        Back to Test Sets
                    </Button>
                </div>
            </div>
        );
    }

    const testCases = suite.test_cases || [];

    return (
        <div className="p-8">
            <div className="w-full max-w-screen-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <button
                            onClick={() => navigate("/test-cases")}
                            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        {editingName ? (
                            <input
                                type="text"
                                defaultValue={suite.name}
                                onBlur={(e) => handleInlineEdit('name', e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleInlineEdit('name', e.target.value)}
                                autoFocus
                                className="text-4xl font-bold text-white bg-gray-800 border border-teal-400 rounded px-3 py-1 focus:outline-none"
                            />
                        ) : (
                            <h1
                                className="text-4xl font-bold text-white cursor-pointer hover:text-teal-400 transition-colors"
                                onClick={() => setEditingName(true)}
                            >
                                {suite.name}
                            </h1>
                        )}

                        <div className="flex items-center gap-3">
                            <Badge variant={suite.status === 'ready' ? 'success' : 'default'} size="md">
                                {suite.status}
                            </Badge>
                            <select
                                value={suite.status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-teal-400"
                            >
                                <option value="draft">Draft</option>
                                <option value="ready">Ready</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                    </div>

                    {editingDescription ? (
                        <textarea
                            defaultValue={suite.description || ''}
                            onBlur={(e) => handleInlineEdit('description', e.target.value)}
                            autoFocus
                            rows={2}
                            className="w-full text-gray-400 bg-gray-800 border border-teal-400 rounded px-3 py-2 focus:outline-none resize-none"
                        />
                    ) : (
                        <p
                            className="text-gray-400 cursor-pointer hover:text-teal-400 transition-colors"
                            onClick={() => setEditingDescription(true)}
                        >
                            {suite.description || 'Click to add description...'}
                        </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-6">
                        <Button
                            size="sm"
                            onClick={() => navigate(`/simulation/evaluator?test_suite_id=${suiteId}`)}
                            className="bg-teal-500 hover:bg-teal-600"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Run Simulation
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleAddTestCase}>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Test Case
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/api/v1/test-suites/${suiteId}/export?format=json`, '_blank')}
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Export
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleClone}>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Clone
                        </Button>
                        <Button size="sm" variant="danger" onClick={handleDelete}>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Metrics Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                        <div className="text-gray-400 text-sm mb-1">Total Test Cases</div>
                        <div className="text-3xl font-bold text-white">{testCases.length}</div>
                    </div>
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                        <div className="text-gray-400 text-sm mb-1">Owner</div>
                        <div className="text-xl font-semibold text-teal-400">{suite.owner || 'Unassigned'}</div>
                    </div>
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                        <div className="text-gray-400 text-sm mb-1">Created</div>
                        <div className="text-xl font-semibold text-white">
                            {new Date(suite.created_at).toLocaleDateString()}
                        </div>
                    </div>
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                        <div className="text-gray-400 text-sm mb-1">Last Updated</div>
                        <div className="text-xl font-semibold text-white">
                            {new Date(suite.updated_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>

                {/* Test Cases Table */}
                <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                    <div className="p-6 border-b border-gray-800">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-white">Test Cases</h2>
                            <Button size="sm" onClick={handleAddTestCase}>
                                Generate from Agent
                            </Button>
                        </div>
                    </div>

                    {testCases.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="text-6xl mb-4">📝</div>
                            <h3 className="text-xl font-semibold text-gray-300 mb-2">No test cases yet</h3>
                            <p className="text-gray-500 mb-6">Get started by adding test cases or generating them from your agent</p>
                            <div className="flex items-center justify-center gap-4">
                                <Button onClick={handleAddTestCase}>Add Test Case</Button>
                                <Button variant="outline" onClick={handleAddTestCase}>Generate from Agent</Button>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-800/50">
                                    <tr>
                                        <th className="w-8 px-4 py-3"></th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">ID / Name</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Type</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Input</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Expected Output</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {testCases.map((testCase, index) => (
                                        <>
                                            <tr
                                                key={testCase.id || index}
                                                className="border-t border-gray-800 hover:bg-gray-800/30 cursor-pointer transition-colors"
                                                onClick={() => toggleRow(testCase.id || index)}
                                            >
                                                <td className="px-4 py-4">
                                                    <svg
                                                        className={`w-5 h-5 text-gray-500 transition-transform ${expandedRows.has(testCase.id || index) ? 'rotate-90' : ''}`}
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="font-medium text-white">{testCase.id || `TC-${index + 1}`}</div>
                                                    {testCase.name && (
                                                        <div className="text-sm text-gray-500">{testCase.name}</div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <Badge variant="info" size="sm">{testCase.type || 'scenario'}</Badge>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="text-gray-300 truncate max-w-xs">
                                                        {testCase.input || '-'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="text-gray-300 truncate max-w-xs">
                                                        {testCase.expected_output || '-'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <Badge variant={testCase.status === 'ready' ? 'success' : 'default'} size="sm">
                                                        {testCase.status || 'draft'}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEditTestCase(testCase);
                                                            }}
                                                            className="p-2 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                                                            title="Edit"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteTestCase(testCase.id);
                                                            }}
                                                            className="p-2 rounded hover:bg-gray-700 text-gray-400 hover:text-red-400 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* Expanded Row */}
                                            {expandedRows.has(testCase.id || index) && (
                                                <tr className="border-t border-gray-800 bg-gray-800/20">
                                                    <td colSpan="7" className="px-4 py-6">
                                                        <div className="grid grid-cols-2 gap-6">
                                                            <div>
                                                                <h4 className="text-sm font-semibold text-gray-400 mb-2">Full Input</h4>
                                                                <div className="bg-gray-900 rounded p-4 text-gray-300 text-sm">
                                                                    {testCase.input || 'No input specified'}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-sm font-semibold text-gray-400 mb-2">Expected Output</h4>
                                                                <div className="bg-gray-900 rounded p-4 text-gray-300 text-sm">
                                                                    {testCase.expected_output || 'No expected output specified'}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-sm font-semibold text-gray-400 mb-2">Persona</h4>
                                                                {testCase.assigned_personas && testCase.assigned_personas.length > 0 ? (
                                                                    <div className="space-y-2">
                                                                        {testCase.assigned_personas.map((persona, idx) => (
                                                                            <div key={idx} className="bg-gray-900 rounded p-3">
                                                                                <div className="font-medium text-teal-400">{persona.name}</div>
                                                                                <div className="text-sm text-gray-400 mt-1">
                                                                                    {persona.region} • {persona.age_group} • {persona.gender}
                                                                                </div>
                                                                                <div className="text-xs text-gray-500 mt-1">
                                                                                    Match: {(persona.confidence_score * 100).toFixed(0)}%
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-gray-500">No persona assigned</div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <h4 className="text-sm font-semibold text-gray-400 mb-2">Metrics</h4>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {testCase.metrics?.length > 0 ? (
                                                                        testCase.metrics.map((metric, idx) => (
                                                                            <Badge key={idx} variant="default" size="sm">{metric}</Badge>
                                                                        ))
                                                                    ) : (
                                                                        <span className="text-gray-500">No metrics configured</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {testCase.extra_instructions && (
                                                                <div className="col-span-2">
                                                                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Extra Instructions</h4>
                                                                    <div className="bg-gray-900 rounded p-4 text-gray-300 text-sm">
                                                                        {testCase.extra_instructions}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
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
        </div>
    );
};

export default TestSuiteDetailView;
