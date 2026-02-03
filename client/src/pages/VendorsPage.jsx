import { useState, useMemo } from 'react'
import { Plus, Edit2, Trash2, Building2, Search, Phone, Mail, MapPin, ChevronDown, ChevronUp, Filter, X, MessageSquare, Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { useVendors, useCreateVendor, useUpdateVendor, useDeleteVendor } from '../hooks/useVendors'
import { useVendorCommunications, useCreateCommunication, useUpdateCommunication, useDeleteCommunication, useCompleteFollowUp } from '../hooks/useCommunications'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import Input from '../components/common/Input'
import LoadingSpinner from '../components/common/LoadingSpinner'

const SIZE_OPTIONS = ['Small', 'Medium', 'Large', 'Large - many shops', 'Mega', 'Mega - many shops']
const SIZE_COLORS = {
  'Small': 'bg-gray-100 text-gray-700',
  'Medium': 'bg-blue-100 text-blue-700',
  'Large': 'bg-green-100 text-green-700',
  'Large - many shops': 'bg-green-200 text-green-800',
  'Mega': 'bg-purple-100 text-purple-700',
  'Mega - many shops': 'bg-purple-200 text-purple-800'
}

const MFC_OUTREACH_OPTIONS = ['Doug', 'Todd', 'Blake', 'Evan', 'Ken', 'Joe L.', 'Joe S.', 'Conrad']
const CONTACT_TYPES = ['Phone', 'Email', 'Meeting', 'Site Visit', 'Other']
const FOLLOW_UP_TYPES = ['Call', 'Email', 'Meeting', 'Quote', 'Other']

export default function VendorsPage() {
  const { data, isLoading, error } = useVendors({ includeInactive: true })
  const createMutation = useCreateVendor()
  const updateMutation = useUpdateVendor()
  const deleteMutation = useDeleteVendor()
  const createCommMutation = useCreateCommunication()
  const updateCommMutation = useUpdateCommunication()
  const deleteCommMutation = useDeleteCommunication()
  const completeFollowUpMutation = useCompleteFollowUp()

  const [showModal, setShowModal] = useState(false)
  const [showCommModal, setShowCommModal] = useState(false)
  const [editingVendor, setEditingVendor] = useState(null)
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [editingComm, setEditingComm] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sizeFilter, setSizeFilter] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [sortField, setSortField] = useState('VendorName')
  const [sortDir, setSortDir] = useState('asc')
  const [expandedRow, setExpandedRow] = useState(null)

  const [formData, setFormData] = useState({
    vendorName: '',
    city: '',
    state: '',
    size: '',
    contactName: '',
    aiscBoard: false,
    mfcOutreach: '',
    email: '',
    phone: '',
    lastContactDate: '',
    notes: ''
  })

  const [commFormData, setCommFormData] = useState({
    contactType: 'Phone',
    contactPerson: '',
    mfcEmployee: '',
    summary: '',
    details: '',
    followUpRequired: false,
    followUpDate: '',
    followUpType: '',
    followUpNotes: ''
  })

  const vendors = data?.data || []

  // Get unique states for filter
  const states = useMemo(() => {
    const stateSet = new Set(vendors.map(v => v.State).filter(Boolean))
    return Array.from(stateSet).sort()
  }, [vendors])

  // Filter and sort vendors
  const filteredVendors = useMemo(() => {
    let result = vendors.filter(v => v.IsActive !== false)

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(v =>
        v.VendorName?.toLowerCase().includes(term) ||
        v.ContactName?.toLowerCase().includes(term) ||
        v.City?.toLowerCase().includes(term) ||
        v.State?.toLowerCase().includes(term) ||
        v.Notes?.toLowerCase().includes(term)
      )
    }

    if (sizeFilter) {
      result = result.filter(v => v.Size === sizeFilter)
    }

    if (stateFilter) {
      result = result.filter(v => v.State === stateFilter)
    }

    // Sort
    result.sort((a, b) => {
      const aVal = a[sortField] || ''
      const bVal = b[sortField] || ''
      const cmp = aVal.toString().localeCompare(bVal.toString())
      return sortDir === 'asc' ? cmp : -cmp
    })

    return result
  }, [vendors, searchTerm, sizeFilter, stateFilter, sortField, sortDir])

  const openCreateModal = () => {
    setEditingVendor(null)
    setFormData({
      vendorName: '',
      city: '',
      state: '',
      size: '',
      contactName: '',
      aiscBoard: false,
      mfcOutreach: '',
      email: '',
      phone: '',
      lastContactDate: '',
      notes: ''
    })
    setShowModal(true)
  }

  const openEditModal = (vendor) => {
    setEditingVendor(vendor)
    setFormData({
      vendorName: vendor.VendorName || '',
      city: vendor.City || '',
      state: vendor.State || '',
      size: vendor.Size || '',
      contactName: vendor.ContactName || '',
      aiscBoard: vendor.AISCBoard || false,
      mfcOutreach: vendor.MFCOutreach || '',
      email: vendor.Email || '',
      phone: vendor.Phone || '',
      lastContactDate: vendor.LastContactDate ? vendor.LastContactDate.split('T')[0] : '',
      notes: vendor.Notes || ''
    })
    setShowModal(true)
  }

  const openCommModal = (vendor, comm = null) => {
    setSelectedVendor(vendor)
    setEditingComm(comm)
    if (comm) {
      // Editing existing communication
      setCommFormData({
        contactType: comm.ContactType || 'Phone',
        contactPerson: comm.ContactPerson || '',
        mfcEmployee: comm.MFCEmployee || '',
        summary: comm.Summary || '',
        details: comm.Details || '',
        followUpRequired: comm.FollowUpRequired || false,
        followUpDate: comm.FollowUpDate ? comm.FollowUpDate.split('T')[0] : '',
        followUpType: comm.FollowUpType || '',
        followUpNotes: comm.FollowUpNotes || ''
      })
    } else {
      // Creating new communication
      setCommFormData({
        contactType: 'Phone',
        contactPerson: vendor.ContactName || '',
        mfcEmployee: vendor.MFCOutreach || '',
        summary: '',
        details: '',
        followUpRequired: false,
        followUpDate: '',
        followUpType: '',
        followUpNotes: ''
      })
    }
    setShowCommModal(true)
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

  const handleCommSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingComm) {
        await updateCommMutation.mutateAsync({
          id: editingComm.LogID,
          data: commFormData
        })
      } else {
        await createCommMutation.mutateAsync({
          vendorId: selectedVendor.VendorID,
          ...commFormData,
          source: 'Manual'
        })
      }
      setShowCommModal(false)
      setEditingComm(null)
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  const handleDeleteComm = async (comm) => {
    if (confirm(`Delete this communication entry from ${new Date(comm.ContactDate).toLocaleDateString()}?`)) {
      try {
        await deleteCommMutation.mutateAsync(comm.LogID)
      } catch (err) {
        alert('Error: ' + err.message)
      }
    }
  }

  const handleDelete = async (vendor) => {
    if (confirm(`Deactivate "${vendor.VendorName}"?`)) {
      try {
        await deleteMutation.mutateAsync(vendor.VendorID)
      } catch (err) {
        alert('Error: ' + err.message)
      }
    }
  }

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCommChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setCommFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null
    return sortDir === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSizeFilter('')
    setStateFilter('')
  }

  const hasFilters = searchTerm || sizeFilter || stateFilter

  if (isLoading) {
    return <LoadingSpinner className="py-20" size="lg" />
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sub Fabricators</h1>
          <p className="text-sm text-gray-500 mt-1">
            {filteredVendors.length} of {vendors.filter(v => v.IsActive !== false).length} fabricators
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-1" />
          Add Fabricator
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search fabricators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={sizeFilter}
              onChange={(e) => setSizeFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Sizes</option>
              {SIZE_OPTIONS.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>

            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All States</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {error ? (
        <div className="text-center py-10 text-red-600">Error: {error.message}</div>
      ) : filteredVendors.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-white rounded-lg border border-gray-200">
          <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          {hasFilters ? (
            <>
              <p>No fabricators match your filters.</p>
              <button onClick={clearFilters} className="text-primary-600 hover:underline mt-2">
                Clear filters
              </button>
            </>
          ) : (
            <>
              <p>No sub fabricators yet.</p>
              <button onClick={openCreateModal} className="text-primary-600 hover:underline mt-2">
                Add the first fabricator
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th
                    className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('VendorName')}
                  >
                    <div className="flex items-center gap-1">
                      Fabricator <SortIcon field="VendorName" />
                    </div>
                  </th>
                  <th
                    className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('City')}
                  >
                    <div className="flex items-center gap-1">
                      Location <SortIcon field="City" />
                    </div>
                  </th>
                  <th
                    className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('Size')}
                  >
                    <div className="flex items-center gap-1">
                      Size <SortIcon field="Size" />
                    </div>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th
                    className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('MFCOutreach')}
                  >
                    <div className="flex items-center gap-1">
                      MFC Rep <SortIcon field="MFCOutreach" />
                    </div>
                  </th>
                  <th
                    className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('LastContactDate')}
                  >
                    <div className="flex items-center gap-1">
                      Last Contact <SortIcon field="LastContactDate" />
                    </div>
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredVendors.map(vendor => (
                  <VendorRow
                    key={vendor.VendorID}
                    vendor={vendor}
                    expanded={expandedRow === vendor.VendorID}
                    onToggle={() => setExpandedRow(expandedRow === vendor.VendorID ? null : vendor.VendorID)}
                    onEdit={() => openEditModal(vendor)}
                    onDelete={() => handleDelete(vendor)}
                    onAddComm={() => openCommModal(vendor)}
                    onEditComm={(comm) => openCommModal(vendor, comm)}
                    onDeleteComm={handleDeleteComm}
                    onCompleteFollowUp={(logId) => completeFollowUpMutation.mutate(logId)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Fabricator Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingVendor ? 'Edit Sub Fabricator' : 'Add Sub Fabricator'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Fabricator Name"
            value={formData.vendorName}
            onChange={handleChange('vendorName')}
            required
          />

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="City"
              value={formData.city}
              onChange={handleChange('city')}
            />
            <Input
              label="State"
              value={formData.state}
              onChange={handleChange('state')}
              placeholder="e.g., WA"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
              <select
                value={formData.size}
                onChange={handleChange('size')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select size...</option>
                {SIZE_OPTIONS.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Contact Name"
              value={formData.contactName}
              onChange={handleChange('contactName')}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">MFC Outreach Rep</label>
              <select
                value={formData.mfcOutreach}
                onChange={handleChange('mfcOutreach')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select rep...</option>
                {MFC_OUTREACH_OPTIONS.map(rep => (
                  <option key={rep} value={rep}>{rep}</option>
                ))}
              </select>
            </div>
          </div>

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

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Last Contact Date"
              type="date"
              value={formData.lastContactDate}
              onChange={handleChange('lastContactDate')}
            />
            <div className="flex items-center pt-7">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.aiscBoard}
                  onChange={handleChange('aiscBoard')}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">AISC Board Member</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={handleChange('notes')}
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Contact history, work status, etc."
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

      {/* Add/Edit Communication Modal */}
      <Modal
        isOpen={showCommModal}
        onClose={() => { setShowCommModal(false); setEditingComm(null); }}
        title={editingComm ? `Edit Communication - ${selectedVendor?.VendorName || ''}` : `Log Communication - ${selectedVendor?.VendorName || ''}`}
        size="lg"
      >
        <form onSubmit={handleCommSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Type</label>
              <select
                value={commFormData.contactType}
                onChange={handleCommChange('contactType')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {CONTACT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">MFC Employee</label>
              <select
                value={commFormData.mfcEmployee}
                onChange={handleCommChange('mfcEmployee')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select...</option>
                {MFC_OUTREACH_OPTIONS.map(rep => (
                  <option key={rep} value={rep}>{rep}</option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Contact Person (at fabricator)"
            value={commFormData.contactPerson}
            onChange={handleCommChange('contactPerson')}
            placeholder="Who did you talk to?"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Summary *</label>
            <input
              type="text"
              value={commFormData.summary}
              onChange={handleCommChange('summary')}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Brief summary of the conversation..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
            <textarea
              value={commFormData.details}
              onChange={handleCommChange('details')}
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Full details of the conversation..."
            />
          </div>

          <div className="border-t border-gray-200 pt-4">
            <label className="flex items-center gap-2 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={commFormData.followUpRequired}
                onChange={handleCommChange('followUpRequired')}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">Follow-up Required</span>
            </label>

            {commFormData.followUpRequired && (
              <div className="grid grid-cols-2 gap-4 pl-6">
                <Input
                  label="Follow-up Date"
                  type="date"
                  value={commFormData.followUpDate}
                  onChange={handleCommChange('followUpDate')}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Type</label>
                  <select
                    value={commFormData.followUpType}
                    onChange={handleCommChange('followUpType')}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select...</option>
                    {FOLLOW_UP_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Notes</label>
                  <input
                    type="text"
                    value={commFormData.followUpNotes}
                    onChange={handleCommChange('followUpNotes')}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="What needs to be done?"
                  />
                </div>
              </div>
            )}
          </div>

          <Modal.Footer>
            <Button type="button" variant="secondary" onClick={() => { setShowCommModal(false); setEditingComm(null); }}>
              Cancel
            </Button>
            <Button type="submit" loading={createCommMutation.isPending || updateCommMutation.isPending}>
              {editingComm ? 'Update' : 'Log Communication'}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  )
}

// Separate component for vendor row with communication log
function VendorRow({ vendor, expanded, onToggle, onEdit, onDelete, onAddComm, onEditComm, onDeleteComm, onCompleteFollowUp }) {
  const { data: commData } = useVendorCommunications(expanded ? vendor.VendorID : null)
  const communications = commData?.data || []

  return (
    <>
      <tr
        className="hover:bg-gray-50 cursor-pointer"
        onClick={onToggle}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{vendor.VendorName}</span>
            {vendor.AISCBoard && (
              <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">
                AISC
              </span>
            )}
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">
          {vendor.City && vendor.State
            ? `${vendor.City}, ${vendor.State}`
            : vendor.State || vendor.City || '—'}
        </td>
        <td className="px-4 py-3">
          {vendor.Size ? (
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${SIZE_COLORS[vendor.Size] || 'bg-gray-100 text-gray-700'}`}>
              {vendor.Size}
            </span>
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">
          {vendor.ContactName || '—'}
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">
          {vendor.MFCOutreach || '—'}
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">
          {vendor.LastContactDate
            ? new Date(vendor.LastContactDate).toLocaleDateString()
            : '—'}
        </td>
        <td className="px-4 py-3 text-right">
          <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={onAddComm}
              className="p-1.5 text-gray-400 hover:text-green-600 rounded hover:bg-gray-100"
              title="Log Communication"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <button
              onClick={onEdit}
              className="p-1.5 text-gray-400 hover:text-primary-600 rounded hover:bg-gray-100"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-gray-100"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-gray-50">
          <td colSpan={7} className="px-4 py-4">
            {/* Contact Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
              {vendor.Phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a href={`tel:${vendor.Phone}`} className="text-primary-600 hover:underline">
                    {vendor.Phone}
                  </a>
                </div>
              )}
              {vendor.Email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a href={`mailto:${vendor.Email}`} className="text-primary-600 hover:underline truncate">
                    {vendor.Email}
                  </a>
                </div>
              )}
              {vendor.Address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{vendor.Address}</span>
                </div>
              )}
            </div>

            {vendor.Notes && (
              <div className="mb-4 p-3 bg-white rounded border border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Notes</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{vendor.Notes}</p>
              </div>
            )}

            {/* Communication Log */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Communication Log
                </h4>
                <button
                  onClick={(e) => { e.stopPropagation(); onAddComm(); }}
                  className="text-xs text-primary-600 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Add Entry
                </button>
              </div>

              {communications.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No communication history yet.</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {communications.map(comm => (
                    <div key={comm.LogID} className="bg-white rounded border border-gray-200 p-3 text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                            comm.ContactType === 'Phone' ? 'bg-blue-100 text-blue-700' :
                            comm.ContactType === 'Email' ? 'bg-green-100 text-green-700' :
                            comm.ContactType === 'Meeting' ? 'bg-purple-100 text-purple-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {comm.ContactType}
                          </span>
                          <span className="text-gray-500">
                            {new Date(comm.ContactDate).toLocaleDateString()}
                          </span>
                          {comm.MFCEmployee && (
                            <span className="text-gray-400">by {comm.MFCEmployee}</span>
                          )}
                          {comm.Source === 'MFCCortex' && (
                            <span className="text-xs bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded">
                              AI
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {comm.FollowUpRequired && !comm.FollowUpCompleted && (
                            <button
                              onClick={(e) => { e.stopPropagation(); onCompleteFollowUp(comm.LogID); }}
                              className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700"
                              title="Mark follow-up complete"
                            >
                              <AlertCircle className="w-3 h-3" />
                              Follow-up {comm.FollowUpDate ? new Date(comm.FollowUpDate).toLocaleDateString() : ''}
                            </button>
                          )}
                          {comm.FollowUpCompleted && (
                            <span className="flex items-center gap-1 text-xs text-green-600">
                              <CheckCircle2 className="w-3 h-3" />
                              Done
                            </span>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); onEditComm(comm); }}
                            className="p-1 text-gray-400 hover:text-primary-600 rounded hover:bg-gray-100"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onDeleteComm(comm); }}
                            className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-gray-100"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      {comm.ContactPerson && (
                        <p className="text-gray-500 text-xs mt-1">Spoke with: {comm.ContactPerson}</p>
                      )}
                      <p className="text-gray-800 mt-1 font-medium">{comm.Summary}</p>
                      {comm.Details && (
                        <p className="text-gray-600 mt-1">{comm.Details}</p>
                      )}
                      {comm.FollowUpNotes && (
                        <p className="text-amber-600 text-xs mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {comm.FollowUpNotes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
