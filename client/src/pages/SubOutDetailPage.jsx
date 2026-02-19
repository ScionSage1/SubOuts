import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Layers, Clock, RefreshCw, Package, Truck, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { useSubOut, useDeleteSubOut, useUpdateStatus } from '../hooks/useSubOuts'
import { useDeleteItem, useBulkAddItems, useUpdateItem } from '../hooks/useSubOutItems'
import { useUpdatePullListSource, useBulkUpdatePullListStatus } from '../hooks/useCutlists'
import { usePullStatuses } from '../hooks/useConfig'
import { useActivity } from '../hooks/useActivity'
import { usePallets, useCreatePallet, useUpdatePallet, useDeletePallet, useUpdatePalletStatus, useAssignItemsToPallet, useRemoveItemFromPallet, useAssignPalletToLoad } from '../hooks/usePallets'
import { useLoads, useCreateLoad, useUpdateLoad, useDeleteLoad, useUpdateLoadStatus, useAssignItemsToLoad, useAssignPalletsToLoad, useRemoveItemFromLoad, useRemovePalletFromLoad } from '../hooks/useLoads'
import SubOutDetail from '../components/subouts/SubOutDetail'
import LoadsSection from '../components/subouts/LoadsSection'
import PalletsSection from '../components/subouts/PalletsSection'
import ItemsTable from '../components/subouts/ItemsTable'
import ItemPicker from '../components/subouts/ItemPicker'
import RawMaterialMatcher from '../components/subouts/RawMaterialMatcher'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function SubOutDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [showItemPicker, setShowItemPicker] = useState(false)
  const [showRawMatcher, setShowRawMatcher] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showReopenModal, setShowReopenModal] = useState(false)

  // Core data
  const { data, isLoading, error } = useSubOut(id)
  const { data: palletsData } = usePallets(id)
  const { data: loadsData } = useLoads(id)

  // SubOut mutations
  const deleteMutation = useDeleteSubOut()
  const updateStatusMutation = useUpdateStatus()

  // Item mutations
  const deleteItemMutation = useDeleteItem()
  const bulkAddMutation = useBulkAddItems()
  const updateItemMutation = useUpdateItem()

  // Activity log
  const { data: activityData } = useActivity(id)
  const activityLog = activityData?.data || []
  const [showActivity, setShowActivity] = useState(true)

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
  const removePalletFromLoadMutation = useRemovePalletFromLoad()

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

  const handleAddRawMaterial = async (items) => {
    try {
      await bulkAddMutation.mutateAsync({ subOutId: id, items })
      setShowRawMatcher(false)
    } catch (err) {
      alert('Failed to add raw material: ' + err.message)
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
        onStatusChange={({ id: subOutId, status }) => updateStatusMutation.mutate({ id: subOutId, status })}
      >
        {/* Loads Section */}
        <LoadsSection
          loads={loads}
          items={subOut.items}
          pallets={pallets}
          subOutId={id}
          subOut={subOut}
          dateToLeaveMFC={subOut.DateToLeaveMFC}
          dateToShipFromSub={subOut.DateToShipFromSub}
          onCreateLoad={createLoadMutation.mutate}
          onUpdateLoad={updateLoadMutation.mutate}
          onDeleteLoad={deleteLoadMutation.mutate}
          onUpdateLoadStatus={updateLoadStatusMutation.mutate}
          onAssignItemsToLoad={assignItemsToLoadMutation.mutate}
          onAssignPalletsToLoad={assignPalletsToLoadMutation.mutate}
          onRemoveItemFromLoad={removeItemFromLoadMutation.mutate}
          onRemovePalletFromLoad={removePalletFromLoadMutation.mutate}
          isCreating={createLoadMutation.isPending}
          isUpdating={updateLoadMutation.isPending || updateLoadStatusMutation.isPending || assignItemsToLoadMutation.isPending || assignPalletsToLoadMutation.isPending}
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
              <Button variant="secondary" size="sm" onClick={() => setShowRawMatcher(true)}>
                <Layers className="w-4 h-4 mr-1" />
                Add Raw Material
              </Button>
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

        {/* Activity Timeline */}
        <Card>
          <Card.Header>
            <button
              onClick={() => setShowActivity(!showActivity)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-500" />
                <h2 className="font-semibold">Activity ({activityLog.length})</h2>
              </div>
              {showActivity ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
          </Card.Header>
          {showActivity && (
            <Card.Body>
              {activityLog.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No activity recorded yet.</p>
              ) : (
                <div className="relative">
                  <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200" />
                  <div className="space-y-4">
                    {activityLog.map(entry => {
                      const eventIcon = {
                        StatusChange: <RefreshCw className="w-3.5 h-3.5" />,
                        ItemsAdded: <Plus className="w-3.5 h-3.5" />,
                        ItemRemoved: <AlertCircle className="w-3.5 h-3.5" />,
                        LoadCreated: <Truck className="w-3.5 h-3.5" />,
                        LoadStatusChange: <Truck className="w-3.5 h-3.5" />,
                        PalletCreated: <Package className="w-3.5 h-3.5" />,
                      }[entry.EventType] || <Clock className="w-3.5 h-3.5" />

                      const eventColor = {
                        StatusChange: 'bg-blue-100 text-blue-600',
                        ItemsAdded: 'bg-green-100 text-green-600',
                        ItemRemoved: 'bg-red-100 text-red-600',
                        LoadCreated: 'bg-purple-100 text-purple-600',
                        LoadStatusChange: 'bg-indigo-100 text-indigo-600',
                        PalletCreated: 'bg-amber-100 text-amber-600',
                      }[entry.EventType] || 'bg-gray-100 text-gray-600'

                      const timeAgo = (date) => {
                        const diff = Date.now() - new Date(date).getTime()
                        const minutes = Math.floor(diff / 60000)
                        if (minutes < 1) return 'just now'
                        if (minutes < 60) return `${minutes}m ago`
                        const hours = Math.floor(minutes / 60)
                        if (hours < 24) return `${hours}h ago`
                        const days = Math.floor(hours / 24)
                        if (days < 7) return `${days}d ago`
                        return new Date(date).toLocaleDateString()
                      }

                      return (
                        <div key={entry.LogID} className="relative pl-8">
                          <div className={`absolute left-1 top-0.5 w-5 h-5 rounded-full flex items-center justify-center ${eventColor}`}>
                            {eventIcon}
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-900">{entry.Description}</span>
                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                              {entry.CreatedBy && <span>by {entry.CreatedBy}</span>}
                              <span>{timeAgo(entry.CreatedAt)}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </Card.Body>
          )}
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

      {/* Raw Material Matcher Modal */}
      <RawMaterialMatcher
        isOpen={showRawMatcher}
        onClose={() => setShowRawMatcher(false)}
        subOutId={id}
        onAddItems={handleAddRawMaterial}
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
