import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'
import SubOutCard from './SubOutCard'

export default function JobGroup({ job }) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="mb-6">
      {/* Job Header */}
      <div
        className="flex items-center gap-2 mb-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400" />
        )}
        <h2 className="text-lg font-semibold text-gray-900">
          {job.JobDescription || `Job ${job.JobCode}`}
        </h2>
        <span className="text-sm text-gray-500">
          ({job.subOuts?.length || 0} subs)
        </span>
        {job.ProjectManager && (
          <span className="text-sm text-gray-400 ml-2">
            PM: {job.ProjectManager}
          </span>
        )}
      </div>

      {/* SubOut Cards */}
      <div
        className={clsx(
          'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
          'transition-all duration-300',
          !isExpanded && 'hidden'
        )}
      >
        {job.subOuts?.map(subOut => (
          <SubOutCard key={subOut.SubOutID} subOut={subOut} />
        ))}
      </div>
    </div>
  )
}
