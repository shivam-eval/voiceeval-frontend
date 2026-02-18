import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Plus } from 'lucide-react';

// Hooks
import { useCalls, useEvaluateAudio, useUploadCalls, useCallCategories } from '../hooks/useCalls';
import { useAgents } from '../hooks/useAgents';
import { useFlows } from '../hooks/useFlows';
import { useWorkflow } from '../context/WorkFlowContext';

// Components
import AudioUploadModal from './AudioUploadModal';
import AgentsTable from '../pages/observability/components/AgentsTable';
import Pagination from '../pages/observability/components/Pagination';
import { EvaluateModal } from '../pages/observability/components/CallsModals';
import CallsSearchBar from '../pages/observability/components/CallsSearchBar';

/**
 * AgentDirectoriesView - Reusable component for displaying agent directories
 * Used in CallsPage and InboundPage to show the list of agents
 */
const AgentDirectoriesView = ({ 
  onAgentSelect, // Callback when an agent is selected
  showHeader = true, // Whether to show the search bar
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { workflow } = useWorkflow();

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEvaluateModalOpen, setIsEvaluateModalOpen] = useState(false);
  const [evalAgentId, setEvalAgentId] = useState(workflow?.assistantId || '');
  const [evalDirectory, setEvalDirectory] = useState('');

  const getSafePage = useCallback((value, fallback = 1) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }, []);

  const [agentsPage, setAgentsPage] = useState(() => getSafePage(searchParams.get('agentsPage'), 1));
  const agentsPerPage = 10;

  // Fetch data
  const { data: agentsData } = useAgents();
  const { data: categoriesData, isLoading: isCategoriesLoading, refetch: refetchCategories } = useCallCategories();
  const { data: flowsData } = useFlows();
  
  // Mutations
  const evaluateAudio = useEvaluateAudio();
  const uploadCalls = useUploadCalls();
  const { refetch } = useCalls({}, { enabled: false });

  const flowId = useMemo(() => {
    return flowsData?.flows?.[0]?.flow_id || null;
  }, [flowsData]);

  // Process categories - backend returns only active agents
  const filteredCategories = useMemo(() => {
    if (categoriesData?.categories && Array.isArray(categoriesData.categories)) {
      return categoriesData.categories
        .filter(cat => cat.has_agent !== false)
        .map(cat => cat.id)
        .filter(id => !!id && typeof id === 'string');
    }

    if (agentsData?.agents && Array.isArray(agentsData.agents)) {
      return agentsData.agents
        .map(agent => agent.provider_agent_id || agent.agent_id)
        .filter(id => !!id && typeof id === 'string');
    }

    return [];
  }, [agentsData, categoriesData]);

  // Display agents with search
  const displayedAgents = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    
    if (categoriesData?.categories && Array.isArray(categoriesData.categories)) {
      return categoriesData.categories
        .filter(cat => {
          if (cat.has_agent === false) return false;
          const name = cat.name || cat.id;
          return name.toLowerCase().includes(searchLower) || 
                 cat.id.toLowerCase().includes(searchLower);
        })
        .map(cat => cat.id);
    }
    
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

    if (agentsData?.agents && Array.isArray(agentsData.agents)) {
      return agentsData.agents.map(agent => ({
        label: agent.name || agent.agent_name || agent.agent_id,
        value: agent.provider_agent_id || agent.agent_id,
        platform: agent.provider
      }));
    }

    return [{ label: 'No Agents Available', value: '' }];
  }, [categoriesData, agentsData]);

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
    updateParams({ agentsPage: String(page) });
  }, [updateParams]);

  // Event handlers
  const handleDirectoryClick = (dir) => {
    if (onAgentSelect) {
      onAgentSelect(dir);
    }
  };

  const handleAddCalls = () => {
    setIsModalOpen(true);
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

      if (onAgentSelect) {
        onAgentSelect(agentId);
      }

      setIsModalOpen(false);
      toast.success('Calls uploaded successfully! Auto-evaluation started.');
    } catch (error) {
      // Error handled by global interceptor
    }
  };

  // Reset pagination when search changes
  useEffect(() => {
    setAgentsPage(1);
  }, [searchTerm]);

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      {showHeader && (
        <CallsSearchBar
          viewMode="directories"
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          directory=""
          currentOptions={currentOptions}
          onDirectoryChange={() => {}}
          onBackToDirectories={() => {}}
          onEvaluateAll={() => {}}
          onAddCalls={handleAddCalls}
          isEvaluating={evaluateAudio.isPending}
        />
      )}

      {/* Add Calls Button (if no agents exist) */}
      {!showHeader && filteredCategories.length === 0 && !isCategoriesLoading && (
        <div className="flex justify-end">
          <button
            onClick={handleAddCalls}
            className="flex items-center gap-2 bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors font-semibold"
          >
            <Plus className="w-5 h-5" />
            Add Calls
          </button>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-dark-panel rounded-xl overflow-hidden border border-gray-800/50 shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
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
            isEvaluating={evaluateAudio.isPending}
          />
        </div>
      </div>

      {/* Pagination */}
      {filteredCategories.length > 0 && (
        <Pagination
          currentPage={agentsPage}
          totalItems={displayedAgents.length}
          itemsPerPage={agentsPerPage}
          onPageChange={handleAgentsPageChange}
          itemName="agents"
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
        defaultAgentId={workflow?.assistantId || ''}
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
    </div>
  );
};

export default AgentDirectoriesView;
