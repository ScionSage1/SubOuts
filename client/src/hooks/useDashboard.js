import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../services/api'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardApi.getStats()
  })
}

export function useActionItems() {
  return useQuery({
    queryKey: ['dashboard', 'action-items'],
    queryFn: () => dashboardApi.getActionItems()
  })
}

export function useVendorSummary() {
  return useQuery({
    queryKey: ['dashboard', 'by-vendor'],
    queryFn: () => dashboardApi.getByVendor()
  })
}

export function useRecentActivity(limit = 10) {
  return useQuery({
    queryKey: ['dashboard', 'recent', limit],
    queryFn: () => dashboardApi.getRecent(limit)
  })
}
