# 🏠 SPEEDHOME Price Intelligence

A web application that automatically collects and analyzes property rental data from **SPEEDHOME.com** (Malaysia's managed rental platform). Built as a Vibe Coding Test for Jendela360.

## ✨ Features

- **🔍 Smart Search** — Search by area name or paste a SPEEDHOME URL directly. Autocomplete suggestions for 16+ Malaysian cities.
- **📊 Price Summary** — Instant market analysis including Average, Median, Mode, and Fair Price calculations per area.
- **📋 Unit Listings** — Complete property table with bedroom type, size, furnishing status, and direct links to SPEEDHOME listings.
- **📈 Market Trends** — Bar chart (average rent by unit type) and Pie chart (unit type distribution) for visual comparison.
- **🎛️ Filter & Sort** — Interactive filters by bedroom type, furnishing status, and price sorting (ascending/descending).
- **📄 Pagination** — Browse listings with configurable items per page (8, 16, or 32).
- **📥 Export Data** — Download results as Excel (.xlsx), CSV, or JSON files with area name and date in filename.
- **📱 Responsive Design** — Fully mobile-friendly with horizontal scroll for tables.
- **🔌 Smart Data Source** — Tries real-time scraping first; falls back to cached data when scraping is unavailable (e.g., on serverless platforms).

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Next.js 14** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first styling |
| **Puppeteer** | Browser automation for web scraping |
| **Cheerio** | HTML parsing and data extraction |
| **Recharts** | Chart visualizations (Bar + Pie) |
| **xlsx** | Excel file generation |
| **Axios** | HTTP request handling |
| **Vercel** | Deployment platform |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/rizkihw21/Price-Intelligence.git
cd Price-Intelligence

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## 🌐 Deployment

The app is deployed on **Vercel** with automatic deployments from the `main` branch.

**Note:** Vercel serverless functions have a 10-second timeout, so **Puppeteer-based scraping will not work** in production. The app automatically falls back to pre-scraped cached data for all 16 Malaysian cities. This behavior is explicitly accepted in the assessment guidelines.

## 📁 Project Structure

```
app/
├── api/scrape/route.ts   # API endpoint with real scraping + cached fallback
├── components/
│   ├── SearchBar.tsx       # Search input with autocomplete & URL detection
│   ├── PriceSummaryCard.tsx # Market summary statistics cards
│   ├── PriceChart.tsx      # Bar chart + Pie chart visualizations
│   ├── PropertyTable.tsx   # Unit listings with pagination & filters
│   └── LoadingSkeleton.tsx # Loading state animation
├── lib/
│   ├── scraper.ts          # Puppeteer + Cheerio scraping logic
│   ├── statistics.ts       # Average, Median, Mode, Fair Price calculations
│   ├── export.ts           # CSV, JSON, Excel export functions
│   └── mockData.ts         # Legacy mock data
├── page.tsx               # Main application page
└── layout.tsx             # Root layout
public/
└── cached-properties.json  # Pre-scraped data for production fallback
```

## 📊 Data Coverage

The application supports **16 Malaysian cities** where SPEEDHOME operates:

| Area | Listings | Area | Listings |
|------|----------|------|----------|
| Mont Kiara | 8 | Bangsar | 5 |
| Damansara | 4 | Kuala Lumpur | 5 |
| Petaling Jaya | 5 | Cyberjaya | 4 |
| Subang Jaya | 4 | Puchong | 4 |
| Shah Alam | 4 | Cheras | 4 |
| Ampang | 4 | KLCC | 4 |
| Johor Bahru | 4 | Penang | 4 |
| Setapak | 3 | Sentul | 3 |

## 💡 How It Works

### Data Flow
1. **User searches** for an area or pastes a SPEEDHOME URL
2. **Frontend** sends request to `/api/scrape?query=mont-kiara`
3. **API Route** attempts real-time scraping via Puppeteer
4. **Fallback** — If scraping fails (production), cached data is served

### Rental Types
| Type | Availability | Notes |
|------|-------------|-------|
| **Daily** | ❌ Not Available | SPEEDHOME primarily lists monthly rentals |
| **Monthly** | ✅ Available | Main focus, always included |
| **Yearly** | ✅ Available | Calculated from monthly price × 12 |

## 📝 Assessment Details

- **Project:** Vibe Coding Test — Jendela360
- **Deadline:** 7 days from assessment sent date
- **Tech Stack:** Open (Next.js chosen)
- **Tools Used:** Claude AI (Claude Code) for development, Puppeteer for scraping

## 📄 License

This project was created as part of a coding assessment.
