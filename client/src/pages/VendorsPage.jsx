import { useState } from 'react'
import { Plus, Edit2, Trash2, Building2 } from 'lucide-react'
import { useVendors, useCreateVendor, useUpdateVendor, useDeleteVendor } from '../hooks/useVendors'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import Input from '../components/common/Input'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function VendorsPage() {
  const { data, isLoading, error } = useVendors({ includeInactive: true })
  const createMutation = useCreateVendor()
  const updateMutation = useUpdateVendor()
  const deleteMutation = useDeleteVendor()

  const [showModal, setShowModal] = useState(false)
  const [editingVendor, setEditingVendor] = useState(null)
  const [formData, setFormData] = useState({
    vendorName: '',
    contactName: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  })

  const vendors = data?.data || []

  const openCreateModal = () => {
    setEditingVendor(null)
    setFormData({
      vendorName: '',
      contactName: '',
      phone: '',
      email: '',
      address: '',
      notes: ''
    })
    setShowModal(true)
  }

  const openEditModal = (vendor) => {
    setEditingVendor(vendor)
    setFormData({
      vendorName: vendor.VendorName || '',
      contactName: vendor.ContactName || '',
      phone: vendor.Phone || '',
      email: vendor.Email || '',
      address: vendor.Address || '',
      notes: vendor.Notes || ''
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingVendor) {
        await updateMutation.mutateAsync({ id: editingVendor.VendorID, data: formData })
      } else {
        await createMutation.mutateAsync(formData)
      }
      setShowModal(false)
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  const handleDelete = async (vendor) => {
    if (confirm(`Deactivate vendor "${vendor.VendorName}"?`)) {
      try {
        await deleteMutation.mutateAsync(vendor.VendorID)
      } catch (err) {
        alert('Error: ' + err.message)
      }
    }
  }

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  if (isLoading) {
    return <LoadingSpinner className="py-20" size="lg" />
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-1" />
          Add Vendor
        </Button>
      </div>

      {error ? (
        <div className="text-center py-10 text-red-600">Error: {error.message}</div>
      ) : vendors.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No vendors yet.</p>
          <button onClick={openCreateModal} className="text-blue-600 hover:underline mt-2">
            Add the first vendor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendors.map(vendor => (
            <Card key={vendor.VendorID} className={!vendor.IsActive ? 'opacity-50' : ''}>
              <Card.Body>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{vendor.VendorName}</h3>
                    {vendor.ContactName && (
                      <p className="text-sm text-gray-600">{vendor.ContactName}</p>
                    )}
                  </div>
                  {!vendor.IsActive && (
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                      Inactive
                    </span>
                  )}
                </div>

                {vendor.Phone && (
                  <p className="text-sm text-gray-500 mt-2">{vendor.Phone}</p>
                )}
                {vendor.Email && (
                  <p className="text-sm text-gray-500">{vendor.Email}</p>
                )}
                {vendor.Address && (
                  <p className="text-sm text-gray-500 mt-1">{vendor.Address}</p>
                )}
                {vendor.Notes && (
                  <p className="text-sm text-gray-400 mt-2 italic">{vendor.Notes}</p>
                )}

                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => openEditModal(vendor)}
                    className="p-1 text-gray-400 hover:text-blue-600"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {vendor.IsActive && (
                    <button
                      onClick={() => handleDelete(vendor)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingVendor ? 'Edit Vendor' : 'Add Vendor'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Vendor Name"
            value={formData.vendorName}
            onChange={handleChange('vendorName')}
            required
          />
          <Input
            label="Contact Name"
            value={formData.contactName}
            onChange={handleChange('contactName')}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Phone"
              value={formData.phone}
              onChange={handleChange('phone')}
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
            />
          </div>
          <Input
            label="Address"
            value={formData.address}
            onChange={handleChange('address')}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={handleChange('notes')}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <Modal.Footer>
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
              {editingVendor ? 'Update' : 'Create'}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  )
}
