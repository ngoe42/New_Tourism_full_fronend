import { useQuery } from '@tanstack/react-query'
import { settingsApi } from '../api/settings'

export function useSiteSettings() {
  const { data } = useQuery({
    queryKey: ['site-settings'],
    queryFn: settingsApi.get,
    staleTime: 0,
  })
  return {
    showPrices: data?.show_prices ?? false,
    heroVideoUrl: data?.hero_video_url ?? null,
    settings: data,
  }
}
