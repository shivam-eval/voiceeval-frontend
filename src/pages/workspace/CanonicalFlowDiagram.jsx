import flowPng from "../../assets/flow.png"; // adjust path

const CanonicalFlowDiagram = () => {
  return (
    <div className="bg-white rounded-xl p-4 overflow-auto max-h-[600px]">
      <img
        src={flowPng}
        alt="Canonical Flow Diagram"
        className="w-full h-auto object-contain"
      />
    </div>
  );
};

export default CanonicalFlowDiagram;
