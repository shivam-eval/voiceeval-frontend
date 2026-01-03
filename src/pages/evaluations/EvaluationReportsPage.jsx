import SectionHeader from "../../components/SectionHeader";

const EvaluationReportsPage = () => {
    const breadcrumbItems = [
        { label: "Evaluations", path: "/evaluations/overview" },
        { label: "Reports" },
    ];

    return (
        <div className="p-8">
            <div className="w-full max-w-screen-2xl mx-auto">
                <SectionHeader
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    }
                    title="Evaluation Reports"
                    description="View historical reports and compare simulation performance over time"
                    breadcrumbItems={breadcrumbItems}
                />

                {/* Empty State */}
                <div className="bg-gray-900 rounded-2xl p-12 border border-gray-800/50">
                    <div className="text-center">
                        <div className="w-20 h-20 rounded-full bg-teal-400/20 flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">No reports yet</h3>
                        <p className="text-gray-400 mb-6 max-w-md mx-auto">
                            Run simulations to generate evaluation reports and track performance trends
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EvaluationReportsPage;
