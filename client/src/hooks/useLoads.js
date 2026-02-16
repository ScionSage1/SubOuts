import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { loadsApi } from '../services/api'

export function useLoads(subOutId, direction) {
  return useQuery({
    queryKey: ['subouts', subOutId, 'loads', { direction }],
    queryFn: () => loadsApi.getBySubOut(subOutId, direction),
    enabled: !!subOutId
  })
}

export function useLoad(subOutId, loadId) {
  return useQuery({
    queryKey: ['subouts', subOutId, 'loads', loadId],
    queryFn: () => loadsApi.getById(subOutId, loadId),
    enabled: !!subOutId && !!loadId
  })
}

export function useCreateLoad() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ subOutId, data }) => loadsApi.create(subOutId, data),
    onSuccess: (_, { subOutId }) => {
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId, 'loads'] })
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId] })
      queryClient.invalidateQueries({ queryKey: ['subouts'] })
    }
  })
}

export function useUpdateLoad() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ subOutId, loadId, data }) => loadsApi.update(subOutId, loadId, data),
    onSuccess: (_, { subOutId }) => {
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId, 'loads'] })
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId] })
    }
  })
}

export function useDeleteLoad() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ subOutId, loadId }) => loadsApi.delete(subOutId, loadId),
    onSuccess: (_, { subOutId }) => {
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId, 'loads'] })
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId, 'items'] })
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId, 'pallets'] })
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId] })
      queryClient.invalidateQueries({ queryKey: ['subouts'] })
    }
  })
}

export function useUpdateLoadStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ subOutId, loadId, status }) => loadsApi.updateStatus(subOutId, loadId, status),
    onSuccess: (_, { subOutId }) => {
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId, 'loads'] })
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId] })
      queryClient.invalidateQueries({ queryKey: ['subouts'] })
    }
  })
}

export function useAssignItemsToLoad() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ subOutId, loadId, itemIds }) => loadsApi.assignItems(subOutId, loadId, itemIds),
    onSuccess: (_, { subOutId }) => {
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId, 'loads'] })
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId, 'items'] })
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId] })
    }
  })
}

export function useRemoveItemFromLoad() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ subOutId, loadId, itemId }) => loadsApi.removeItem(subOutId, loadId, itemId),
    onSuccess: (_, { subOutId }) => {
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId, 'loads'] })
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId, 'items'] })
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId] })
    }
  })
}

export function useAssignPalletsToLoad() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ subOutId, loadId, palletIds }) => loadsApi.assignPallets(subOutId, loadId, palletIds),
    onSuccess: (_, { subOutId }) => {
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId, 'loads'] })
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId, 'pallets'] })
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId, 'items'] })
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId] })
    }
  })
}

export function useRemovePalletFromLoad() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ subOutId, loadId, palletId }) => loadsApi.removePallet(subOutId, loadId, palletId),
    onSuccess: (_, { subOutId }) => {
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId, 'loads'] })
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId, 'pallets'] })
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId] })
    }
  })
}
