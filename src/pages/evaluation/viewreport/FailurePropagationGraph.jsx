import React, { useEffect, useRef } from 'react';
import { AlertTriangle, CheckCircle, XCircle, TrendingDown } from 'lucide-react';

const FailurePropagationGraph = ({ stepHealth = {}, cascadingFailures = {} }) => {
  const canvasRef = useRef(null);
  
  // Convert step_health object to array
  const steps = Object.values(stepHealth || {}).sort((a, b) => {
    const aNum = a.step_number || 0;
    const bNum = b.step_number || 0;
    return aNum - bNum;
  });

  useEffect(() => {
    if (!canvasRef.current || steps.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Layout parameters
    const nodeRadius = 24;
    const padding = 60;
    const nodeSpacing = (rect.width - 2 * padding) / Math.max(steps.length - 1, 1);

    // Draw connections first (so they appear behind nodes)
    steps.forEach((step, index) => {
      if (step.tainted_by_step_number) {
        const sourceIndex = steps.findIndex(s => s.step_number === step.tainted_by_step_number);
        if (sourceIndex !== -1 && sourceIndex < index) {
          const x1 = padding + sourceIndex * nodeSpacing;
          const y1 = rect.height / 2;
          const x2 = padding + index * nodeSpacing;
          const y2 = rect.height / 2;

          // Draw curved arrow
          ctx.beginPath();
          ctx.moveTo(x1 + nodeRadius, y1);
          
          const controlY = y1 + 40;
          ctx.bezierCurveTo(
            x1 + nodeRadius + 20, controlY,
            x2 - nodeRadius - 20, controlY,
            x2 - nodeRadius, y2
          );

          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Arrow head
          const arrowSize = 8;
          ctx.beginPath();
          ctx.moveTo(x2 - nodeRadius, y2);
          ctx.lineTo(x2 - nodeRadius - arrowSize, y2 - arrowSize / 2);
          ctx.lineTo(x2 - nodeRadius - arrowSize, y2 + arrowSize / 2);
          ctx.closePath();
          ctx.fillStyle = '#ef4444';
          ctx.fill();
        }
      }
    });

    // Draw nodes
    steps.forEach((step, index) => {
      const x = padding + index * nodeSpacing;
      const y = rect.height / 2;

      // Node circle
      ctx.beginPath();
      ctx.arc(x, y, nodeRadius, 0, 2 * Math.PI);
      
      if (!step.is_healthy && !step.is_tainted) {
        // Critical failure
        ctx.fillStyle = '#7f1d1d';
        ctx.strokeStyle = '#ef4444';
      } else if (step.is_tainted) {
        // Tainted
        ctx.fillStyle = '#78350f';
        ctx.strokeStyle = '#f59e0b';
      } else {
        // Healthy
        ctx.fillStyle = '#14532d';
        ctx.strokeStyle = '#22c55e';
      }
      
      ctx.lineWidth = 3;
      ctx.fill();
      ctx.stroke();

      // Turn number
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(step.step_number || '', x, y);

      // Label below
      ctx.fillStyle = '#9ca3af';
      ctx.font = '10px sans-serif';
      ctx.fillText(
        step.is_healthy ? 'Healthy' : step.is_tainted ? 'Tainted' : 'Failed',
        x,
        y + nodeRadius + 16
      );
    });

  }, [steps]);

  // Calculate summary stats
  const totalSteps = steps.length;
  const healthySteps = steps.filter(s => s.is_healthy).length;
  const taintedSteps = steps.filter(s => s.is_tainted).length;
  const failedSteps = steps.filter(s => !s.is_healthy && !s.is_tainted).length;

  return (
    <div className="bg-dark-panel border border-gray-800/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-400" />
            Failure Propagation Analysis
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Visualizing how failures cascade through conversation turns
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-900 border-2 border-green-500" />
            <span className="text-xs text-gray-400">Healthy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-900 border-2 border-yellow-500" />
            <span className="text-xs text-gray-400">Tainted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-900 border-2 border-red-500" />
            <span className="text-xs text-gray-400">Failed</span>
          </div>
        </div>
      </div>

      {/* Graph Canvas */}
      <div className="bg-dark-input rounded-lg p-4 mb-6">
        <canvas 
          ref={canvasRef}
          className="w-full"
          style={{ height: '200px' }}
        />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-dark-input rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-400">Total Steps</span>
          </div>
          <p className="text-2xl font-bold text-white">{totalSteps}</p>
        </div>

        <div className="bg-dark-input rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-400">Healthy</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{healthySteps}</p>
        </div>

        <div className="bg-dark-input rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-gray-400">Tainted</span>
          </div>
          <p className="text-2xl font-bold text-yellow-400">{taintedSteps}</p>
        </div>

        <div className="bg-dark-input rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-red-400" />
            <span className="text-xs text-gray-400">Failed</span>
          </div>
          <p className="text-2xl font-bold text-red-400">{failedSteps}</p>
        </div>
      </div>

      {/* Cascading Failures Details */}
      {Object.keys(cascadingFailures).length > 0 && (
        <div className="mt-6 p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
          <h4 className="text-sm font-semibold text-red-400 mb-3">
            Cascading Failure Chains
          </h4>
          <div className="space-y-2">
            {Object.entries(cascadingFailures).map(([source, affected]) => (
              <div key={source} className="text-sm">
                <span className="text-gray-400">
                  <span className="font-mono text-red-400">{source}</span>
                  {' → '}
                  <span className="font-mono text-yellow-400">
                    {affected.join(', ')}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FailurePropagationGraph;
