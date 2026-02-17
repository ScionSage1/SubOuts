import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cutlistsApi } from '../services/api'

export function usePackages(jobCode) {
  return useQuery({
    queryKey: ['cutlists', 'packages', jobCode],
    queryFn: () => cutlistsApi.getPackages(jobCode),
    enabled: !!jobCode
  })
}

export function useLongShapes(jobCode, pkg) {
  return useQuery({
    queryKey: ['cutlists', 'longshapes', jobCode, pkg],
    queryFn: () => cutlistsApi.getLongShapes(jobCode, pkg),
    enabled: !!jobCode && !!pkg
  })
}

export function useParts(jobCode, pkg) {
  return useQuery({
    queryKey: ['cutlists', 'parts', jobCode, pkg],
    queryFn: () => cutlistsApi.getParts(jobCode, pkg),
    enabled: !!jobCode && !!pkg
  })
}

export function usePullList(jobCode, pkg) {
  return useQuery({
    queryKey: ['cutlists', 'pulllist', jobCode, pkg],
    queryFn: () => cutlistsApi.getPullList(jobCode, pkg),
    enabled: !!jobCode && !!pkg
  })
}

export function useAvailableItems(jobCode, pkg) {
  return useQuery({
    queryKey: ['cutlists', 'available', jobCode, pkg],
    queryFn: () => cutlistsApi.getAvailable(jobCode, pkg),
    enabled: !!jobCode && !!pkg
  })
}

export function useUpdatePullListSource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ pullListId, data }) => cutlistsApi.updatePullListSource(pullListId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subouts'] })
      queryClient.invalidateQueries({ queryKey: ['cutlists'] })
    }
  })
}

export function useBulkUpdatePullListStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ pullListIds, pullStatus }) => cutlistsApi.bulkUpdatePullListStatus(pullListIds, pullStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subouts'] })
      queryClient.invalidateQueries({ queryKey: ['cutlists'] })
    }
  })
}
