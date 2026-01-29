import { useVendors } from '../../hooks/useVendors'
import Select from '../common/Select'

export default function VendorSelect({ value, onChange, ...props }) {
  const { data, isLoading } = useVendors()

  const options = data?.data?.map(vendor => ({
    value: vendor.VendorID,
    label: vendor.VendorName
  })) || []

  return (
    <Select
      options={options}
      value={value}
      onChange={onChange}
      placeholder={isLoading ? 'Loading...' : 'Select vendor...'}
      disabled={isLoading}
      {...props}
    />
  )
}
