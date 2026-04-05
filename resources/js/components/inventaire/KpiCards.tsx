import React from 'react'




interface stats {
    healthPct:         number;
    machinesOk:        number;
    machinesAlert:     number;
    machinesCritical:  number;
    totalMachines:     number;
}

export default function KpiCards({ stats }: { stats: stats }) {
  return (
    <div>KpiCards</div>
  )
}
