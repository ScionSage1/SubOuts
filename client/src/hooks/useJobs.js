import { useQuery } from '@tanstack/react-query'
import { jobsApi } from '../services/api'

export function useJobs() {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobsApi.getAll()
  })
}

export function useJob(jobCode) {
  return useQuery({
    queryKey: ['jobs', jobCode],
    queryFn: () => jobsApi.getByCode(jobCode),
    enabled: !!jobCode
  })
}

export function useJobSubOuts(jobCode) {
  return useQuery({
    queryKey: ['jobs', jobCode, 'subouts'],
    queryFn: () => jobsApi.getSubOuts(jobCode),
    enabled: !!jobCode
  })
}
