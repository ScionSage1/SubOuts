import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Plus, FileDown } from 'lucide-react'
import { useSubOut, useDeleteSubOut, useIncrementLoadsOut, useIncrementLoadsIn, useUpdateStatus } from '../hooks/useSubOuts'
import { useDeleteItem, useBulkAddItems } from '../hooks/useSubOutItems'
import SubOutDetail from '../components/subouts/SubOutDetail'
import ItemsTable from '../components/subouts/ItemsTable'
import ItemPicker from '../components/subouts/ItemPicker'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function SubOutDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [showItemPicker, setShowItemPicker] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showReopenModal, setShowReopenModal] = useState(false)

  const { data, isLoading, error } = useSubOut(id)
  const deleteMutation = useDeleteSubOut()
  const incrementOutMutation = useIncrementLoadsOut()
  const incrementInMutation = useIncrementLoadsIn()
  const updateStatusMutation = useUpdateStatus()
  const deleteItemMutation = useDeleteItem()
  const bulkAddMutation = useBulkAddItems()

  const subOut = data?.data

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id)
      navigate('/')
    } catch (err) {
      alert('Failed to delete: ' + err.message)
    }
  }

  const handleReopen = async () => {
    try {
      await updateStatusMutation.mutateAsync({ id, status: 'Received' })
      setShowReopenModal(false)
    } catch (err) {
      alert('Failed to reopen: ' + err.message)
    }
  }

  const handleIncrementLoadsOut = () => {
    incrementOutMutation.mutate(id)
  }

  const handleIncrementLoadsIn = () => {
    incrementInMutation.mutate(id)
  }

  const handleDeleteItem = (itemId) => {
    if (confirm('Remove this item from the sub out?')) {
      deleteItemMutation.mutate({ subOutId: id, itemId })
    }
  }

  const handleEditItem = (item) => {
    // TODO: Implement item edit modal
    console.log('Edit item:', item)
  }

  const handleAddItems = async (items) => {
    try {
      await bulkAddMutation.mutateAsync({ subOutId: id, items })
      setShowItemPicker(false)
    } catch (err) {
      alert('Failed to add items: ' + err.message)
    }
  }

  if (isLoading) {
    return <LoadingSpinner className="py-20" size="lg" />
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600">Error: {error.message}</p>
        <Link to="/" className="text-blue-600 hover:underline">Back to Dashboard</Link>
      </div>
    )
  }

  if (!subOut) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">SubOut not found</p>
        <Link to="/" className="text-blue-600 hover:underline">Back to Dashboard</Link>
      </div>
    )
  }

  return (
    <div>
      {/* Back Link */}
      <Link
        to="/"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Dashboard
      </Link>

      {/* SubOut Details */}
      <SubOutDetail
        subOut={subOut}
        onIncrementLoadsOut={handleIncrementLoadsOut}
        onIncrementLoadsIn={handleIncrementLoadsIn}
        onDelete={() => setShowDeleteModal(true)}
        onReopen={() => setShowReopenModal(true)}
        isUpdating={incrementOutMutation.isPending || incrementInMutation.isPending}
      />

      {/* Items Section */}
      <Card className="mt-6">
        <Card.Header className="flex items-center justify-between">
          <h2 className="font-semibold">Items ({subOut.items?.length || 0} total)</h2>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowItemPicker(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Add Items
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <ItemsTable
            items={subOut.items}
            onDelete={handleDeleteItem}
            onEdit={handleEditItem}
            isDeleting={deleteItemMutation.isPending}
          />
        </Card.Body>
      </Card>

      {/* Item Picker Modal */}
      <ItemPicker
        isOpen={showItemPicker}
        onClose={() => setShowItemPicker(false)}
        jobCode={subOut.JobCode}
        onAdd={handleAddItems}
        isAdding={bulkAddMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete SubOut"
        size="sm"
      >
        <p className="text-gray-600">
          Are you sure you want to delete <strong>{subOut.Lot}</strong>?
          This will also remove all associated items.
        </p>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            loading={deleteMutation.isPending}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reopen Confirmation Modal */}
      <Modal
        isOpen={showReopenModal}
        onClose={() => setShowReopenModal(false)}
        title="Reopen SubOut"
        size="sm"
      >
        <p className="text-gray-600">
          Are you sure you want to reopen <strong>{subOut.Lot}</strong>?
          Its status will be set to "Received" and it will appear in active views.
        </p>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReopenModal(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleReopen}
            loading={updateStatusMutation.isPending}
          >
            Reopen
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
