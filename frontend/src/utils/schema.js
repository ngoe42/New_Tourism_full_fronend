/**
 * Schema.org JSON-LD builders. Every value here is real, verifiable business
 * information (name, contact details, confirmed social profiles) — nothing
 * is invented (no fabricated ratings, reviews, prices, or unlinked profiles).
 */

export const SITE_URL = 'https://nelsontoursandsafaris.com'
export const SITE_LOGO = `${SITE_URL}/images/logo/logo.png`
export const ORG_NAME = 'Nelson Tours and Safaris'
export const ORG_PHONE = '+255750005973'
export const ORG_EMAIL = 'hello@nelsontoursandsafari.com'

// Only confirmed, working profile links — no placeholder "#" hrefs.
export const ORG_SAME_AS = [
  'https://www.instagram.com/nelson_tour_and_safari',
  'https://www.facebook.com/nelson.michael.39',
]

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    '@id': `${SITE_URL}/#organization`,
    name: ORG_NAME,
    url: SITE_URL,
    logo: SITE_LOGO,
    image: SITE_LOGO,
    description: 'Tanzanian-owned, Arusha-based safari and Kilimanjaro trekking operator offering luxury wildlife safaris, mountain expeditions, and tailor-made Tanzania travel experiences.',
    telephone: ORG_PHONE,
    email: ORG_EMAIL,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Sokoine Road',
      addressLocality: 'Arusha',
      addressCountry: 'TZ',
    },
    areaServed: 'Tanzania',
    sameAs: ORG_SAME_AS,
  }
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: ORG_NAME,
    publisher: { '@id': `${SITE_URL}/#organization` },
  }
}

/**
 * items: [{ name, path }] — path is site-relative ("/", "/tours", "/tours/slug").
 * The last item is treated as the current page (no link, per BreadcrumbList convention).
 */
export function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path === '/' ? '' : item.path}`,
    })),
  }
}

export function touristTripSchema({ name, description, image, url, duration, price, location }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name,
    description,
    url,
    touristType: 'Leisure',
    provider: { '@id': `${SITE_URL}/#organization` },
  }
  if (image) schema.image = image
  if (location) {
    schema.itinerary = { '@type': 'Place', name: location }
  }
  if (duration) schema.duration = duration
  if (price) {
    schema.offers = {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: String(price),
      url,
      availability: 'https://schema.org/InStock',
    }
  }
  return schema
}

export function faqSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
}
