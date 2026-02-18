import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Plus } from 'lucide-react'
import { useSubOut, useDeleteSubOut, useIncrementLoadsOut, useIncrementLoadsIn, useUpdateStatus } from '../hooks/useSubOuts'
import { useDeleteItem, useBulkAddItems, useUpdateItem } from '../hooks/useSubOutItems'
import { useUpdatePullListSource, useBulkUpdatePullListStatus } from '../hooks/useCutlists'
import { usePullStatuses } from '../hooks/useConfig'
import { usePallets, useCreatePallet, useUpdatePallet, useDeletePallet, useUpdatePalletStatus, useAssignItemsToPallet, useRemoveItemFromPallet, useAssignPalletToLoad } from '../hooks/usePallets'
import { useLoads, useCreateLoad, useUpdateLoad, useDeleteLoad, useUpdateLoadStatus, useAssignItemsToLoad, useAssignPalletsToLoad, useRemoveItemFromLoad } from '../hooks/useLoads'
import SubOutDetail from '../components/subouts/SubOutDetail'
import LoadsSection from '../components/subouts/LoadsSection'
import PalletsSection from '../components/subouts/PalletsSection'
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

  // Core data
  const { data, isLoading, error } = useSubOut(id)
  const { data: palletsData } = usePallets(id)
  const { data: loadsData } = useLoads(id)

  // SubOut mutations
  const deleteMutation = useDeleteSubOut()
  const incrementOutMutation = useIncrementLoadsOut()
  const incrementInMutation = useIncrementLoadsIn()
  const updateStatusMutation = useUpdateStatus()

  // Item mutations
  const deleteItemMutation = useDeleteItem()
  const bulkAddMutation = useBulkAddItems()
  const updateItemMutation = useUpdateItem()

  // PullList source data
  const { data: pullStatusesData } = usePullStatuses()
  const pullStatuses = pullStatusesData?.data || []
  const updatePullListSourceMutation = useUpdatePullListSource()
  const bulkUpdatePullListStatusMutation = useBulkUpdatePullListStatus()

  // Pallet mutations
  const createPalletMutation = useCreatePallet()
  const updatePalletMutation = useUpdatePallet()
  const deletePalletMutation = useDeletePallet()
  const updatePalletStatusMutation = useUpdatePalletStatus()
  const assignItemsToPalletMutation = useAssignItemsToPallet()
  const removeItemFromPalletMutation = useRemoveItemFromPallet()
  const assignPalletToLoadMutation = useAssignPalletToLoad()

  // Load mutations
  const createLoadMutation = useCreateLoad()
  const updateLoadMutation = useUpdateLoad()
  const deleteLoadMutation = useDeleteLoad()
  const updateLoadStatusMutation = useUpdateLoadStatus()
  const assignItemsToLoadMutation = useAssignItemsToLoad()
  const assignPalletsToLoadMutation = useAssignPalletsToLoad()
  const removeItemFromLoadMutation = useRemoveItemFromLoad()

  const subOut = data?.data
  const pallets = palletsData?.data || []
  const loads = loadsData?.data || []

  // --- SubOut handlers ---
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

  // --- Item handlers ---
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

  const handleUpdateSendType = (itemId, sendType) => {
    updateItemMutation.mutate({ subOutId: id, itemId, data: { sendType } })
  }

  const handleUpdatePullListSource = (pullListId, data) => {
    updatePullListSourceMutation.mutate({ pullListId, data })
  }

  const handleBulkUpdatePullListStatus = (pullListIds, pullStatus) => {
    bulkUpdatePullListStatusMutation.mutate({ pullListIds, pullStatus })
  }

  // --- Load handlers ---
  const handleQuickShipOut = () => {
    incrementOutMutation.mutate(id)
  }

  const handleQuickShipIn = () => {
    incrementInMutation.mutate(id)
  }

  if (isLoading) {
    return <LoadingSpinner className="py-20" size="lg" message="Fetching inventory from Tekla..." />
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

      {/* SubOut Details + Loads + Pallets + Items */}
      <SubOutDetail
        subOut={subOut}
        onDelete={() => setShowDeleteModal(true)}
        onReopen={() => setShowReopenModal(true)}
      >
        {/* Loads Section */}
        <LoadsSection
          loads={loads}
          items={subOut.items}
          pallets={pallets}
          subOutId={id}
          dateToLeaveMFC={subOut.DateToLeaveMFC}
          dateToShipFromSub={subOut.DateToShipFromSub}
          onCreateLoad={createLoadMutation.mutate}
          onUpdateLoad={updateLoadMutation.mutate}
          onDeleteLoad={deleteLoadMutation.mutate}
          onUpdateLoadStatus={updateLoadStatusMutation.mutate}
          onAssignItemsToLoad={assignItemsToLoadMutation.mutate}
          onAssignPalletsToLoad={assignPalletsToLoadMutation.mutate}
          onRemoveItemFromLoad={removeItemFromLoadMutation.mutate}
          onQuickShipOut={handleQuickShipOut}
          onQuickShipIn={handleQuickShipIn}
          isCreating={createLoadMutation.isPending}
          isUpdating={updateLoadMutation.isPending || updateLoadStatusMutation.isPending || assignItemsToLoadMutation.isPending || assignPalletsToLoadMutation.isPending}
          isQuickShipping={incrementOutMutation.isPending || incrementInMutation.isPending}
        />

        {/* Pallets Section */}
        <PalletsSection
          pallets={pallets}
          items={subOut.items}
          loads={loads}
          subOutId={id}
          onCreatePallet={createPalletMutation.mutate}
          onUpdatePallet={updatePalletMutation.mutate}
          onDeletePallet={deletePalletMutation.mutate}
          onUpdatePalletStatus={updatePalletStatusMutation.mutate}
          onAssignItems={assignItemsToPalletMutation.mutate}
          onRemoveItem={removeItemFromPalletMutation.mutate}
          onAssignPalletToLoad={assignPalletToLoadMutation.mutate}
          isCreating={createPalletMutation.isPending}
          isUpdating={updatePalletMutation.isPending || updatePalletStatusMutation.isPending || assignItemsToPalletMutation.isPending || removeItemFromPalletMutation.isPending || assignPalletToLoadMutation.isPending}
        />

        {/* Items Section */}
        <Card>
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
              onUpdateSendType={handleUpdateSendType}
              onUpdatePullListSource={handleUpdatePullListSource}
              onBulkUpdatePullListStatus={handleBulkUpdatePullListStatus}
              pullStatuses={pullStatuses}
              isDeleting={deleteItemMutation.isPending}
            />
          </Card.Body>
        </Card>
      </SubOutDetail>

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
          This will also remove all associated items, pallets, and loads.
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
