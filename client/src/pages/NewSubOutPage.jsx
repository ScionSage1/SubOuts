import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useCreateSubOut } from '../hooks/useSubOuts'
import SubOutForm from '../components/subouts/SubOutForm'
import Card from '../components/common/Card'

export default function NewSubOutPage() {
  const navigate = useNavigate()
  const createMutation = useCreateSubOut()

  const handleSubmit = async (data) => {
    try {
      const result = await createMutation.mutateAsync(data)
      navigate(`/subouts/${result.data.SubOutID}`)
    } catch (err) {
      alert('Failed to create SubOut: ' + err.message)
    }
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

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New SubOut</h1>

      <Card>
        <Card.Body>
          <SubOutForm
            onSubmit={handleSubmit}
            onCancel={() => navigate('/')}
            isLoading={createMutation.isPending}
          />
        </Card.Body>
      </Card>
    </div>
  )
}
