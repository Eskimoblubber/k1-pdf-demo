# I-129F Interview App

A TurboTax-style interview UI for USCIS Form I-129F (Part 1, Items 1-5).

## Features

- Step-by-step interview flow
- Conditional navigation based on answers
- Input validation (A-Number, USCIS Account, SSN)
- PDF generation using pdf-lib
- Role labels (Petitioner/Beneficiary)
- Mobile responsive

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## Deploy to Vercel

1. Push to GitHub
2. Import to Vercel
3. Deploy (no environment variables needed)

Or use Vercel CLI:

```bash
npm i -g vercel
vercel
```

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with fonts
│   ├── page.tsx            # Main interview UI (React)
│   └── api/
│       └── generate-pdf/
│           └── route.ts    # PDF generation endpoint
├── package.json
├── tsconfig.json
└── next.config.js
```

## API Endpoint

**POST /api/generate-pdf**

Request body:
```json
{
  "Part1.Item1.ANumber": "A123456789",
  "Part1.Item2.USCISAccount": "123456789012",
  "Part1.Item3.SSN": "123-45-6789",
  "Part1.Item4a.K1": true,
  "Part1.Item4b.K3": false,
  "Part1.Item5.I130Filed": null
}
```

Response: PDF file download

## Tech Stack

- Next.js 14 (App Router)
- React 18
- TypeScript
- pdf-lib (PDF generation)
