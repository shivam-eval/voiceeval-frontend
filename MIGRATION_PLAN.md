
# VoiceEval Platform - Complete Implementation Documentation
## Executive Summary

This document provides a comprehensive specification for building a production-ready voice agent testing platform inspired by Cekura and Coval. The platform enables creation, testing, and evaluation of voice AI agents through simulated conversations.

Table of Contents

    Architecture Overview
    Navigation Structure
    Page Specifications
    Modal Specifications
    Backend API Specifications
    Database Schema
    Implementation Roadmap

Architecture Overview
Technology Stack

Frontend:

    React 18+ with React Router
    React Query for data fetching
    Tailwind CSS for styling
    Lucide React for icons
    Recharts for data visualization

Backend:

    FastAPI (Python)
    MongoDB for data persistence
    Repository pattern for data access
    Celery for background tasks
    WebSocket/SSE for real-time updates

External Services:

    Voice providers (Vapi, ElevenLabs, Cartesia)
    LLM providers (OpenAI, Anthropic)
    Cloud storage (GCS) for audio files

Navigation Structure

VoiceEval Platform
│
├── 🏠 Dashboard (Home)
│
├── ⚙️ Configuration
│   ├── Agents
│   │   ├── Agents List
│   │   └── Agent Detail (NEW)
│   ├── Personas
│   │   ├── Personas Grid
│   │   └── Persona Detail Modal
│   ├── Test Sets
│   │   ├── Test Sets List
│   │   └── Test Set Detail
│   ├── Metrics
│   │   ├── Metrics List
│   │   └── Metric Configuration Modal
│   ├── Test Profiles (NEW)
│   │   └── Test Profiles List
│   └── Templates (NEW)
│       └── Templates Library
│
├── 🔬 Simulation
│   ├── Evaluator (Scenarios List)
│   ├── Results
│   ├── Runs Overview (NEW)
│   │   ├── Simulations List
│   │   └── Simulation Detail (NEW)
│   └── Scheduled (NEW)
│
├── 👁️ Observability
│   ├── Calls
│   │   ├── Calls List
│   │   └── Call Detail
│   └── Overview Dashboard
│
└── 🔔 Alerts (NEW)
    └── Alerts Configuration

Page Specifications
1. Dashboard (Home Page)

Route: /

Purpose: Quick overview of system status and quick access to common actions

Components:
1.1 Stats Cards (4-column grid)
jsx

<div className="grid grid-cols-4 gap-6">
  <StatCard
    title="Total Agents"
    value={12}
    icon={<Bot />}
    trend="+2 this week"
    trendType="positive"
  />
  <StatCard
    title="Test Sets"
    value={48}
    icon={<FileText />}
    trend="+5 this week"
  />
  <StatCard
    title="Simulations"
    value={156}
    icon={<Activity />}
    trend="+23 this week"
  />
  <StatCard
    title="Avg Success Rate"
    value="87.3%"
    icon={<TrendingUp />}
    trend="+3.2%"
    trendType="positive"
  />
</div>

1.2 Quick Actions Grid (3-column)
jsx

<div className="grid grid-cols-3 gap-4">
  <QuickActionCard
    title="Create Agent"
    description="Set up a new voice agent for testing"
    icon={<Plus />}
    action={() => navigate('/agents/create')}
  />
  <QuickActionCard
    title="Run Simulation"
    description="Execute test scenarios"
    icon={<Play />}
    action={() => openRunSimulationModal()}
  />
  <QuickActionCard
    title="View Results"
    description="Check latest evaluation results"
    icon={<BarChart3 />}
    action={() => navigate('/simulation/results')}
  />
</div>

1.3 Recent Activity Table

    Last 10 activities (agent created, simulation run, test set updated)
    Columns: Type, Name/ID, Status, Date, Quick Action
    Click row to navigate to detail page

1.4 Getting Started Checklist (for new users)
jsx

<OnboardingChecklist>
  ✅ Create your first agent
  ✅ Generate evaluators
  ⬜ Run your first simulation
  ⬜ Review results
</OnboardingChecklist>

Backend Requirements:

    GET /api/v1/dashboard/stats - Returns aggregate statistics
    GET /api/v1/dashboard/activity - Returns recent activity feed

2. Agents List Page

Route: /agents

Purpose: Browse and manage all voice agents
2.1 Header Section
jsx

<PageHeader>
  <h1>Agents</h1>
  <div className="actions">
    <Button variant="secondary" onClick={handleExport}>
      <Download /> Export
    </Button>
    <Button variant="primary" onClick={openCreateModal}>
      <Plus /> Create Agent
    </Button>
  </div>
</PageHeader>

2.2 Filters Bar
jsx

<FiltersBar>
  <SearchInput placeholder="Search by name, ID, phone..." />
  <MultiSelect
    label="Platform"
    options={['Vapi', 'ElevenLabs', 'Cartesia', 'Retell', 'Bland']}
  />
  <Select
    label="Direction"
    options={['All', 'Inbound', 'Outbound']}
  />
  <Select
    label="Status"
    options={['All', 'Active', 'Inactive', 'Error']}
  />
</FiltersBar>

2.3 Agents Table

Columns:

    Checkbox (bulk selection)
    Platform Icon
    Agent Name (editable inline)
    Agent ID (copyable)
    Model Type
    Phone Number
    Direction Badge
    Status Badge
    Created Date
    Actions

Row Actions:

    View Details (eye icon) → Navigate to /agents/:id
    Test Connection (play icon)
    Generate Flow (zap icon) → Opens Generate Flow Modal
    Edit (pencil icon)
    Delete (trash icon)

Bulk Actions:

    Delete selected
    Export selected
    Change status

2.4 Table Features

    Sortable columns
    Pagination (20/50/100 per page)
    Expandable rows (show additional metadata)
    Loading skeleton
    Empty state with "Create your first agent" CTA

Backend Requirements:
python

GET /api/v1/agents
Query params:
  - skip: int = 0
  - limit: int = 50
  - search: str = None
  - platform: List[str] = None
  - direction: str = None
  - status: str = None
  - sort_by: str = "created_at"
  - sort_desc: bool = True

Response:
{
  "agents": [...],
  "total": 145,
  "skip": 0,
  "limit": 50
}

3. Agent Detail Page (NEW)

Route: /agents/:agentId

Purpose: Comprehensive view of a single agent with all related data
3.1 Header Section
jsx

<AgentDetailHeader>
  <BackButton to="/agents" />
  
  <div className="agent-title">
    <h1 onClick={enableInlineEdit}>Customer Support Agent</h1>
    <div className="meta">
      <PlatformBadge platform="vapi" />
      <StatusBadge status="active" />
      <span>Created 2 days ago</span>
    </div>
  </div>
  
  <div className="actions">
    <Button variant="secondary" onClick={testConnection}>
      <Play /> Test Connection
    </Button>
    <Button variant="secondary" onClick={openGenerateFlowModal}>
      <Zap /> Generate Flow
    </Button>
    <DropdownMenu>
      <DropdownItem onClick={edit}>Edit</DropdownItem>
      <DropdownItem onClick={duplicate}>Duplicate</DropdownItem>
      <DropdownItem onClick={exportConfig}>Export Config</DropdownItem>
      <DropdownItem onClick={deleteAgent} danger>Delete</DropdownItem>
    </DropdownMenu>
  </div>
</AgentDetailHeader>

3.2 Tabs Navigation
jsx

<TabNavigation>
  <Tab active>Overview</Tab>
  <Tab>Configuration</Tab>
  <Tab>Flows</Tab>
  <Tab>Test Sets</Tab>
  <Tab>Simulation History</Tab>
</TabNavigation>

3.3 Tab: Overview

Metrics Cards (4-column grid):
jsx

<MetricsGrid>
  <MetricCard
    title="Platform"
    icon={<Cloud />}
    content={
      <>
        <PlatformLogo name="vapi" />
        <div>
          <strong>Vapi</strong>
          <StatusDot status="connected" /> Connected
        </div>
        <span className="text-sm">Last sync: 2 hours ago</span>
      </>
    }
  />
  
  <MetricCard
    title="Extraction Status"
    icon={<Database />}
    content={
      <>
        <Badge variant="success">Extracted</Badge>
        <div>14 tools found</div>
        <Button size="sm" onClick={reExtract}>Re-extract</Button>
      </>
    }
  />
  
  <MetricCard
    title="Test Sets"
    icon={<FileText />}
    content={
      <>
        <div className="text-3xl">8</div>
        <Link to={`/agents/${agentId}#test-sets`}>View all →</Link>
      </>
    }
  />
  
  <MetricCard
    title="Flows"
    icon={<GitBranch />}
    content={
      <>
        <div className="text-3xl">3</div>
        <Button size="sm" onClick={generateFlow}>Generate New</Button>
      </>
    }
  />
</MetricsGrid>

Agent Information Card:
jsx

<InfoCard title="Agent Information">
  <InfoRow label="Agent ID" value={agentId} copyable />
  <InfoRow label="Phone Number" value="+1-555-0123" copyable />
  <InfoRow label="Assistant ID" value="asst_abc123" copyable />
  <InfoRow label="API Endpoint" value="https://api.vapi.ai/..." copyable />
  <InfoRow label="Model" value="gpt-4" />
  <InfoRow label="Direction" value={<Badge>Inbound</Badge>} />
  <InfoRow label="Created" value="Dec 28, 2024, 3:45 PM" />
  <InfoRow label="Last Updated" value="Dec 29, 2024, 10:22 AM" />
</InfoCard>

Quick Actions:
jsx

<QuickActions>
  <ActionButton icon={<Play />} onClick={testConnection}>
    Test Connection
  </ActionButton>
  <ActionButton icon={<RefreshCw />} onClick={reExtract}>
    Re-extract Config
  </ActionButton>
  <ActionButton icon={<Zap />} onClick={generateFlow}>
    Generate Flow
  </ActionButton>
  <ActionButton icon={<Plus />} onClick={createTestSet}>
    Create Test Set
  </ActionButton>
</QuickActions>

3.4 Tab: Configuration

System Prompt Section:
jsx

<ConfigSection title="System Prompt" expandable>
  <div className="relative">
    <SyntaxHighlighter language="markdown">
      {agent.system_prompt}
    </SyntaxHighlighter>
    <Button
      className="absolute top-2 right-2"
      size="sm"
      onClick={copyPrompt}
    >
      <Copy /> Copy
    </Button>
  </div>
  <Button variant="secondary" onClick={editPrompt}>
    Edit Prompt
  </Button>
</ConfigSection>

Tools & Functions Section:
jsx

<ConfigSection title="Tools & Functions">
  <Table>
    <thead>
      <tr>
        <th>Tool Name</th>
        <th>Description</th>
        <th>Parameters</th>
        <th>Enabled</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {tools.map(tool => (
        <tr key={tool.id}>
          <td><Code>{tool.name}</Code></td>
          <td>{tool.description}</td>
          <td>
            <Badge>{tool.parameters.length} params</Badge>
          </td>
          <td>
            <Toggle checked={tool.enabled} onChange={toggleTool} />
          </td>
          <td>
            <IconButton icon={<Eye />} onClick={viewDetails} />
          </td>
        </tr>
      ))}
    </tbody>
  </Table>
</ConfigSection>

Model Configuration:
jsx

<ConfigSection title="Model Configuration">
  <InfoGrid>
    <InfoRow label="Model" value="gpt-4-turbo" />
    <InfoRow label="Temperature" value="0.7" />
    <InfoRow label="Max Tokens" value="1000" />
    <InfoRow label="Provider" value="OpenAI" />
  </InfoGrid>
</ConfigSection>

Voice Settings:
jsx

<ConfigSection title="Voice Settings">
  <InfoGrid>
    <InfoRow label="Voice Provider" value="ElevenLabs" />
    <InfoRow label="Voice ID" value="21m00Tcm4TlvDq8ikWAM" />
    <InfoRow label="Voice Name" value="Rachel" />
    <InfoRow label="Stability" value="0.5" />
    <InfoRow label="Similarity Boost" value="0.75" />
  </InfoGrid>
  <Button size="sm" onClick={testVoice}>
    <Volume2 /> Test Voice
  </Button>
</ConfigSection>

3.5 Tab: Flows

Flows Grid (card layout):
jsx

<FlowsGrid>
  {flows.map(flow => (
    <FlowCard key={flow.id}>
      <div className="header">
        <h3>{flow.name}</h3>
        <DropdownMenu>
          <DropdownItem onClick={() => viewFlow(flow)}>View</DropdownItem>
          <DropdownItem onClick={() => generateTests(flow)}>
            Generate Tests
          </DropdownItem>
          <DropdownItem onClick={() => exportFlow(flow)}>Export</DropdownItem>
          <DropdownItem onClick={() => deleteFlow(flow)} danger>
            Delete
          </DropdownItem>
        </DropdownMenu>
      </div>
      
      <div className="description">{flow.description}</div>
      
      <div className="stats">
        <div className="flow-preview">
          🔵─🔵─🔵─🔵  {flow.nodes.length} nodes
        </div>
        <div className="meta">Generated: {formatDate(flow.created_at)}</div>
      </div>
      
      <div className="actions">
        <Button size="sm" variant="secondary" onClick={() => viewFlow(flow)}>
          View Diagram
        </Button>
        <Button size="sm" onClick={() => generateTests(flow)}>
          Generate Tests
        </Button>
      </div>
    </FlowCard>
  ))}
  
  <EmptyFlowCard onClick={openGenerateFlowModal}>
    <Plus size={48} />
    <p>Generate New Flow</p>
  </EmptyFlowCard>
</FlowsGrid>

3.6 Tab: Test Sets

Test Sets Table:
jsx

<TestSetsTable>
  <TableFilters>
    <SearchInput placeholder="Search test sets..." />
    <Select label="Status" options={['All', 'Draft', 'Ready', 'Archived']} />
  </TableFilters>
  
  <Table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Description</th>
        <th>Test Cases</th>
        <th>Status</th>
        <th>Created</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {testSets.map(set => (
        <tr key={set.id} onClick={() => navigate(`/test-sets/${set.id}`)}>
          <td>{set.name}</td>
          <td>{truncate(set.description)}</td>
          <td><Badge>{set.test_cases.length}</Badge></td>
          <td><StatusBadge status={set.status} /></td>
          <td>{formatDate(set.created_at)}</td>
          <td>
            <IconButton icon={<Eye />} onClick={view} />
            <IconButton icon={<Play />} onClick={runTests} />
            <IconButton icon={<Copy />} onClick={duplicate} />
          </td>
        </tr>
      ))}
    </tbody>
  </Table>
</TestSetsTable>

<Button onClick={createNewTestSet}>
  <Plus /> Create Test Set
</Button>

3.7 Tab: Simulation History

Simulations Table:
jsx

<SimulationsTable>
  <TableFilters>
    <DateRangePicker />
    <Select label="Status" options={['All', 'Running', 'Completed', 'Failed']} />
  </TableFilters>
  
  <Table>
    <thead>
      <tr>
        <th>Simulation ID</th>
        <th>Test Set</th>
        <th>Started</th>
        <th>Duration</th>
        <th>Status</th>
        <th>Score</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {simulations.map(sim => (
        <tr key={sim.id} onClick={() => navigate(`/simulation/runs/${sim.id}`)}>
          <td><Code>{truncate(sim.id)}</Code></td>
          <td>{sim.test_set_name}</td>
          <td>{formatDate(sim.started_at)}</td>
          <td>{formatDuration(sim.duration_ms)}</td>
          <td><StatusBadge status={sim.status} /></td>
          <td>
            {sim.status === 'completed' && (
              <Score value={sim.overall_score} />
            )}
          </td>
          <td>
            <IconButton icon={<Eye />} onClick={view} />
            <IconButton icon={<RefreshCw />} onClick={rerun} />
          </td>
        </tr>
      ))}
    </tbody>
  </Table>
</SimulationsTable>

Backend Requirements:
python

GET /api/v1/agents/{agent_id}
GET /api/v1/agents/{agent_id}/flows
GET /api/v1/agents/{agent_id}/test-sets
GET /api/v1/agents/{agent_id}/simulations
POST /api/v1/agents/{agent_id}/test-connection
POST /api/v1/agents/{agent_id}/re-extract

4. Personas Page

Route: /personas

Purpose: Browse and manage simulated personas for testing
4.1 Header
jsx

<PageHeader>
  <h1>Simulated Personas</h1>
  <Button variant="primary" onClick={openCreateModal}>
    <Plus /> Add Persona
  </Button>
</PageHeader>

4.2 Filters Sidebar
jsx

<FiltersSidebar>
  <SearchInput placeholder="Search personas..." />
  
  <FilterGroup label="Region">
    <Checkbox label="India" />
    <Checkbox label="North America" />
    <Checkbox label="Europe" />
    <Checkbox label="Default" />
  </FilterGroup>
  
  <FilterGroup label="Language">
    <Checkbox label="English" />
    <Checkbox label="Hindi" />
    <Checkbox label="Tamil" />
    <Checkbox label="Spanish" />
  </FilterGroup>
  
  <FilterGroup label="Age Group">
    <Checkbox label="Young (18-30)" />
    <Checkbox label="Adult (31-45)" />
    <Checkbox label="Middle-aged (46-60)" />
    <Checkbox label="Senior (60+)" />
  </FilterGroup>
  
  <FilterGroup label="Patience Level">
    <Checkbox label="Low" />
    <Checkbox label="Medium" />
    <Checkbox label="High" />
  </FilterGroup>
</FiltersSidebar>

4.3 Personas Grid
jsx

<PersonasGrid className="grid grid-cols-4 gap-6">
  {personas.map(persona => (
    <PersonaCard key={persona.id} onClick={() => openDetailModal(persona)}>
      <div className="avatar">
        <Avatar
          gender={persona.gender}
          style={persona.region}
        />
      </div>
      
      <div className="header">
        <h3>{persona.name}</h3>
        <Badge variant={getVoiceTypeBadge(persona.voice_type)}>
          {persona.voice_type}
        </Badge>
      </div>
      
      <div className="tags">
        <Badge>{persona.native_language}</Badge>
        <Badge>{persona.age_group}</Badge>
        <Badge>{persona.gender}</Badge>
      </div>
      
      <div className="voice-info">
        <div className="flex items-center gap-2">
          <Mic size={16} />
          <span className="text-sm">
            {persona.voice_profile.provider}: {persona.voice_profile.voice_id}
          </span>
        </div>
      </div>
      
      <div className="traits">
        <TraitBadge icon={<Smile />} label={persona.behavior_traits.patience_level} />
        <TraitBadge icon={<Cpu />} label={persona.behavior_traits.tech_savviness} />
      </div>
      
      <div className="actions">
        <Button size="sm" variant="secondary" onClick={tryVoice}>
          <Volume2 /> Try Voice
        </Button>
        <Button size="sm" onClick={useInTest}>
          Use in Test
        </Button>
      </div>
      
      <div className="card-actions">
        <IconButton icon={<Edit />} onClick={edit} />
        <IconButton icon={<Copy />} onClick={clone} />
        <IconButton icon={<Trash2 />} onClick={deletePersona} />
      </div>
    </PersonaCard>
  ))}
</PersonasGrid>

4.4 Persona Detail Modal
jsx

<Modal size="large" isOpen={isOpen} onClose={onClose}>
  <ModalHeader>
    <Avatar gender={persona.gender} size="large" />
    <div>
      <h2>{persona.name}</h2>
      <Badge>{persona.voice_type}</Badge>
    </div>
  </ModalHeader>
  
  <Tabs>
    <Tab label="About">
      <div className="space-y-4">
        <Section title="Description">
          <p>{persona.description}</p>
        </Section>
        
        <Section title="Demographics">
          <InfoGrid>
            <InfoRow label="Region" value={persona.region} />
            <InfoRow label="Age Group" value={persona.age_group} />
            <InfoRow label="Gender" value={persona.gender} />
            <InfoRow label="Occupation" value={persona.occupation} />
            <InfoRow label="Native Language" value={persona.native_language} />
          </InfoGrid>
        </Section>
        
        <Section title="Suitable For">
          <div className="flex flex-wrap gap-2">
            {persona.suitable_for_paths.map(path => (
              <Badge key={path}>{path}</Badge>
            ))}
          </div>
        </Section>
      </div>
    </Tab>
    
    <Tab label="Voice Profile">
      <div className="space-y-4">
        <Section title="Voice Configuration">
          <InfoGrid>
            <InfoRow label="Provider" value={persona.voice_profile.provider} />
            <InfoRow label="Voice ID" value={persona.voice_profile.voice_id} />
            <InfoRow label="Language Code" value={persona.voice_profile.language_code} />
            <InfoRow label="Accent Type" value={persona.voice_profile.accent_type} />
          </InfoGrid>
        </Section>
        
        <Section title="Voice Parameters">
          <div className="space-y-3">
            <RangeSlider
              label="Pace"
              value={persona.voice_profile.pace}
              min={0.5}
              max={2.0}
              step={0.1}
              disabled
            />
            <RangeSlider
              label="Pitch"
              value={persona.voice_profile.pitch}
              min={-1}
              max={1}
              step={0.1}
              disabled
            />
          </div>
        </Section>
        
        <Button onClick={playVoiceSample}>
          <Volume2 /> Play Voice Sample
        </Button>
      </div>
    </Tab>
    
    <Tab label="Behavior Traits">
      <div className="space-y-4">
        <TraitCard
          icon={<Clock />}
          title="Patience Level"
          value={persona.behavior_traits.patience_level}
          description="How patient the persona is during conversations"
        />
        
        <TraitCard
          icon={<MessageSquare />}
          title="Verbosity"
          value={persona.behavior_traits.verbosity}
          description="How much detail the persona provides"
        />
        
        <TraitCard
          icon={<Cpu />}
          title="Tech Savviness"
          value={persona.behavior_traits.tech_savviness}
          description="Comfort level with technology"
        />
        
        <TraitCard
          icon={<User />}
          title="Formality"
          value={persona.behavior_traits.formality}
          description="Communication style formality"
        />
        
        {persona.behavior_traits.special_behaviors && (
          <Section title="Special Behaviors">
            <ul className="list-disc list-inside">
              {persona.behavior_traits.special_behaviors.map(behavior => (
                <li key={behavior}>{behavior}</li>
              ))}
            </ul>
          </Section>
        )}
      </div>
    </Tab>
    
    <Tab label="Usage Stats">
      <div className="space-y-4">
        <StatsGrid>
          <StatCard
            title="Times Used"
            value={persona.usage_stats.times_used}
            icon={<Activity />}
          />
          <StatCard
            title="Success Rate"
            value={`${persona.usage_stats.success_rate}%`}
            icon={<CheckCircle />}
          />
          <StatCard
            title="Avg Score"
            value={persona.usage_stats.avg_score}
            icon={<Star />}
          />
        </StatsGrid>
        
        <Section title="Recent Simulations">
          <Table>
            <thead>
              <tr>
                <th>Simulation ID</th>
                <th>Date</th>
                <th>Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {persona.recent_simulations.map(sim => (
                <tr key={sim.id}>
                  <td><Code>{truncate(sim.id)}</Code></td>
                  <td>{formatDate(sim.date)}</td>
                  <td><Score value={sim.score} /></td>
                  <td><StatusBadge status={sim.status} /></td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Section>
      </div>
    </Tab>
  </Tabs>
  
  <ModalFooter>
    <Button variant="secondary" onClick={onClose}>
      Close
    </Button>
    <Button variant="secondary" onClick={clonePersona}>
      <Copy /> Clone & Customize
    </Button>
    <Button onClick={usePersona}>
      Use in Test Case
    </Button>
  </ModalFooter>
</Modal>

Backend Requirements:
python

GET /api/v1/personas
Query params:
  - search: str
  - region: List[str]
  - language: List[str]
  - age_group: List[str]
  - gender: str
  - patience_level: List[str]

GET /api/v1/personas/{persona_id}
POST /api/v1/personas/{persona_id}/test-voice

5. Test Sets Page

Route: /test-sets

Purpose: Manage collections of test cases
5.1 Header
jsx

<PageHeader>
  <h1>Test Sets</h1>
  <div className="actions">
    <Button variant="secondary">
      <Download /> Export
    </Button>
    <Button variant="primary" onClick={openCreateModal}>
      <Plus /> Create Test Set
    </Button>
  </div>
</PageHeader>

5.2 Filters
jsx

<FiltersBar>
  <SearchInput placeholder="Search by ID, name, or description..." />
  <Select label="Agent" options={agents} />
  <Select label="Status" options={['All', 'Draft', 'Ready', 'Archived']} />
  <RangeSlider label="Test Cases" min={0} max={100} />
  <DateRangePicker label="Created Date" />
</FiltersBar>

5.3 Test Sets Table
jsx

<Table>
  <thead>
    <tr>
      <th><Checkbox /></th>
      <th>Name</th>
      <th>Description</th>
      <th>Test Cases</th>
      <th>Created At</th>
      <th>Last Updated</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {testSets.map(set => (
      <tr key={set.id} onClick={() => navigate(`/test-sets/${set.id}`)}>
        <td><Checkbox /></td>
        <td className="font-medium">{set.name}</td>
        <td className="text-gray-400">{truncate(set.description, 60)}</td>
        <td>
          <Badge variant="info">{set.test_cases.length} cases</Badge>
        </td>
        <td>{formatDate(set.created_at)}</td>
        <td>{formatDate(set.updated_at)}</td>
        <td>
          <IconButton icon={<Eye />} onClick={view} />
          <IconButton icon={<Edit />} onClick={edit} />
          <IconButton icon={<Play />} onClick={run} />
          <IconButton icon={<Copy />} onClick={clone} />
          <IconButton icon={<Trash2 />} onClick={deleteSet} />
        </td>
      </tr>
    ))}
  </tbody>
</Table>

Backend Requirements:
python

GET /api/v1/test-sets
Query params:

search, agent_id, status, min_cases, max_cases, created_after, created_before

Response:
{
"test_sets": [...],
"total": 48,
"skip": 0,
"limit": 50
}


---

### 6. Test Set Detail Page

**Route:** `/test-sets/:setId`

**Purpose:** View and edit a test set with all test cases

#### 6.1 Header (Inline Editable)
```jsx
<DetailHeader>
  <BackButton to="/test-sets" />
  
  <div className="editable-title" onClick={enableEdit}>
    {isEditingName ? (
      <Input
        value={name}
        onChange={setName}
        onBlur={saveName}
        onKeyDown={e => e.key === 'Enter' && saveName()}
        autoFocus
      />
    ) : (
      <>
        <h1>{testSet.name}</h1>
        <IconButton icon={<Edit />} size="sm" />
      </>
    )}
  </div>
  
  <div className="editable-description" onClick={enableEdit}>
    {isEditingDescription ? (
      <Textarea
        value={description}
        onChange={setDescription}
        onBlur={saveDescription}
        autoFocus
      />
    ) : (
      <>
        <p>{testSet.description}</p>
        <IconButton icon={<Edit />} size="sm" />
      </>
    )}
  </div>
  
  <div className="actions">
    <Button variant="secondary" onClick={addTestCase}>
      <Plus /> Add Test Case
    </Button>
    <Button variant="secondary" onClick={runSimulation}>
      <Play /> Run Simulation
    </Button>
    <DropdownMenu>
      <DropdownItem onClick={clone}>Clone</DropdownItem>
      <DropdownItem onClick={exportSet}>Export</DropdownItem>
      <DropdownItem onClick={archive}>Archive</DropdownItem>
      <DropdownItem onClick={deleteSet} danger>Delete</DropdownItem>
    </DropdownMenu>
  </div>
</DetailHeader>
```

#### 6.2 Metrics Cards
```jsx
<MetricsGrid>
  <MetricCard
    title="Test Cases"
    value={testSet.test_cases.length}
    icon={<FileText />}
  />
  <MetricCard
    title="Owner"
    value={testSet.owner}
    icon={<User />}
  />
  <MetricCard
    title="Created"
    value={formatDate(testSet.created_at)}
    icon={<Calendar />}
  />
  <MetricCard
    title="Last Updated"
    value={formatDate(testSet.updated_at)}
    icon={<Clock />}
  />
</MetricsGrid>
```

#### 6.3 Generation Options
```jsx
<Section title="Generate Test Cases">
  <div className="flex gap-4">
    <Button
      variant="secondary"
      onClick={openGenerateFromFlowModal}
    >
      <GitBranch /> From Flow
    </Button>
    <Button
      variant="secondary"
      onClick={openGenerateFromAudioModal}
    >
      <Music /> From Audio
    </Button>
    <Button
      variant="secondary"
      onClick={openAIGenerateModal}
    >
      <Sparkles /> AI Generate
    </Button>
  </div>
</Section>
```

#### 6.4 Test Cases Table (Expandable Rows)
```jsx
<TestCasesTable>
  <TableFilters>
    <SearchInput placeholder="Search test cases..." />
    <Select label="Type" options={['All', 'Scenario', 'Transcript', 'Audio', 'Graph', 'IVR']} />
    <Select label="Status" options={['All', 'Pass', 'Fail', 'Not Run']} />
  </TableFilters>
  
  <Table>
    <thead>
      <tr>
        <th className="w-10"></th>
        <th><Checkbox /></th>
        <th>ID / Name</th>
        <th>Type</th>
        <th>Input</th>
        <th>Expected Output</th>
        <th>Persona</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {testCases.map(testCase => (
        <>
          <tr key={testCase.id} className="cursor-pointer">
            <td>
              <IconButton
                icon={expandedRows.includes(testCase.id) ? <ChevronDown /> : <ChevronRight />}
                onClick={() => toggleRow(testCase.id)}
              />
            </td>
            <td><Checkbox /></td>
            <td>
              <div className="font-medium">{testCase.name}</div>
              <Code className="text-xs">{testCase.id}</Code>
            </td>
            <td>
              <TypeBadge type={testCase.type} />
            </td>
            <td className="max-w-xs truncate">{testCase.input}</td>
            <td className="max-w-xs truncate">{testCase.expected_output}</td>
            <td>
              {testCase.persona_id && (
                <PersonaBadge personaId={testCase.persona_id} />
              )}
            </td>
            <td>
              {testCase.last_result && (
                <StatusBadge status={testCase.last_result.status} />
              )}
            </td>
            <td>
              <IconButton icon={<Play />} onClick={runTest} />
              <IconButton icon={<Edit />} onClick={editTest} />
              <IconButton icon={<Copy />} onClick={duplicateTest} />
              <IconButton icon={<Trash2 />} onClick={deleteTest} />
            </td>
          </tr>
          
          {expandedRows.includes(testCase.id) && (
            <tr className="bg-gray-900/50">
              <td colSpan={9}>
                <ExpandedTestCaseView testCase={testCase} />
              </td>
            </tr>
          )}
        </>
      ))}
    </tbody>
  </Table>
</TestCasesTable>
```

#### 6.5 Expanded Test Case View
```jsx
<ExpandedTestCaseView>
  <div className="grid grid-cols-2 gap-6 p-6">
    <div>
      <Label>Full Input</Label>
      <Card className="bg-gray-800 p-4">
        <pre className="whitespace-pre-wrap">{testCase.input}</pre>
      </Card>
    </div>
    
    <div>
      <Label>Expected Output</Label>
      <Card className="bg-gray-800 p-4">
        <pre className="whitespace-pre-wrap">{testCase.expected_output}</pre>
      </Card>
    </div>
    
    <div>
      <Label>Persona</Label>
      {testCase.persona_id ? (
        <PersonaCard persona={getPersona(testCase.persona_id)} compact />
      ) : (
        <EmptyState text="No persona assigned" />
      )}
    </div>
    
    <div>
      <Label>Evaluation Metrics</Label>
      <div className="flex flex-wrap gap-2">
        {testCase.metrics?.map(metric => (
          <Badge key={metric}>{metric}</Badge>
        ))}
      </div>
    </div>
    
    {testCase.extra_instructions && (
      <div className="col-span-2">
        <Label>Extra Instructions</Label>
        <Card className="bg-gray-800 p-4">
          <p>{testCase.extra_instructions}</p>
        </Card>
      </div>
    )}
    
    {testCase.last_result && (
      <div className="col-span-2">
        <Label>Last Result</Label>
        <ResultCard result={testCase.last_result} />
      </div>
    )}
  </div>
</ExpandedTestCaseView>
```

**Backend Requirements:**
```python
GET /api/v1/test-sets/{set_id}
PUT /api/v1/test-sets/{set_id}
POST /api/v1/test-sets/{set_id}/test-cases
PUT /api/v1/test-sets/{set_id}/test-cases/{case_id}
DELETE /api/v1/test-sets/{set_id}/test-cases/{case_id}
POST /api/v1/test-sets/{set_id}/run
```

---

### 7. Simulations List Page (Runs Overview)

**Route:** `/simulation/runs`

**Purpose:** View all simulation runs with filtering and search

#### 7.1 Header
```jsx
<PageHeader>
  <h1>Simulation Runs</h1>
  <Button variant="primary" onClick={openRunSimulationModal}>
    <Play /> Run New Simulation
  </Button>
</PageHeader>
```

#### 7.2 Filters
```jsx
<FiltersBar>
  <SearchInput placeholder="Search by simulation ID..." />
  <Select label="Agent" options={agents} />
  <Select label="Test Set" options={testSets} />
  <MultiSelect
    label="Status"
    options={['Queued', 'Running', 'Completed', 'Failed', 'Cancelled']}
  />
  <DateRangePicker label="Date Range" />
  <RangeSlider label="Score" min={0} max={100} />
</FiltersBar>
```

#### 7.3 Simulations Table
```jsx
<Table>
  <thead>
    <tr>
      <th><Checkbox /></th>
      <th>Simulation ID</th>
      <th>Agent</th>
      <th>Test Set</th>
      <th>Started</th>
      <th>Duration</th>
      <th>Status</th>
      <th>Progress</th>
      <th>Score</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {simulations.map(sim => (
      <tr key={sim.id} onClick={() => navigate(`/simulation/runs/${sim.id}`)}>
        <td><Checkbox /></td>
        <td>
          <Code copyable>{truncate(sim.id, 12)}</Code>
        </td>
        <td>{sim.agent_name}</td>
        <td>{sim.test_set_name}</td>
        <td>{formatDateTime(sim.started_at)}</td>
        <td>{formatDuration(sim.duration_ms)}</td>
        <td>
          <StatusBadge status={sim.status} animated={sim.status === 'running'} />
        </td>
        <td>
          {sim.status === 'running' ? (
            <ProgressBar
              value={sim.progress_percentage}
              label={`${sim.completed_sessions}/${sim.total_sessions}`}
            />
          ) : (
            <span>{sim.completed_sessions}/{sim.total_sessions}</span>
          )}
        </td>
        <td>
          {sim.status === 'completed' && (
            <Score value={sim.overall_score} size="large" />
          )}
        </td>
        <td>
          <IconButton icon={<Eye />} onClick={view} />
          {sim.status === 'running' && (
            <IconButton icon={<StopCircle />} onClick={cancel} />
          )}
          {sim.status === 'completed' && (
            <IconButton icon={<RefreshCw />} onClick={rerun} />
          )}
          <IconButton icon={<Download />} onClick={exportResults} />
          <IconButton icon={<Trash2 />} onClick={deleteSimulation} />
        </td>
      </tr>
    ))}
  </tbody>
</Table>
```

**Bulk Actions:**
```jsx
<BulkActions selected={selectedSimulations}>
  <Button onClick={bulkDelete}>Delete Selected</Button>
  <Button onClick={bulkExport}>Export Selected</Button>
  <Button onClick={bulkCompare}>Compare Selected</Button>
</BulkActions>
```

**Backend Requirements:**
```python
GET /api/v1/simulations
Query params: search, agent_id, test_set_id, status, started_after, started_before, min_score, max_score

Response:
{
  "simulations": [...],
  "total": 156,
  "skip": 0,
  "limit": 50
}
```

---

### 8. Simulation Detail Page (NEW)

**Route:** `/simulation/runs/:simulationId`

**Purpose:** Detailed view of a single simulation run with live updates

#### 8.1 Header
```jsx
<SimulationDetailHeader>
  <BackButton to="/simulation/runs" />
  
  <div className="simulation-info">
    <h1>Simulation {truncate(simulation.id)}</h1>
    <div className="meta">
      <AgentBadge agentId={simulation.agent_id} />
      <TestSetBadge testSetId={simulation.test_set_id} />
      <StatusBadge status={simulation.status} animated />
    </div>
  </div>
  
  <div className="actions">
    {simulation.status === 'running' && (
      <Button variant="danger" onClick={cancelSimulation}>
        <StopCircle /> Cancel
      </Button>
    )}
    {simulation.status === 'completed' && (
      <>
        <Button variant="secondary" onClick={rerunSimulation}>
          <RefreshCw /> Re-run
        </Button>
        <Button variant="secondary" onClick={downloadResults}>
          <Download /> Download Results
        </Button>
      </>
    )}
    <DropdownMenu>
      <DropdownItem onClick={viewEvaluation}>View Evaluation</DropdownItem>
      <DropdownItem onClick={compareWithOther}>Compare</DropdownItem>
      <DropdownItem onClick={exportJSON}>Export as JSON</DropdownItem>
      <DropdownItem onClick={deleteSimulation} danger>Delete</DropdownItem>
    </DropdownMenu>
  </div>
</SimulationDetailHeader>
```

#### 8.2 Overview Cards
```jsx
<MetricsGrid>
  <MetricCard
    title="Simulation ID"
    value={<Code copyable>{simulation.id}</Code>}
    icon={<Hash />}
  />
  <MetricCard
    title="Status"
    value={<StatusBadge status={simulation.status} large />}
    icon={<Activity />}
  />
  <MetricCard
    title="Started"
    value={formatDateTime(simulation.started_at)}
    subtitle={`Duration: ${formatDuration(simulation.duration_ms)}`}
    icon={<Clock />}
  />
  <MetricCard
    title="Overall Score"
    value={simulation.status === 'completed' ? (
      <Score value={simulation.overall_score} size="xlarge" />
    ) : (
      <span>-</span>
    )}
    icon={<Star />}
  />
</MetricsGrid>
```

#### 8.3 Quick Stats (if completed)
```jsx
<StatsSection>
  <StatCard
    title="Total Sessions"
    value={simulation.metadata.total_sessions}
    icon={<Users />}
  />
  <StatCard
    title="Passed"
    value={simulation.metadata.passed}
    icon={<CheckCircle />}
    variant="success"
  />
  <StatCard
    title="Failed"
    value={simulation.metadata.failed}
    icon={<XCircle />}
    variant="error"
  />
  <StatCard
    title="Avg Latency"
    value={`${simulation.metadata.avg_latency_ms}ms`}
    icon={<Zap />}
  />
  <StatCard
    title="Issues Found"
    value={simulation.metadata.issues_found}
    icon={<AlertTriangle />}
    variant="warning"
  />
</StatsSection>
```

#### 8.4 Sessions Table (with live updates)
```jsx
<SessionsSection>
  <TabNavigation>
    <Tab active count={simulation.metadata.total_sessions}>All</Tab>
    <Tab count={simulation.metadata.passed}>Passed</Tab>
    <Tab count={simulation.metadata.failed}>Failed</Tab>
    {simulation.status === 'running' && (
      <Tab count={simulation.metadata.active}>Active</Tab>
    )}
  </TabNavigation>
  
  <TableFilters>
    <SearchInput placeholder="Search sessions..." />
    <Select label="Test Case" options={testCases} />
    <Select label="Persona" options={personas} />
  </TableFilters>
  
  <Table>
    <thead>
      <tr>
        <th className="w-10"></th>
        <th>Session ID</th>
        <th>Test Case</th>
        <th>Persona</th>
        <th>Status</th>
        <th>Score</th>
        <th>Duration</th>
        <th>Started</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {sessions.map(session => (
        <>
          <tr
            key={session.id}
            className={cn(
              "cursor-pointer",
              session.status === 'running' && "animate-pulse"
            )}
          >
            <td>
              <IconButton
                icon={expandedSessions.includes(session.id) ? <ChevronDown /> : <ChevronRight />}
                onClick={() => toggleSession(session.id)}
              />
            </td>
            <td>
              <Code>{truncate(session.id)}</Code>
            </td>
            <td>{session.test_case_name}</td>
            <td>
              {session.persona_id && (
                <PersonaBadge personaId={session.persona_id} />
              )}
            </td>
            <td>
              <StatusBadge
                status={session.status}
                animated={session.status === 'running'}
              />
            </td>
            <td>
              {session.score !== null && (
                <Score value={session.score} />
              )}
            </td>
            <td>{formatDuration(session.duration_ms)}</td>
            <td>{formatTime(session.started_at)}</td>
            <td>
              <IconButton icon={<Eye />} onClick={() => viewTranscript(session)} />
              <IconButton icon={<BarChart3 />} onClick={() => viewMetrics(session)} />
              {session.status === 'failed' && (
                <IconButton icon={<RefreshCw />} onClick={() => retrySession(session)} />
              )}
            </td>
          </tr>
          
          {expandedSessions.includes(session.id) && (
            <tr className="bg-gray-900/50">
              <td colSpan={9}>
                <ExpandedSessionView session={session} />
              </td>
            </tr>
          )}
        </>
      ))}
    </tbody>
  </Table>
</SessionsSection>
```

#### 8.5 Live Log Streaming (if running)
```jsx
{simulation.status === 'running' && (
  <LiveLogsSection>
    <SectionHeader>
      <h3>Live Logs</h3>
      <div className="actions">
        <Button size="sm" onClick={pauseLogs}>
          {logsPaused ? <Play /> : <Pause />}
        </Button>
        <Button size="sm" onClick={clearLogs}>
          <Trash2 /> Clear
        </Button>
      </div>
    </SectionHeader>
    
    <LogViewer>
      {logs.map((log, index) => (
        <LogEntry key={index} level={log.level}>
          <span className="timestamp">{formatTime(log.timestamp)}</span>
          <span className="level">[{log.level}]</span>
          <span className="message">{log.message}</span>
        </LogEntry>
      ))}
    </LogViewer>
  </LiveLogsSection>
)}
```

#### 8.6 Expanded Session View
```jsx
<ExpandedSessionView>
  <Tabs>
    <Tab label="Transcript">
      <TranscriptViewer>
        <AudioPlayer src={session.audio_url} />
        
        <TranscriptTimeline>
          {session.transcript.map((turn, index) => (
            <TranscriptTurn
              key={index}
              speaker={turn.speaker}
              timestamp={turn.timestamp}
              text={turn.text}
              sentiment={turn.sentiment}
            />
          ))}
        </TranscriptTimeline>
      </TranscriptViewer>
    </Tab>
    
    <Tab label="Metrics">
      <MetricsBreakdown>
        {session.metrics.map(metric => (
          <MetricRow
            key={metric.name}
            name={metric.name}
            value={metric.value}
            threshold={metric.threshold}
            passed={metric.passed}
          />
        ))}
      </MetricsBreakdown>
    </Tab>
    
    <Tab label="Issues">
      <IssuesList>
        {session.issues.map((issue, index) => (
          <IssueCard
            key={index}
            severity={issue.severity}
            title={issue.title}
            description={issue.description}
            timestamp={issue.timestamp}
          />
        ))}
      </IssuesList>
    </Tab>
    
    <Tab label="Raw Data">
      <JSONViewer data={session} />
    </Tab>
  </Tabs>
</ExpandedSessionView>
```

**Backend Requirements:**
```python
GET /api/v1/simulations/{simulation_id}
GET /api/v1/simulations/{simulation_id}/sessions
GET /api/v1/simulations/{simulation_id}/logs (SSE endpoint)
POST /api/v1/simulations/{simulation_id}/cancel
POST /api/v1/simulations/{simulation_id}/rerun
DELETE /api/v1/simulations/{simulation_id}
```

---

### 9. Evaluator Page (Existing - Integration)

**Route:** `/simulation/evaluator`

**Current State:** Table of test scenarios with expandable rows

**Integration Changes:**

1. **Update Header:**
```jsx
<PageHeader>
  <h1>Evaluators (Test Scenarios)</h1>
  <div className="actions">
    <Button variant="secondary" onClick={openTestProfilesModal}>
      <User /> Test Profiles
    </Button>
    <Button variant="primary" onClick={openAddEvaluatorModal}>
      <Plus /> Add Evaluator
    </Button>
    <Button variant="primary" onClick={openGenerateEvaluatorsModal}>
      <Sparkles /> Generate Evaluators
    </Button>
  </div>
</PageHeader>
```

2. **Add Quick Filter Chips:**
```jsx
<FilterChips>
  <Chip active onClick={() => filterByPersonality('Normal Male')}>
    Normal Male (12)
  </Chip>
  <Chip onClick={() => filterByPersonality('Frustrated Customer')}>
    Frustrated Customer (8)
  </Chip>
  <Chip onClick={() => filterByProfile('customer_order')}>
    Customer Order Profile (15)
  </Chip>
</FilterChips>
```

3. **Enhanced Row Actions:**
```jsx
<td className="actions">
  <IconButton icon={<Play />} onClick={runSingle} tooltip="Run Single" />
  <IconButton icon={<Edit />} onClick={editEvaluator} tooltip="Edit" />
  <IconButton icon={<Copy />} onClick={duplicate} tooltip="Duplicate" />
  <IconButton icon={<FileText />} onClick={viewResults} tooltip="View Results" />
  <IconButton icon={<Trash2 />} onClick={deleteEvaluator} tooltip="Delete" />
</td>
```

4. **Bulk Run Actions:**
```jsx
<BulkActions selected={selectedEvaluators}>
  <Button onClick={runSelected}>
    <Play /> Run Selected ({selectedEvaluators.length})
  </Button>
  <Button onClick={exportSelected}>
    <Download /> Export Selected
  </Button>
  <Button onClick={deleteSelected} variant="danger">
    <Trash2 /> Delete Selected
  </Button>
</BulkActions>
```

---

### 10. Results Page (Existing - Integration)

**Route:** `/simulation/results`

**Current State:** Evaluation dashboard with metrics

**Integration Changes:**

1. **Add Navigation from Simulation Detail:**
   - When viewing a simulation, show "View Detailed Evaluation" button
   - Navigate to `/simulation/results?simulation_id={id}`

2. **Filter by Simulation:**
```jsx
<FiltersBar>
  <Select
    label="Simulation"
    options={simulations}
    value={simulationIdFromQuery}
  />
  <DateRangePicker label="Date Range" />
  <Select label="Status" options={['All', 'Pass', 'Fail']} />
</FiltersBar>
```

3. **Add Simulation Context Header:**
```jsx
{simulationId && (
  <ContextBanner>
    <InfoIcon />
    <span>
      Showing results for simulation <Code>{simulationId}</Code>
    </span>
    <Button size="sm" onClick={() => navigate(`/simulation/runs/${simulationId}`)}>
      View Simulation
    </Button>
  </ContextBanner>
)}
```

---

### 11. Metrics Page

**Route:** `/metrics`

**Purpose:** Manage evaluation metrics

#### 11.1 Header
```jsx
<PageHeader>
  <div>
    <h1>Metrics</h1>
    <p className="text-gray-400">
      Evaluation metrics for simulations and live monitoring
    </p>
  </div>
  <div className="actions">
    <Button variant="secondary" onClick={openMetricStudio}>
      <Wrench /> Metric Studio
    </Button>
    <Button variant="primary" onClick={openCreateMetricModal}>
      <Plus /> Create Metric
    </Button>
  </div>
</PageHeader>
```

#### 11.2 Tabs
```jsx
<TabNavigation>
  <Tab active>Agent Metrics</Tab>
  <Tab>Project Metrics</Tab>
  <Tab>Predefined Metrics</Tab>
</TabNavigation>
```

#### 11.3 Metrics Table
```jsx
<Table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
      <th>Category</th>
      <th>Type</th>
      <th>Affects Call Success</th>
      <th>Enabled</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {metrics.map(metric => (
      <tr key={metric.id}>
        <td className="font-medium">{metric.name}</td>
        <td className="text-gray-400">{truncate(metric.description)}</td>
        <td>
          <Badge>{metric.category}</Badge>
        </td>
        <td>
          <Badge variant={getTypeVariant(metric.type)}>
            {metric.type}
          </Badge>
        </td>
        <td>
          {metric.affects_call_success ? (
            <CheckCircle className="text-green-400" />
          ) : (
            <XCircle className="text-gray-600" />
          )}
        </td>
        <td>
          <Toggle
            checked={metric.enabled}
            onChange={() => toggleMetric(metric.id)}
          />
        </td>
        <td>
          <IconButton icon={<Eye />} onClick={viewDetails} />
          <IconButton icon={<Edit />} onClick={editMetric} />
          <IconButton icon={<Copy />} onClick={duplicateMetric} />
          <IconButton icon={<Trash2 />} onClick={deleteMetric} />
        </td>
      </tr>
    ))}
  </tbody>
</Table>
```

**Backend Requirements:**
```python
GET /api/v1/metrics
POST /api/v1/metrics
PUT /api/v1/metrics/{metric_id}
DELETE /api/v1/metrics/{metric_id}
POST /api/v1/metrics/{metric_id}/toggle
```

---

### 12. Test Profiles Page (NEW)

**Route:** `/test-profiles`

**Purpose:** Manage test profile data that agents should know

#### 12.1 Header
```jsx
<PageHeader>
  <div>
    <h1>Test Profiles</h1>
    <p className="text-gray-400">
      Information that test agents should know (e.g., customer data, order IDs)
    </p>
  </div>
  <Button variant="primary" onClick={openCreateModal}>
    <Plus /> Create Test Profile
  </Button>
</PageHeader>
```

#### 12.2 Table
```jsx
<Table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
      <th>Fields</th>
      <th>Associated Agent</th>
      <th>Created</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {profiles.map(profile => (
      <tr key={profile.id}>
        <td className="font-medium">{profile.name}</td>
        <td className="text-gray-400">{profile.description}</td>
        <td>
          <Badge>{Object.keys(profile.fields).length} fields</Badge>
        </td>
        <td>
          {profile.agent_id && (
            <AgentBadge agentId={profile.agent_id} />
          )}
        </td>
        <td>{formatDate(profile.created_at)}</td>
        <td>
          <IconButton icon={<Eye />} onClick={viewProfile} />
          <IconButton icon={<Edit />} onClick={editProfile} />
          <IconButton icon={<Copy />} onClick={duplicateProfile} />
          <IconButton icon={<Trash2 />} onClick={deleteProfile} />
        </td>
      </tr>
    ))}
  </tbody>
</Table>
```

**Backend Requirements:**
```python
GET /api/v1/test-profiles
POST /api/v1/test-profiles
GET /api/v1/test-profiles/{profile_id}
PUT /api/v1/test-profiles/{profile_id}
DELETE /api/v1/test-profiles/{profile_id}
```

---

### 13. Observability - Calls Page (Existing - Enhancement)

**Route:** `/observability/calls`

**Current State:** Table of actual call logs

**Enhancement:**

1. **Add Lab Feature:**
```jsx
<TableToolbar>
  <Button variant="secondary" onClick={openAddToLabModal}>
    <TestTube /> Add to Lab
  </Button>
  <Button variant="secondary" onClick={createTestFromCall}>
    <FileText /> Create Test from Call
  </Button>
</TableToolbar>
```

2. **Enhanced Row Actions:**
```jsx
<td className="actions">
  <IconButton icon={<Eye />} onClick={viewCall} tooltip="View Details" />
  <IconButton icon={<Play />} onClick={replayCall} tooltip="Replay" />
  <IconButton icon={<TestTube />} onClick={addToLab} tooltip="Add to Lab" />
  <IconButton icon={<FileText />} onClick={createTest} tooltip="Create Test" />
  <IconButton icon={<Download />} onClick={downloadAudio} tooltip="Download Audio" />
</td>
```

---

## Modal Specifications

### Modal 1: Create Agent Modal

**Trigger:** Click "Create Agent" button

**Purpose:** Configure and connect a new agent from a voice platform

#### Modal Structure
```jsx
<Modal size="xlarge" isOpen={isOpen} onClose={onClose}> <ModalHeader> <h2>Create an Agent</h2> <p>Create an agent to start testing your voice assistant</p> </ModalHeader> <ModalBody className="grid grid-cols-2 gap-8"> {/* Left Panel - Form */} <div className="form-panel"> <FormField label="Agent name" required> <Input placeholder="e.g., Customer Support Agent - v1" value={agentName} onChange={setAgentName} /> </FormField>

  <div className="grid grid-cols-2 gap-4">
    <FormField label="Contact number" required>
      <PhoneInput
        value={phoneNumber}
        onChange={setPhoneNumber}
      />
    </FormField>
    
    <FormField label="Language" required>
      <Select
        options={['English', 'Spanish', 'Hindi', 'French']}
        value={language}
        onChange={setLanguage}
      />
    </FormField>
  </div>
  
  <FormField label="Description" required>
    <Textarea
      rows={12}
      placeholder="Add your AI Agent's prompt or a detailed description..."
      value={description}
      onChange={setDescription}
    />
    <HelpText>
      By clearly articulating your agent's description, you enable us to generate more accurate test scenarios.
      <Link to="/docs/agent-description">Learn more →</Link>
    </HelpText>
  </FormField>
  
  <FormField label="Inbound">
    <Toggle
      checked={isInbound}
      onChange={setIsInbound}
    />
    <HelpText>
      If true, our agent will call you on above number.
    </HelpText>
  </FormField>
</div>

{/* Right Panel - Guide */}
<div className="guide-panel bg-gray-900/50 p-6 rounded-lg">
  <h3 className="text-lg font-semibold mb-4">
    Getting Started - Create an Agent
  </h3>
  
  <div className="space-y-6">
    <GuideStep number={1} title="Open The Agent Form">
      <p>
        From your dashboard, click "Create an agent" in the left panel,
        or open the dropdown and click "Create an agent".
      </p>
    </GuideStep>
    
    <GuideStep number={2} title="Fill the Details">
      <p>Complete each field with the following information:</p>
      
      <div className="mt-3 space-y-2">
        <DetailRow label="Agent Name">
          Choose a unique, descriptive name for your agent
        </DetailRow>
        
        <DetailRow label="Contact Number">
          Phone number for inbound calls (optional)
        </DetailRow>
        
        <DetailRow label="Language">
          Main language your agent will communicate in
        </DetailRow>
        
        <DetailRow label="Description">
          Add a detailed description including your agent's role, target users, and instructions. You can paste their agent's prompt here.
        </DetailRow>
      </div>
      
      <Link to="/docs/agent-description" className="text-teal-400 text-sm mt-3 inline-block">
        View our agent description guide →
      </Link>
    </GuideStep>
    
    <GuideStep number={3} title="Inbound Setting">
      <div className="bg-gray-800 p-3 rounded">
        <strong>True:</strong> Our test agents will call your number<br/>
        <strong>False:</strong> No AI agent will call our test agent (call from the agent)
      </div>
    </GuideStep>
  </div>
</div>

</ModalBody> <ModalFooter> <Button variant="secondary" onClick={onClose}> Cancel </Button> <Button variant="primary" onClick={handleCreate} disabled={!isValid} loading={isCreating} > Create </Button> </ModalFooter> </Modal> ````

Backend Requirements:
python

POST /api/v1/agents
Request body:
{
  "name": str,
  "phone_number": str,
  "language": str,
  "description": str,
  "is_inbound": bool,
  "platform": str  # To be added if multi-platform support
}

Modal 2: Generate Evaluators Modal

Trigger: Click "Generate Evaluators" button

Purpose: AI-generate test scenarios for an agent
jsx

<Modal size="large" isOpen={isOpen} onClose={onClose}>
  <ModalHeader>
    <h2>Generate Evaluators</h2>
    <p>Generate evaluators to test your voice assistant</p>
  </ModalHeader>
  
  <ModalBody className="grid grid-cols-2 gap-8">
    {/* Left Panel - Configuration */}
    <div className="config-panel space-y-6">
      <FormField label="Number of Scenarios" required>
        <Input
          type="number"
          min={1}
          max={100}
          value={numScenarios}
          onChange={setNumScenarios}
        />
      </FormField>
      
      <FormField label="Scenario Type">
        <Select
          options={['None', 'Edge Cases', 'Happy Path', 'Error Handling']}
          value={scenarioType}
          onChange={setScenarioType}
        />
        <HelpText>Select the type of scenario to generate</HelpText>
      </FormField>
      
      <FormField label="Test Profile">
        <Select
          options={testProfiles}
          value={testProfile}
          onChange={setTestProfile}
          placeholder="Select Test Profile"
        />
        <HelpText>
          Test profile is the information you expect our test agent to know.
          Example: the name, date of birth, etc.
        </HelpText>
      </FormField>
      
      <FormField label="Personalities">
        <MultiSelect
          options={personalities}
          value={selectedPersonalities}
          onChange={setSelectedPersonalities}
        />
        <HelpText>Select the personalities that the AI will use.</HelpText>
      </FormField>
      
      <FormField label="Extra Instructions">
        <Textarea
          rows={4}
          placeholder="e.g., Generate scenarios where the user is trying to fake his identity OR Generate scenarios where the user is trying to cancel an appointment"
          value={extraInstructions}
          onChange={setExtraInstructions}
        />
        <HelpText>Additional instructions for the LLM while generating scenarios.</HelpText>
      </FormField>
      
      <FormField label="Tags">
        <TagInput
          placeholder="Press Enter to add a tag"
          tags={tags}
          onAdd={addTag}
          onRemove={removeTag}
        />
      </FormField>
    </div>
    
    {/* Right Panel - Guide */}
    <div className="guide-panel bg-gray-900/50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">
        Getting Started - Generate Evaluators
      </h3>
      
      <div className="space-y-6">
        <GuideStep number={1} title="Click Generate Evaluator">
          <p>
            From the evaluator section, click the "Generate Evaluator" button on the top right.
          </p>
        </GuideStep>
        
        <GuideStep number={2} title="Select Number of Evaluators (Required)">
          <p>
            At minimum, you only need to select the number of evaluators to generate.
            All other configurations are optional and available in the "Additional Info" dropdown section.
          </p>
          
          <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3 mt-3">
            <strong className="text-blue-400">Quick tip:</strong> You can simply enter the number of evaluators and skip directly to Step 3 if you want to use default settings!
          </div>
        </GuideStep>
        
        <GuideStep number={3} title="Click Generate and Wait">
          <p>
            Review your configuration and click generate. Once generated you will see all evaluators to review if interested.
          </p>
          
          <p className="mt-2 text-gray-400">
            Note - this may take some time. Feel free to close the pop up and explore the platform.
          </p>
        </GuideStep>
      </div>
    </div>
  </ModalBody>
  
  <ModalFooter>
    <Button variant="secondary" onClick={onClose}>
      Cancel
    </Button>
    <Button
      variant="primary"
      onClick={handleGenerate}
      disabled={!numScenarios}
      loading={isGenerating}
    >
      Generate
    </Button>
  </ModalFooter>
</Modal>

Backend Requirements:
python

POST /api/v1/evaluators/generate
Request body:
{
  "agent_id": str,
  "num_scenarios": int,
  "scenario_type": str | None,
  "test_profile_id": str | None,
  "personalities": List[str],
  "extra_instructions": str | None,
  "tags": List[str]
}

Modal 3: Create Test Set Modal

Trigger: Click "Create Test Set" button

Purpose: Multi-step wizard to create a test set
Step 1: Basics
jsx

<ModalStep step={1} total={3} title="Test Set Basics">
  <FormField label="Test Set Name" required>
    <Input
      placeholder="Enter test set name"
      value={name}
      onChange={setName}
    />
  </FormField>
  
  <FormField label="Test Set Owner">
    <Input
      placeholder="Your name"
      value={owner}
      onChange={setOwner}
    />
  </FormField>
  
  <FormField label="Test Set Description">
    <Textarea
      rows={3}
      placeholder="Enter test set description"
      value={description}
      onChange={setDescription}
    />
  </FormField>
  
  <FormField label="Associated Agent" required>
    <Select
      options={agents}
      value={agentId}
      onChange={setAgentId}
      placeholder="Select an agent"
    />
  </FormField>
</ModalStep>

Step 2: Test Case Type Selection
jsx

<ModalStep step={2} total={3} title="Select Test Case Type">
  <p className="text-gray-400 mb-6">
    Select the type of test cases for this suite
  </p>
  
  <div className="grid grid-cols-3 gap-4">
    <TestTypeCard
      icon={<FileText />}
      title="Scenarios"
      description="Text-based test scenarios with expected flows."
      selected={testType === 'scenarios'}
      onClick={() => setTestType('scenarios')}
    />
    
    <TestTypeCard
      icon={<MessageSquare />}
      title="Transcripts"
      description="Conversation logs from real calls. We'll replay them."
      selected={testType === 'transcripts'}
      onClick={() => setTestType('transcripts')}
    />
    
    <TestTypeCard
      icon={<Music />}
      title="Audio Files"
      description="Upload audio recordings for observed testing."
      selected={testType === 'audio'}
      onClick={() => setTestType('audio')}
    />
    
    <TestTypeCard
      icon={<GitBranch />}
      title="Graph-based"
      description="Flow diagrams and decision trees for logic testing."
      selected={testType === 'graph'}
      onClick={() => setTestType('graph')}
    />
    
    <TestTypeCard
      icon={<Phone />}
      title="IVR Testing"
      description="Phone tree navigation and DTMF input tests."
      selected={testType === 'ivr'}
      onClick={() => setTestType('ivr')}
    />
  </div>
  
  {testType && (
    <div className="mt-6 bg-gray-900/50 p-4 rounded">
      <h4 className="font-medium mb-2">Best for:</h4>
      <p className="text-sm text-gray-400">
        {getTestTypeDescription(testType)}
      </p>
    </div>
  )}
</ModalStep>

Step 3: Configuration
jsx

<ModalStep step={3} total={3} title="Configuration">
  <FormField label="Test Profile">
    <Select
      options={testProfiles}
      value={testProfileId}
      onChange={setTestProfileId}
      placeholder="Select test profile (optional)"
    />
  </FormField>
  
  <FormField label="Default Persona">
    <Select
      options={personas}
      value={defaultPersonaId}
      onChange={setDefaultPersonaId}
      placeholder="Select default persona (optional)"
    />
  </FormField>
  
  <FormField label="Extra Instructions">
    <Textarea
      rows={4}
      placeholder="Additional instructions for the evaluator"
      value={extraInstructions}
      onChange={setExtraInstructions}
    />
    <HelpText>
      💡 You can add test cases after creation
    </HelpText>
  </FormField>
</ModalStep>

Navigation:
jsx

<ModalFooter>
  {currentStep > 1 && (
    <Button variant="secondary" onClick={goBack}>
      Back
    </Button>
  )}
  
  {currentStep < 3 ? (
    <Button
      variant="primary"
      onClick={goNext}
      disabled={!isStepValid(currentStep)}
    >
      Next
    </Button>
  ) : (
    <Button
      variant="primary"
      onClick={handleCreate}
      disabled={!isValid}
      loading={isCreating}
    >
      Create Test Set
    </Button>
  )}
</ModalFooter>

Modal 4: Test Case Editor Modal

Trigger: Click "Edit" on a test case or "Add Test Case" button

Purpose: Create or edit individual test cases
jsx

<Modal size="xlarge" isOpen={isOpen} onClose={onClose}>
  <ModalHeader>
    <h2>{isEditing ? 'Edit Test Case' : 'Add Test Case'}</h2>
  </ModalHeader>
  
  <Tabs>
    <Tab label="Basics">
      <div className="space-y-6 p-6">
        <FormField label="Test Case Name" required>
          <Input
            placeholder="e.g., Happy path - order status inquiry"
            value={name}
            onChange={setName}
          />
        </FormField>
        
        <FormField label="Type" required>
          <Select
            options={['Scenario', 'Transcript', 'Audio', 'Graph', 'IVR']}
            value={type}
            onChange={setType}
          />
        </FormField>
        
        <FormField label="Input" required>
          <Textarea
            rows={6}
            placeholder="Enter the test input..."
            value={input}
            onChange={setInput}
          />
        </FormField>
        
        <FormField label="Expected Output" required>
          <Textarea
            rows={6}
            placeholder="Enter the expected agent response..."
            value={expectedOutput}
            onChange={setExpectedOutput}
          />
        </FormField>
        
        <FormField label="Priority">
          <Select
            options={['Low', 'Medium', 'High', 'Critical']}
            value={priority}
            onChange={setPriority}
          />
        </FormField>
      </div>
    </Tab>
    
    <Tab label="Persona">
      <div className="space-y-6 p-6">
        <FormField label="Select Persona">
          <SearchableSelect
            options={personas}
            value={personaId}
            onChange={setPersonaId}
            renderOption={(persona) => (
              <PersonaOption persona={persona} />
            )}
          />
        </FormField>
        
        {personaId && (
          <PersonaPreviewCard persona={getPersona(personaId)} />
        )}
        
        <Accordion title="Override Behavior (Optional)">
          <div className="space-y-4 pt-4">
            <FormField label="Custom Patience Level">
              <Select
                options={['Low', 'Medium', 'High']}
                value={customPatience}
                onChange={setCustomPatience}
              />
            </FormField>
            
            <FormField label="Custom Verbosity">
              <Select
                options={['Concise', 'Balanced', 'Verbose']}
                value={customVerbosity}
                onChange={setCustomVerbosity}
              />
            </FormField>
            
            <FormField label="Special Instructions">
              <Textarea
                rows={3}
                placeholder="Any special behavior for this test case..."
                value={specialInstructions}
                onChange={setSpecialInstructions}
              />
            </FormField>
          </div>
        </Accordion>
      </div>
    </Tab>
    
    <Tab label="Evaluation">
      <div className="space-y-6 p-6">
        <FormField label="Metrics to Evaluate">
          <p className="text-sm text-gray-400 mb-3">
            Select which metrics should be evaluated for this test case
          </p>
          
          <div className="space-y-2">
            {availableMetrics.map(metric => (
              <CheckboxWithLabel
                key={metric.id}
                label={metric.name}
                description={metric.description}
                checked={selectedMetrics.includes(metric.id)}
                onChange={() => toggleMetric(metric.id)}
              />
            ))}
          </div>
        </FormField>
        
        <FormField label="Success Criteria">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Label>Minimum Score:</Label>
              <RangeSlider
                min={0}
                max={100}
                value={minScore}
                onChange={setMinScore}
              />
              <span className="font-medium">{minScore}%</span>
            </div>
            
            <CheckboxWithLabel
              label="Must pass all selected metrics"
              checked={mustPassAll}
              onChange={setMustPassAll}
            />
          </div>
        </FormField>
      </div>
    </Tab>
    
    <Tab label="Advanced">
      <div className="space-y-6 p-6">
        <FormField label="Tags">
          <TagInput
            tags={tags}
            onAdd={addTag}
            onRemove={removeTag}
            placeholder="Add tags for organization..."
          />
        </FormField>
        
        <FormField label="Extra Instructions for Evaluator">
          <Textarea
            rows={4}
            placeholder="Additional context or instructions..."
            value={evaluatorInstructions}
            onChange={setEvaluatorInstructions}
          />
        </FormField>
        
        <FormField label="Custom Metadata">
          <KeyValueEditor
            data={metadata}
            onChange={setMetadata}
          />
        </FormField>
        
        <FormField label="Dependencies">
          <p className="text-sm text-gray-400 mb-2">
            Run this test case only after:
          </p>
          <MultiSelect
            options={otherTestCases}
            value={dependencies}
            onChange={setDependencies}
          />
        </FormField>
      </div>
    </Tab>
  </Tabs>
  
  <ModalFooter>
    <Button variant="secondary" onClick={onClose}>
      Cancel
    </Button>
    <Button
      variant="primary"
      onClick={handleSave}
      disabled={!isValid}
      loading={isSaving}
    >
      Save
    </Button>
  </ModalFooter>
</Modal>

Modal 5: Generate from Flow Modal

Trigger: Click "From Flow" button in test set detail page

Purpose: Generate test cases from a conversation flow
jsx

<Modal size="large" isOpen={isOpen} onClose={onClose}>
  <ModalHeader>
    <h2>Generate from Flow Tree</h2>
  </ModalHeader>
  
  <ModalBody className="space-y-6">
    <FormField label="Select Flow" required>
      <Select
        options={flows}
        value={flowId}
        onChange={setFlowId}
        placeholder="Choose a conversation flow"
        renderOption={(flow) => (
          <FlowOption
            name={flow.name}
            nodeCount={flow.nodes.length}
            createdAt={flow.created_at}
          />
        )}
      />
    </FormField>
    
    {flowId && (
      <FlowPreviewCard flow={getFlow(flowId)} />
    )}
    
    <Divider />
    
    <h3 className="font-semibold">Configuration</h3>
    
    <div className="grid grid-cols-2 gap-4">
      <FormField label="Max Paths">
        <RangeSlider
          min={1}
          max={50}
          value={maxPaths}
          onChange={setMaxPaths}
        />
        <span className="text-sm">{maxPaths} paths</span>
      </FormField>
      
      <FormField label="Region for Personas">
        <Select
          options={['India', 'North America', 'Europe', 'Auto']}
          value={region}
          onChange={setRegion}
        />
      </FormField>
    </div>
    
    <CheckboxGroup>
      <CheckboxWithLabel
        label="Include edge cases"
        checked={includeEdgeCases}
        onChange={setIncludeEdgeCases}
      />
      <CheckboxWithLabel
        label="Cover all paths"
        checked={coverAllPaths}
        onChange={setCoverAllPaths}
      />
      <CheckboxWithLabel
        label="Auto-assign personas"
        checked={autoAssignPersonas}
        onChange={setAutoAssignPersonas}
      />
    </CheckboxGroup>
  </ModalBody>
  
  <ModalFooter>
    <Button variant="secondary" onClick={onClose}>
      Cancel
    </Button>
    <Button
      variant="primary"
      onClick={handleGenerate}
      disabled={!flowId}
      loading={isGenerating}
    >
      Generate
    </Button>
  </ModalFooter>
</Modal>

Modal 6: Generate from Audio Modal

Trigger: Click "From Audio" button

Purpose: Upload audio files and generate test cases
jsx

<Modal size="xlarge" isOpen={isOpen} onClose={onClose}>
  <ModalHeader>
    <h2>Generate from Audio Files</h2>
  </ModalHeader>
  
  <Tabs>
    <Tab label="Upload" icon={<Upload />}>
      <div className="p-6">
        <FileDropzone
          accept=".wav,.mp3,.m4a"
          multiple
          onDrop={handleFilesAdded}
        >
          <div className="text-center py-12">
            <Upload size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">
              Drag & drop audio files here
            </p>
            <p className="text-sm text-gray-400 mb-4">
              or click to browse
            </p>
            <Button variant="secondary">Browse Files</Button>
            <p className="text-xs text-gray-500 mt-4">
              Supported formats: .wav, .mp3, .m4a (Max 100MB per file)
            </p>
          </div>
        </FileDropzone>
        
        {files.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-3">
              Uploaded Files ({files.length})
            </h3>
            <div className="space-y-2">
              {files.map((file, index) => (
                <FileCard
                  key={index}
                  filename={file.name}
                  size={formatFileSize(file.size)}
                  duration={file.duration}
                  onRemove={() => removeFile(index)}
                />
              ))}
            </div>
          </div>
        )}
        
        <FormField label="Select Flow for Grounding" className="mt-6">
          <Select
            options={flows}
            value={flowId}
            onChange={setFlowId}
            placeholder="Choose a conversation flow"
          />
          <HelpText>
            The flow will be used to validate and ground the transcriptions
          </HelpText>
        </FormField>
      </div>
    </Tab>
    
    <Tab label="Processing" icon={<Loader />} disabled={!isProcessing}>
      <div className="p-6">
        <h3 className="font-semibold mb-4">Processing Audio Files</h3>
        
        <Table>
          <thead>
            <tr>
              <th>File</th>
              <th>Status</th>
              <th>Progress</th>
              <th>Transcript Preview</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file, index) => (
              <tr key={index}>
                <td>{file.name}</td>
                <td>
                  <StatusBadge status={file.processingStatus} animated />
                </td>
                <td>
                  <ProgressBar value={file.processingProgress} />
                </td>
                <td>
                  {file.transcript && (
                    <span className="text-sm text-gray-400">
                      {truncate(file.transcript, 50)}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        
        <div className="mt-6 flex items-center gap-4">
          <div className="flex-1">
            <ProgressBar
              value={overallProgress}
              label={`${completedFiles}/${totalFiles} files processed`}
            />
          </div>
          <Button
            variant="secondary"
            onClick={pauseProcessing}
            disabled={!isProcessing}
          >
            {processingPaused ? <Play /> : <Pause />}
          </Button>
        </div>
      </div>
    </Tab>
    
    <Tab label="Review" icon={<CheckCircle />} disabled={!allProcessed}>
      <div className="p-6 space-y-6">
        <h3 className="font-semibold">Review Generated Test Cases</h3>
        
        {processedFiles.map((file, index) => (
          <TestCaseReviewCard
            key={index}
            file={file}
            onEdit={(data) => editTestCase(index, data)}
            onRemove={() => removeTestCase(index)}
          />
        ))}
        
        <div className="flex items-center gap-3">
          <Checkbox
            checked={addAll}
            onChange={setAddAll}
          />
          <Label>Add all test cases to suite</Label>
        </div>
      </div>
    </Tab>
  </Tabs>
  
  <ModalFooter>
    <Button variant="secondary" onClick={onClose}>
      {currentTab === 'review' ? 'Cancel' : 'Close'}
    </Button>
    
    {currentTab === 'upload' && (
      <Button
        variant="primary"
        onClick={startProcessing}
        disabled={files.length === 0 || !flowId}
      >
        Start Processing
      </Button>
    )}
    
    {currentTab === 'review' && (
      <Button
        variant="primary"
        onClick={handleAddToSuite}
        disabled={!hasSelectedTests}
      >
        Add to Suite ({selectedCount})
      </Button>
    )}
  </ModalFooter>
</Modal>

Modal 7: Run Simulation Modal

Trigger: Click "Run Simulation" button from anywhere

Purpose: Configure and start a new simulation
jsx

<Modal size="large" isOpen={isOpen} onClose={onClose}>
  <ModalHeader>
    <h2>Run Simulation</h2>
    <p>Configure and start a new test simulation</p>
  </ModalHeader>
  
  <ModalBody>
    <Wizard currentStep={currentStep} totalSteps={3}>
      {/* Step 1: Select Test Suite */}
      {currentStep === 1 && (
        <WizardStep title="Select Test Suite">
          <FormField label="Test Suite" required>
            <SearchableSelect
              options={testSets}
              value={testSetId}
              onChange={setTestSetId}
              renderOption={(set) => (
                <TestSetOption
                  name={set.name}
                  testCaseCount={set.test_cases.length}
                  agentName={set.agent_name}
                />
              )}
            />
          </FormField>
          
          {testSetId && (
            <TestSetPreview testSet={getTestSet(testSetId)} />
          )}
        </WizardStep>
      )}
      
      {/* Step 2: Configure Parameters */}
      {currentStep === 2 && (
        <WizardStep title="Configure Parameters">
          <FormField label="Phone Number">
            <PhoneInput
              value={phoneNumber}
              onChange={setPhoneNumber}
              helperText="Leave empty to use agent's default number"
            />
          </FormField>
          
          <FormField label="Region">
            <Select
              options={['Auto', 'North America', 'Europe', 'Asia Pacific']}
              value={region}
              onChange={setRegion}
            />
          </FormField>
          
          <CheckboxWithLabel
            label="Parallel execution"
            description="Run multiple test cases simultaneously"
            checked={parallelExecution}
            onChange={setParallelExecution}
          />
          
          {parallelExecution && (
            <FormField label="Max concurrent calls">
              <RangeSlider
                min={1}
                max={10}
                value={maxConcurrent}
                onChange={setMaxConcurrent}
              />
              <span className="text-sm">{maxConcurrent} calls</span>
            </FormField>
          )}
          
          <FormField label="Timeout per test (seconds)">
            <Input
              type="number"
              min={30}
              max={600}
              value={timeout}
              onChange={setTimeout}
            />
          </FormField>
        </WizardStep>
      )}
      
      {/* Step 3: Review & Start */}
      {currentStep === 3 && (
        <WizardStep title="Review & Start">
          <ReviewSection>
            <ReviewItem label="Test Suite" value={getTestSet(testSetId).name} />
            <ReviewItem label="Test Cases" value={`${testCases.length} cases`} />
            <ReviewItem label="Agent" value={agent.name} />
            <ReviewItem label="Phone Number" value={phoneNumber || 'Default'} />
            <ReviewItem label="Region" value={region} />
            <ReviewItem label="Parallel Execution" value={parallelExecution ? 'Yes' : 'No'} />
            {parallelExecution && (
              <ReviewItem label="Max Concurrent" value={`${maxConcurrent} calls`} />
            )}
            <ReviewItem label="Estimated Duration" value={estimatedDuration} />
          </ReviewSection>
          
          <Alert variant="info" className="mt-6">
            <InfoIcon />
            <div>
              <p className="font-medium">Ready to start</p> <p className="text-sm"> The simulation will begin immediately after clicking Start. You can monitor progress in real-time. </p> </div> </Alert> </WizardStep> )} </Wizard> </ModalBody>
<ModalFooter> {currentStep > 1 && ( <Button variant="secondary" onClick={goBack}> Back </Button> )}

<Button variant="secondary" onClick={onClose}>
  Cancel
</Button>

{currentStep < 3 ? (
  <Button
    variant="primary"
    onClick={goNext}
    disabled={!isStepValid(currentStep)}
  >
    Next
  </Button>
) : (
  <Button
    variant="primary"
    onClick={handleStart}
    loading={isStarting}
  >
    <Play /> Start Simulation
  </Button>
)}

</ModalFooter> </Modal> ````
Backend API Specifications
Base URL

http://localhost:8001/api/v1

Authentication
python

# Headers for all requests
{
  "Authorization": "Bearer {jwt_token}",
  "Content-Type": "application/json"
}

API Endpoints Summary
Agents
python

GET    /api/v1/agents
POST   /api/v1/agents
GET    /api/v1/agents/{agent_id}
PUT    /api/v1/agents/{agent_id}
DELETE /api/v1/agents/{agent_id}
POST   /api/v1/agents/{agent_id}/test-connection
POST   /api/v1/agents/{agent_id}/re-extract
GET    /api/v1/agents/{agent_id}/flows
GET    /api/v1/agents/{agent_id}/test-sets
GET    /api/v1/agents/{agent_id}/simulations

Personas
python

GET    /api/v1/personas
POST   /api/v1/personas
GET    /api/v1/personas/{persona_id}
PUT    /api/v1/personas/{persona_id}
DELETE /api/v1/personas/{persona_id}
POST   /api/v1/personas/{persona_id}/test-voice

Test Sets
python

GET    /api/v1/test-sets
POST   /api/v1/test-sets
GET    /api/v1/test-sets/{set_id}
PUT    /api/v1/test-sets/{set_id}
DELETE /api/v1/test-sets/{set_id}
POST   /api/v1/test-sets/{set_id}/test-cases
PUT    /api/v1/test-sets/{set_id}/test-cases/{case_id}
DELETE /api/v1/test-sets/{set_id}/test-cases/{case_id}
POST   /api/v1/test-sets/{set_id}/run

Test Profiles
python

GET    /api/v1/test-profiles
POST   /api/v1/test-profiles
GET    /api/v1/test-profiles/{profile_id}
PUT    /api/v1/test-profiles/{profile_id}
DELETE /api/v1/test-profiles/{profile_id}

Simulations
python

GET    /api/v1/simulations
POST   /api/v1/simulations/run
GET    /api/v1/simulations/{simulation_id}
GET    /api/v1/simulations/{simulation_id}/sessions
GET    /api/v1/simulations/{simulation_id}/logs (SSE)
POST   /api/v1/simulations/{simulation_id}/cancel
POST   /api/v1/simulations/{simulation_id}/rerun
DELETE /api/v1/simulations/{simulation_id}

Evaluators (Scenarios)
python

GET    /api/v1/evaluators
POST   /api/v1/evaluators
POST   /api/v1/evaluators/generate
GET    /api/v1/evaluators/{evaluator_id}
PUT    /api/v1/evaluators/{evaluator_id}
DELETE /api/v1/evaluators/{evaluator_id}
POST   /api/v1/evaluators/{evaluator_id}/run

Metrics
python

GET    /api/v1/metrics
POST   /api/v1/metrics
GET    /api/v1/metrics/{metric_id}
PUT    /api/v1/metrics/{metric_id}
DELETE /api/v1/metrics/{metric_id}
POST   /api/v1/metrics/{metric_id}/toggle

Generation
python

POST   /api/v1/generate/flow
POST   /api/v1/generate/test-suite
POST   /api/v1/generate/audio

Dashboard
python

GET    /api/v1/dashboard/stats
GET    /api/v1/dashboard/activity

Database Schema
Collections
1. agents
json

{
  "_id": "ObjectId",
  "platform": "vapi|elevenlabs|cartesia|retell|bland",
  "agent_id": "string",
  "agent_name": "string",
  "phone_number": "string",
  "direction": "inbound|outbound|both",
  "language": "string",
  "description": "string",
  "model_type": "string",
  "endpoint": "string",
  "metadata": {
    "system_prompt": "string",
    "tools": [],
    "model_config": {},
    "voice_settings": {}
  },
  "status": "active|inactive|error",
  "extraction_status": "extracted|pending|failed",
  "api_key_encrypted": "string",
  "created_at": "DateTime",
  "updated_at": "DateTime",
  "created_by": "string"
}

2. personas
json

{
  "_id": "ObjectId",
  "persona_id": "string",
  "name": "string",
  "description": "string",
  "region": "apac_india|na|eu|default",
  "age_group": "young|adult|middle_aged|senior",
  "gender": "male|female|neutral",
  "occupation": "string",
  "native_language": "string",
  "voice_profile": {
    "provider": "sarvam|elevenlabs|cartesia",
    "voice_id": "string",
    "language_code": "string",
    "accent_type": "string",
    "pace": 1.0,
    "pitch": 0.0
  },
  "behavior_traits": {
    "patience_level": "low|medium|high",
    "verbosity": "concise|balanced|verbose",
    "tech_savviness": "low|medium|high",
    "formality": "casual|neutral|formal",
    "special_behaviors": []
  },
  "tags": [],
  "confidence_score": 1.0,
  "voice_type": "inbound|outbound",
  "created_at": "DateTime"
}

3. test_sets
json

{
  "_id": "ObjectId",
  "name": "string",
  "description": "string",
  "owner": "string",
  "agent_id": "ObjectId",
  "status": "draft|ready|archived",
  "test_cases": [
    {
      "id": "string",
      "name": "string",
      "type": "scenario|transcript|audio|graph|ivr",
      "input": "string",
      "expected_output": "string",
      "persona_id": "ObjectId",
      "metrics": [],
      "priority": "low|medium|high|critical",
      "tags": [],
      "extra_instructions": "string",
      "metadata": {},
      "order": 0,
      "last_result": {}
    }
  ],
  "metadata": {
    "total_cases": 0,
    "avg_duration_ms": 0
  },
  "created_at": "DateTime",
  "updated_at": "DateTime"
}

4. test_profiles
json

{
  "_id": "ObjectId",
  "name": "string",
  "description": "string",
  "fields": {
    "key": "value"
  },
  "agent_id": "ObjectId",
  "created_at": "DateTime",
  "updated_at": "DateTime"
}

5. simulations
json

{
  "_id": "ObjectId",
  "simulation_id": "string",
  "agent_id": "ObjectId",
  "test_set_id": "ObjectId",
  "parameters": {
    "phone_number": "string",
    "region": "string",
    "parallel_execution": false,
    "max_concurrent_calls": 1,
    "timeout_seconds": 300
  },
  "status": "queued|running|completed|failed|cancelled",
  "started_at": "DateTime",
  "completed_at": "DateTime",
  "duration_ms": 0,
  "overall_score": 0,
  "progress_percentage": 0,
  "sessions": [
    {
      "session_id": "string",
      "test_case_id": "string",
      "persona_id": "ObjectId",
      "status": "pending|running|completed|failed",
      "score": 0,
      "duration_ms": 0,
      "started_at": "DateTime",
      "transcript_id": "ObjectId",
      "evaluation_id": "ObjectId",
      "audio_url": "string",
      "issues": []
    }
  ],
  "metadata": {
    "total_sessions": 0,
    "completed_sessions": 0,
    "passed": 0,
    "failed": 0,
    "active": 0,
    "avg_score": 0,
    "avg_latency_ms": 0,
    "issues_found": 0
  },
  "created_at": "DateTime"
}

6. evaluators (scenarios)
json

{
  "_id": "ObjectId",
  "scenario_id": "string",
  "scenario_name": "string",
  "agent_id": "ObjectId",
  "personality": "string",
  "phone_number": "string",
  "test_profile_id": "ObjectId",
  "language": "string",
  "instructions": "string",
  "metrics": [],
  "expected_outcome": "string",
  "tags": [],
  "created_at": "DateTime",
  "updated_at": "DateTime"
}

7. metrics
json

{
  "_id": "ObjectId",
  "metric_id": "string",
  "name": "string",
  "description": "string",
  "category": "accuracy|latency|quality|sentiment",
  "type": "boolean|rating|numeric",
  "affects_call_success": true,
  "enabled": true,
  "threshold": 0,
  "evaluation_trigger": "always|conditional",
  "created_at": "DateTime"
}

8. flows
json

{
  "_id": "ObjectId",
  "flow_id": "string",
  "name": "string",
  "description": "string",
  "agent_id": "ObjectId",
  "nodes": [],
  "edges": [],
  "mermaid": "string",
  "summary": "string",
  "created_at": "DateTime"
}

Implementation Roadmap
Phase 1: Foundation (Week 1-2)

Goal: Core infrastructure and basic functionality

Tasks:

    Set up React Router with all routes
    Create base layout components (Sidebar, Header, Page)
    Set up React Query with API client
    Create reusable UI components (Table, Card, Button, Badge, Form components)
    Implement authentication and authorization
    Set up Tailwind design system
    Create MongoDB collections with indexes

Deliverables:

    Working navigation structure
    Base UI component library
    Authentication flow
    Database schema implemented

Phase 2: Agents & Configuration (Week 3-4)

Goal: Complete agents management

Frontend Tasks:

    Agents List Page with table, filters, search
    Agent Detail Page with all 5 tabs
    Create Agent Modal
    Connect Agent Modal (platform selection)
    Generate Flow Modal integration

Backend Tasks:

    Agents CRUD API endpoints
    Agent extraction adapters (Vapi, ElevenLabs, Cartesia)
    Agent repository with search/filter
    Test connection endpoint
    Re-extract endpoint

Deliverables:

    Fully functional agents management
    Platform integrations working
    Agent detail page with all information

Phase 3: Personas & Test Profiles (Week 5)

Goal: Persona and test profile management

Frontend Tasks:

    Personas Grid Page with filters
    Persona Detail Modal with 4 tabs
    Test Profiles List Page
    Create/Edit Test Profile Modal

Backend Tasks:

    Load personas from JSON files
    Personas API endpoints
    Test Profiles CRUD API
    Persona repository
    Test profile repository

Deliverables:

    Browseable persona library
    Test profiles CRUD functionality

Phase 4: Test Sets Management (Week 6-7)

Goal: Complete test sets with all test case types

Frontend Tasks:

    Test Sets List Page
    Create Test Set Modal (3-step wizard)
    Test Set Detail Page with expandable rows
    Test Case Editor Modal (4 tabs)
    Generate from Flow Modal
    Generate from Audio Modal (3 tabs with upload)
    AI Generate Modal

Backend Tasks:

    Test Sets CRUD API
    Test Cases CRUD within sets
    Flow generation API
    Test suite generation from flows API
    Audio upload and processing API
    Bulk audio processing with queue

Deliverables:

    Full test set management
    All 5 test case types working
    Generation workflows functional

Phase 5: Simulations (Week 8-9)

Goal: Run and monitor simulations

Frontend Tasks:

    Simulations List Page (Runs Overview)
    Run Simulation Modal (3-step wizard)
    Simulation Detail Page with live updates
    Live log streaming component
    Session expandable rows with transcript viewer
    Integration with existing Results page

Backend Tasks:

    Simulations CRUD API
    Run simulation endpoint with Celery
    WebSocket/SSE for live updates
    Session management
    Cancel simulation endpoint
    Re-run simulation endpoint
    Log streaming endpoint

Deliverables:

    End-to-end simulation execution
    Real-time monitoring
    Complete simulation history

Phase 6: Evaluators & Metrics (Week 10)

Goal: Enhanced evaluator management and metrics configuration

Frontend Tasks:

    Update Evaluator Page with new filters and actions
    Generate Evaluators Modal with guide
    Metrics List Page
    Create/Edit Metric Modal
    Metric Studio (advanced)

Backend Tasks:

    Enhanced evaluators API
    Generate evaluators AI endpoint
    Metrics CRUD API
    Metric evaluation logic

Deliverables:

    AI-powered evaluator generation
    Custom metrics management

Phase 7: Dashboard & Analytics (Week 11)

Goal: Home dashboard and analytics

Frontend Tasks:

    Dashboard page with stats cards
    Quick actions grid
    Recent activity feed
    Getting started checklist
    Charts and visualizations

Backend Tasks:

    Dashboard stats API
    Activity feed API
    Analytics aggregation

Deliverables:

    Informative home dashboard
    Quick access to key features

Phase 8: Observability Integration (Week 12)

Goal: Enhance observability features

Frontend Tasks:

    Enhanced Calls page with Lab feature
    Call detail enhancements
    Create test from call flow
    Overview dashboard updates

Backend Tasks:

    Labs API endpoints
    Call analysis and test generation
    Enhanced call metadata

Deliverables:

    Integrated observability
    Call-to-test workflow

Phase 9: Polish & Optimization (Week 13-14)

Goal: UI/UX improvements and performance

Tasks:

    Loading skeletons for all tables
    Empty states for all pages
    Error boundaries and error handling
    Toast notification system
    Keyboard shortcuts
    Responsive design improvements
    Dark mode refinements
    Database indexing optimization
    API caching strategies
    Frontend bundle optimization

Deliverables:

    Polished UI/UX
    Optimized performance
    Better error handling

Phase 10: Testing & Documentation (Week 15-16)

Goal: Comprehensive testing and documentation

Tasks:

    Unit tests for critical components
    Integration tests for API endpoints
    End-to-end tests for user workflows
    Load testing for simulations
    API documentation (Swagger/OpenAPI)
    User guide and tutorials
    Developer documentation
    Deployment documentation

Deliverables:

    Test coverage > 70%
    Complete documentation
    Production-ready application

Success Metrics
User Experience

    All pages load in < 1 second
    All actions provide immediate feedback
    No UI jank or layout shifts
    Smooth animations and transitions
    Clear error messages and recovery paths

Functionality

    All CRUD operations work reliably
    Real-time updates have < 500ms latency
    Simulations run without failures
    AI generation produces quality results
    File uploads handle large files (100MB+)

Code Quality

    Component reusability > 80%
    No duplicate API calls
    Proper error boundaries
    Clean separation of concerns
    Consistent code style

Performance

    API response time < 200ms (avg)
    Database queries optimized with indexes
    Frontend bundle size < 500KB (gzipped)
    Simulation processing rate > 10/min

Conclusion

This comprehensive specification provides a complete roadmap for building a production-ready voice agent testing platform. The implementation is structured in logical phases, with clear deliverables and success metrics at each stage.

Key Highlights:

    18 pages with full specifications
    13 modals with complete UI/UX
    8 database collections with detailed schemas
    50+ API endpoints documented
    10-phase roadmap with ~16 weeks timeline
    Competitor-inspired UX patterns
    Modern tech stack (React, FastAPI, MongoDB)
    Real-time features with WebSocket/SSE
    Comprehensive testing workflows

The platform enables users to create, test, and monitor voice AI agents through an intuitive interface that rivals existing solutions like Cekura and Coval.
You are out of free messages until 5:30 PM
Upgrade
