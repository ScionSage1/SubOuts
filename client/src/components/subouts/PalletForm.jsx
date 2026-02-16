import { useState, useEffect } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import Input from '../common/Input'

export default function PalletForm({ isOpen, onClose, onSubmit, initialData, isLoading }) {
  const [formData, setFormData] = useState({
    palletNumber: '',
    weight: '',
    length: '',
    width: '',
    height: '',
    photoURL: '',
    notes: ''
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        palletNumber: initialData.PalletNumber || '',
        weight: initialData.Weight || '',
        length: initialData.Length || '',
        width: initialData.Width || '',
        height: initialData.Height || '',
        photoURL: initialData.PhotoURL || '',
        notes: initialData.Notes || ''
      })
    } else {
      setFormData({
        palletNumber: '',
        weight: '',
        length: '',
        width: '',
        height: '',
        photoURL: '',
        notes: ''
      })
    }
  }, [initialData, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Pallet' : 'New Pallet'} size="md">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Input
            label="Pallet Number"
            name="palletNumber"
            value={formData.palletNumber}
            onChange={handleChange}
            placeholder="Auto-generated if blank"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Weight (lbs)"
              name="weight"
              type="number"
              value={formData.weight}
              onChange={handleChange}
            />
            <div></div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions (inches)</label>
            <div className="grid grid-cols-3 gap-3">
              <Input
                name="length"
                type="number"
                value={formData.length}
                onChange={handleChange}
                placeholder="L"
              />
              <Input
                name="width"
                type="number"
                value={formData.width}
                onChange={handleChange}
                placeholder="W"
              />
              <Input
                name="height"
                type="number"
                value={formData.height}
                onChange={handleChange}
                placeholder="H"
              />
            </div>
          </div>

          <Input
            label="Photo URL"
            name="photoURL"
            value={formData.photoURL}
            onChange={handleChange}
            placeholder="https://..."
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isLoading}>
            {initialData ? 'Update Pallet' : 'Create Pallet'}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}
