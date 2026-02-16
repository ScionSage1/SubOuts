import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { palletsApi } from '../services/api'

export function usePallets(subOutId) {
  return useQuery({
    queryKey: ['subouts', subOutId, 'pallets'],
    queryFn: () => palletsApi.getBySubOut(subOutId),
    enabled: !!subOutId
  })
}

export function usePallet(subOutId, palletId) {
  return useQuery({
    queryKey: ['subouts', subOutId, 'pallets', palletId],
    queryFn: () => palletsApi.getById(subOutId, palletId),
    enabled: !!subOutId && !!palletId
  })
}

export function useCreatePallet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ subOutId, data }) => palletsApi.create(subOutId, data),
    onSuccess: (_, { subOutId }) => {
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId, 'pallets'] })
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId] })
    }
  })
}

export function useUpdatePallet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ subOutId, palletId, data }) => palletsApi.update(subOutId, palletId, data),
    onSuccess: (_, { subOutId }) => {
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId, 'pallets'] })
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId] })
    }
  })
}

export function useDeletePallet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ subOutId, palletId }) => palletsApi.delete(subOutId, palletId),
    onSuccess: (_, { subOutId }) => {
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId, 'pallets'] })
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId] })
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId, 'items'] })
    }
  })
}

export function useUpdatePalletStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ subOutId, palletId, status }) => palletsApi.updateStatus(subOutId, palletId, status),
    onSuccess: (_, { subOutId }) => {
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId, 'pallets'] })
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId] })
    }
  })
}

export function useAssignItemsToPallet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ subOutId, palletId, itemIds }) => palletsApi.assignItems(subOutId, palletId, itemIds),
    onSuccess: (_, { subOutId }) => {
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId, 'pallets'] })
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId, 'items'] })
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId] })
    }
  })
}

export function useRemoveItemFromPallet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ subOutId, palletId, itemId }) => palletsApi.removeItem(subOutId, palletId, itemId),
    onSuccess: (_, { subOutId }) => {
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId, 'pallets'] })
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId, 'items'] })
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId] })
    }
  })
}

export function useAssignPalletToLoad() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ subOutId, palletId, loadId }) => palletsApi.assignToLoad(subOutId, palletId, loadId),
    onSuccess: (_, { subOutId }) => {
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId, 'pallets'] })
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId, 'loads'] })
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId, 'items'] })
      queryClient.invalidateQueries({ queryKey: ['subouts', subOutId] })
    }
  })
}
