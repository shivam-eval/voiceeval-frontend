/**
 * Transforms backend evaluation data to frontend format
 * Handles both single evaluation results and mock data fallback
 */

/**
 * Transform backend evaluation response to frontend format
 * @param {Object} evaluationData - Raw evaluation data from backend API
 * @returns {Object} Transformed data matching frontend expectations
 */
export const transformEvaluationData = (evaluationData) => {
  if (!evaluationData) {
    return null;
  }

  // Extract key data
  const overallScore = Math.round((evaluationData.overall_score || 0) * 100);
  const categoryScores = evaluationData.category_scores || [];
  const metricResults = evaluationData.metric_results || [];
  const issues = evaluationData.issues_found || 0;
  const recommendations = evaluationData.recommendations || [];

  // Transform category scores for radar chart
  const transformedCategoryScores = Object.entries(categoryScores).map(([name, data]) => ({
    name: formatCategoryName(name),
    score: Math.round((data.overall_score || 0) * 100),
    passed: data.passed || false,
    weight: data.weight || 1.0
  }));

  // Calculate summary metrics
  const passedMetrics = metricResults.filter(m => m.status === 'passed' || m.passed).length;
  const totalMetrics = metricResults.length;
  const successRate = totalMetrics > 0 ? Math.round((passedMetrics / totalMetrics) * 100) : 0;

  // Group issues by priority/severity
  const groupedIssues = groupIssuesByPriority(recommendations, issues);

  return {
    summary: {
      successRate: successRate,
      overallScore: overallScore,
      totalTests: 1, // Single evaluation
      passedTests: evaluationData.passed ? 1 : 0,
      failedTests: evaluationData.passed ? 0 : 1,
      avgCallDuration: "N/A", // Not provided by current evaluation
      complianceScore: getCategoryScore(categoryScores, 'compliance') || 100,
      sentimentImprovement: 0 // Would need specific sentiment metrics
    },
    categoryScores: transformedCategoryScores,
    metricResults: metricResults.map(transformMetricResult),
    improvements: groupedIssues,
    testCases: [], // Single evaluation doesn't have multiple test cases
    sentimentData: [] // Would need specific sentiment tracking data
  };
};

/**
 * Transform a single metric result
 */
const transformMetricResult = (metric) => ({
  name: metric.name || metric.metric_name,
  category: metric.category,
  score: Math.round((metric.score || 0) * 100),
  status: metric.status,
  passed: metric.passed || metric.status === 'passed',
  details: metric.details || {},
  reasoning: metric.reasoning
});

/**
 * Format category names for display
 */
const formatCategoryName = (category) => {
  const mapping = {
    'accuracy': 'Accuracy',
    'task_completion': 'Task Completion',
    'latency': 'Response Time',
    'audio_quality': 'Audio Quality',
    'conversation_quality': 'Conversation Quality',
    'endpointing': 'Turn-Taking',
    'cost': 'Cost Efficiency',
    'persona': 'Persona Match',
    'compliance': 'Compliance'
  };
  return mapping[category] || category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Get score for a specific category
 */
const getCategoryScore = (categoryScores, categoryName) => {
  const category = Object.entries(categoryScores).find(([name]) => 
    name.toLowerCase().includes(categoryName.toLowerCase())
  );
  return category ? Math.round((category[1].overall_score || 0) * 100) : null;
};

/**
 * Group recommendations and issues by priority
 */
const groupIssuesByPriority = (recommendations, issuesCount) => {
  // If we have structured recommendations, group them
  if (Array.isArray(recommendations) && recommendations.length > 0) {
    // Group recommendations into priority levels
    const highPriority = recommendations.slice(0, Math.ceil(recommendations.length / 3));
    const mediumPriority = recommendations.slice(
      Math.ceil(recommendations.length / 3), 
      Math.ceil(recommendations.length * 2 / 3)
    );
    const lowPriority = recommendations.slice(Math.ceil(recommendations.length * 2 / 3));

    const result = [];

    if (highPriority.length > 0) {
      result.push({
        priority: 1,
        priorityLabel: "High Impact",
        items: highPriority.map(rec => ({
          title: extractTitle(rec),
          description: rec
        }))
      });
    }

    if (mediumPriority.length > 0) {
      result.push({
        priority: 2,
        priorityLabel: "Medium Impact",
        items: mediumPriority.map(rec => ({
          title: extractTitle(rec),
          description: rec
        }))
      });
    }

    if (lowPriority.length > 0) {
      result.push({
        priority: 3,
        priorityLabel: "Low Impact",
        items: lowPriority.map(rec => ({
          title: extractTitle(rec),
          description: rec
        }))
      });
    }

    return result;
  }

  return [];
};

/**
 * Extract a title from a recommendation string
 */
const extractTitle = (recommendation) => {
  if (typeof recommendation === 'object' && recommendation.title) {
    return recommendation.title;
  }
  
  // Extract first sentence or first 50 characters as title
  const text = String(recommendation);
  const firstSentence = text.split(/[.!?]/)[0];
  return firstSentence.length > 50 
    ? firstSentence.substring(0, 47) + '...'
    : firstSentence;
};

/**
 * Check if evaluation data is available and valid
 */
export const hasEvaluationData = (evaluationData) => {
  return evaluationData && 
         typeof evaluationData === 'object' && 
         'overall_score' in evaluationData;
};
