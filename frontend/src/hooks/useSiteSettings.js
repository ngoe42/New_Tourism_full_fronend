import { useQuery } from '@tanstack/react-query'
import { settingsApi } from '../api/settings'

export function useSiteSettings() {
  const { data } = useQuery({
    queryKey: ['site-settings'],
    queryFn: settingsApi.get,
    staleTime: 5 * 60 * 1000,
  })
  return {
    showPrices: data?.show_prices ?? false,
    settings: data,
  }
}
