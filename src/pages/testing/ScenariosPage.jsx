import SectionHeader from "../../components/SectionHeader";
import Button from "../../components/Button";

const ScenariosPage = () => {
    const breadcrumbItems = [
        { label: "Testing", path: "/testing/test-cases" },
        { label: "Scenarios" },
    ];

    const scenarioCategories = [
        {
            name: "Customer Support",
            description: "Pre-built scenarios for customer service interactions",
            count: 12,
            icon: "💬",
        },
        {
            name: "Sales & Outreach",
            description: "Scenarios for sales calls and lead qualification",
            count: 8,
            icon: "📞",
        },
        {
            name: "Appointment Booking",
            description: "Scheduling and calendar management scenarios",
            count: 6,
            icon: "📅",
        },
        {
            name: "FAQ & Information",
            description: "Common questions and information requests",
            count: 15,
            icon: "❓",
        },
    ];

    return (
        <div className="p-8">
            <div className="w-full max-w-screen-2xl mx-auto">
                <SectionHeader
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    }
                    title="Test Scenarios"
                    description="Browse and use pre-built test scenarios for common use cases"
                    breadcrumbItems={breadcrumbItems}
                    actions={
                        <Button
                            variant="outline"
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            }
                        >
                            Create Custom Scenario
                        </Button>
                    }
                />

                {/* Scenario Categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {scenarioCategories.map((category) => (
                        <div
                            key={category.name}
                            className="bg-gray-900 rounded-2xl p-6 border border-gray-800/50 hover:border-teal-400/50 transition-all cursor-pointer group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="text-4xl">{category.icon}</div>
                                <span className="px-3 py-1 bg-teal-400/20 text-teal-400 rounded-full text-sm font-medium">
                                    {category.count} scenarios
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-teal-400 transition-colors">
                                {category.name}
                            </h3>
                            <p className="text-gray-400 text-sm">{category.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ScenariosPage;
