# Yacht Salary Guide

Next.js app for comparing yacht crew salary benchmarks across roles, yacht sizes, and published salary guides.

## Runtime Data Source

The live app is Supabase-first:

- Primary source: `salary_benchmarks` in Supabase
- Runtime fetch path: [src/lib/supabase.ts](/Users/hugo-sss/yacht-salary-guide/src/lib/supabase.ts)
- Fallback source: [salary-data.json](/Users/hugo-sss/yacht-salary-guide/salary-data.json) if the live fetch fails

## Add More Salary Data

You now have a repeatable import path for adding new salary rows without editing app code.

### 1. Add Supabase credentials

Create `.env.local` in the project root with:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

If you want the app itself to read from a different public project in development, you can also add:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Create an import file

Copy the template:

`data/imports/salary-import.template.json`

Expected shape:

```json
[
  {
    "position": "Captain",
    "yachtSize": "100m+",
    "minSalary": 22000,
    "maxSalary": 32000,
    "currency": "EUR",
    "source": "Example Source (2026)",
    "department": "Deck"
  }
]
```

Allowed department values:

- `Deck`
- `Engineering`
- `Interior`
- `Culinary`

### 3. Dry-run the import

```bash
npm run supabase:upsert -- --file data/imports/my-new-source.json
```

This validates and dedupes the file but does not write to Supabase.

### 4. Write to Supabase

Append new rows:

```bash
npm run supabase:upsert -- --file data/imports/my-new-source.json --write
```

Replace all existing rows for the source(s) in that file, then insert the new ones:

```bash
npm run supabase:upsert -- --file data/imports/my-new-source.json --write --replace-source
```

`--replace-source` is the safest option when you are refreshing a whole source like `Dockwalk Salary Survey (2026)`.

## Other Data Scripts

Seed Supabase from the main bundled JSON:

```bash
npm run supabase:import
```

Transfer `salary_benchmarks` between two Supabase projects:

```bash
npm run supabase:transfer
```

## Development

```bash
npm install
npm run dev
```

## Verification

```bash
npm run lint
npm run build
```
