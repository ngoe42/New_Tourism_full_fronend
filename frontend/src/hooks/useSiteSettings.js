import { useQuery } from '@tanstack/react-query'
import { settingsApi } from '../api/settings'

export function useSiteSettings() {
  const { data } = useQuery({
    queryKey: ['site-settings'],
    queryFn: settingsApi.get,
    staleTime: 0,
  })
  return {
    showPrices:    data?.show_prices     ?? false,
    showBlog:      data?.show_blog       ?? true,
    heroVideoUrl:  data?.hero_video_url  ?? null,
    heroMode:      data?.hero_mode       ?? 'video',
    heroImages:    data?.hero_images     ?? [],
    storyImage1:      data?.story_image_1      ?? null,
    storyImage2:      data?.story_image_2      ?? null,
    ctaBgImage:       data?.cta_bg_image       ?? null,
    logoUrl:          data?.logo_url           ?? null,
    toursHeroLabel:       data?.tours_hero_label       ?? null,
    toursHeroTitle:       data?.tours_hero_title       ?? null,
    toursHeroDescription: data?.tours_hero_description ?? null,
    toursHeroImage:       data?.tours_hero_image       ?? null,
    routesHeroTitle:      data?.routes_hero_title      ?? null,
    routesHeroDescription:data?.routes_hero_description?? null,
    routesHeroImage:      data?.routes_hero_image      ?? null,
    aboutHeroImage:   data?.about_hero_image   ?? null,
    aboutTeam1Image:  data?.about_team_1_image ?? null,
    aboutTeam2Image:  data?.about_team_2_image ?? null,
    aboutTeam3Image:  data?.about_team_3_image ?? null,
    settings: data,
  }
}
