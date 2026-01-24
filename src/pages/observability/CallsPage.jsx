import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AudioUploadModal from '../../components/AudioUploadModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useCalls, useEvaluateCall, useUploadCalls, useCallCategories, useEvaluateAudio, useDeleteCall } from '../../hooks/useCalls';
import { useFlows } from '../../hooks/useFlows';
import { useAgents } from '../../hooks/useAgents';
import { useWorkflow } from '../../context/WorkFlowContext';
import { useEvents } from '../../context/EventsContext';
import { useAgentKPIs, useDiscoverKPIs } from '../../hooks/useKPIs';

// Import modular components
import CallsPageHeader from './components/CallsPageHeader';
import CallsSearchBar from './components/CallsSearchBar';
import KPISection from './components/KPISection';
import AgentsTable from './components/AgentsTable';
import CallsTable from './components/CallsTable';
import Pagination from './components/Pagination';
import { EvaluateModal, KPIDiscoveryModal } from './components/CallsModals';

const CallsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { workflow } = useWorkflow();
  const { subscribe } = useEvents();

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEvaluateModalOpen, setIsEvaluateModalOpen] = useState(false);
  const [evalAgentId, setEvalAgentId] = useState(workflow?.assistantId || '');
  const [evalDirectory, setEvalDirectory] = useState('');
  const [agentsPage, setAgentsPage] = useState(1);
  const agentsPerPage = 10;
  const [callsPage, setCallsPage] = useState(1);
  const callsPerPage = 10;
  const [showKPIs, setShowKPIs] = useState(true);
  const [discoveredKPIs, setDiscoveredKPIs] = useState(null);
  const [isDiscoveryModalOpen, setIsDiscoveryModalOpen] = useState(false);

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

  // Sync session storage with current directory
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

  // Fetch data
  const { data: agentsData } = useAgents();
  const { data: categoriesData, isLoading: isCategoriesLoading, refetch: refetchCategories } = useCallCategories();
  const { data, isLoading: isCallsLoading, error, refetch } = useCalls({
    category: directory,
    directory: directory,
    search: searchTerm,
    include_evaluations: true
  });

  // Fetch flows
  const { data: flowsData } = useFlows();
  const flowId = useMemo(() => {
    return flowsData?.flows?.[0]?.flow_id || null;
  }, [flowsData]);

  // Fetch agent KPIs
  const { data: agentKPIsData, isLoading: isLoadingKPIs } = useAgentKPIs(
    directory,
    30,
    { enabled: viewMode === 'calls' && !!directory }
  );

  // Hook for discovering new KPIs
  const discoverKPIsMutation = useDiscoverKPIs();

  // Mutations
  const evaluateCall = useEvaluateCall();
  const evaluateAudio = useEvaluateAudio();
  const uploadCalls = useUploadCalls();
  const deleteCall = useDeleteCall();

  // Process categories
  const filteredCategories = useMemo(() => {
    let categories = [];

    if (agentsData?.agents && Array.isArray(agentsData.agents)) {
      categories = agentsData.agents
        .map(agent => agent.provider_agent_id || agent.agent_id)
        .filter(id => !!id && typeof id === 'string');
    }

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

    if (directory && typeof directory === 'string' && !categories.includes(directory)) {
      categories.push(directory);
    }

    return categories;
  }, [agentsData, categoriesData, directory]);

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

  // Display agents with search
  const displayedAgents = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return filteredCategories.filter(cat => {
      const agent = agentsData?.agents?.find(a => a.provider_agent_id === cat || a.agent_id === cat);
      const agentName = agent?.name || agent?.agent_name || `Agent ${cat.substring(0, 8)}`;
      return cat.toLowerCase().includes(searchLower) || agentName.toLowerCase().includes(searchLower);
    });
  }, [filteredCategories, agentsData, searchTerm]);

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
    const backendCategories = filteredCategories;
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

    if (options.length === 0) {
      return [{ label: 'All Directories', value: '' }];
    }

    return options;
  }, [filteredCategories, agentsData]);

  // Format KPIs for display
  const kpisForDisplay = useMemo(() => {
    if (!agentKPIsData || !agentKPIsData.kpis) return [];

    const kpis = agentKPIsData.kpis;
    const displayKPIs = [];

    // Add static KPIs
    if (kpis.static_kpis) {
      // FCR Rate
      if (kpis.static_kpis.fcr_rate !== undefined && kpis.static_kpis.fcr_rate !== null) {
        const fcrValue = kpis.static_kpis.fcr_rate;
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

    // Add dynamic KPIs
    if (kpis.dynamic_kpis) {
      Object.entries(kpis.dynamic_kpis).forEach(([key, kpiData]) => {
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
            count: kpiData.count,
            min: kpiData.min,
            max: kpiData.max,
          });
        }
      });
    }

    return displayKPIs;
  }, [agentKPIsData]);

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
  };

  const handleBackToDirectories = () => {
    sessionStorage.removeItem('last_directory');
    updateParams({ directory: '', view: 'directories' });
    setSearchTerm('');
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
      navigate(`/evaluations/report/${evaluationId}`);
      return;
    }

    if (status === 'processing' || processingStage === 'transcribing' || processingStage === 'evaluating') {
      toast.info('🔄 Evaluation in progress. Please wait...', { autoClose: 3000 });
      return;
    }

    if (sessionId) {
      navigate(`/evaluations/session?sessionId=${sessionId}`);
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

  const handleDownloadCall = async (call) => {
    toast.info('Preparing download...');
    
    try {
      let audioFilePath = null;
      
      // Try to get audio file from simulation if available
      const simulationId = call.simulation_id || call.evaluation?.simulation_id;
      
      if (simulationId) {
        const simResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/simulation/${simulationId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'X-Tenant-ID': localStorage.getItem('tenantId') || '',
          }
        });
        
        if (simResponse.ok) {
          const simData = await simResponse.json();
          audioFilePath = simData?.metadata?.audio_file;
        }
      }
      
      // Fallback to call data if simulation didn't have it
      if (!audioFilePath) {
        audioFilePath = call.audio_url || call.filename || call.audio_path;
      }
      
      if (!audioFilePath) {
        toast.error('Audio file source not found for this call.');
        return;
      }

      const GCP_STORAGE_BASE_URL = import.meta.env.VITE_GCP_STORAGE_BASE_URL || 'https://storage.googleapis.com/voiceeval-public';
      
      const fullUrl = audioFilePath.startsWith('http') 
        ? audioFilePath 
        : `${GCP_STORAGE_BASE_URL}/${audioFilePath.startsWith('/') ? audioFilePath.slice(1) : audioFilePath}`;

      // Use direct link approach
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = fullUrl;
      a.target = '_blank';
      
      const fileName = audioFilePath.split('/').pop() || `call-${call.call_id}.wav`;
      a.download = fileName;
      
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
      }, 100);
      
      toast.success('Download initiated!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to prepare download. Please try again.');
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

  const getMetricValue = (call, metricName) => {
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
  };

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
    setAgentsPage(1);
  }, [searchTerm]);

  useEffect(() => {
    setAgentsPage(1);
    setCallsPage(1);
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
        onBackToDirectories={handleBackToDirectories}
      />

      {/* KPI Summary Section */}
      {viewMode === 'calls' && directory && (
        <KPISection
          kpisForDisplay={kpisForDisplay}
          isLoadingKPIs={isLoadingKPIs}
          agentKPIsData={agentKPIsData}
          showKPIs={showKPIs}
          onToggleKPIs={() => setShowKPIs(!showKPIs)}
          onDiscoverKPIs={handleDiscoverKPIs}
          isDiscovering={discoverKPIsMutation.isPending}
        />
      )}

      {/* Search Bar */}
      <CallsSearchBar
        viewMode={viewMode}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        directory={directory}
        currentOptions={currentOptions}
        onDirectoryChange={(val) => updateParams({ directory: val })}
        onBackToDirectories={handleBackToDirectories}
        onEvaluateAll={handleEvaluateAll}
        onAddCalls={handleAddCalls}
        isEvaluating={evaluateAudio.isPending || evaluateCall.isPending}
      />

      {/* Table Container */}
      <div className="bg-dark-panel rounded-xl overflow-hidden border border-gray-800/50 shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          {viewMode === 'directories' ? (
            <AgentsTable
              filteredCategories={filteredCategories}
              isCategoriesLoading={isCategoriesLoading}
              displayedAgents={displayedAgents}
              agentsPage={agentsPage}
              agentsPerPage={agentsPerPage}
              agentsData={agentsData}
              onDirectoryClick={handleDirectoryClick}
              onEvaluateAll={handleEvaluateAll}
              onAddCalls={handleAddCalls}
              isEvaluating={evaluateAudio.isPending || evaluateCall.isPending}
            />
          ) : (
            <CallsTable
              calls={calls}
              isCallsLoading={isCallsLoading}
              error={error}
              callsPage={callsPage}
              callsPerPage={callsPerPage}
              onRowClick={handleRowClick}
              onEvaluate={handleEvaluate}
              onDeleteCall={handleDeleteCall}
              onDownload={handleDownloadCall}
              onAddCalls={handleAddCalls}
              formatDate={formatDate}
              getMetricValue={getMetricValue}
              isEvaluating={evaluateAudio.isPending || evaluateCall.isPending}
              isDeleting={deleteCall.isPending}
            />
          )}
        </div>
      </div>

      {/* Pagination */}
      {viewMode === 'directories' && filteredCategories.length > 0 && (
        <Pagination
          currentPage={agentsPage}
          totalItems={displayedAgents.length}
          itemsPerPage={agentsPerPage}
          onPageChange={setAgentsPage}
          itemName="agents"
        />
      )}

      {viewMode === 'calls' && calls.length > 0 && (
        <Pagination
          currentPage={callsPage}
          totalItems={calls.length}
          itemsPerPage={callsPerPage}
          onPageChange={setCallsPage}
          itemName="calls"
        />
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
