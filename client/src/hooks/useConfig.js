import { useQuery } from '@tanstack/react-query'
import { configApi } from '../services/api'

export function usePullStatuses() {
  return useQuery({
    queryKey: ['config', 'pullStatuses'],
    queryFn: () => configApi.getPullStatuses(),
    staleTime: 30 * 60 * 1000 // 30 minutes - config rarely changes
  })
}
