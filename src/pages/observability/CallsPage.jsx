import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
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
  Folder
} from 'lucide-react';
import AudioUploadModal from '../../components/AudioUploadModal';
import GenericDropdown from '../../components/DropDown';
import { useCalls, useEvaluateCall, useUploadCalls, useCallCategories, useEvaluateAudio } from '../../hooks/useCalls';
import { useFlows } from '../../hooks/useFlows';

const CallsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const directory = searchParams.get('directory') || sessionStorage.getItem('last_directory') || '';
  const viewMode = searchParams.get('view') || (directory ? 'calls' : 'directories');

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

  // Track directories created from frontend
  const [frontendDirectories, setFrontendDirectories] = useState(() => {
    const saved = localStorage.getItem('frontend_directories');
    return saved ? JSON.parse(saved) : []; // Start empty, only show what user creates
  });

  const addFrontendDirectory = useCallback((dir) => {
    if (!dir) return;
    setFrontendDirectories(prev => {
      if (prev.includes(dir)) return prev;
      const next = [...prev, dir];
      localStorage.setItem('frontend_directories', JSON.stringify(next));
      return next;
    });
  }, []);

  // Fetch unique categories (directories) dynamically
  const { data: categoriesData, isLoading: isCategoriesLoading } = useCallCategories();

  // Filter categories to only show those created from frontend
  const filteredCategories = useMemo(() => {
    const rawCategories = Array.isArray(categoriesData) 
      ? categoriesData 
      : (categoriesData?.categories || []);
    
    return rawCategories.filter(cat => 
      typeof cat === 'string' && frontendDirectories.includes(cat)
    );
  }, [categoriesData, frontendDirectories]);

  // Automatically select the first directory if none is selected
  useEffect(() => {
    if (!isCategoriesLoading && filteredCategories.length > 0 && !directory && viewMode === 'directories') {
      const firstDir = filteredCategories[0];
      updateParams({ directory: firstDir, view: 'calls' }, true);
    }
  }, [filteredCategories, isCategoriesLoading, directory, viewMode, updateParams]);

  // Fetch flows to get a dynamic flow_id if needed
  const { data: flowsData } = useFlows();
  const flowId = useMemo(() => {
    return flowsData?.flows?.[0]?.flow_id || "69528d4fdb229b2af9cd718b";
  }, [flowsData]);

  // Fetch calls from the backend with directory filter
  const { data, isLoading: isCallsLoading, error, refetch } = useCalls({ 
    category: directory,
    directory: directory,
    search: searchTerm,
    include_evaluations: true
  });

  // Check if any visible calls are missing evaluations or are still processing to trigger polling
  const hasPendingEvaluations = useMemo(() => {
    if (!data) return false;
    const rawCalls = Array.isArray(data) ? data : (data?.calls || []);
    // Only poll if we have calls but some are missing evaluations
    // and we are in the calls view (not directories)
    if (viewMode !== 'calls' || rawCalls.length === 0) return false;
    
    return rawCalls.some(call => {
      if (!call) return false;
      // Case 1: No evaluation or evaluation ID at all
      if (!call.evaluation && !call.evaluation_id) return true;
      
      // Case 2: Has evaluation object but status is not completed/failed
      const status = call.evaluation?.status || call.evaluation_status;
      if (status && !['completed', 'failed', 'success', 'error'].includes(status.toLowerCase())) {
        return true;
      }
      
      // Case 3: Has evaluation ID but no evaluation object yet
      if (call.evaluation_id && !call.evaluation) return true;

      return false;
    });
  }, [data, viewMode]);

  // Force refetch when view mode changes to calls
  useEffect(() => {
    if (viewMode === 'calls' && directory) {
      refetch();
    }
  }, [viewMode, directory, refetch]);

  // Poll for updates if evaluations are pending
  useEffect(() => {
    let interval;
    if (hasPendingEvaluations) {
      interval = setInterval(() => {
        refetch();
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [hasPendingEvaluations, refetch]);

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
    // Priority: explicit evaluation_id from various possible paths
    const evaluationId = 
      call.evaluation?.evaluation_id || 
      call.evaluation?.evaluation?.evaluation_id || 
      call.evaluation_id || 
      (Array.isArray(call.evaluations) && call.evaluations[0]?.evaluation_id);
      
    const sessionId = 
      call.session_id || 
      call.evaluation?.session_id || 
      call.evaluation?.evaluation?.session_id || 
      call.call_id;
    
    if (evaluationId) {
      navigate(`/evaluations/${evaluationId}`);
    } else if (sessionId) {
      // If we have a session ID but no evaluation ID yet, 
      // navigate to evaluation report page with sessionId filter
      navigate(`/evaluations/session?sessionId=${sessionId}`);
    }
  };

  const evaluateCall = useEvaluateCall();
  const evaluateAudio = useEvaluateAudio();
  const uploadCalls = useUploadCalls();

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
        await evaluateAudio.mutateAsync({
          gcp_folder_path: `audio/${directory}`,
          flow_id: flowId,
          skip_failures: true
        });
        toast.success(`Evaluation re-triggered for directory: audio/${directory}`);
      }
    } catch (error) {
      console.error('Evaluation error:', error);
      // Handled by global interceptor
    }
  };

  const handleEvaluateAll = async (targetDirectory) => {
    if (!targetDirectory) return;
    try {
      await evaluateAudio.mutateAsync({
        gcp_folder_path: `audio/${targetDirectory}`,
        flow_id: flowId,
        skip_failures: true
      });
      toast.success(`Evaluation started for all calls in: audio/${targetDirectory}`);
    } catch (error) {
      console.error('Evaluation error:', error);
      // Handled by global interceptor
    }
  };

  const handleModalSubmit = async ({ files, directory: uploadDirectory }) => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      // Use the directory provided in the modal, fallback to current directory
      const category = uploadDirectory || directory;

      await uploadCalls.mutateAsync({ formData, category });
      
      // Track this directory as being created from frontend
      addFrontendDirectory(category);
      
      // Update state to show the uploaded calls immediately
      updateParams({ directory: category, view: 'calls' }, true);
      setSearchTerm('');
      
      setIsModalOpen(false);
      toast.success('Calls uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      // Handled by global interceptor
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
      'overall_score': ['overall', 'overall_score', 'total_score', 'sequential_task_accuracy', 'score'],
      'semantic_accuracy': ['accuracy', 'semantic_accuracy', 'transcription_accuracy', 'semantic'],
      'task_completion_rate': ['task_completion', 'completion', 'success_rate', 'sequential_task_accuracy', 'flow_path_coverage', 'task_completion_rate'],
      'audio_quality': ['audio', 'audio_quality', 'signal_to_noise', 'audio_quality_score'],
      'persona_score': ['persona', 'tone', 'voice_match', 'persona_score', 'tone_score'],
      'sentiment_score': ['sentiment', 'mood', 'sentiment_score'],
      'avg_latency': ['avg_latency', 'response_latency', 'latency', 'average_latency']
    };

    const aliases = mapping[metricName] || [metricName];
    const normalizedAliases = aliases.map(a => a.toLowerCase().replace(/_/g, ' '));

    // 1. Try to find in evaluation.category_scores -> metrics (New API Format)
    // The structure can be call.evaluation.category_scores OR call.evaluation.evaluation.category_scores
    const evalObj = call.evaluation?.evaluation || call.evaluation || (Array.isArray(call.evaluations) ? call.evaluations[0] : null);
    
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

  const calls = useMemo(() => {
    // Handle both { calls: [] } and [ ] response formats
    const rawCalls = Array.isArray(data) ? data : (data?.calls || []);
    
    // Filter out any null/undefined entries that might cause crashes
    const validCalls = rawCalls.filter(call => !!call);

    if (!directory) return validCalls;
    
    // Safety check: ensure only calls for the selected directory are shown
    // if the backend doesn't filter correctly, or handles properties differently
    return validCalls.filter(call => {
      if (!call) return false;
      const callDir = call.category || call.directory || call.metadata?.category || call.metadata?.directory;
      // If no directory info on call, assume it's correct if we filtered by directory in API
      if (!callDir) return true;
      return callDir === directory;
    });
  }, [data, directory]);

  // Generate dynamic options from fetched categories
  const currentOptions = useMemo(() => {
    // Use filtered categories (frontend only)
    const backendCategories = filteredCategories;
    
    // Create options from backend categories, ensuring we only process strings
    const options = backendCategories
      .filter(cat => typeof cat === 'string')
      .map(cat => ({
        label: cat.split(/[_-]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        value: cat
      }));

    // Ensure currently selected directory is in the list even if not in backend categories yet
    if (directory && typeof directory === 'string' && !backendCategories.includes(directory)) {
      options.push({
        label: directory.split(/[_-]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        value: directory
      });
    }

    // Fallback if no categories exist
    if (options.length === 0) {
      return [{ label: 'All Directories', value: '' }];
    }

    return options;
  }, [filteredCategories, directory]);

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
            Directories
          </span>
          {viewMode === 'calls' && (
            <>
              <ChevronRight className="w-4 h-4" />
              <span className="text-teal-400 font-semibold capitalize">
                {directory.split(/[_-]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-3 w-full md:w-auto">
          {viewMode === 'calls' && (
            <button 
              onClick={handleBackToDirectories}
              className="p-3 bg-dark-panel border border-gray-800 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white shadow-lg"
              title="Back to Directories"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder={viewMode === 'directories' ? "Search directories..." : "Search calls..."}
              className="w-full bg-dark-panel border border-gray-800 rounded-lg py-3 px-5 pl-5 text-base focus:outline-none focus:border-teal-500 transition-colors text-white placeholder-gray-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {viewMode === 'calls' && (
            <div className="flex items-center gap-2 bg-dark-panel border border-gray-800 rounded-lg px-4 py-2 min-w-[200px]">
              <span className="text-gray-500 text-sm font-medium whitespace-nowrap">Directory:</span>
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
          <button className="flex items-center gap-2 bg-dark-panel border border-gray-800 text-white px-6 py-3 rounded-lg text-base font-semibold hover:bg-gray-800 transition-colors shadow-lg">
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-dark-panel rounded-xl overflow-hidden border border-gray-800/50 shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          {viewMode === 'directories' ? (
            <table className="w-full text-left border-collapse min-w-[1400px]">
              <thead>
                <tr className="bg-gray-900/50 text-gray-400 text-sm font-semibold border-b border-gray-800/50">
                  <th className="px-6 py-5">Directory Name</th>
                  <th className="px-6 py-5">Actions</th>
                </tr>
              </thead>
              <tbody className="text-base text-gray-300">
                {isCategoriesLoading ? (
                  <tr>
                    <td colSpan="2" className="px-6 py-10 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                        Loading directories...
                      </div>
                    </td>
                  </tr>
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan="2" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-gray-800/30 rounded-full border border-gray-700/50">
                          <Folder className="w-8 h-8 text-gray-500" />
                        </div>
                        <p className="text-gray-400 text-lg font-medium">No calls uploaded yet</p>
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
                ) : filteredCategories
                    .filter(cat => typeof cat === 'string' && cat.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(cat => (
                  <tr key={cat} className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors cursor-pointer group" onClick={() => handleDirectoryClick(cat)}>
                    <td className="px-6 py-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-teal-500/5 rounded-lg border border-teal-500/10 group-hover:border-teal-500/30 transition-colors">
                            <Folder className="w-6 h-6 text-teal-400" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-white font-bold text-lg capitalize">
                              {cat.split(/[_-]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </span>
                            <span className="text-gray-500 text-sm font-mono">{cat}</span>
                          </div>
                        </div>
                        
                        {/* Evaluate All button right next to the directory name */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEvaluateAll(cat);
                          }}
                          disabled={evaluateAudio.isPending || evaluateCall.isPending}
                          className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 text-purple-400 px-4 py-2 rounded-lg text-sm font-bold hover:bg-purple-500/20 transition-colors shadow-[0_0_15px_rgba(168,85,247,0.1)] disabled:opacity-50"
                        >
                          <Brain className="w-4 h-4" />
                          Evaluate All
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2 text-gray-400 group-hover:text-teal-400 transition-colors">
                        <span className="text-sm font-medium">View Calls</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse min-w-[1400px]">
              <thead>
                <tr className="bg-gray-900/50 text-gray-400 text-sm font-semibold border-b border-gray-800/50">
                  <th className="px-6 py-5 sticky left-0 bg-[#0b1220] z-20 border-r border-gray-800/50 shadow-[4px_0_10px_rgba(0,0,0,0.3)]">Call ID</th>
                  <th className="px-6 py-5">Actions</th>
                  <th className="px-6 py-5">Timestamp</th>
                  <th className="px-6 py-5">Overall Score</th>
                  <th className="px-6 py-5">Semantic Accuracy</th>
                  <th className="px-6 py-5">Task Completion</th>
                  <th className="px-6 py-5">Avg Latency</th>
                  <th className="px-6 py-5">Sentiment</th>
                  <th className="px-6 py-5">Audio Quality</th>
                  <th className="px-6 py-5">Persona/Tone</th>
                  <th className="px-6 py-5">Issues</th>
                </tr>
              </thead>
              <tbody className="text-base text-gray-300">
                {isCallsLoading ? (
                  <tr>
                    <td colSpan="11" className="px-6 py-10 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                        Loading calls...
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="11" className="px-6 py-10 text-center text-red-400">
                      <div className="flex flex-col items-center gap-3">
                        <AlertCircle className="w-8 h-8" />
                        Error loading calls: {error.message}
                      </div>
                    </td>
                  </tr>
                ) : calls.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="px-6 py-20 text-center">
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
                ) : (
                  calls.map((call, index) => (
                    <tr 
                      key={call.call_id || index} 
                      onClick={() => handleRowClick(call)}
                      className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-6 sticky left-0 bg-[#0b1220] group-hover:bg-[#151c2c] z-10 border-r border-gray-800/50 shadow-[4px_0_10px_rgba(0,0,0,0.3)]">
                        <div className="flex flex-col">
                          <span className="text-white font-bold font-mono text-sm truncate w-40" title={call.call_id}>
                            {call.call_id || 'N/A'}
                          </span>
                          <span className="text-gray-500 text-xs truncate w-40">
                            {call.filename || 'manual_upload.mp3'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleEvaluate(call.call_id); }}
                            disabled={evaluateAudio.isPending || evaluateCall.isPending}
                            className="p-2 bg-teal-500/10 text-teal-400 rounded-lg hover:bg-teal-500/20 transition-colors disabled:opacity-50"
                            title="Evaluate"
                          >
                            <Brain className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col">
                          <span className="text-gray-300 text-sm whitespace-nowrap">
                            {formatDate(call.created_at)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2">
                          {(() => {
                            const status = (call.evaluation?.status || call.evaluation_status || '').toLowerCase();
                            const isProcessing = status && !['completed', 'failed', 'success', 'error', 'not_found'].includes(status);
                            const val = getMetricValue(call, 'overall_score');
                            
                            if (isProcessing || (call.evaluation_id && !call.evaluation)) {
                              return (
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                  <span className="text-purple-400 text-xs font-medium">Evaluating...</span>
                                </div>
                              );
                            }

                            if (val !== '--') {
                              return (
                                <>
                                  <div className={`w-3 h-3 rounded-full ${
                                    parseFloat(val) >= 80 ? 'bg-green-500' : 
                                    parseFloat(val) >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}></div>
                                  <span className="text-white font-bold">{val}</span>
                                </>
                              );
                            }

                            return (
                              <>
                                <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                                <span className="text-white font-bold">--</span>
                              </>
                            );
                          })()}
                        </div>
                      </td>
                      <td className="px-6 py-6 text-gray-300">
                        {(() => {
                          const status = (call.evaluation?.status || call.evaluation_status || '').toLowerCase();
                          const isProcessing = status && !['completed', 'failed', 'success', 'error', 'not_found'].includes(status);
                          if (isProcessing || (call.evaluation_id && !call.evaluation)) return '--';
                          return (
                            <div className="flex items-center gap-2">
                              <Brain className="w-4 h-4 text-teal-400" />
                              <span>{getMetricValue(call, 'semantic_accuracy')}</span>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-6 text-gray-300">
                        {(() => {
                          const status = (call.evaluation?.status || call.evaluation_status || '').toLowerCase();
                          const isProcessing = status && !['completed', 'failed', 'success', 'error', 'not_found'].includes(status);
                          if (isProcessing || (call.evaluation_id && !call.evaluation)) return '--';
                          
                          const val = getMetricValue(call, 'task_completion_rate');
                          const numVal = parseFloat(val);
                          
                          return (
                            <div className="flex items-center gap-4">
                              <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden min-w-[60px]">
                                <div 
                                  className="h-full bg-blue-500 rounded-full"
                                  style={{ width: val !== '--' ? `${Math.min(100, numVal || 0)}%` : '0%' }}
                                />
                              </div>
                              <span className="text-xs font-medium w-8">{val}</span>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-400" />
                          <span className="text-gray-300">
                            {getMetricValue(call, 'avg_latency')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-pink-400" />
                          <span className="text-gray-300">
                            {getMetricValue(call, 'sentiment_score')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-orange-400" />
                          <span className="text-gray-300">
                            {getMetricValue(call, 'audio_quality')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2">
                          <Filter className="w-4 h-4 text-purple-400" />
                          <span className="text-gray-300">
                            {getMetricValue(call, 'persona_score') || getMetricValue(call, 'tone_score')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          (parseInt(getMetricValue(call, 'issues_found')) || 0) > 0 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'
                        }`}>
                          {getMetricValue(call, 'issues_found')} issues
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pagination */}
      {viewMode === 'calls' && calls.length > 0 && (
        <div className="mt-8 flex items-center justify-between">
          <p className="text-gray-500 text-sm">
            Showing {calls.length} {calls.length === 1 ? 'call' : 'calls'}
          </p>
          <div className="flex items-center gap-2">
            <button className="p-2 bg-dark-panel border border-gray-800 rounded hover:bg-gray-800 transition-colors text-gray-400 disabled:opacity-30" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-4 py-2 text-sm text-gray-400">Page 1 of 1</span>
            <button className="p-2 bg-dark-panel border border-gray-800 rounded hover:bg-gray-800 transition-colors text-gray-400 disabled:opacity-30" disabled>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
              


      {/* Create Call Modal */}
      <AudioUploadModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        isLoading={uploadCalls.isPending}
        mode="calls"
        initialDirectory={directory}
      />
    </div>
  );
}

export default CallsPage;
