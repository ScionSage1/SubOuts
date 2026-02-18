import { useQuery } from '@tanstack/react-query'
import { teklaApi } from '../services/api'

export function useMatchingInventory(shapes, enabled = true) {
  return useQuery({
    queryKey: ['tekla', 'matching', shapes],
    queryFn: () => teklaApi.getMatchingInventory(shapes),
    enabled: enabled && Array.isArray(shapes) && shapes.length > 0,
    staleTime: 30 * 60 * 1000 // 30 minutes - same as Tekla cache
  })
}
