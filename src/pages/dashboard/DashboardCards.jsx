import KpiCard from "../../components/KPIcard";

  const kpiData = {
    successRate: { value: 78.5, change: 5.2 },
    conversionRate: { value: 42.3, change: 8.1 },
    complianceScore: 99.8
  }
const DashboardCards = () => {
    return ( <>
           <div className="grid grid-cols-4 gap-4">
                <KpiCard
                  label="Success Rate"
                  value={`${kpiData.successRate.value}%`}
                  change={kpiData.successRate.change}
                  showProgress
                  progressValue={kpiData.successRate.value}
                />
        
                <KpiCard
                  label="Conversion Rate"
                  value={`${kpiData.conversionRate.value}%`}
                  change={kpiData.conversionRate.change}
                  showProgress
                  progressValue={kpiData.conversionRate.value}
                />
        
                <KpiCard
                  label="Compliance Score"
                  value={`${kpiData.complianceScore}%`}
                  showProgress
                  progressValue={kpiData.complianceScore}
                />
        
                <KpiCard
                  label="Avg Call Duration"
                  value="3:15"
                  helperText="Within target range"
                />
              </div>
    </> );
}
 
export default DashboardCards;