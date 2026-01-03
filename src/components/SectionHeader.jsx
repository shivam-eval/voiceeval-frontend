import Breadcrumb from "./Breadcrumb";

const SectionHeader = ({
    icon,
    title,
    description,
    breadcrumbItems,
    actions,
    children,
}) => {
    return (
        <div className="mb-8">
            {/* Breadcrumb */}
            {breadcrumbItems && <Breadcrumb items={breadcrumbItems} />}

            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                    {/* Icon */}
                    {icon && (
                        <div className="w-12 h-12 rounded-xl bg-teal-400/20 flex items-center justify-center flex-shrink-0 mt-1">
                            <div className="text-teal-400">{icon}</div>
                        </div>
                    )}

                    {/* Title & Description */}
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">{title}</h1>
                        {description && (
                            <p className="text-gray-400 text-lg">{description}</p>
                        )}
                        {children}
                    </div>
                </div>

                {/* Actions */}
                {actions && <div className="flex items-center gap-3">{actions}</div>}
            </div>
        </div>
    );
};

export default SectionHeader;
