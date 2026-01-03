/**
 * Evaluation Data Transformation Utilities
 * 
 * Transforms data between current API format and legacy evaluation dashboard format
 */

/**
 * Calculate aggregated metrics from array of evaluations
 * @param {Array} evaluations - Array of evaluation objects
 * @returns {Object} simulation_evaluation aggregate
 */
export const calculateSimulationAggregates = (evaluations) => {
    if (!evaluations || evaluations.length === 0) {
        return {
            total_sessions_evaluated: 0,
            average_overall_score: 0,
            average_category_scores: []
        };
    }

    const total = evaluations.length;
    const avgScore = evaluations.reduce((sum, e) => sum + (e.overall_score || 0), 0) / total;

    // Aggregate category scores across all evaluations
    const categoryScores = {};

    evaluations.forEach(evaluation => {
        if (!evaluation.category_scores) return;

        evaluation.category_scores.forEach(cat => {
            if (!categoryScores[cat.category]) {
                categoryScores[cat.category] = {
                    total: 0,
                    count: 0,
                    weight: cat.weight || 1
                };
            }
            categoryScores[cat.category].total += cat.score || 0;
            categoryScores[cat.category].count += 1;
        });
    });

    const average_category_scores = Object.entries(categoryScores).map(([category, data]) => ({
        category,
        average_score: data.count > 0 ? data.total / data.count : 0,
        average_weight: data.weight
    }));

    return {
        total_sessions_evaluated: total,
        average_overall_score: avgScore,
        average_category_scores
    };
};

/**
 * Transform session data to report format for ViewReport component
 * @param {Object} session - Session object from API
 * @returns {Object} Report object
 */
export const transformSessionToReport = (session) => {
    if (!session) return null;

    // Handle nested evaluation structure if present
    const data = session.evaluation || session;

    return {
        transcript_result_id: session.evaluation_id || data.evaluation_id || session.session_id || data.session_id,
        session_id: session.session_id || data.session_id,
        path_id: session.path_id || data.path_id || session.test_case_id || data.test_case_id,
        test_id: session.test_case_name || data.test_case_name || session.path_id || data.path_id || 'Test Case',
        status: session.status || data.status || 'unknown',
        overall_score: typeof data.score === 'number'
            ? Math.round(data.score <= 1 ? data.score * 100 : data.score)
            : data.overall_score !== undefined ? Math.round(data.overall_score <= 1 ? data.overall_score * 100 : data.overall_score) : 0
    };
};

/**
 * Transform simulation + evaluations to legacy dashboard workflow format
 * @param {Object} simulation - Simulation object
 * @param {Array} evaluations - Array of evaluations
 * @returns {Object} Workflow object for legacy dashboard
 */
export const transformToLegacyDashboardFormat = (simulation, evaluations) => {
    const simulationEvaluation = calculateSimulationAggregates(evaluations);

    return {
        simulationResult: {
            simulationId: simulation.simulation_id,
            fullResponse: {
                simulation_id: simulation.simulation_id,
                evaluations: evaluations || [],
                simulation_evaluation: simulationEvaluation,
                test_suite_name: simulation.metadata?.test_suite_name,
                agent_name: simulation.metadata?.agent_name,
                status: simulation.status
            },
            evaluationResult: simulationEvaluation
        }
    };
};

/**
 * Get transcript data from session/evaluation
 * @param {Object} session - Session object
 * @param {Object} evaluation - Evaluation object
 * @returns {Object} Transcript data
 */
export const getTranscriptData = (session, evaluation) => {
    // Handle nested evaluation structure if present
    const evalData = evaluation?.evaluation || evaluation;
    const sessData = session?.evaluation || session;

    // Priority: evaluation transcript > session transcript
    if (evalData?.transcript_steps) {
        return {
            ...evalData.transcript_steps,
            metadata: {
                ...(evalData.transcript_steps.metadata || {}),
                ...(evalData.metadata || {}),
                audio_files: evalData.audio_files || evalData.metadata?.audio_files || []
            }
        };
    }

    if (sessData?.transcript_steps) {
        return {
            ...sessData.transcript_steps,
            metadata: {
                ...(sessData.transcript_steps.metadata || {}),
                ...(sessData.metadata || {}),
                audio_files: sessData.audio_files || sessData.metadata?.audio_files || []
            }
        };
    }

    return null;
};

/**
 * Transform simulation data for dashboard overview
 * @param {Object} simulation - Simulation object
 * @param {Array} evaluations - Array of evaluations
 * @returns {Object} Simulation data for overview
 */
export const transformSimulationForOverview = (simulation, evaluations) => {
    const passedCount = evaluations.filter(e => e.passed).length;
    const failedCount = evaluations.length - passedCount;

    const totalExecutionTime = evaluations.reduce((sum, evaluation) => {
        return sum + (evaluation.execution_time_ms || 0);
    }, 0);

    const averageExecutionTime = evaluations.length > 0
        ? totalExecutionTime / evaluations.length
        : 0;

    return {
        simulation_id: simulation.simulation_id,
        execution_summary: {
            total_test_cases: evaluations.length,
            completed_test_cases: passedCount,
            failed_test_cases: failedCount,
        },
        timing: {
            start_time_ms: simulation.timestamps?.started_at ? new Date(simulation.timestamps.started_at).getTime() : Date.now(),
            end_time_ms: simulation.timestamps?.completed_at ? new Date(simulation.timestamps.completed_at).getTime() : Date.now(),
            duration_ms: totalExecutionTime,
            average_duration_ms: averageExecutionTime
        },
        transcript_results: evaluations.map(evaluation => ({
            transcript_result_id: evaluation.evaluation_id,
            session_id: evaluation.session_id,
            path_id: evaluation.path_id,
            test_id: evaluation.test_case_name || evaluation.path_id || 'Test Case',
            status: evaluation.passed ? "completed" : "failed",
            overall_score: typeof evaluation.overall_score === 'number'
                ? Math.round(evaluation.overall_score * 100)
                : Math.round(parseFloat(evaluation.overall_score || 0) * 100)
        })),
        flow_tree_name: simulation.metadata?.test_suite_name || "Test Suite",
        schema_version: "1.0"
    };
};
