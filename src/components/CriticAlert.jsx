import {AlertTriangle} from "lucide-react";

const CriticalAlert = ({ title, description, metrics }) => (
  <div className="bg-red-900/20 border-2 border-red-500 rounded-lg p-6 mt-6">
    <div className="flex items-start gap-4">
      <div className="p-2 bg-red-500/20 rounded-lg">
        <AlertTriangle className="text-red-500" size={24} />
      </div>
      <div className="flex-1">
        <h4 className="text-red-400 font-semibold text-lg mb-2">
          {title}
        </h4>
        <p className="text-gray-300 mb-4">{description}</p>
        <div className="flex gap-6 text-sm">
          {metrics && metrics.map((metric, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <metric.icon className="text-red-400" size={18} />
              <span className="text-gray-400">{metric.label}:</span>
              <span className="text-red-400 font-semibold">
                {metric.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default CriticalAlert;