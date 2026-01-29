import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useJob, useJobSubOuts } from '../hooks/useJobs'
import SubOutCard from '../components/subouts/SubOutCard'
import Card from '../components/common/Card'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function JobView() {
  const { jobCode } = useParams()
  const { data: jobData, isLoading: jobLoading } = useJob(jobCode)
  const { data: subOutsData, isLoading: subOutsLoading } = useJobSubOuts(jobCode)

  const job = jobData?.data
  const subOuts = subOutsData?.data || []

  if (jobLoading || subOutsLoading) {
    return <LoadingSpinner className="py-20" size="lg" />
  }

  return (
    <div>
      <Link
        to="/"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Dashboard
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {jobCode} - {job?.JobDescription || 'Unknown Job'}
        </h1>
        {job?.ProjectManager && (
          <p className="text-gray-500">PM: {job.ProjectManager}</p>
        )}
      </div>

      {subOuts.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">No sub outs for this job yet.</p>
          <Link to="/subouts/new" className="text-blue-600 hover:underline mt-2 block">
            Create one
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {subOuts.map(subOut => (
            <SubOutCard key={subOut.SubOutID} subOut={subOut} />
          ))}
        </div>
      )}
    </div>
  )
}
