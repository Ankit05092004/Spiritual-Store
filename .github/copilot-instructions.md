# Copilot Instructions - Spiritual Store

## Project Overview

This is a Next.js e-commerce application for spiritual products (gemstones, crystals, etc.) and astrology services. The application includes:

- **E-commerce functionality**: Products, cart, checkout, orders
- **Astrology services**: Personalized Kundali reports with PDF generation
- **Authentication**: Clerk-based user authentication
- **Payment processing**: Cashfree integration (previously Razorpay)
- **Database**: PostgreSQL via Neon with Drizzle ORM
- **Security**: Arcjet for payment route protection, Sentry for monitoring

## Development Commands

All commands run from the `frontend/` directory:

```bash
# Development
npm run dev              # Start dev server on localhost:3000

# Building & Production
npm run build            # Build for production
npm start                # Start production server

# Database
npm run db:generate      # Generate Drizzle migrations from schema
npm run db:push          # Push schema changes to database
npm run db:migrate       # Run migrations
npm run db:seed          # Seed database with sample data
npm run db:studio        # Open Drizzle Studio (DB GUI)

# Code Quality
npm run lint             # Run ESLint
```

## Architecture

### Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js App Router pages and API routes
│   │   ├── api/          # 21 API route handlers
│   │   ├── shop/         # Product listing pages
│   │   ├── product/      # Product detail pages
│   │   ├── cart/         # Shopping cart
│   │   ├── checkout/     # Checkout flow
│   │   ├── orders/       # Order history
│   │   ├── rashi/        # Astrology reports UI
│   │   └── services/     # Service listings
│   ├── components/       # Reusable React components
│   │   ├── ui/           # shadcn/ui components
│   │   └── sections/     # Page sections (hero, features, etc.)
│   ├── db/               # Database layer
│   │   ├── schema.ts     # Drizzle schema definitions
│   │   ├── index.ts      # Database client export
│   │   └── seed*.ts      # Database seeding scripts
│   ├── lib/              # Utility libraries
│   │   ├── astrology-reports/  # Kundali generation engine
│   │   ├── stores/       # Zustand state stores
│   │   ├── arcjet.ts     # Security configurations
│   │   ├── cashfree*.ts  # Payment integration
│   │   └── utils.ts      # Shared utilities
│   └── middleware.ts     # Clerk auth middleware
└── drizzle/              # Generated migrations
```

### Database Architecture

- **ORM**: Drizzle ORM with Neon serverless Postgres
- **Schema location**: `src/db/schema.ts`
- **Import pattern**: Import `db` and tables from `@/db` (see conventions)
- **Key tables**:
  - `products` - Physical products and services (differentiated by `productType`)
  - `categories` - Product categorization
  - `cartItems` - User shopping carts (keyed by Clerk `userId`)
  - `orders` - Order records with payment gateway IDs
  - `payments` - Payment transaction tracking
  - `addresses` - User shipping addresses
  - `users` - User profiles (synced from Clerk)
  - `astrologyReports` - Generated Kundali reports
  - `wishlistItems` - User wishlists

### Authentication Flow

- **Provider**: Clerk
- **User IDs**: Stored as `text` fields (Clerk user IDs, not UUIDs)
- **Middleware**: `src/middleware.ts` protects non-public routes
- **Public routes**: `/`, `/shop`, `/product`, `/services`, `/rashi`, `/sign-in`, `/sign-up`, `/api`
- **Protected routes**: `/cart`, `/checkout`, `/orders`, `/wishlist` (auto-redirect to sign-in)

### Payment Flow

1. User initiates checkout via `/api/cashfree/create-order`
2. Cashfree order created, `cashfreeOrderId` stored in `orders` table
3. Frontend redirects to Cashfree payment page
4. After payment, Cashfree redirects to `/api/cashfree/verify-product` or `/api/cashfree/verify-report`
5. Verification endpoint confirms payment and updates order status

### Astrology Report Generation

Located in `src/lib/astrology-reports/`:

- **Entry point**: `report-generator.ts` - Orchestrates report creation
- **PDF generation**: `pdf-generator.ts` - Generates styled PDF using jsPDF
- **Business logic**: `blocks/` and `rules/` - Domain-specific calculations
- **Data flow**: User birth details → Normalization → Rule evaluation → PDF generation → Storage

## Key Conventions

### Import Paths

- **Use `@/` alias for all imports** from `src/`:
  ```typescript
  import { db, products, categories } from "@/db";
  import { paymentProtection } from "@/lib/arcjet";
  import { Button } from "@/components/ui/button";
  ```
- **Database imports**: Always import from `@/db` (exports both `db` client and all schema tables)
  ```typescript
  // ✅ Correct
  import { db, products, cartItems } from "@/db";
  
  // ❌ Avoid
  import { db } from "@/db";
  import { products } from "@/db/schema";
  ```

### Database Patterns

- **Primary keys**: Use `uuid().primaryKey().defaultRandom()` for all tables
- **User references**: Use `text("user_id")` for Clerk user IDs (not UUID foreign keys)
- **Timestamps**: Use `timestamp("created_at", { withTimezone: true }).defaultNow()`
- **Indexes**: Add indexes on foreign keys and frequently queried fields
- **Constraints**: Use Drizzle's `check()` for data validation (e.g., price >= 0)
- **Relations**: Define bidirectional relations for all foreign keys

### API Route Security

- **Arcjet protection**: Apply ONLY to sensitive routes (checkout, payment verification, admin)
  ```typescript
  import { paymentProtection } from "@/lib/arcjet";
  const decision = await paymentProtection.protect(request, { requested: 1 });
  if (decision.isDenied()) { /* handle */ }
  ```
- **Public routes**: Products, shop, services should NOT use Arcjet (for SEO and performance)
- **Authentication**: Use `auth()` from `@clerk/nextjs/server` in API routes
  ```typescript
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  ```

### Component Patterns

- **UI components**: Use shadcn/ui from `@/components/ui`
- **Styling**: Tailwind CSS with `cn()` utility from `@/lib/utils` for conditional classes
- **State management**: Zustand stores in `@/lib/stores` (cart, wishlist)
- **Client components**: Mark with `"use client"` when using hooks or browser APIs

### Environment Variables

Required variables (see `env.example`):

- `DATABASE_URL` - Neon Postgres connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` - Clerk auth
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (legacy, being replaced by Cashfree)
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase (if used)
- `ARCJET_KEY` - Security protection (optional, defaults to DRY_RUN in dev)
- `SENTRY_DSN` - Error monitoring (optional)

### TypeScript Configuration

- **Strict mode enabled**: All code must satisfy strict TypeScript checks
- **Path alias**: `@/*` maps to `./src/*`
- **Target**: ES2017
- **JSX**: react-jsx (React 19)

## Testing

Currently, no test suite is configured. If adding tests:

- Consider Playwright for E2E tests (payment flows, checkout)
- Consider Vitest or Jest for unit tests (astrology calculations, utilities)

## Common Tasks

### Adding a New Product Field

1. Update `products` table in `src/db/schema.ts`
2. Run `npm run db:generate` to create migration
3. Run `npm run db:push` to apply to database
4. Update TypeScript types (auto-inferred from schema)
5. Update relevant API routes and components

### Creating a New API Route

1. Create `route.ts` in `src/app/api/[path]/`
2. Export `GET`, `POST`, `PUT`, `DELETE` as needed
3. Use `auth()` for protected routes
4. Apply Arcjet protection if handling sensitive data
5. Import database tables from `@/db`

### Adding a New Zustand Store

1. Create store in `src/lib/stores/[name]-store.ts`
2. Follow pattern from existing stores (cart-store.ts, wishlist-store.ts)
3. Export typed hooks (`useStore`, etc.)
4. Use in client components with `"use client"`

### Modifying Astrology Report Logic

1. Navigate to `src/lib/astrology-reports/`
2. Business rules are in `blocks/` and `rules/` directories
3. Update `report-generator.ts` for orchestration changes
4. Test with `npm run db:seed` to generate sample reports
5. PDF styling is in `pdf-generator.ts`
