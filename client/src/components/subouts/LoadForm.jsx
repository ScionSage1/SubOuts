import { useState, useEffect } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import Input from '../common/Input'
import Select from '../common/Select'
import { formatDateInput } from '../../utils/formatters'

export default function LoadForm({ isOpen, onClose, onSubmit, initialData, defaultDirection, isLoading }) {
  const [formData, setFormData] = useState({
    direction: 'Outbound',
    scheduledDate: '',
    actualDate: '',
    truckCompany: '',
    trailerNumber: '',
    driverName: '',
    bolNumber: '',
    weight: '',
    pieceCount: '',
    notes: ''
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        direction: initialData.Direction || 'Outbound',
        scheduledDate: formatDateInput(initialData.ScheduledDate),
        actualDate: formatDateInput(initialData.ActualDate),
        truckCompany: initialData.TruckCompany || '',
        trailerNumber: initialData.TrailerNumber || '',
        driverName: initialData.DriverName || '',
        bolNumber: initialData.BOLNumber || '',
        weight: initialData.Weight ?? '',
        pieceCount: initialData.PieceCount ?? '',
        notes: initialData.Notes || ''
      })
    } else {
      setFormData({
        direction: defaultDirection || 'Outbound',
        scheduledDate: '',
        actualDate: '',
        truckCompany: '',
        trailerNumber: '',
        driverName: '',
        bolNumber: '',
        weight: '',
        pieceCount: '',
        notes: ''
      })
    }
  }, [initialData, defaultDirection, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ ...formData, weight: String(formData.weight).replace(/,/g, '') })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Load' : 'New Load'} size="md">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Select
            label="Direction"
            name="direction"
            value={formData.direction}
            onChange={handleChange}
            disabled={!!initialData}
            options={[
              { value: 'Outbound', label: 'Outbound (MFC → Sub)' },
              { value: 'Inbound', label: 'Inbound (Sub → MFC)' }
            ]}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Scheduled Date"
              name="scheduledDate"
              type="date"
              value={formData.scheduledDate}
              onChange={handleChange}
            />
            <Input
              label="Actual Date"
              name="actualDate"
              type="date"
              value={formData.actualDate}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Truck Company"
              name="truckCompany"
              value={formData.truckCompany}
              onChange={handleChange}
            />
            <Input
              label="Trailer Number"
              name="trailerNumber"
              value={formData.trailerNumber}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Driver Name"
              name="driverName"
              value={formData.driverName}
              onChange={handleChange}
            />
            <Input
              label="BOL Number"
              name="bolNumber"
              value={formData.bolNumber}
              onChange={handleChange}
              placeholder="Bill of Lading"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Weight (lbs)"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
            />
            <Input
              label="Piece Count"
              name="pieceCount"
              type="number"
              value={formData.pieceCount}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isLoading}>
            {initialData ? 'Update Load' : 'Create Load'}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}
