import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { communicationsApi } from '../services/api'

export function useCommunications(params = {}) {
  return useQuery({
    queryKey: ['communications', params],
    queryFn: () => communicationsApi.getAll(params)
  })
}

export function useVendorCommunications(vendorId) {
  return useQuery({
    queryKey: ['communications', { vendorId }],
    queryFn: () => communicationsApi.getAll({ vendorId }),
    enabled: !!vendorId
  })
}

export function useFollowUps() {
  return useQuery({
    queryKey: ['communications', 'follow-ups'],
    queryFn: () => communicationsApi.getFollowUps()
  })
}

export function useCommunication(id) {
  return useQuery({
    queryKey: ['communications', id],
    queryFn: () => communicationsApi.getById(id),
    enabled: !!id
  })
}

export function useCreateCommunication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => communicationsApi.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['communications'] })
      queryClient.invalidateQueries({ queryKey: ['vendors'] })
    }
  })
}

export function useUpdateCommunication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => communicationsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['communications'] })
      queryClient.invalidateQueries({ queryKey: ['communications', id] })
      queryClient.invalidateQueries({ queryKey: ['vendors'] })
    }
  })
}

export function useCompleteFollowUp() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => communicationsApi.completeFollowUp(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communications'] })
    }
  })
}

export function useDeleteCommunication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => communicationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communications'] })
    }
  })
}
