import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { subOutsApi } from '../services/api'

export function useSubOuts(params = {}) {
  return useQuery({
    queryKey: ['subouts', params],
    queryFn: () => subOutsApi.getAll(params)
  })
}

export function useGroupedSubOuts() {
  return useQuery({
    queryKey: ['subouts', 'grouped'],
    queryFn: () => subOutsApi.getGrouped()
  })
}

export function useSubOut(id) {
  return useQuery({
    queryKey: ['subouts', id],
    queryFn: () => subOutsApi.getById(id),
    enabled: !!id
  })
}

export function useCreateSubOut() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => subOutsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subouts'] })
    }
  })
}

export function useUpdateSubOut() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => subOutsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['subouts'] })
      queryClient.invalidateQueries({ queryKey: ['subouts', id] })
    }
  })
}

export function useDeleteSubOut() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => subOutsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subouts'] })
    }
  })
}

export function useUpdateStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }) => subOutsApi.updateStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['subouts'] })
      queryClient.invalidateQueries({ queryKey: ['subouts', id] })
    }
  })
}

export function useIncrementLoadsOut() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => subOutsApi.incrementLoadsOut(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['subouts'] })
      queryClient.invalidateQueries({ queryKey: ['subouts', id] })
    }
  })
}

export function useIncrementLoadsIn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => subOutsApi.incrementLoadsIn(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['subouts'] })
      queryClient.invalidateQueries({ queryKey: ['subouts', id] })
    }
  })
}
