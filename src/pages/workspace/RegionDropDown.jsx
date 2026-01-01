import { useState } from "react";
const REGIONS = [
  { label: "India", value: "apac_india" },
  { label: "Europe (EU)", value: "eu" },
  { label: "North America", value: "north-america" },
  { label: "Default", value: "" },
]

import GenericDropdown from "../../components/DropDown";
const RegionDropDown = ({selectedRegion,setSelectedRegion}) => {
    return ( 

           <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                      <h4 className="text-lg font-semibold text-white mb-2">
                        Target Region
                      </h4>
                      <p className="text-gray-400 text-sm mb-4">
                        Select the primary region for evaluation
                      </p>
                        <GenericDropdown
              options={REGIONS}
              value={selectedRegion}
              onChange={setSelectedRegion}
              placeholder="Select a region"
            />
                    </div>
     );
}
 
export default RegionDropDown;