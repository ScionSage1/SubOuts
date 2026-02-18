import { useQuery } from '@tanstack/react-query'
import { teklaApi } from '../services/api'

export function useInventoryFilters(enabled = true) {
  return useQuery({
    queryKey: ['tekla', 'filters'],
    queryFn: () => teklaApi.getInventoryFilters(),
    enabled,
    staleTime: 30 * 60 * 1000
  })
}

export function useMatchingInventory(shapes, enabled = true) {
  return useQuery({
    queryKey: ['tekla', 'matching', shapes],
    queryFn: () => teklaApi.getMatchingInventory(shapes),
    enabled: enabled && Array.isArray(shapes) && shapes.length > 0,
    staleTime: 30 * 60 * 1000
  })
}
