import PrimaryButton from "../../components/PrimaryButton";

const RunTestsButton = ({ onRun, disabled = false }) => {
  return (
    <div className="pt-4 border-t border-gray-800">
      <PrimaryButton
        loading={false}
        disabled={disabled}
        onClick={onRun}
        text="Run Tests"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Run Tests
      </PrimaryButton>
    </div>
  );
};

export default RunTestsButton;
