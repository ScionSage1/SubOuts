import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useSubOut, useUpdateSubOut } from '../hooks/useSubOuts'
import SubOutForm from '../components/subouts/SubOutForm'
import Card from '../components/common/Card'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function EditSubOutPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, isLoading, error } = useSubOut(id)
  const updateMutation = useUpdateSubOut()

  const subOut = data?.data

  const handleSubmit = async (formData) => {
    try {
      await updateMutation.mutateAsync({ id, data: formData })
      navigate(`/subouts/${id}`)
    } catch (err) {
      alert('Failed to update SubOut: ' + err.message)
    }
  }

  if (isLoading) {
    return <LoadingSpinner className="py-20" size="lg" />
  }

  if (error || !subOut) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600">Error loading SubOut</p>
        <Link to="/" className="text-blue-600 hover:underline">Back to Dashboard</Link>
      </div>
    )
  }

  return (
    <div>
      <Link
        to={`/subouts/${id}`}
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Detail
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Edit {subOut.Lot}
      </h1>

      <Card>
        <Card.Body>
          <SubOutForm
            initialData={subOut}
            onSubmit={handleSubmit}
            onCancel={() => navigate(`/subouts/${id}`)}
            isLoading={updateMutation.isPending}
          />
        </Card.Body>
      </Card>
    </div>
  )
}
