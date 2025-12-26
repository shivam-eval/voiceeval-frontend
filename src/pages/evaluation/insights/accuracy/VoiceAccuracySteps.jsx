import React from "react";
import { Target, MessageSquare, Settings, CheckCircle } from "lucide-react";
import { Descriptions } from "antd";

const VoiceAccuracySteps = () => {
  const steps = [
    { accuracy: 0.95, title: "Initial Accuracy",descriptions:"accuracy of the metric", icon: Target },
    { accuracy: 0.85, title: "Semantic Accuracy", descriptions:"accuracy of the metric",icon: MessageSquare },
    { accuracy: 0.75, title: "Intent Accuracy",descriptions:"accuracy of the metric", icon: Settings },
    { accuracy: 0.65, title: "Final Accuracy", descriptions:"accuracy of the metric",icon: CheckCircle },
  ];

  const X_AXIS = 650;

  return (
    <div className="flex justify-center overflow-hidden" >
    
      <div className="relative w-full max-w-7xl"
      style={{transform:"scale(0.5)", transformOrigin:"bottom  left",left:"40px", bottom:"100px"}}
      >


        <div className="relative w-full" style={{ height: "260px" }}>
          {steps.map((step, index) => {
            const size = 450- index * 90;
            const left = index * 150;
            const top = X_AXIS - size-200;
            const Icon = step.icon;
        
            const reversedIndex = steps.length - 1 - index;

const maxZ = 50;
const stepZ = 10;

const circleZ = maxZ - reversedIndex * stepZ;
const stripZ = circleZ - 5;


            return (
              <div
                key={index}
                className="absolute"
                style={{
                  width: size,
                  height: size,
                  left,
                  top,
                }}
              >
                {/* Circle */}
                <div className="relative w-full h-full rounded-full border-2 border-[#5EEAD4] bg-[#0b1220] flex items-center justify-center "
                style={{zIndex:circleZ}}
                >
                  
                </div>

                <span className="absolute top-0 text-white-200 text-lg">
                  {step.accuracy}
                </span>

                {/* Label on top of circle */}
                <div
                  className="absolute  min-w-[800px] bg-[#5EEAD4] left-1/2 p-4 top-0 flex flex-col items-right text-right rounded-xl "
                  style={{zIndex:stripZ, right:0}}
                  
                >
                  <div className="flex items-center gap-2 text-sm text-white-400 font-semibold">
                    <Icon className="w-4 h-4" />
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-300">
                    Score: {step.descriptions}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default VoiceAccuracySteps;
