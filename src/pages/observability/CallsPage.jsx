import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AudioUploadModal from '../../components/AudioUploadModal';
import BolnaImportModal from '../../components/BolnaImportModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useCalls, useEvaluateCall, useUploadCalls, useCallCategories, useEvaluateAudio, useDeleteCall } from '../../hooks/useCalls';
import { useFlows } from '../../hooks/useFlows';
import { useAgents } from '../../hooks/useAgents';
import { useWorkflow } from '../../context/WorkFlowContext';
import { useEvents } from '../../context/EventsContext';
import { useDiscoverKPIs, useNormalizedAgentKPIs, useAgentKPIsAggregated } from '../../hooks/useKPIs';
// Import modular components
import CallsPageHeader from './components/CallsPageHeader';
import CallsSearchBar from './components/CallsSearchBar';
import KPISection from './components/KPISection';
import AgentsTable from './components/AgentsTable';
import CallsTable from './components/CallsTable';
import Pagination from './components/Pagination';
import { EvaluateModal, KPIDiscoveryModal } from './components/CallsModals';
import AgentDirectoriesView from '../../components/AgentDirectoriesView';

const CallsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { workflow } = useWorkflow();
  const { subscribe } = useEvents();

  // Refs to persist page state across navigation
  const callsPageRef = useRef(1);
  const agentsPageRef = useRef(1);
  const directoryRef = useRef('');
  const viewModeRef = useRef('directories');

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBolnaImportOpen, setIsBolnaImportOpen] = useState(false);
  const [isEvaluateModalOpen, setIsEvaluateModalOpen] = useState(false);
  const [evalAgentId, setEvalAgentId] = useState(workflow?.assistantId || '');
  const [evalDirectory, setEvalDirectory] = useState('');
  const getSafePage = useCallback((value, fallback = 1) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }, []);

  const [agentsPage, setAgentsPage] = useState(() => getSafePage(searchParams.get('agentsPage'), 1));
  const agentsPerPage = 10;
  const [callsPage, setCallsPage] = useState(() => getSafePage(searchParams.get('callsPage'), 1));
  const callsPerPage = 10;
  const [showKPIs, setShowKPIs] = useState(true);
  const [discoveredKPIs, setDiscoveredKPIs] = useState(null);
  const [isDiscoveryModalOpen, setIsDiscoveryModalOpen] = useState(false);

  // KPI Filters State
  const [kpiFilters, setKpiFilters] = useState({});

  // Confirmation Modal State
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => { },
    isLoading: false
  });

  // URL params
  const directoryParam = searchParams.get('directory');
  const directory = directoryParam;
  const viewMode = searchParams.get('view') || 'directories';

  // Use aggregated KPIs hook with filters
  const { normalized, isLoading: isLoadingNormalizedKPIs } =
    useNormalizedAgentKPIs(directory, 30, {
      enabled: !!directory && Object.keys(kpiFilters).length === 0, // Use basic hook when no filters
    });

  // Use aggregated KPIs hook WITH filters when filters are active
  const {
    data: filteredKPIsData,
    isLoading: isLoadingFilteredKPIs
  } = useAgentKPIsAggregated(
    directory,
    null, // start_date
    null, // end_date
    null, // kpi_types
    kpiFilters, // filters
    {
      enabled: !!directory && Object.keys(kpiFilters).length > 0,
    }
  );

  // Determine which KPI data to use
  const activeKPIData = Object.keys(kpiFilters).length > 0 ? filteredKPIsData : normalized;
  const isLoadingKPIs = Object.keys(kpiFilters).length > 0 ? isLoadingFilteredKPIs : isLoadingNormalizedKPIs;

  // Track if this is the initial mount
  const isInitialMount = useRef(true);

  // Restore page state from URL params when component mounts
  useEffect(() => {
    const urlCallsPage = searchParams.get('callsPage');
    const urlAgentsPage = searchParams.get('agentsPage');
    
    if (urlCallsPage) {
      const page = getSafePage(urlCallsPage, 1);
      console.log('Restoring callsPage to:', page);
      setCallsPage(page);
      callsPageRef.current = page;
    }
    
    if (urlAgentsPage) {
      const page = getSafePage(urlAgentsPage, 1);
      setAgentsPage(page);
      agentsPageRef.current = page;
    }

    // Mark that initial mount is complete
    isInitialMount.current = false;
  }, []); // Only run on mount

  // Keep refs in sync with current state
  useEffect(() => {
    callsPageRef.current = callsPage;
    agentsPageRef.current = agentsPage;
    directoryRef.current = directory || '';
    viewModeRef.current = viewMode;
    console.log('State synced - callsPage:', callsPage, 'agentsPage:', agentsPage);
  }, [callsPage, agentsPage, directory, viewMode]);

  // Sync session storage with current directory
  useEffect(() => {
    if (directory) {
      sessionStorage.setItem('last_directory', directory);
    }
  }, [directory]);

  // Handle search debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400); // 400ms debounce
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const updateParams = useCallback((updates, replace = false) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      Object.entries(updates).forEach(([key, value]) => {
        if (value) next.set(key, value);
        else next.delete(key);
      });
      return next;
    }, { replace });
  }, [setSearchParams]);

  const handleAgentsPageChange = useCallback((page) => {
    setAgentsPage(page);
    agentsPageRef.current = page;
    updateParams({ agentsPage: String(page) });
    console.log('Updated agentsPage to:', page);
  }, [updateParams, agentsPage]);

  const handleCallsPageChange = useCallback((page) => {
    setCallsPage(page);
    callsPageRef.current = page;
    updateParams({ callsPage: String(page) });
  }, [updateParams, callsPage]);

  // Fetch data
  const { data: agentsData } = useAgents();
  const { data: categoriesData, isLoading: isCategoriesLoading, refetch: refetchCategories } = useCallCategories();

  // Build filters for calls query based on KPI filters
  const callsQueryFilters = useMemo(() => {
    if (Object.keys(kpiFilters).length === 0) return undefined;

    // Convert KPI filters to call query format
    return JSON.stringify(kpiFilters);
  }, [kpiFilters]);

  const { data, isLoading: isCallsLoading, error, refetch } = useCalls({
    category: directory,
    directory: directory,
    search: debouncedSearch,
    include_evaluations: true,
    filters: callsQueryFilters, // Pass filters to calls API
  }, {
    placeholderData: (previousData) => previousData,
  });

  // Fetch flows
  const { data: flowsData } = useFlows();
  const flowId = useMemo(() => {
    return flowsData?.flows?.[0]?.flow_id || null;
  }, [flowsData]);

  // Hook for discovering new KPIs
  const discoverKPIsMutation = useDiscoverKPIs();

  // Mutations
  const evaluateCall = useEvaluateCall();
  const evaluateAudio = useEvaluateAudio();
  const uploadCalls = useUploadCalls();
  const deleteCall = useDeleteCall();

  // Process categories - now backend returns only active agents
  const filteredCategories = useMemo(() => {
    // Backend now returns categories from database (active agents only)
    // Format: [{ id: "agent_id", name: "Agent Name", platform: "vapi", has_agent: true }]
    
    if (categoriesData?.categories && Array.isArray(categoriesData.categories)) {
      // Extract agent IDs from the new format
      return categoriesData.categories
        .filter(cat => cat.has_agent !== false) // Only show agents that exist
        .map(cat => cat.id)
        .filter(id => !!id && typeof id === 'string');
    }

    // Fallback: Try to get from agentsData if categories API fails
    if (agentsData?.agents && Array.isArray(agentsData.agents)) {
      return agentsData.agents
        .map(agent => agent.provider_agent_id || agent.agent_id)
        .filter(id => !!id && typeof id === 'string');
    }

    return [];
  }, [agentsData, categoriesData]);

  // Process calls
  const calls = useMemo(() => {
    if (!data) return [];

    let rawCalls = [];
    if (Array.isArray(data)) {
      rawCalls = data;
    } else if (data?.calls && Array.isArray(data.calls)) {
      rawCalls = data.calls;
    } else if (data?.data && Array.isArray(data.data)) {
      if (Array.isArray(data.data)) {
        rawCalls = data.data;
      } else if (data.data.calls && Array.isArray(data.data.calls)) {
        rawCalls = data.data.calls;
      } else if (data.data.items && Array.isArray(data.data.items)) {
        rawCalls = data.data.items;
      }
    } else if (data?.items && Array.isArray(data.items)) {
      rawCalls = data.items;
    } else if (data?.results && Array.isArray(data.results)) {
      rawCalls = data.results;
    }

    return rawCalls.filter(call => !!call);
  }, [data]);

  // Display agents with search - use enriched categories data
  const displayedAgents = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    
    // Use categoriesData which now has agent names already
    if (categoriesData?.categories && Array.isArray(categoriesData.categories)) {
      return categoriesData.categories
        .filter(cat => {
          if (cat.has_agent === false) return false; // Skip orphaned directories
          const name = cat.name || cat.id;
          return name.toLowerCase().includes(searchLower) || 
                 cat.id.toLowerCase().includes(searchLower);
        })
        .map(cat => cat.id);
    }
    
    // Fallback to filteredCategories
    return filteredCategories.filter(cat => {
      const agent = agentsData?.agents?.find(a => a.provider_agent_id === cat || a.agent_id === cat);
      const agentName = agent?.name || agent?.agent_name || `Agent ${cat.substring(0, 8)}`;
      return cat.toLowerCase().includes(searchLower) || agentName.toLowerCase().includes(searchLower);
    });
  }, [categoriesData, filteredCategories, agentsData, searchTerm]);

  // Agent options for dropdowns
  const agentOptions = useMemo(() => {
    const agents = agentsData?.agents || [];
    return agents.map(agent => ({
      label: `${agent.name} (${agent.provider_agent_id || agent.agent_id})`,
      value: agent.provider_agent_id || agent.agent_id,
      name: agent.name
    }));
  }, [agentsData]);

  // Current options for agent dropdown
  const currentOptions = useMemo(() => {
    // Use the new categories format from backend
    if (categoriesData?.categories && Array.isArray(categoriesData.categories)) {
      const options = categoriesData.categories
        .filter(cat => cat.has_agent !== false)
        .map(cat => ({
          label: cat.name || cat.id,
          value: cat.id,
          platform: cat.platform
        }));

      if (options.length === 0) {
        return [{ label: 'No Agents Available', value: '' }];
      }

      return options;
    }

    // Fallback to agentsData
    if (agentsData?.agents && Array.isArray(agentsData.agents)) {
      return agentsData.agents.map(agent => ({
        label: agent.name || agent.agent_name || agent.agent_id,
        value: agent.provider_agent_id || agent.agent_id,
        platform: agent.provider
      }));
    }

    return [{ label: 'No Agents Available', value: '' }];
  }, [categoriesData, agentsData]);

  // Handle KPI filter changes
  const handleKPIFilterChange = useCallback((filters) => {
    setKpiFilters(filters);
    setCallsPage(1); // Reset to first page when filters change

    // Show toast notification
    // No toast notification when KPI filters change
  }, []);

  // Event handlers
  const handleDiscoverKPIs = async () => {
    if (!directory) return;

    try {
      const result = await discoverKPIsMutation.mutateAsync({ agentId: directory, forceRefresh: true });
      setDiscoveredKPIs(result);
      setIsDiscoveryModalOpen(true);
      toast.success(`✨ KPI discovery completed! Found ${result?.schemas?.length || 0} metrics.`);
    } catch (error) {
      toast.error(`Failed to discover KPIs: ${error.message}`);
    }
  };

  const handleDirectoryClick = (dir) => {
    updateParams({ directory: dir, view: 'calls' });
    setSearchTerm('');
    setKpiFilters({}); // Clear filters when changing directory
  };

  const handleBackToDirectories = () => {
    sessionStorage.removeItem('last_directory');
    updateParams({ directory: '', view: 'directories' });
    setSearchTerm('');
    setKpiFilters({}); // Clear filters when going back
  };

  const handleRowClick = (call) => {
    const status = (call.status || '').toLowerCase();
    const processingStage = (call.processing_stage || '').toLowerCase();

    const evaluationId =
      call.evaluation?.evaluation_id ||
      call.evaluation?.evaluation?.evaluation_id ||
      call.evaluation_id ||
      (Array.isArray(call.evaluations) && call.evaluations[0]?.evaluation_id);

    const sessionId =
      call.session_id ||
      call.evaluation?.session_id ||
      call.evaluation?.evaluation?.session_id;

    if (evaluationId) {
      // Store current state in refs (persists across navigation)
      callsPageRef.current = callsPage;
      agentsPageRef.current = agentsPage;
      directoryRef.current = directory;
      viewModeRef.current = viewMode;
      
      // Add return parameters to URL for back navigation
      const returnParams = new URLSearchParams({
        returnTo: 'calls',
        directory: directory || '',
        callsPage: String(callsPage),
        agentsPage: String(agentsPage),
        view: viewMode
      });
      
      navigate(`/evaluations/report/${evaluationId}?isUploaded=true&${returnParams.toString()}`);
      return;
    }

    if (status === 'processing' || processingStage === 'transcribing' || processingStage === 'evaluating') {
      toast.info('🔄 Evaluation in progress. Please wait...', { autoClose: 3000 });
      return;
    }

    if (sessionId) {
      // Store current state in refs (persists across navigation)
      callsPageRef.current = callsPage;
      agentsPageRef.current = agentsPage;
      directoryRef.current = directory;
      viewModeRef.current = viewMode;
      
      // Add return parameters to URL for back navigation
      const returnParams = new URLSearchParams({
        returnTo: 'calls',
        directory: directory || '',
        callsPage: String(callsPage),
        agentsPage: String(agentsPage),
        view: viewMode
      });
      
      navigate(`/evaluations/session?sessionId=${sessionId}&isUploaded=true&${returnParams.toString()}`);
      return;
    }

    if (status === 'failed') {
      toast.warning('Previous evaluation failed. Retrying...', { autoClose: 2000 });
      handleEvaluate(call.call_id);
      return;
    }

    if (status === 'pending' || status === 'uploaded' || !call.agent_id) {
      if (!call.agent_id) {
        toast.error('No agent assigned to this call. Cannot evaluate.');
        return;
      }
      toast.info('Starting evaluation...', { autoClose: 2000 });
      handleEvaluate(call.call_id);
      return;
    }

    toast.info('🔄 Loading evaluation status...', { autoClose: 2000 });
  };

  const handleDownloadCall = (call) => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
    const downloadUrl = `${API_BASE_URL}/calls/${call.call_id}/download`;

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = call.filename || `call-${call.call_id}.mp3`;

    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'X-Tenant-ID': localStorage.getItem('tenantId') || '',
        }
      })
        .then(response => {
          if (!response.ok) throw new Error('Download failed');
          return response.blob();
        })
        .then(blob => {
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = call.filename || `call-${call.call_id}.mp3`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(blobUrl);
        })
        .catch(error => {
          console.error('Download error:', error);
          toast.error('Failed to download audio file');
        });
    } else {
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDeleteCall = (callId) => {
    setConfirmationModal({
      isOpen: true,
      title: "Delete Call",
      message: "Are you sure you want to delete this call? This action cannot be undone.",
      variant: "danger",
      confirmText: "Delete",
      onConfirm: async () => {
        setConfirmationModal(prev => ({ ...prev, isLoading: true }));
        try {
          const result = await deleteCall.mutateAsync(callId);
          setConfirmationModal(prev => ({ ...prev, isOpen: false }));

          if (result?.message && result.message.includes('No audio files found')) {
            toast.info(`Call record deleted, but no audio files were found to remove.`);
          } else {
            toast.success("Call and audio files deleted successfully");
          }

          refetch();
        } catch (error) {
          toast.error(`Failed to delete call: ${error.message || 'Unknown error'}`);
          setConfirmationModal(prev => ({ ...prev, isLoading: false }));
        }
      }
    });
  };

  const handleAddCalls = () => {
    setIsModalOpen(true);
  };

  const handleImportBolna = () => {
    setIsBolnaImportOpen(true);
  };

  const handleBolnaImportComplete = () => {
    refetch();
    refetchCategories();
  };

  const currentAgentName = useMemo(() => {
    if (!directory) return '';
    const opt = currentOptions.find((o) => o.value === directory);
    return opt?.label || '';
  }, [directory, currentOptions]);

  const handleEvaluate = async (targetCallId) => {
    try {
      if (targetCallId) {
        await evaluateCall.mutateAsync(targetCallId);
        toast.success(`Evaluation triggered for call ID: ${targetCallId}`);
      } else {
        handleEvaluateAll(directory);
      }
    } catch (error) {
      // Error handled by global interceptor
    }
  };

  const handleEvaluateAll = (targetDirectory) => {
    if (!targetDirectory) return;
    setEvalDirectory(targetDirectory);

    const defaultAgent = targetDirectory || workflow?.assistantId || '';
    setEvalAgentId(defaultAgent);

    setIsEvaluateModalOpen(true);
  };

  const submitEvaluate = () => {
    setIsEvaluateModalOpen(false);
    toast.info(`Initiating evaluation for calls in: audio/${evalDirectory}...`);

    evaluateAudio.mutate({
      gcp_folder_path: `audio/${evalDirectory}`,
      flow_id: flowId || undefined,
      agent_id: evalAgentId || undefined,
      skip_failures: true
    }, {
      onSuccess: () => {
        toast.success(`Evaluation started successfully for: audio/${evalDirectory}`);
      }
    });
  };

  const handleModalSubmit = async ({ files, agentId }) => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      formData.append('agent_id', agentId);

      await uploadCalls.mutateAsync({ formData, agentId });

      refetch();
      refetchCategories();

      updateParams({ directory: agentId, view: 'calls' }, true);
      setSearchTerm('');

      setIsModalOpen(false);
      toast.success('Calls uploaded successfully! Auto-evaluation started.');
    } catch (error) {
      // Error handled by global interceptor
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getMetricValue = useCallback((call, metricName) => {
    if (!call) return '--';

    const isLatency = metricName === 'avg_latency';
    const isSentiment = metricName === 'sentiment_score';
    const isIssues = metricName === 'issues_found';

    const formatScore = (score) => {
      if (score === undefined || score === null) return null;

      let numScore = typeof score === 'number' ? score : parseFloat(score);
      if (isNaN(numScore)) return null;

      if (isLatency) {
        const val = numScore > 100 ? numScore / 1000 : numScore;
        return val.toFixed(2) + 's';
      }

      if (isSentiment) {
        return numScore.toFixed(2);
      }

      if (isIssues) {
        return numScore.toString();
      }

      const val = numScore > 1 ? numScore : numScore * 100;
      return val.toFixed(1) + '%';
    };

    if (metricName === 'issues_found') {
      if (call.issues_found !== undefined) return call.issues_found;
      if (call.evaluation?.issues_found !== undefined) return call.evaluation.issues_found;
      if (Array.isArray(call.evaluation?.issues)) return call.evaluation.issues.length;
      return 0;
    }

    const mapping = {
      'overall_score': ['overall', 'overall_score', 'total_score', 'score'],
      'semantic_accuracy': ['accuracy', 'semantic_accuracy', 'transcription_accuracy', 'semantic'],
      'task_completion_rate': ['task_completion', 'completion', 'success_rate', 'sequential_task_accuracy', 'flow_path_coverage', 'task_completion_rate'],
      'audio_quality': ['audio', 'audio_quality', 'signal_to_noise', 'audio_quality_score'],
      'persona_score': ['persona', 'tone', 'voice_match', 'persona_score', 'tone_score'],
      'sentiment_score': ['sentiment', 'mood', 'sentiment_score'],
      'avg_latency': ['avg_latency', 'response_latency', 'latency', 'average_latency']
    };

    const aliases = mapping[metricName] || [metricName];
    const normalizedAliases = aliases.map(a => a.toLowerCase().replace(/_/g, ' '));

    const evalObj = call.evaluation?.evaluation || call.evaluation || (Array.isArray(call.evaluations) ? call.evaluations[0] : null);

    if (metricName === 'overall_score' && evalObj?.overall_score !== undefined && evalObj?.overall_score !== null) {
      return formatScore(evalObj.overall_score);
    }

    if (evalObj?.category_scores) {
      for (const cat of evalObj.category_scores) {
        if (!cat) continue;

        const catName = (cat.category || '').toLowerCase().replace(/_/g, ' ');
        if (normalizedAliases.includes(catName)) {
          return formatScore(cat.score);
        }

        const metrics = cat.metrics || cat.metric_results;
        if (Array.isArray(metrics)) {
          const metric = metrics.find(m => {
            if (!m || !m.name) return false;
            const mName = m.name.toLowerCase().replace(/_/g, ' ');
            return normalizedAliases.includes(mName);
          });
          if (metric) return formatScore(metric.score);
        }
      }
    }

    // Look in metric_results (primary source for detailed metrics)
    if (evalObj?.metric_results && Array.isArray(evalObj.metric_results)) {
      const result = evalObj.metric_results.find(m => {
        if (!m || !m.metric_name) return false;
        const name = m.metric_name.toLowerCase().replace(/_/g, ' ');
        return normalizedAliases.includes(name);
      });

      if (result) {
        // Special handling for latency - use average_ms from details
        if (isLatency && result.details?.average_ms) {
          return formatScore(result.details.average_ms);
        }
        // For other metrics, use score or value
        return formatScore(result.score !== undefined ? result.score : result.value);
      }
    }

    for (const alias of aliases) {
      if (evalObj && typeof evalObj === 'object') {
        if (evalObj[alias] !== undefined && evalObj[alias] !== null) {
          return formatScore(evalObj[alias]);
        }
        if (evalObj.metrics && !Array.isArray(evalObj.metrics) && evalObj.metrics[alias] !== undefined) {
          return formatScore(evalObj.metrics[alias]);
        }
      }

      if (call[alias] !== undefined && call[alias] !== null && typeof call[alias] !== 'object') {
        return formatScore(call[alias]);
      }

      if (call.metrics && call.metrics[alias] !== undefined && call.metrics[alias] !== null) {
        return formatScore(call.metrics[alias]);
      }
    }

    return '--';
  }, []);

  // Subscribe to SSE events
  useEffect(() => {
    const unsubscribe = subscribe('call_evaluation_update', (data) => {
      const { status, call_id, error, overall_score } = data;

      if (status === 'completed') {
        const scoreText = overall_score !== undefined ? ` (Score: ${Math.round(overall_score * 100)}%)` : '';
        toast.success(`✅ Evaluation completed for ${call_id}${scoreText}`, {
          autoClose: 4000,
          position: 'bottom-right'
        });
        refetch();
        refetchCategories();
      } else if (status === 'failed') {
        toast.error(`❌ Evaluation failed for ${call_id}: ${error || 'Unknown error'}`, {
          autoClose: 5000,
          position: 'bottom-right'
        });
        refetch();
        refetchCategories();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [subscribe, refetch, refetchCategories]);

  // Reset pagination
  useEffect(() => {
    // Skip on initial mount if we're restoring from URL
    if (isInitialMount.current) return;
    
    console.log('searchTerm changed, resetting agentsPage to 1');
    setAgentsPage(1);
  }, [searchTerm]);
useEffect(() => {
  if (isInitialMount.current) return;

  const urlCallsPage = searchParams.get('callsPage');
  const urlAgentsPage = searchParams.get('agentsPage');

  // Only reset if page NOT coming from URL
  if (!urlCallsPage) setCallsPage(1);
  if (!urlAgentsPage) setAgentsPage(1);

}, [viewMode, directory]);

 
  useEffect(() => {
    if (viewMode === 'calls' && directory) {
      refetch();
    }
  }, [viewMode, directory, refetch]);

  return (
    <div className="p-8 bg-dark-bg min-h-screen text-white">
      {/* Page Header */}
      <CallsPageHeader
        viewMode={viewMode}
        directory={directory}
        agentsData={agentsData}
        agentName={activeKPIData?.agentName}
        period={activeKPIData?.period}
        totalCalls={activeKPIData?.totalCalls}
        isLoading={isLoadingKPIs}
        onBackToDirectories={handleBackToDirectories}
      />

      {/* KPI Section with Filters */}
      {viewMode === 'calls' && directory && (
        <KPISection
          normalized={activeKPIData}
          isLoadingKPIs={isLoadingKPIs}
          onFilterChange={handleKPIFilterChange}
          agentId={directory}
        />
      )}

      {/* Render Agent Directories View or Calls View */}
      {viewMode === 'directories' ? (
        <AgentDirectoriesView 
          onAgentSelect={handleDirectoryClick}
          showHeader={true}
        />
      ) : (
        <>
          {/* Search Bar */}
          <CallsSearchBar
            viewMode={viewMode}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            directory={directory}
            currentOptions={currentOptions}
            onDirectoryChange={(val) =>
              updateParams({
                directory: val,
                callsPage: String(callsPage),
                agentsPage: String(agentsPage),
              })
            }
            onBackToDirectories={handleBackToDirectories}
            onEvaluateAll={handleEvaluateAll}
            onAddCalls={handleAddCalls}
            onImportBolna={handleImportBolna}
            isEvaluating={evaluateAudio.isPending || evaluateCall.isPending}
          />

          {/* Active Filters Indicator */}
          {Object.keys(kpiFilters).length > 0 && (
            <div className="mb-4 flex items-center gap-2 text-sm text-teal-400">
              <span>Filtering by {Object.keys(kpiFilters).length} metric{Object.keys(kpiFilters).length > 1 ? 's' : ''}</span>
              <button
                onClick={() => handleKPIFilterChange({})}
                className="text-xs underline hover:text-teal-300"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Table Container */}
          <div className="bg-dark-panel rounded-xl overflow-hidden border border-gray-800/50 shadow-2xl">
            <div className="overflow-x-auto custom-scrollbar">
              <CallsTable
                calls={calls}
                isCallsLoading={isCallsLoading}
                error={error}
                callsPage={callsPage}
                callsPerPage={callsPerPage}
                onRowClick={handleRowClick}
                onDeleteCall={handleDeleteCall}
                onDownload={handleDownloadCall}
                onAddCalls={handleAddCalls}
                formatDate={formatDate}
                getMetricValue={getMetricValue}
                isDeleting={deleteCall.isPending}
              />
            </div>
          </div>

          {/* Pagination */}
          {calls.length > 0 && (
            <Pagination
              currentPage={callsPage}
              totalItems={calls.length}
              itemsPerPage={callsPerPage}
              onPageChange={handleCallsPageChange}
              itemName="calls"
            />
          )}
        </>
      )}

      {/* Modals */}
      <AudioUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        isLoading={uploadCalls.isPending}
        mode="calls"
        agents={agentOptions}
        defaultAgentId={directory || workflow?.assistantId || ''}
      />

      <BolnaImportModal
        isOpen={isBolnaImportOpen}
        onClose={() => setIsBolnaImportOpen(false)}
        agentId={directory}
        agentName={currentAgentName}
        onImportComplete={handleBolnaImportComplete}
      />

      <EvaluateModal
        isOpen={isEvaluateModalOpen}
        onClose={() => setIsEvaluateModalOpen(false)}
        evalAgentId={evalAgentId}
        onAgentIdChange={setEvalAgentId}
        agentOptions={agentOptions}
        onSubmit={submitEvaluate}
        isLoading={evaluateAudio.isPending}
      />

      <KPIDiscoveryModal
        isOpen={isDiscoveryModalOpen}
        onClose={() => setIsDiscoveryModalOpen(false)}
        discoveredKPIs={discoveredKPIs}
        directory={directory}
      />

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        isLoading={confirmationModal.isLoading}
        variant={confirmationModal.variant}
        confirmText={confirmationModal.confirmText}
      />
    </div>
  );
}

export default CallsPage;