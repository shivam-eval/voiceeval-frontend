# Evaluation Response Integration

## Overview
This document describes the integration of the new evaluation response structure where metrics are nested within `category_scores`.

## Response Structure

The evaluation response has the following structure:

```json
{
  "evaluations": [
    {
      "evaluation_id": "eval_xxx",
      "session_id": "sess_xxx",
      "overall_score": 0.62,
      "passed": false,
      "category_scores": [
        {
          "category": "accuracy",
          "score": 0.33,
          "weight": 0.25,
          "metrics": [
            {
              "name": "semantic_accuracy",
              "category": "accuracy",
              "score": 0,
              "status": "failed",
              "details": { ... }
            },
            {
              "name": "keyword_match_accuracy",
              "category": "accuracy",
              "score": 0,
              "status": "failed",
              "details": { ... }
            }
          ]
        },
        {
          "category": "task_completion",
          "score": 0.66,
          "weight": 0.25,
          "metrics": [ ... ]
        }
      ]
    }
  ]
}
```

## Key Changes Made

### 1. ViewReport.jsx
**Updated:** `categoryMap` construction
- **Before:** Expected `evaluation.metric_results` (flat array)
- **After:** Uses `evaluation.category_scores` (nested structure)
- **Impact:** Correctly extracts metrics grouped by category

```javascript
// OLD
evaluation.metric_results.forEach((metric) => { ... })

// NEW
evaluation.category_scores.forEach((categoryData) => {
  map[category] = {
    category: categoryData.category,
    score: categoryData.score,
    weight: categoryData.weight,
    metrics: categoryData.metrics
  };
})
```

### 2. Accuracy.jsx
**Updated:** Component to handle dual data sources
- **From ViewReport:** Receives `response` prop with single evaluation's category data
- **From Dashboard:** Receives `data` prop with aggregated data from multiple evaluations

```javascript
export default function AccuracyView({ response, data, onBack }) {
  let metrics = [];
  
  if (response) {
    // Single evaluation from ViewReport
    metrics = response?.metrics || [];
  } else if (data) {
    // Aggregated data from Dashboard
    const accuracyCategory = data.category_scores?.find(c => c.category === 'accuracy');
    metrics = accuracyCategory?.metrics || [];
  }
}
```

**Filtered Metrics:**
- Removed: `semantic_accuracy` (response accuracy)
- Removed: `intent_classification_accuracy` (intent classification)
- Kept: `keyword_match_accuracy`, `semantic_similarity`

### 3. TaskCompletion/index.jsx
**Updated:** Similar dual-source handling
- Handles both `response` (from ViewReport) and `data` (from Dashboard)
- Filters to show only 3 priority metrics:
  - `task_completion_rate`
  - `sequential_task_accuracy`
  - `step_validation_pass_rate`
- Changed grid layout from 4 columns to 3 columns

### 4. InsightTab.jsx
**Updated:** Category labels and clickability
- Removed: `cost`, `speech`, `sentiment` categories
- Added: `clickable` prop to control tab interaction
- **Dashboard:** `clickable={false}` (tabs disabled)
- **ViewReport:** `clickable={true}` (tabs enabled)

## Category Metrics Structure

### Accuracy
```javascript
{
  category: "accuracy",
  score: 0.33,
  weight: 0.25,
  metrics: [
    { name: "keyword_match_accuracy", score: 0, status: "failed" },
    { name: "semantic_similarity", score: 0.35, status: "failed" },
    { name: "response_consistency", score: null, status: "passed" }
  ]
}
```

### Task Completion
```javascript
{
  category: "task_completion",
  score: 0.66,
  weight: 0.25,
  metrics: [
    { name: "task_completion_rate", score: 0.8, status: "failed" },
    { name: "sequential_task_accuracy", score: null, status: "passed" },
    { name: "flow_path_coverage", score: 0.2, status: "failed" }
  ]
}
```

### Latency
```javascript
{
  category: "latency",
  score: 0.5,
  weight: 0.15,
  metrics: [
    { name: "response_latency", score: 0, status: "failed", details: {...} },
    { name: "total_duration", score: 1, status: "passed", details: {...} }
  ]
}
```

### Audio Quality
```javascript
{
  category: "audio_quality",
  score: 0.9,
  weight: 0.1,
  metrics: [
    { name: "audio_technical_quality", score: null, status: "passed" },
    { name: "average_pitch", score: null, status: "passed" },
    { name: "voice_quality_index", score: null, status: "passed" },
    { name: "tts_naturalness", score: null, status: "passed" }
  ]
}
```

### Conversation Quality
```javascript
{
  category: "conversation_quality",
  score: 0.69,
  weight: 0.15,
  metrics: [
    { name: "grammar_quality", score: null, status: "passed" },
    { name: "context_maintenance", score: null, status: "failed" },
    { name: "clarification_request_rate", score: null, status: "passed" },
    { name: "repetition_count", score: 1, status: "passed" },
    { name: "not_early_termination", score: null, status: "passed" },
    { name: "words_per_minute", score: 0.43, status: "failed" },
    { name: "talk_ratio", score: 0.59, status: "failed" },
    { name: "text_sentiment", score: 0.85, status: "passed" }
  ]
}
```

### Endpointing
```javascript
{
  category: "endpointing",
  score: 0.48,
  weight: 0,
  metrics: [
    { name: "interruption_count", score: 1, status: "passed" },
    { name: "pause_detection", score: 0.61, status: "passed" },
    { name: "turn_boundary_accuracy", score: 0.33, status: "failed" },
    { name: "stop_time_after_user_interruption", score: null, status: "passed" }
  ]
}
```

### Persona
```javascript
{
  category: "persona",
  score: 1,
  weight: 0.1,
  metrics: [
    { name: "persona_consistency", score: null, status: "passed" },
    { name: "tone_appropriateness", score: null, status: "passed" },
    { name: "region_appropriate_language", score: null, status: "passed" },
    { name: "behavior_trait_alignment", score: null, status: "passed" }
  ]
}
```

## Data Flow

### ViewReport Flow
1. User clicks on a test case in CallResultsTable
2. ViewReport receives `evaluation` object
3. `categoryMap` is built from `evaluation.category_scores`
4. User clicks on category tab (e.g., "Accuracy")
5. Category view receives `response={categoryMap.accuracy}`
6. Component extracts `metrics` from `response.metrics`

### Dashboard Flow
1. Dashboard receives `fullResponse.evaluations` array
2. Aggregates data across all evaluations
3. User clicks on category tab (disabled by default)
4. Category view receives `data={aggregatedData}`
5. Component finds category in `data.category_scores`
6. Extracts metrics from category

## Testing Checklist

- [ ] ViewReport displays individual evaluation correctly
- [ ] Category tabs work in ViewReport
- [ ] Accuracy view shows only keyword_match and semantic_similarity
- [ ] Task completion shows only 3 metric boxes
- [ ] Dashboard tabs are disabled (non-clickable)
- [ ] All category views handle null/missing metrics gracefully
- [ ] Bar charts and visualizations render correctly
- [ ] Metric details are displayed properly

## Notes

- Metrics with `score: null` are still displayed but may show "N/A" or skip certain calculations
- The `status` field ("passed"/"failed") is used for visual indicators
- The `details` object contains metric-specific additional information
- Weights are used for calculating overall scores but may not be displayed in all views
