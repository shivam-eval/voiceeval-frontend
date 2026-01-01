/**
 * Constants for test case types and their associated styling
 */

export const TEST_CASE_TYPES = {
    SCENARIO: 'scenario',
    TRANSCRIPT: 'transcript',
    AUDIO: 'audio',
    GRAPH: 'graph',
    IVR: 'ivr',
};

export const TEST_CASE_TYPE_CONFIG = {
    [TEST_CASE_TYPES.SCENARIO]: {
        label: 'Scenarios',
        icon: '📝',
        color: 'blue',
        badgeVariant: 'info',
        description: 'Text-based test scenarios with expected flows',
        borderColor: 'border-blue-500',
        bgColor: 'bg-blue-500/10',
        textColor: 'text-blue-400',
    },
    [TEST_CASE_TYPES.TRANSCRIPT]: {
        label: 'Transcripts',
        icon: '📄',
        color: 'purple',
        badgeVariant: 'accent',
        description: 'Conversation logs from real calls',
        borderColor: 'border-purple-500',
        bgColor: 'bg-purple-500/10',
        textColor: 'text-purple-400',
    },
    [TEST_CASE_TYPES.AUDIO]: {
        label: 'Audio Files',
        icon: '🎵',
        color: 'teal',
        badgeVariant: 'success',
        description: 'Audio recordings for observed testing',
        borderColor: 'border-teal-500',
        bgColor: 'bg-teal-500/10',
        textColor: 'text-teal-400',
    },
    [TEST_CASE_TYPES.GRAPH]: {
        label: 'Graph-based',
        icon: '📊',
        color: 'green',
        badgeVariant: 'success',
        description: 'Flow diagrams and decision trees',
        borderColor: 'border-green-500',
        bgColor: 'bg-green-500/10',
        textColor: 'text-green-400',
    },
    [TEST_CASE_TYPES.IVR]: {
        label: 'IVR Testing',
        icon: '☎️',
        color: 'orange',
        badgeVariant: 'warning',
        description: 'Phone tree navigation and DTMF inputs',
        borderColor: 'border-orange-500',
        bgColor: 'bg-orange-500/10',
        textColor: 'text-orange-400',
    },
};

export const PRIORITY_LEVELS = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
};

export const PRIORITY_CONFIG = {
    [PRIORITY_LEVELS.LOW]: {
        label: 'Low',
        badgeVariant: 'default',
        color: 'gray',
    },
    [PRIORITY_LEVELS.MEDIUM]: {
        label: 'Medium',
        badgeVariant: 'warning',
        color: 'yellow',
    },
    [PRIORITY_LEVELS.HIGH]: {
        label: 'High',
        badgeVariant: 'danger',
        color: 'red',
    },
};

export const EVALUATION_METRICS = [
    { id: 'semantic_accuracy', label: 'Semantic Accuracy', description: 'Measure response accuracy' },
    { id: 'response_time', label: 'Response Time', description: 'Measure agent response latency' },
    { id: 'conversation_flow', label: 'Conversation Flow', description: 'Evaluate conversational coherence' },
    { id: 'error_handling', label: 'Error Handling', description: 'Test error recovery capabilities' },
    { id: 'intent_recognition', label: 'Intent Recognition', description: 'Verify intent classification' },
    { id: 'entity_extraction', label: 'Entity Extraction', description: 'Check entity detection accuracy' },
    { id: 'sentiment_analysis', label: 'Sentiment Analysis', description: 'Analyze conversation sentiment' },
    { id: 'call_completion', label: 'Call Completion', description: 'Track successful call outcomes' },
    { id: 'task_completion', label: 'Task Completion', description: 'Verify task completion rate' },
    { id: 'flow_coverage', label: 'Flow Coverage', description: 'Measure conversation path coverage' },
];

export const REGIONS = {
    INDIA: 'india',
    NORTH_AMERICA: 'north_america',
    EUROPE: 'europe',
};

export const REGION_CONFIG = {
    [REGIONS.INDIA]: {
        label: 'India',
        flag: '🇮🇳',
    },
    [REGIONS.NORTH_AMERICA]: {
        label: 'North America',
        flag: '🇺🇸',
    },
    [REGIONS.EUROPE]: {
        label: 'Europe',
        flag: '🇪🇺',
    },
};
