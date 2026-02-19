import { useQuery } from '@tanstack/react-query'
import { activityApi } from '../services/api'

export function useActivity(subOutId) {
  return useQuery({
    queryKey: ['subouts', subOutId, 'activity'],
    queryFn: () => activityApi.getBySubOut(subOutId),
    enabled: !!subOutId
  })
}
