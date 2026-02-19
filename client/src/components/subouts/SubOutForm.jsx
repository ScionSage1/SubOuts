import { useState, useEffect } from 'react'
import Input from '../common/Input'
import Select from '../common/Select'
import DatePicker from '../common/DatePicker'
import Button from '../common/Button'
import { useVendors } from '../../hooks/useVendors'
import { useJobs } from '../../hooks/useJobs'
import { statusOptions } from '../../utils/statusColors'
import { formatDateInput } from '../../utils/formatters'

export default function SubOutForm({ initialData, onSubmit, onCancel, isLoading }) {
  const { data: vendorsData } = useVendors()
  const { data: jobsData } = useJobs()

  const [formData, setFormData] = useState({
    jobCode: '',
    lot: '',
    description: '',
    vendorId: '',
    dateToLeaveMFC: '',
    loadsToShipFromMFC: 1,
    dateToShipFromSub: '',
    loadsToShipFromSub: 1,
    zone: '',
    weight: '',
    majorPieces: '',
    missingSteel: '',
    status: 'Submitted',
    poNumber: '',
    estimatedCost: '',
    actualCost: '',
    notes: ''
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        jobCode: initialData.JobCode || '',
        lot: initialData.Lot || '',
        description: initialData.Description || '',
        vendorId: initialData.VendorID || '',
        dateToLeaveMFC: formatDateInput(initialData.DateToLeaveMFC),
        loadsToShipFromMFC: initialData.LoadsToShipFromMFC || 1,
        dateToShipFromSub: formatDateInput(initialData.DateToShipFromSub),
        loadsToShipFromSub: initialData.LoadsToShipFromSub || 1,
        zone: initialData.Zone || '',
        weight: initialData.Weight || '',
        majorPieces: initialData.MajorPieces || '',
        missingSteel: initialData.MissingSteel || '',
        status: initialData.Status || 'Submitted',
        poNumber: initialData.PONumber || '',
        estimatedCost: initialData.EstimatedCost || '',
        actualCost: initialData.ActualCost || '',
        notes: initialData.Notes || ''
      })
    }
  }, [initialData])

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const vendors = vendorsData?.data || []
  const jobs = jobsData?.data || []

  const vendorOptions = vendors.map(v => ({ value: v.VendorID, label: v.VendorName }))
  const jobOptions = jobs.map(j => ({ value: j.JobCode, label: j.JobDescription || `Job ${j.JobCode}` }))
  const statusOpts = statusOptions.map(s => ({ value: s, label: s }))

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Job & Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          label="Job"
          value={formData.jobCode}
          onChange={handleChange('jobCode')}
          options={jobOptions}
          placeholder="Select job..."
          required
          disabled={!!initialData}
        />
        <Input
          label="Lot Number"
          value={formData.lot}
          onChange={handleChange('lot')}
          placeholder="SUB#001"
          required
          disabled={!!initialData}
        />
        <Input
          label="Description"
          value={formData.description}
          onChange={handleChange('description')}
          placeholder="Columns, Beams, etc."
        />
      </div>

      {/* Vendor & Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          label="Vendor"
          value={formData.vendorId}
          onChange={handleChange('vendorId')}
          options={vendorOptions}
          placeholder="Select vendor..."
        />
        <Select
          label="Status"
          value={formData.status}
          onChange={handleChange('status')}
          options={statusOpts}
        />
        <Input
          label="Zone"
          value={formData.zone}
          onChange={handleChange('zone')}
          placeholder="e.g., 2, 3"
        />
      </div>

      {/* Shipping Dates & Planning */}
      <div className="border-t pt-4">
        <h3 className="font-medium text-gray-900 mb-3">Shipping</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DatePicker
            label="Date to Leave MFC"
            value={formData.dateToLeaveMFC}
            onChange={handleChange('dateToLeaveMFC')}
          />
          <DatePicker
            label="Date to Ship from Sub"
            value={formData.dateToShipFromSub}
            onChange={handleChange('dateToShipFromSub')}
          />
          <Input
            label="Planned Outbound Loads"
            type="number"
            min="1"
            value={formData.loadsToShipFromMFC}
            onChange={handleChange('loadsToShipFromMFC')}
          />
          <Input
            label="Planned Inbound Loads"
            type="number"
            min="1"
            value={formData.loadsToShipFromSub}
            onChange={handleChange('loadsToShipFromSub')}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">Detailed load tracking (truck info, status, items) is available on the detail page.</p>
      </div>

      {/* Details */}
      <div className="border-t pt-4">
        <h3 className="font-medium text-gray-900 mb-3">Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Weight (lbs)"
            type="number"
            value={formData.weight}
            onChange={handleChange('weight')}
          />
          <Input
            label="Major Pieces"
            type="number"
            value={formData.majorPieces}
            onChange={handleChange('majorPieces')}
          />
          <Input
            label="PO Number"
            value={formData.poNumber}
            onChange={handleChange('poNumber')}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Input
            label="Estimated Cost"
            type="number"
            step="0.01"
            value={formData.estimatedCost}
            onChange={handleChange('estimatedCost')}
          />
          <Input
            label="Actual Cost"
            type="number"
            step="0.01"
            value={formData.actualCost}
            onChange={handleChange('actualCost')}
          />
        </div>
      </div>

      {/* Missing Steel */}
      <div className="border-t pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Missing Steel
        </label>
        <textarea
          value={formData.missingSteel}
          onChange={handleChange('missingSteel')}
          rows={2}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="List any missing steel..."
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={handleChange('notes')}
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Additional notes..."
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={isLoading}>
          {initialData ? 'Update SubOut' : 'Create SubOut'}
        </Button>
      </div>
    </form>
  )
}
