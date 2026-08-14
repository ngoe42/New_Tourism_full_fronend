import { Helmet } from 'react-helmet-async'
import { organizationSchema, websiteSchema } from '../utils/schema'

/**
 * Sitewide Organization + WebSite structured data. Mounted once per page
 * (from PublicLayout) so every public page — regardless of whether it
 * defines its own page-specific schema — identifies the business to
 * Google consistently.
 */
export default function SiteSchema() {
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(organizationSchema())}</script>
      <script type="application/ld+json">{JSON.stringify(websiteSchema())}</script>
    </Helmet>
  )
}
