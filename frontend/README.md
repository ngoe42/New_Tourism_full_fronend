# 🦁 Karibu Safari — Luxury Tanzania Travel Website

A world-class luxury safari travel website built with React.js (Vite), TailwindCSS, Framer Motion, GSAP, and Swiper.js. Designed for a Tanzania-based safari company with a cinematic, conversion-focused experience.

---

## 🌍 Live Preview

> Run locally with `npm run dev` — opens at `http://localhost:5173`

---

## ✨ Features

- **Fullscreen hero** with GSAP parallax zoom + Framer Motion fade-up animations
- **Sticky navbar** — transparent on hero, solid on scroll, mobile hamburger menu
- **Tour listings** with live search, category filter, and price/rating sort
- **Tour detail page** — image gallery with thumbnails, accordion itinerary, sticky booking card
- **Booking form** with date picker, guest selector, price estimate & success state
- **Testimonials slider** via Swiper.js (autoplay, pagination)
- **Animated stat counters** (react-countup, viewport-triggered)
- **Parallax image breaks** between sections (GSAP scroll-driven)
- **Story sections** with alternating image/text layout
- **Why Choose Us** grid with staggered Framer Motion reveal
- **Contact page** with FAQ accordion and response promise card
- **Footer** with newsletter subscribe, social links, multi-column nav
- **All images stored locally** in `public/images/` — no external CDN dependency

---

## 🧱 Tech Stack

| Tool | Purpose |
|------|---------|
| React 18 + Vite | Framework & bundler |
| TailwindCSS 3 | Utility-first styling |
| Framer Motion | Scroll animations, page transitions |
| GSAP | Parallax scrolling effects |
| Swiper.js | Touch-friendly image/testimonial sliders |
| React Router v6 | Multi-page routing |
| Lucide React | Icon library |
| react-countup | Animated number counters |
| react-intersection-observer | Viewport detection for animations |

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Primary green | `#0f3d2e` |
| Gold accent | `#c9a96e` |
| Background beige | `#faf8f3` |
| Heading font | Playfair Display (serif) |
| Body font | Inter (sans-serif) |

---

## 📁 Project Structure

```
karibu-safari/
├── public/
│   └── images/
│       ├── hero-bg.jpg
│       ├── cta-bg.jpg
│       ├── tours/          # Tour card thumbnails
│       ├── sections/       # Parallax & story section images
│       ├── gallery/        # Tour detail gallery images
│       └── avatars/        # Testimonial author photos
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Hero.jsx
│   │   ├── TrustStrip.jsx
│   │   ├── TourCard.jsx
│   │   ├── FeaturedTours.jsx
│   │   ├── StorySection.jsx
│   │   ├── ParallaxBreak.jsx
│   │   ├── WhyChooseUs.jsx
│   │   ├── Testimonials.jsx
│   │   ├── StatsSection.jsx
│   │   ├── CTASection.jsx
│   │   ├── BookingForm.jsx
│   │   └── Footer.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Tours.jsx
│   │   ├── TourDetail.jsx
│   │   └── Contact.jsx
│   ├── data/
│   │   └── tours.js        # All tour, testimonial & stats data
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/karibu-safari.git
cd karibu-safari

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📄 Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage — hero, tours, story, testimonials, stats, CTA |
| `/tours` | All tours with filter, search & sort |
| `/tours/:id` | Tour detail — gallery, itinerary, booking form |
| `/contact` | Contact form, FAQ, office info |

---

## 🖼️ Adding or Replacing Images

All images live in `public/images/`. To replace any image, simply overwrite the file with the same name — no code changes needed.

| Folder | Contents |
|--------|----------|
| `public/images/` | `hero-bg.jpg`, `cta-bg.jpg` |
| `public/images/tours/` | One thumbnail per tour |
| `public/images/sections/` | Story & parallax background images |
| `public/images/gallery/` | Tour detail gallery photos |
| `public/images/avatars/` | Testimonial author avatars |

---

## 📦 Adding a New Tour

Edit `src/data/tours.js` — add a new object to the `tours` array following the existing structure. The tour will automatically appear on the Tours page and be linkable via `/tours/your-tour-id`.

---

## 📝 License

MIT — free to use and modify for commercial projects.
