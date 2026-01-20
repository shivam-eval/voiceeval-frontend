import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Search,
  Plus,
  Filter,
  Download,
  Copy,
  MoreVertical,
  X,
  Upload,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Clock,
  BarChart3,
  Brain,
  MessageSquare,
  Folder,
  Phone,
  Trash2
} from 'lucide-react';
import AudioUploadModal from '../../components/AudioUploadModal';
import GenericDropdown from '../../components/DropDown';
import Badge from '../../components/Badge';
import { extractNoiseFromSessionId, getNoiseProfileBadgeVariant } from '../../utils/noiseUtils';
import { useCalls, useEvaluateCall, useUploadCalls, useCallCategories, useEvaluateAudio, useDeleteCall } from '../../hooks/useCalls';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useFlows } from '../../hooks/useFlows';
import { useAgents } from '../../hooks/useAgents';
import { useWorkflow } from '../../context/WorkFlowContext';
import { useEvents } from '../../context/EventsContext';
import { useAgentKPIs, useDiscoverKPIs } from '../../hooks/useKPIs';
import KPIMetricsGrid from '../../components/KPIMetricsGrid';
import { formatKPIValue, getKPIIcon, getKPIColor } from '../../utils/kpiFormatters';

const CallsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { workflow } = useWorkflow();
  const { subscribe } = useEvents();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEvaluateModalOpen, setIsEvaluateModalOpen] = useState(false);
  const [evalAgentId, setEvalAgentId] = useState(workflow?.assistantId || '');
  const [evalDirectory, setEvalDirectory] = useState('');
  const [agentsPage, setAgentsPage] = useState(1);
  const agentsPerPage = 10;
  const [callsPage, setCallsPage] = useState(1);
  const callsPerPage = 10;
  const [showKPIs, setShowKPIs] = useState(true); // Show KPIs by default
  const [discoveredKPIs, setDiscoveredKPIs] = useState(null);
  const [isDiscoveryModalOpen, setIsDiscoveryModalOpen] = useState(false);

  // Confirmation Modal State for delete
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => { },
    isLoading: false
  });


  const directoryParam = searchParams.get('directory');
  const directory = directoryParam; // Only use URL param, no session storage fallback
  const viewMode = searchParams.get('view') || 'directories'; // Default to agents list view

  // Sync session storage with current directory (for back button functionality)
  useEffect(() => {
    if (directory) {
      sessionStorage.setItem('last_directory', directory);
    }
  }, [directory]);

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

  // Fetch agents for the directories list
  const { data: agentsData } = useAgents();

  // Fetch unique categories (directories) dynamically - DEPRECATED, using agents instead
  const { data: categoriesData, isLoading: isCategoriesLoading, refetch: refetchCategories } = useCallCategories();

  // Use agents from /agents endpoint as the source of truth for directories
  const filteredCategories = useMemo(() => {
    let categories = [];

    // Primary source: Use agents from /agents endpoint
    if (agentsData?.agents && Array.isArray(agentsData.agents)) {
      categories = agentsData.agents
        .map(agent => agent.provider_agent_id || agent.agent_id)
        .filter(id => !!id && typeof id === 'string');
    }

    // Fallback: Use categories from /calls/categories if no agents found
    if (categories.length === 0 && categoriesData) {
      let raw = [];
      if (Array.isArray(categoriesData)) {
        raw = categoriesData;
      } else if (categoriesData?.categories && Array.isArray(categoriesData.categories)) {
        raw = categoriesData.categories;
      } else if (categoriesData?.data && Array.isArray(categoriesData.data)) {
        raw = categoriesData.data;
      } else if (categoriesData?.items && Array.isArray(categoriesData.items)) {
        raw = categoriesData.items;
      }

      categories = raw.map(cat => {
        if (typeof cat === 'string') return cat;
        if (typeof cat === 'object' && cat !== null) {
          return cat.name || cat.category || cat.id || String(cat);
        }
        return String(cat);
      }).filter(cat => !!cat && cat !== 'undefined' && cat !== 'null');
    }

    // IMPORTANT: Ensure currently selected directory is always in the list
    if (directory && typeof directory === 'string' && !categories.includes(directory)) {
      console.log(`⚠️ Current directory "${directory}" not in agents list. Adding it manually.`);
      categories.push(directory);
    }

    console.log('📁 Available agent directories:', categories);
    console.log('📍 Current directory:', directory);

    return categories;
  }, [agentsData, categoriesData, directory]);

  // Reset pagination when search term changes
  useEffect(() => {
    setAgentsPage(1);
  }, [searchTerm]);

  const displayedAgents = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return filteredCategories.filter(cat => {
      const agent = agentsData?.agents?.find(a => a.provider_agent_id === cat || a.agent_id === cat);
      const agentName = agent?.name || agent?.agent_name || `Agent ${cat.substring(0, 8)}`;
      return cat.toLowerCase().includes(searchLower) || agentName.toLowerCase().includes(searchLower);
    });
  }, [filteredCategories, agentsData, searchTerm]);

  // Generate agent options for the evaluation modal (reusing agentsData from above)
  const agentOptions = useMemo(() => {
    const agents = agentsData?.agents || [];
    const options = [
      ...agents.map(agent => ({
        label: `${agent.name} (${agent.provider_agent_id || agent.agent_id})`,
        value: agent.provider_agent_id || agent.agent_id,
        name: agent.name // Add the name separately
      }))
    ];

    return options;
  }, [agentsData]);

  // Fetch flows to get a dynamic flow_id if needed
  const { data: flowsData } = useFlows();
  const flowId = useMemo(() => {
    return flowsData?.flows?.[0]?.flow_id || null;
  }, [flowsData]);

  // Fetch calls from the backend with directory filter
  const { data, isLoading: isCallsLoading, error, refetch } = useCalls({
    category: directory,
    directory: directory,
    search: searchTerm,
    include_evaluations: true
  });

  const calls = useMemo(() => {
    if (!data) return [];

    // Handle various response formats: [ ], { calls: [] }, { data: [] }, { items: [] }, { results: [] }
    let rawCalls = [];
    if (Array.isArray(data)) {
      rawCalls = data;
    } else if (data?.calls && Array.isArray(data.calls)) {
      rawCalls = data.calls;
    } else if (data?.data && Array.isArray(data.data)) {
      // Could be { data: [...] } or { data: { calls: [...] } }
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

    // Filter out any null/undefined entries that might cause crashes
    return rawCalls.filter(call => !!call);
  }, [data]);

  // Force refetch when view mode changes to calls
  useEffect(() => {
    if (viewMode === 'calls' && directory) {
      refetch();
    }
  }, [viewMode, directory, refetch]);

  // Fetch agent KPIs when viewing an agent's calls
  const { data: agentKPIsData, isLoading: isLoadingKPIs } = useAgentKPIs(
    directory, // Only fetch if directory (agent) is selected
    30, // 30-day period
    { enabled: viewMode === 'calls' && !!directory } // Only enabled when viewing calls for an agent
  );

  // Hook for discovering new KPIs
  const discoverKPIsMutation = useDiscoverKPIs();

  // Format KPIs for display
  const kpisForDisplay = useMemo(() => {
    if (!agentKPIsData || !agentKPIsData.kpis) return [];

    const kpis = agentKPIsData.kpis;
    const displayKPIs = [];

    // Add static KPIs - normalize rates to percentages
    if (kpis.static_kpis) {
      // FCR Rate - normalize to percentage
      if (kpis.static_kpis.fcr_rate !== undefined && kpis.static_kpis.fcr_rate !== null) {
        const fcrValue = kpis.static_kpis.fcr_rate;
        // If value is > 1, it's a count, convert to rate based on total_calls
        const normalizedValue = fcrValue > 1 && kpis.static_kpis.fcr_count !== undefined
          ? (kpis.static_kpis.fcr_count / (agentKPIsData.total_calls || 1)) * 100
          : fcrValue <= 1 ? fcrValue * 100 : fcrValue;

        displayKPIs.push({
          kpi_id: 'fcr',
          name: 'First Call Resolution',
          value: normalizedValue,
          unit: '%',
          data_type: 'float',
          aggregation_method: 'rate',
          description: 'Percentage of calls resolved on first contact',
          is_static: true,
        });
      }

      // Conversion Rate
      if (kpis.static_kpis.conversion_rate !== undefined && kpis.static_kpis.conversion_rate !== null) {
        const conversionValue = kpis.static_kpis.conversion_rate;
        const normalizedValue = conversionValue > 1 && kpis.static_kpis.conversion_count !== undefined
          ? (kpis.static_kpis.conversion_count / (agentKPIsData.total_calls || 1)) * 100
          : conversionValue <= 1 ? conversionValue * 100 : conversionValue;

        displayKPIs.push({
          kpi_id: 'conversion',
          name: 'Conversion Rate',
          value: normalizedValue,
          unit: '%',
          data_type: 'float',
          aggregation_method: 'rate',
          description: 'Percentage of calls that resulted in a conversion',
          is_static: true,
        });
      }

      // Transfer Rate
      if (kpis.static_kpis.transfer_rate !== undefined && kpis.static_kpis.transfer_rate !== null) {
        const transferValue = kpis.static_kpis.transfer_rate;
        const normalizedValue = transferValue > 1 && kpis.static_kpis.transfer_count !== undefined
          ? (kpis.static_kpis.transfer_count / (agentKPIsData.total_calls || 1)) * 100
          : transferValue <= 1 ? transferValue * 100 : transferValue;

        displayKPIs.push({
          kpi_id: 'transfer',
          name: 'Transfer Rate',
          value: normalizedValue,
          unit: '%',
          data_type: 'float',
          aggregation_method: 'rate',
          description: 'Percentage of calls transferred to another agent',
          is_static: true,
        });
      }

      // Objection Handling Quality
      if (kpis.static_kpis.avg_objection_handling_quality !== undefined && kpis.static_kpis.avg_objection_handling_quality !== null) {
        const objectionValue = kpis.static_kpis.avg_objection_handling_quality;
        // Normalize to 0-100 scale if needed
        const normalizedValue = objectionValue <= 1 ? objectionValue * 100 : objectionValue;

        displayKPIs.push({
          kpi_id: 'objection_handling',
          name: 'Objection Quality',
          value: normalizedValue,
          unit: '%',
          data_type: 'float',
          aggregation_method: 'avg',
          description: 'Average quality of objection handling across all calls',
          is_static: true,
        });
      }
    }

    // Add dynamic KPIs - use metadata from API
    if (kpis.dynamic_kpis) {
      Object.entries(kpis.dynamic_kpis).forEach(([key, kpiData]) => {
        // Only add KPIs with non-null values
        if (typeof kpiData === 'object' && kpiData.value !== null && kpiData.value !== undefined) {
          displayKPIs.push({
            kpi_id: kpiData.kpi_id || key,
            name: kpiData.kpi_name || key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
            value: kpiData.value,
            unit: kpiData.unit || '',
            data_type: kpiData.data_type || (typeof kpiData.value === 'boolean' ? 'boolean' :
              typeof kpiData.value === 'number' && Number.isInteger(kpiData.value) ? 'int' : 'float'),
            aggregation_method: kpiData.aggregation_method || 'avg',
            description: `${kpiData.kpi_name || key} - ${kpiData.category || 'Dynamic KPI'}`,
            category: kpiData.category,
            is_static: false,
            // Additional metadata for display
            count: kpiData.count,
            min: kpiData.min,
            max: kpiData.max,
          });
        }
      });
    }

    return displayKPIs;
  }, [agentKPIsData]);

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


  // Subscribe to SSE events for real-time call evaluation updates (replaces polling)
  useEffect(() => {
    const unsubscribe = subscribe('call_evaluation_update', (data) => {
      console.log('📡 Call evaluation update received:', data);

      const { status, call_id, error, overall_score } = data;

      // Show toast notifications and refetch on completion or failure
      if (status === 'completed') {
        const scoreText = overall_score !== undefined ? ` (Score: ${Math.round(overall_score * 100)}%)` : '';
        toast.success(`✅ Evaluation completed for ${call_id}${scoreText}`, {
          autoClose: 4000,
          position: 'bottom-right'
        });
        console.log(`✅ Call ${call_id} evaluation completed, refetching calls and categories...`);
        refetch();
        refetchCategories(); // Refresh agent list to show new agents
      } else if (status === 'failed') {
        toast.error(`❌ Evaluation failed for ${call_id}: ${error || 'Unknown error'}`, {
          autoClose: 5000,
          position: 'bottom-right'
        });
        console.log(`❌ Call ${call_id} evaluation failed, refetching calls and categories...`);
        refetch();
        refetchCategories(); // Refresh agent list even on failure
      }
    });

    return () => {
      unsubscribe();
    };
  }, [subscribe, refetch, refetchCategories]);

  // Reset pagination when view mode or directory changes
  useEffect(() => {
    setAgentsPage(1);
    setCallsPage(1);
  }, [viewMode, directory]);

  // Handle directory selection
  const handleDirectoryClick = (dir) => {
    updateParams({ directory: dir, view: 'calls' });
    setSearchTerm(''); // Clear search when drilling down
  };

  const handleBackToDirectories = () => {
    sessionStorage.removeItem('last_directory');
    updateParams({ directory: '', view: 'directories' });
    setSearchTerm(''); // Clear search when going back
  };

  const handleRowClick = (call) => {
    // Check call status and processing stage
    const status = (call.status || '').toLowerCase();
    const processingStage = (call.processing_stage || '').toLowerCase();

    // Priority: explicit evaluation_id from various possible paths
    const evaluationId =
      call.evaluation?.evaluation_id ||
      call.evaluation?.evaluation?.evaluation_id ||
      call.evaluation_id ||
      (Array.isArray(call.evaluations) && call.evaluations[0]?.evaluation_id);

    const sessionId =
      call.session_id ||
      call.evaluation?.session_id ||
      call.evaluation?.evaluation?.session_id;

    // Case 1: Evaluation complete - show report
    if (evaluationId) {
      navigate(`/evaluations/report/${evaluationId}`);
      return;
    }

    // Case 2: Evaluation in progress - show message
    if (status === 'processing' || processingStage === 'transcribing' || processingStage === 'evaluating') {
      toast.info('🔄 Evaluation in progress. Please wait...', { autoClose: 3000 });
      return;
    }

    // Case 3: Has session but no evaluation yet - might still be processing
    if (sessionId) {
      navigate(`/evaluations/session?sessionId=${sessionId}`);
      return;
    }

    // Case 4: Evaluation failed - allow retry
    if (status === 'failed') {
      toast.warning('Previous evaluation failed. Retrying...', { autoClose: 2000 });
      handleEvaluate(call.call_id);
      return;
    }

    // Case 5: No evaluation started yet (shouldn't happen with auto-eval, but handle it)
    if (status === 'pending' || status === 'uploaded' || !call.agent_id) {
      if (!call.agent_id) {
        toast.error('No agent assigned to this call. Cannot evaluate.');
        return;
      }
      toast.info('Starting evaluation...', { autoClose: 2000 });
      handleEvaluate(call.call_id);
      return;
    }

    // Default: Try to navigate with call_id
    toast.info('🔄 Loading evaluation status...', { autoClose: 2000 });
  };

  const evaluateCall = useEvaluateCall();
  const evaluateAudio = useEvaluateAudio();
  const uploadCalls = useUploadCalls();
  const deleteCall = useDeleteCall();

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
          await deleteCall.mutateAsync(callId);
          setConfirmationModal(prev => ({ ...prev, isOpen: false }));
          toast.success("Call deleted successfully");
        } catch (error) {
          // Error handled by global interceptor
          setConfirmationModal(prev => ({ ...prev, isLoading: false }));
        }
      }
    });
  };

  const handleAddCalls = () => {
    setIsModalOpen(true);
  };

  const handleEvaluate = async (targetCallId) => {
    try {
      if (targetCallId) {
        await evaluateCall.mutateAsync(targetCallId);
        toast.success(`Evaluation triggered for call ID: ${targetCallId}`);
      } else {
        // Fallback to directory evaluation if no specific ID
        handleEvaluateAll(directory);
      }
    } catch (error) {
      // Error handled by global interceptor
    }
  };

  const handleEvaluateAll = (targetDirectory) => {
    if (!targetDirectory) return;
    setEvalDirectory(targetDirectory);

    // Default evalAgentId to the selected directory/agent if present, 
    // otherwise fallback to workflow context
    const defaultAgent = targetDirectory || workflow?.assistantId || '';
    setEvalAgentId(defaultAgent);

    setIsEvaluateModalOpen(true);
  };

  const submitEvaluate = () => {
    // Close modal immediately
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
      formData.append('agent_id', agentId); // Add agent_id to form data

      await uploadCalls.mutateAsync({ formData, agentId });

      // Force a refetch of calls and categories to ensure the UI updates
      refetch();
      refetchCategories(); // Refresh agent list to show new agent

      // Update state to show the uploaded calls immediately
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

  const getMetricValue = (call, metricName) => {
    if (!call) return '--';

    const isLatency = metricName === 'avg_latency';
    const isSentiment = metricName === 'sentiment_score';
    const isIssues = metricName === 'issues_found';

    const formatScore = (score) => {
      if (score === undefined || score === null) return null;

      // If score is a string that looks like a number, convert it
      let numScore = typeof score === 'number' ? score : parseFloat(score);
      if (isNaN(numScore)) return null;

      if (isLatency) {
        // Assume score is in ms if > 100, else in s
        const val = numScore > 100 ? numScore / 1000 : numScore;
        return val.toFixed(2) + 's';
      }

      if (isSentiment) {
        return numScore.toFixed(2);
      }

      if (isIssues) {
        return numScore.toString();
      }

      // Default percentage formatting for scores
      // If score is > 1, assume it's already a percentage (e.g. 89.5)
      // If score is <= 1, assume it's a decimal (e.g. 0.895)
      const val = numScore > 1 ? numScore : numScore * 100;
      return val.toFixed(1) + '%';
    };

    // Special handling for issues
    if (metricName === 'issues_found') {
      if (call.issues_found !== undefined) return call.issues_found;
      if (call.evaluation?.issues_found !== undefined) return call.evaluation.issues_found;
      if (Array.isArray(call.evaluation?.issues)) return call.evaluation.issues.length;
      return 0;
    }

    // Common mappings/aliases
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

    // The structure can be call.evaluation.category_scores OR call.evaluation.evaluation.category_scores
    const evalObj = call.evaluation?.evaluation || call.evaluation || (Array.isArray(call.evaluations) ? call.evaluations[0] : null);

    // 1. For overall_score, check the direct field FIRST before searching category metrics
    if (metricName === 'overall_score' && evalObj?.overall_score !== undefined && evalObj?.overall_score !== null) {
      return formatScore(evalObj.overall_score);
    }

    // 2. Try to find in evaluation.category_scores -> metrics (New API Format)
    if (evalObj?.category_scores) {
      for (const cat of evalObj.category_scores) {
        if (!cat) continue;

        // Check category name itself against aliases
        const catName = (cat.category || '').toLowerCase().replace(/_/g, ' ');
        if (normalizedAliases.includes(catName)) {
          return formatScore(cat.score);
        }

        // Check metrics within category
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

    // 2. Try various paths for each alias
    for (const alias of aliases) {
      // Check in the extracted evalObj
      if (evalObj && typeof evalObj === 'object') {
        if (evalObj[alias] !== undefined && evalObj[alias] !== null) {
          return formatScore(evalObj[alias]);
        }
        // Check in evalObj.metrics (if it's an object)
        if (evalObj.metrics && !Array.isArray(evalObj.metrics) && evalObj.metrics[alias] !== undefined) {
          return formatScore(evalObj.metrics[alias]);
        }
      }

      // Check top-level call object if not found in evaluation
      if (call[alias] !== undefined && call[alias] !== null && typeof call[alias] !== 'object') {
        return formatScore(call[alias]);
      }

      // Check in top level metrics of call
      if (call.metrics && call.metrics[alias] !== undefined && call.metrics[alias] !== null) {
        return formatScore(call.metrics[alias]);
      }
    }

    return '--';
  };

  // Generate dynamic options from fetched categories
  const currentOptions = useMemo(() => {
    // Use filtered categories (already includes current directory)
    const backendCategories = filteredCategories;

    // Create options from backend categories, ensuring we only process strings
    const options = backendCategories
      .filter(cat => typeof cat === 'string')
      .map(cat => {
        const agent = agentsData?.agents?.find(a => a.provider_agent_id === cat || a.agent_id === cat);
        const rawName = agent?.name || agent?.agent_name || cat.replace(/[_-]/g, ' ');
        const cleanName = rawName.replace(/^Agent\s+/i, '');

        return {
          label: cleanName,
          value: cat
        };
      });

    // Fallback if no categories exist
    if (options.length === 0) {
      return [{ label: 'All Directories', value: '' }];
    }

    return options;
  }, [filteredCategories, agentsData]);

  return (
    <div className="p-8 bg-dark-bg min-h-screen text-white">
      {/* Page Title & Breadcrumbs */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Calls Observability</h1>
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <span
            className={`cursor-pointer hover:text-teal-400 transition-colors ${viewMode === 'directories' ? 'text-teal-400 font-semibold' : ''}`}
            onClick={handleBackToDirectories}
          >
            Agents
          </span>
          {viewMode === 'calls' && (
            <>
              <ChevronRight className="w-4 h-4" />
              <span className="text-teal-400 font-semibold">
                {(() => {
                  const agent = agentsData?.agents?.find(a => a.provider_agent_id === directory || a.agent_id === directory);
                  const rawName = agent?.name || agent?.agent_name || directory.replace(/[_-]/g, ' ');
                  return rawName.replace(/^Agent\s+/i, '');
                })()}
              </span>
            </>
          )}
        </div>
      </div>

      {/* KPI Summary Section (only in calls view) */}
      {viewMode === 'calls' && directory && (
        <div className="mb-6 space-y-4">
          {/* Overview Section - First 4 Static KPIs */}
          {(() => {
            const overviewKPIs = kpisForDisplay.filter(k => k.is_static).slice(0, 4);
            const agentSpecificKPIs = kpisForDisplay.filter(k => !k.is_static);

            return (
              <>
                {/* Overview Section */}
                {overviewKPIs.length > 0 && (
                  <div className="bg-dark-panel rounded-xl border border-gray-800/50 p-5">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-teal-500/10 rounded-lg border border-teal-500/20">
                          <BarChart3 className="w-4 h-4 text-teal-400" />
                        </div>
                        <h3 className="text-base font-bold text-white">
                          Performance Overview
                          <span className="text-xs text-gray-500 ml-2 font-normal">(Last 30 Days)</span>
                        </h3>
                      </div>
                    </div>

                    {isLoadingKPIs ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <div key={idx} className="bg-gray-800/30 rounded-lg p-3 border border-gray-800/50 animate-pulse">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 bg-gray-700 rounded-lg"></div>
                            </div>
                            <div className="h-6 w-16 bg-gray-700 rounded mb-1"></div>
                            <div className="h-3 w-24 bg-gray-700 rounded"></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                        {/* Total Calls Card - Always first */}
                        <div
                          className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20 transition-all hover:bg-opacity-80"
                          title={`Total calls analyzed in the last 30 days`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-lg bg-blue-500/20">
                              <Phone className="w-4 h-4 text-blue-400" />
                            </div>
                          </div>
                          <div className="text-xl font-bold text-blue-400 mb-0.5">
                            {agentKPIsData?.total_calls || 0}
                          </div>
                          <div className="text-gray-400 text-xs font-medium">
                            Total Calls
                          </div>
                        </div>

                        {/* Static KPI Cards */}
                        {overviewKPIs.map((kpi) => {
                          const Icon = getKPIIcon(kpi.kpi_id, kpi.kpi_id);
                          const color = getKPIColor(kpi.value, kpi.data_type);
                          const formattedValue = formatKPIValue(kpi.value, kpi.data_type, kpi.unit);

                          const colorClasses = {
                            teal: { bg: 'bg-teal-500/10', border: 'border-teal-500/20', text: 'text-teal-400', icon: 'bg-teal-500/20' },
                            green: { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400', icon: 'bg-green-500/20' },
                            yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400', icon: 'bg-yellow-500/20' },
                            red: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', icon: 'bg-red-500/20' },
                            blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', icon: 'bg-blue-500/20' },
                            gray: { bg: 'bg-gray-500/10', border: 'border-gray-500/20', text: 'text-gray-400', icon: 'bg-gray-500/20' },
                          };

                          const colors = colorClasses[color] || colorClasses.gray;

                          return (
                            <div
                              key={kpi.kpi_id}
                              className={`${colors.bg} rounded-lg p-3 border ${colors.border} transition-all hover:bg-opacity-80`}
                              title={kpi.description}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <div className={`p-1.5 rounded-lg ${colors.icon}`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                              </div>
                              <div className={`text-xl font-bold ${colors.text} mb-0.5`}>
                                {formattedValue}
                              </div>
                              <div className="text-gray-400 text-xs font-medium">
                                {kpi.name}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Agent-Specific Metrics Section */}
                {agentSpecificKPIs.length > 0 && (
                  <div className="bg-dark-panel rounded-xl border border-gray-800/50 p-5">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-purple-500/10 rounded-lg border border-purple-500/20">
                          <Brain className="w-4 h-4 text-purple-400" />
                        </div>
                        <h3 className="text-base font-bold text-white">
                          Agent-Specific Metrics
                          <span className="text-xs text-gray-500 ml-2 font-normal">({agentSpecificKPIs.length} metrics)</span>
                        </h3>
                      </div>
                      <button
                        onClick={() => setShowKPIs(!showKPIs)}
                        className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-lg text-xs font-medium transition-colors"
                      >
                        {showKPIs ? 'Collapse' : 'Expand'}
                      </button>
                    </div>

                    {showKPIs && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {agentSpecificKPIs.map((kpi) => {
                          const Icon = getKPIIcon(kpi.kpi_id, kpi.kpi_id);
                          const color = getKPIColor(kpi.value, kpi.data_type);
                          const formattedValue = formatKPIValue(kpi.value, kpi.data_type, kpi.unit);

                          const colorClasses = {
                            teal: { bg: 'bg-teal-500/10', border: 'border-teal-500/20', text: 'text-teal-400', icon: 'bg-teal-500/20' },
                            green: { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400', icon: 'bg-green-500/20' },
                            yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400', icon: 'bg-yellow-500/20' },
                            red: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', icon: 'bg-red-500/20' },
                            blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', icon: 'bg-blue-500/20' },
                            gray: { bg: 'bg-gray-500/10', border: 'border-gray-500/20', text: 'text-gray-400', icon: 'bg-gray-500/20' },
                          };

                          const colors = colorClasses[color] || colorClasses.gray;

                          return (
                            <div
                              key={kpi.kpi_id}
                              className={`${colors.bg} rounded-lg p-3 border ${colors.border} transition-all hover:bg-opacity-80 relative`}
                              title={kpi.description}
                            >
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <div className={`p-1.5 rounded-lg ${colors.icon}`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 uppercase font-bold">
                                  Dynamic
                                </span>
                              </div>
                              <div className={`text-xl font-bold ${colors.text} mb-0.5`}>
                                {formattedValue}
                              </div>
                              <div className="text-gray-400 text-xs font-medium mb-1">
                                {kpi.name}
                              </div>
                              {kpi.aggregation_method && (
                                <div className="text-gray-500 text-[10px] capitalize">
                                  {kpi.aggregation_method}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {!showKPIs && (
                      <div className="flex items-center gap-3 text-xs flex-wrap">
                        {agentSpecificKPIs.slice(0, 3).map((kpi) => (
                          <div key={kpi.kpi_id} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-800/50 rounded-lg border border-gray-700/50">
                            <span className="text-gray-400">{kpi.name}:</span>
                            <span className="text-white font-semibold">
                              {formatKPIValue(kpi.value, kpi.data_type, kpi.unit)}
                            </span>
                          </div>
                        ))}
                        {agentSpecificKPIs.length > 3 && (
                          <span className="text-gray-500 px-2">+{agentSpecificKPIs.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Discover KPIs CTA */}
                {!isLoadingKPIs && agentSpecificKPIs.length === 0 && overviewKPIs.length > 0 && (
                  <div className="bg-purple-500/5 rounded-xl border border-purple-500/20 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                          <Brain className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white mb-0.5">Discover Agent-Specific Metrics</h4>
                          <p className="text-xs text-gray-400">AI will analyze your calls to find unique KPIs for this agent</p>
                        </div>
                      </div>
                      <button
                        onClick={handleDiscoverKPIs}
                        disabled={discoverKPIsMutation.isPending}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                      >
                        <Brain className="w-4 h-4" />
                        {discoverKPIsMutation.isPending ? 'Discovering...' : 'Discover KPIs'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {!isLoadingKPIs && overviewKPIs.length === 0 && agentSpecificKPIs.length === 0 && (
                  <div className="bg-dark-panel rounded-xl border border-gray-800/50 p-8 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 bg-gray-800/30 rounded-full border border-gray-700/50">
                        <BarChart3 className="w-6 h-6 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm font-medium mb-1">No KPI data available</p>
                        <p className="text-gray-500 text-xs">Start by evaluating some calls or click 'Discover KPIs' to find agent-specific metrics.</p>
                      </div>
                      <button
                        onClick={handleDiscoverKPIs}
                        disabled={discoverKPIsMutation.isPending}
                        className="mt-2 flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                      >
                        <Brain className="w-4 h-4" />
                        {discoverKPIsMutation.isPending ? 'Discovering...' : 'Discover KPIs'}
                      </button>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )
      }

      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-3 w-full md:w-auto">
          {viewMode === 'calls' && (
            <button
              onClick={handleBackToDirectories}
              className="p-3 bg-dark-panel border border-gray-800 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white shadow-lg"
              title="Back to Agents"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder={viewMode === 'directories' ? "Search agents..." : "Search calls..."}
              className="w-full bg-dark-panel border border-gray-800 rounded-lg py-3 px-5 pl-5 text-base focus:outline-none focus:border-teal-500 transition-colors text-white placeholder-gray-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {viewMode === 'calls' && (
            <div className="flex items-center gap-2 bg-dark-panel border border-gray-800 rounded-lg px-4 py-2 min-w-[200px]">
              <span className="text-gray-500 text-sm font-medium whitespace-nowrap">Agent:</span>
              <GenericDropdown
                options={currentOptions}
                value={directory}
                onChange={(val) => updateParams({ directory: val })}
                className="flex-1"
              />
            </div>
          )}
          <button className="bg-dark-panel border border-gray-800 text-white px-8 py-3 rounded-lg text-base font-semibold hover:bg-gray-800 transition-colors shadow-lg">
            Search
          </button>
        </div>

        <div className="flex items-center gap-3">
          {viewMode === 'calls' && (
            <button
              onClick={() => handleEvaluateAll(directory)}
              disabled={evaluateAudio.isPending || evaluateCall.isPending}
              className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 text-purple-400 px-6 py-3 rounded-lg text-base font-bold hover:bg-purple-500/20 transition-colors shadow-[0_0_15px_rgba(168,85,247,0.1)] disabled:opacity-50"
            >
              <Brain className="w-5 h-5" />
              Evaluate All
            </button>
          )}
          <button
            onClick={handleAddCalls}
            className="flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 text-teal-400 px-6 py-3 rounded-lg text-base font-bold hover:bg-teal-500/20 transition-colors shadow-[0_0_15px_rgba(20,184,166,0.1)]"
          >
            <Plus className="w-5 h-5" />
            Add Calls
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-dark-panel rounded-xl overflow-hidden border border-gray-800/50 shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          {viewMode === 'directories' ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-900/50 text-gray-400 text-xs font-semibold border-b border-gray-800/50">
                  <th className="px-4 py-3">Agent Name</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-300">
                {isCategoriesLoading ? (
                  <tr>
                    <td colSpan="2" className="px-4 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                        Loading agents...
                      </div>
                    </td>
                  </tr>
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan="2" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-gray-800/30 rounded-full border border-gray-700/50">
                          <Folder className="w-8 h-8 text-gray-500" />
                        </div>
                        <p className="text-gray-400 text-lg font-medium">No agents found</p>
                        <button
                          onClick={handleAddCalls}
                          className="mt-2 flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 text-teal-400 px-6 py-3 rounded-lg text-base font-bold hover:bg-teal-500/20 transition-colors"
                        >
                          <Plus className="w-5 h-5" />
                          Add Your First Call
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (() => {
                  const filtered = displayedAgents;
                  const totalPages = Math.ceil(filtered.length / agentsPerPage);
                  const startIdx = (agentsPage - 1) * agentsPerPage;
                  const endIdx = startIdx + agentsPerPage;
                  const paginatedAgents = filtered.slice(startIdx, endIdx);

                  return paginatedAgents.map(cat => (
                    <tr key={cat} className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors cursor-pointer group" onClick={() => handleDirectoryClick(cat)}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-teal-500/5 rounded border border-teal-500/10 group-hover:border-teal-500/30 transition-colors">
                            <Folder className="w-4 h-4 text-teal-400" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-white font-semibold text-sm">
                              {(() => {
                                const agent = agentsData?.agents?.find(a => a.provider_agent_id === cat || a.agent_id === cat);
                                const rawName = agent?.name || agent?.agent_name || `Agent ${cat.substring(0, 8)}`;
                                return rawName.replace(/^Agent\s+/i, '');
                              })()}
                            </span>
                            <span className="text-gray-500 text-xs font-mono">{cat}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEvaluateAll(cat);
                            }}
                            disabled={evaluateAudio.isPending || evaluateCall.isPending}
                            className="flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/30 text-purple-400 px-3 py-1.5 rounded text-xs font-semibold hover:bg-purple-500/20 transition-colors disabled:opacity-50"
                          >
                            <Brain className="w-3.5 h-3.5" />
                            Evaluate All
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDirectoryClick(cat);
                            }}
                            className="flex items-center gap-1.5 text-gray-400 hover:text-teal-400 transition-colors px-2 py-1.5"
                          >
                            <span className="text-xs font-medium">View Calls</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-900/50 text-gray-400 text-xs font-semibold border-b border-gray-800/50">
                  <th className="px-4 py-3">Call ID</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                  <th className="px-4 py-3 text-center">Noise</th>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3 text-center">Overall Score</th>
                  <th className="px-4 py-3 text-center">Issues</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-300">
                {isCallsLoading ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                        Loading calls...
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-red-400">
                      <div className="flex flex-col items-center gap-3">
                        <AlertCircle className="w-8 h-8" />
                        Error loading calls: {error.message}
                      </div>
                    </td>
                  </tr>
                ) : calls.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-gray-800/30 rounded-full border border-gray-700/50">
                          <Upload className="w-8 h-8 text-gray-500" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-gray-400 text-lg font-medium">No calls found in this directory</p>
                          <p className="text-gray-500 text-sm">Upload recordings to start evaluating your voice flows</p>
                        </div>
                        <button
                          onClick={handleAddCalls}
                          className="mt-2 flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 text-teal-400 px-6 py-3 rounded-lg text-base font-bold hover:bg-teal-500/20 transition-colors shadow-[0_0_15px_rgba(20,184,166,0.1)]"
                        >
                          <Plus className="w-5 h-5" />
                          Add Calls
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (() => {
                  const startIdx = (callsPage - 1) * callsPerPage;
                  const endIdx = startIdx + callsPerPage;
                  const paginatedCalls = calls.slice(startIdx, endIdx);

                  return paginatedCalls.map((call, index) => (
                    <tr
                      key={call.call_id || index}
                      onClick={() => handleRowClick(call)}
                      className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors group cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-white font-semibold font-mono text-xs truncate max-w-[180px]" title={call.call_id}>
                            {call.call_id || 'N/A'}
                          </span>
                          <span className="text-gray-500 text-xs truncate max-w-[180px]">
                            {call.filename || call.agent_id || call.directory || 'No filename'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEvaluate(call.call_id); }}
                            disabled={evaluateAudio.isPending || evaluateCall.isPending}
                            className="p-1.5 bg-teal-500/10 text-teal-400 rounded hover:bg-teal-500/20 transition-colors disabled:opacity-50"
                            title="Evaluate"
                          >
                            <Brain className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 bg-gray-800 text-gray-400 rounded hover:bg-gray-700 transition-colors"
                            title="Download"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteCall(call.call_id); }}
                            disabled={deleteCall.isPending}
                            className="p-1.5 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {(() => {
                          const noise = extractNoiseFromSessionId(call.session_id || call.call_id);
                          return noise ? (
                            <Badge variant={getNoiseProfileBadgeVariant(noise.profile_id)} size="sm">
                              {noise.displayName}
                            </Badge>
                          ) : (
                            <span className="text-gray-500 text-xs">-</span>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-300 text-xs whitespace-nowrap">
                          {formatDate(call.created_at)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {(() => {
                            const evalStatus = (call.evaluation?.status || call.evaluation_status || '').toLowerCase();
                            const callStatus = (call.status || '').toLowerCase();
                            const processingStage = (call.processing_stage || '').toLowerCase();

                            // Check if evaluation is in progress
                            const isEvaluating = evalStatus && !['completed', 'failed', 'success', 'error', 'not_found'].includes(evalStatus);
                            const isProcessing = callStatus === 'processing' || processingStage === 'transcribing' || processingStage === 'evaluating';
                            const hasEvalIdButNoData = call.evaluation_id && !call.evaluation;

                            if (isEvaluating || isProcessing || hasEvalIdButNoData) {
                              const stageText = processingStage === 'transcribing' ? 'Transcribing...' :
                                processingStage === 'evaluating' ? 'Evaluating...' :
                                  'Processing...';
                              return (
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                  <span className="text-purple-400 text-xs font-medium">{stageText}</span>
                                </div>
                              );
                            }

                            // Check if evaluation failed
                            if (callStatus === 'failed') {
                              return (
                                <div className="flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4 text-red-500" />
                                  <span className="text-red-400 text-xs font-medium">Failed</span>
                                </div>
                              );
                            }

                            const val = getMetricValue(call, 'overall_score');
                            if (val !== '--') {
                              return (
                                <>
                                  <div className={`w-2.5 h-2.5 rounded-full ${parseFloat(val) >= 80 ? 'bg-green-500' :
                                    parseFloat(val) >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}></div>
                                  <span className="text-white font-semibold text-sm">{val}</span>
                                </>
                              );
                            }

                            return (
                              <>
                                <div className="w-2.5 h-2.5 rounded-full bg-gray-600"></div>
                                <span className="text-white font-semibold text-sm">--</span>
                              </>
                            );
                          })()}
                        </div>
                      </td>


                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${(parseInt(getMetricValue(call, 'issues_found')) || 0) > 0 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'
                          }`}>
                          {getMetricValue(call, 'issues_found')} issues
                        </span>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pagination for Agents */}
      {
        viewMode === 'directories' && filteredCategories.length > 0 && (
          <div className="mt-8 flex items-center justify-between">
            <p className="text-gray-500 text-sm">
              Showing {Math.min(displayedAgents.length, agentsPerPage)} of {displayedAgents.length} {displayedAgents.length === 1 ? 'agent' : 'agents'}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAgentsPage(p => Math.max(1, p - 1))}
                disabled={agentsPage === 1}
                className="p-2 bg-dark-panel border border-gray-800 rounded hover:bg-gray-800 transition-colors text-gray-400 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-4 py-2 text-sm text-gray-400">
                Page {agentsPage} of {Math.max(1, Math.ceil(displayedAgents.length / agentsPerPage))}
              </span>
              <button
                onClick={() => setAgentsPage(p => p + 1)}
                disabled={agentsPage >= Math.ceil(displayedAgents.length / agentsPerPage)}
                className="p-2 bg-dark-panel border border-gray-800 rounded hover:bg-gray-800 transition-colors text-gray-400 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )
      }

      {/* Pagination for Calls */}
      {
        viewMode === 'calls' && calls.length > 0 && (
          <div className="mt-8 flex items-center justify-between">
            <p className="text-gray-500 text-sm">
              Showing {Math.min(calls.length, callsPerPage)} of {calls.length} {calls.length === 1 ? 'call' : 'calls'}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCallsPage(p => Math.max(1, p - 1))}
                disabled={callsPage === 1}
                className="p-2 bg-dark-panel border border-gray-800 rounded hover:bg-gray-800 transition-colors text-gray-400 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-4 py-2 text-sm text-gray-400">
                Page {callsPage} of {Math.max(1, Math.ceil(calls.length / callsPerPage))}
              </span>
              <button
                onClick={() => setCallsPage(p => p + 1)}
                disabled={callsPage >= Math.ceil(calls.length / callsPerPage)}
                className="p-2 bg-dark-panel border border-gray-800 rounded hover:bg-gray-800 transition-colors text-gray-400 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )
      }



      {/* Create Call Modal */}
      <AudioUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        isLoading={uploadCalls.isPending}
        mode="calls"
        agents={agentOptions}
        defaultAgentId={directory || workflow?.assistantId || ''}
      />

      {/* Evaluate Prompt Modal */}
      {
        isEvaluateModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-dark-bg rounded-2xl max-w-md w-full border border-gray-800 relative shadow-2xl">
              <button
                onClick={() => {
                  setIsEvaluateModalOpen(false);
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                    <Brain className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Evaluate All Calls</h3>
                    <p className="text-gray-400 text-sm">Configure evaluation parameters</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Select Agent
                    </label>
                    <GenericDropdown
                      options={agentOptions}
                      value={evalAgentId}
                      onChange={(val) => setEvalAgentId(val)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Manual Agent ID Input
                    </label>
                    <input
                      type="text"
                      value={evalAgentId}
                      onChange={(e) => setEvalAgentId(e.target.value)}
                      placeholder="Enter agent ID to evaluate against..."
                      className="w-full bg-dark-input border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      If provided, this ID will be used for the evaluation request.
                    </p>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={submitEvaluate}
                      disabled={evaluateAudio.isPending}
                      className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-purple-600/20 disabled:opacity-50"
                    >
                      {evaluateAudio.isPending ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Brain className="w-5 h-5" />
                      )}
                      Start Evaluation
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }
      {/* KPI Discovery Modal */}
      {
        isDiscoveryModalOpen && discoveredKPIs && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-800 flex flex-col">
              <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg">
                    <Brain className="w-6 h-6" />
              
      {/* Confirmation Modal for Delete */}
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
                  <div>
                    <h2 className="text-2xl font-bold text-white">Discovered KPIs</h2>
                    <p className="text-sm text-gray-400">
                      AI discovered {discoveredKPIs.schemas?.length || 0} unique metrics for <span className="text-teal-400">{discoveredKPIs.agent_name || directory}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDiscoveryModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {discoveredKPIs.schemas?.map((schema, idx) => (
                    <div key={idx} className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 hover:border-purple-500/30 transition-all group">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                          {schema.name}
                        </h3>
                        <Badge variant="purple" className="text-[10px] uppercase px-1.5 py-0">
                          {schema.category?.replace('_', ' ') || 'Metric'}
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                        {schema.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-auto">
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-900 rounded text-xs text-gray-500 border border-gray-700">
                          <span className="font-semibold text-gray-400">Unit:</span> {schema.unit || 'n/a'}
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-900 rounded text-xs text-gray-500 border border-gray-700">
                          <span className="font-semibold text-gray-400">Type:</span> {schema.data_type}
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-900 rounded text-xs text-gray-500 border border-gray-700">
                          <span className="font-semibold text-gray-400">Agg:</span> {schema.aggregation_method}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 flex gap-4">
                  <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-blue-400 font-bold mb-1">Getting Started</h4>
                    <p className="text-blue-400/80 text-sm leading-relaxed">
                      These KPIs have been registered for this agent. Once you evaluate calls,
                      the AI will automatically extract these metrics and calculate the aggregate scores shown on your dashboard.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-800 flex justify-end">
                <button
                  onClick={() => setIsDiscoveryModalOpen(false)}
                  className="px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}

export default CallsPage;
