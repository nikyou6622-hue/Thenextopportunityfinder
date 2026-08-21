# 18 — SEO, METADATA & DISCOVERABILITY AUDIT
**Audited File**: `web/index.html`  
**Standard**: Google Search Central & Open Graph Protocol 2026 Guidelines  
**Current Discoverability Score**: **92 / 100**

---

## 1. Meta Tag & Discoverability Matrix

| Metadata Property | Configured Value in `index.html` | Purpose & Verification |
| :--- | :--- | :--- |
| `<title>` | `Thenextopportunity — Find Your Next Step \| The AI Career Operating System` | Displays in browser tab and search results. |
| `<meta name="description">` | High-converting 160-character description covering ATS scoring, verified Indian & global jobs, mock interviews. | Search engine snippet generation. |
| `<meta name="keywords">` | `Thenextopportunity, AI Resume Builder, ATS Score Checker, Tech Jobs India, SDE Internships, Remote Developer Jobs, Mock Interview AI` | Targeted keyword indexing. |
| `<meta name="theme-color">` | `#080b14` | Matches browser mobile address bar to dark mode obsidian theme. |
| `og:type`, `og:url` | `website`, `https://thenextopportunity.io/` | Facebook / LinkedIn social rich link preview. |
| `og:title`, `og:description`| Comprehensive social preview headline & value proposition. | Social cards presentation. |
| `og:image` | `/thumbnails/fullstack_track_thumb.png` (or `/logo.png`) | High-resolution social media thumbnail preview. |
| `twitter:card` | `summary_large_image` | Twitter / X expanded card format. |
| Fonts Preconnect | `https://fonts.googleapis.com`, `https://fonts.gstatic.com` | Eliminates font loading latency and layout shift (CLS). |

---

## 2. SEO Best Practices & Enhancement Recommendations

1. **JSON-LD Structured Data**: Add Schema.org `SoftwareApplication` and `WebApplication` JSON-LD structured markup to `index.html`:
   ```html
   <script type="application/ld+json">
   {
     "@context": "https://schema.org",
     "@type": "WebApplication",
     "name": "Thenextopportunity",
     "url": "https://thenextopportunity.io",
     "applicationCategory": "BusinessApplication",
     "operatingSystem": "All",
     "offers": {
       "@type": "Offer",
       "price": "0",
       "priceCurrency": "USD"
     },
     "description": "End-to-end AI career accelerator, 5-pillar ATS resume studio, verified job discovery in ₹, 1-click tailored CVs, and AI voice mock interviews."
   }
   </script>
   ```
2. **Sitemap & Robots.txt**: Create `web/public/robots.txt` and `web/public/sitemap.xml` listing public marketing routes (`/`, `/jobs`, `/internships`, `/templates`) for search engine crawling.
