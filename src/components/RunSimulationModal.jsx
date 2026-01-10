import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { X, Play, AlertCircle } from 'lucide-react';
import { useAgents } from '../hooks/useAgents';
import { useTestSuites } from '../hooks/useTestSuites';
import { useRunSimulation } from '../hooks/useSimulations';
import { useBatchEvaluateSimulation } from '../hooks/useEvaluations';
import useBatchEvaluationMonitor from '../hooks/useBatchEvaluationMonitor';
import Button from './Button';
import Badge from './Badge';
import BatchEvaluationProgressModal from './BatchEvaluationProgressModal';

const RunSimulationModal = ({ isOpen, onClose, preSelectedTestSuiteId = null, preSelectedAgentId = null }) => {
    const [selectedAgentId, setSelectedAgentId] = useState(preSelectedAgentId || '');
    const [selectedTestSuiteId, setSelectedTestSuiteId] = useState(preSelectedTestSuiteId || '');
    const [phoneNumber, setPhoneNumber] = useState('');

    // Batch evaluation state
    const [evaluationTaskId, setEvaluationTaskId] = useState(null);
    const [currentSimulationId, setCurrentSimulationId] = useState(null);
    const [showEvaluationProgress, setShowEvaluationProgress] = useState(false);

    // Hooks
    const navigate = useNavigate();

    // Fetch agents and test suites
    const { data: agentsData, isLoading: agentsLoading } = useAgents();
    const { data: testSuitesData, isLoading: testSuitesLoading } = useTestSuites({
        agent_id: selectedAgentId || undefined
    });

    const runSimulation = useRunSimulation();
    const batchEvaluate = useBatchEvaluateSimulation();

    // Monitor batch evaluation progress
    const { status, progress, result, error } = useBatchEvaluationMonitor(
        evaluationTaskId,
        currentSimulationId,
        {
            autoRedirect: true,
            showToasts: true
        }
    );

    const agents = agentsData?.agents || [];
    const testSuites = testSuitesData?.test_suites || [];

    // Find selected items
    const selectedAgent = agents.find(a => a.agent_id === selectedAgentId);
    const selectedTestSuite = testSuites.find(ts => ts.test_suite_id === selectedTestSuiteId);

    // Auto-fill phone number from selected agent
    useEffect(() => {
        if (selectedAgent?.phoneNumber) {
            setPhoneNumber(selectedAgent.phoneNumber);
        }
    }, [selectedAgent]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedTestSuiteId || !phoneNumber) {
            toast.warning('Please select a test suite and enter a phone number');
            return;
        }

        try {
            // Start the simulation
            const simulationResult = await runSimulation.mutateAsync({
                test_suite_id: selectedTestSuiteId,
                phone_number: phoneNumber,
                agent_id: selectedAgentId || undefined,
                metadata: {
                    agent_name: selectedAgent?.agent_name,
                    test_suite_name: selectedTestSuite?.name,
                    started_from: 'modal'
                }
            });

            const simulationId = simulationResult.simulation_id;

            toast.success('Simulation started successfully!');
            console.log('🚀 Simulation started:', simulationId);

            // Close the modal
            onClose();

            // Navigate to simulation detail page
            navigate(`/simulation/runs/${simulationId}`);

        } catch (error) {
            console.error('Error starting simulation:', error);
            // Error handled by global interceptor
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Run New Simulation</h2>
                        <p className="text-gray-400 text-sm mt-1">
                            Execute test suite against your voice agent
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Agent Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Select Agent
                        </label>
                        <select
                            value={selectedAgentId}
                            onChange={(e) => setSelectedAgentId(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-400"
                            disabled={agentsLoading}
                        >
                            <option value="">Choose an agent...</option>
                            {agents.map(agent => (
                                <option key={agent.agent_id} value={agent.agent_id}>
                                    {agent.agent_name || agent.agent_id} ({agent.platform})
                                </option>
                            ))}
                        </select>
                        {selectedAgent && (
                            <div className="mt-2 p-3 bg-gray-800/50 rounded-lg">
                                <div className="flex items-center gap-2 text-sm">
                                    <Badge variant="info">{selectedAgent.platform}</Badge>
                                    {selectedAgent.phoneNumber && (
                                        <span className="text-gray-400">
                                            {selectedAgent.phoneNumber}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Test Suite Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Select Test Suite
                        </label>
                        <select
                            value={selectedTestSuiteId}
                            onChange={(e) => setSelectedTestSuiteId(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-400"
                            disabled={testSuitesLoading || !selectedAgentId}
                        >
                            <option value="">
                                {selectedAgentId ? 'Choose a test suite...' : 'Select an agent first...'}
                            </option>
                            {testSuites.map(suite => (
                                <option key={suite.test_suite_id} value={suite.test_suite_id}>
                                    {suite.name} ({suite.metadata?.total_cases || 0} test cases)
                                </option>
                            ))}
                        </select>

                        {selectedTestSuite && (
                            <div className="mt-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-semibold text-white">{selectedTestSuite.name}</h4>
                                    <Badge variant={selectedTestSuite.status === 'ready' ? 'success' : 'default'}>
                                        {selectedTestSuite.status}
                                    </Badge>
                                </div>
                                {selectedTestSuite.description && (
                                    <p className="text-sm text-gray-400 mb-2">
                                        {selectedTestSuite.description}
                                    </p>
                                )}
                                <div className="flex items-center gap-4 text-sm">
                                    <span className="text-gray-500">
                                        Test Cases: <span className="text-teal-400 font-medium">
                                            {selectedTestSuite.metadata?.total_cases || selectedTestSuite.test_cases?.length || 0}
                                        </span>
                                    </span>
                                    {selectedTestSuite.metadata?.generated_from_flow && (
                                        <Badge variant="info" size="sm">
                                            Generated from Flow
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="+1234567890"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-400"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Phone number to test the agent (automatically filled from selected agent)
                        </p>
                    </div>

                    {/* Warning if suite not ready */}
                    {selectedTestSuite && selectedTestSuite.status !== 'ready' && (
                        <div className="p-4 bg-yellow-900/20 border border-yellow-500/50 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-yellow-400 font-medium text-sm">
                                    Test suite is not marked as ready
                                </p>
                                <p className="text-yellow-200/70 text-xs mt-1">
                                    You can still run it, but results may not be optimal.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            type="button"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={!selectedTestSuiteId || !phoneNumber || runSimulation.isPending}
                            className="flex items-center gap-2"
                        >
                            <Play className="w-4 h-4" />
                            {runSimulation.isPending ? 'Starting Simulation...' : 'Run Simulation'}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Batch Evaluation Progress Modal */}
            <BatchEvaluationProgressModal
                isOpen={showEvaluationProgress}
                onClose={() => setShowEvaluationProgress(false)}
                status={status}
                progress={progress}
                result={result}
                error={error}
                simulationId={currentSimulationId}
            />
        </div>
    );
};

export default RunSimulationModal;
