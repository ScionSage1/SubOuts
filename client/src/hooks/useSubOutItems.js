import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { itemsApi } from '../services/api'

export function useSubOutItems(subOutId) {
  return useQuery({
    queryKey: ['subouts', subOutId, 'items'],
    queryFn: () => itemsApi.getBySubOut(subOutId),
    enabled: !!subOutId
  })
}

export function useAddItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ subOutId, data }) => itemsApi.add(subOutId, data),
    onSuccess: (_, { subOutId }) => {
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId, 'items'] })
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId] })
    }
  })
}

export function useBulkAddItems() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ subOutId, items }) => itemsApi.bulkAdd(subOutId, items),
    onSuccess: (_, { subOutId }) => {
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId, 'items'] })
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId] })
      queryClient.invalidateQueries({ queryKey: ['cutlists'] })
    }
  })
}

export function useUpdateItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ subOutId, itemId, data }) => itemsApi.update(subOutId, itemId, data),
    onSuccess: (_, { subOutId }) => {
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId, 'items'] })
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId] })
    }
  })
}

export function useDeleteItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ subOutId, itemId }) => itemsApi.delete(subOutId, itemId),
    onSuccess: (_, { subOutId }) => {
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId, 'items'] })
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId] })
      queryClient.invalidateQueries({ queryKey: ['cutlists'] })
    }
  })
}
