import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { vendorsApi } from '../services/api'

export function useVendors(params = {}) {
  return useQuery({
    queryKey: ['vendors', params],
    queryFn: () => vendorsApi.getAll(params)
  })
}

export function useVendor(id) {
  return useQuery({
    queryKey: ['vendors', id],
    queryFn: () => vendorsApi.getById(id),
    enabled: !!id
  })
}

export function useCreateVendor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => vendorsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] })
    }
  })
}

export function useUpdateVendor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => vendorsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] })
      queryClient.invalidateQueries({ queryKey: ['vendors', id] })
    }
  })
}

export function useDeleteVendor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => vendorsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] })
    }
  })
}
