import React from 'react'
import { DEMO_CONFIG } from '../../lib/demo'

const DemoBanner: React.FC = () => {
  if (!DEMO_CONFIG.showDemoBanner) return null

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 text-center text-sm font-medium">
      <div className="flex items-center justify-center space-x-2">
        <span className="animate-pulse">🚀</span>
        <span>DEMO MODE - This is a demonstration of Orion Project Management</span>
        <span className="animate-pulse">🚀</span>
      </div>
      <div className="text-xs mt-1 opacity-90">
        All data is simulated. Features are fully functional for demonstration purposes.
      </div>
    </div>
  )
}

export default DemoBanner 