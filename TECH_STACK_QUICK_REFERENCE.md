# Spiritual Store - Technology Stack Quick Reference Guide

## 🎯 Overview
Comprehensive reference for all technologies, libraries, and services used in the Spiritual Store project.

---

## 📦 Frontend Technologies

### Core Framework
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 16.1.3 | React framework with SSR, SSG, API routes |
| **React** | 19.0.0 | UI library with hooks and components |
| **TypeScript** | Latest | Static type checking and IDE support |

### Styling & UI
| Technology | Purpose |
|-----------|---------|
| **Tailwind CSS** | Utility-first CSS framework |
| **Base UI** | Accessible component primitives |
| **Shadcn** | Pre-built component library |
| **Radix UI** | Low-level component library |
| **Hugeicons** | Icon library for UI elements |

### State Management
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Zustand** | 5.0.10 | Lightweight state management |

### Utilities & Enhancements
| Technology | Purpose |
|-----------|---------|
| **Next Themes** | Dark mode and theme switching |
| **Sonner** | Toast notifications |
| **Clsx** | Conditional className utilities |
| **Class Variance Authority** | Component variant management |
| **DOMPurify** | HTML sanitization and XSS prevention |

---

## 🔐 Authentication & Security

### Authentication
| Service | Version | Features |
|---------|---------|----------|
| **Clerk** | 6.36.7 | Email/password, OAuth, MFA, user management |

### API Security
| Service | Version | Features |
|---------|---------|----------|
| **Arcjet** | 1.0.0-beta.17 | Rate limiting, bot detection, DDoS protection |

### Error Tracking & Monitoring
| Service | Version | Features |
|---------|---------|----------|
| **Sentry** | 10.x | Error tracking, performance monitoring, release health |

---

## 💾 Database & Backend

### Database
| Service | Purpose |
|---------|---------|
| **Supabase PostgreSQL** | Managed PostgreSQL with real-time, RLS |
| **Neon PostgreSQL** | Serverless PostgreSQL alternative |

### ORM & Query Building
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Drizzle ORM** | 0.45.1 | Type-safe database queries |

### Connection Management
| Technology | Version | Purpose |
|-----------|---------|---------|
| **postgres-js** | 3.4.8 | Node.js PostgreSQL client |

---

## 💳 Payment Processing

### Payment Gateway
| Service | Version | Features |
|---------|---------|----------|
| **Razorpay** | 2.9.6 | Payment processing, webhooks, refunds |

**Supported Payment Methods:**
- Credit/Debit Cards
- UPI (Unified Payments Interface)
- Net Banking
- Digital Wallets
- EMI Options

---

## 📊 Analytics & Real-time Features

### Real-time Database
| Service | Features |
|---------|----------|
| **Supabase Real-time** | WebSocket subscriptions, presence, broadcasts |

### Vector Search
| Technology | Features |
|-----------|----------|
| **PostgreSQL pgvector** | Semantic search, embeddings |

---

## 🌐 Additional Services & Libraries

### Cloud Storage
| Service | Features |
|---------|----------|
| **Supabase Storage** | File storage, CDN, image optimization |

### Font Management
| Technology | Purpose |
|-----------|---------|
| **Google Fonts** | Manrope, Playfair Display, Inter fonts |

### Utility Libraries
| Library | Purpose |
|---------|---------|
| **Linkedom** | DOM manipulation and parsing |

---

## 🛠️ Development Tools

### Linting & Code Quality
| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting and style enforcement |
| **TypeScript** | Static type checking |

### Database Management
| Tool | Purpose |
|------|---------|
| **Drizzle Kit** | ORM CLI for migrations |

### Build & Optimization
| Tool | Purpose |
|------|---------|
| **Next.js Build System** | Compilation, optimization, bundling |
| **Tailwind CSS PostCSS** | CSS processing and compilation |

---

## 🏗️ Architecture Overview

### Request Flow
```
Browser/Client
    ↓ (HTTP/HTTPS)
Next.js Server (API Routes)
    ↓ (SQL Queries + Webhooks)
Database (PostgreSQL + Supabase)
```

### Security Layers
```
1. Network Layer (HTTPS/TLS) → Arcjet (Rate limiting, Bot detection)
2. Application Layer (Clerk) → Authentication & Authorization
3. Business Logic Layer → Input validation, Business rules
4. Data Layer (RLS) → Row-Level Security, Database constraints
5. Observability → Sentry (Monitoring & Alerts)
```

---

## 🔄 Integration Points

### Authentication Flow
- **Client**: Sign up/in via Clerk UI
- **Middleware**: Clerk middleware validates requests
- **API Routes**: Protected with `auth()` from Clerk
- **Database**: User data synced with Clerk

### Payment Flow
- **Client**: Razorpay modal for payment
- **Backend**: Create order and payment on server
- **Razorpay**: Process payment securely
- **Webhook**: Receive payment confirmation
- **Database**: Update order status
- **Notification**: Send confirmation email

### Error Monitoring Flow
- **Client/Server**: Error occurs
- **Sentry**: Captures error with context
- **Breadcrumbs**: Track user actions leading to error
- **Dashboard**: Alerts sent to team
- **Ticketing**: Auto-create tickets in Jira/Linear

---

## 📋 Environment Variables

### Database
```
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### Authentication
```
CLERK_SECRET_KEY=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

### Payment
```
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
NEXT_PUBLIC_RAZORPAY_KEY_ID=...
RAZORPAY_WEBHOOK_SECRET=...
```

### Security
```
ARCJET_KEY=...
```

### Monitoring
```
SENTRY_DSN=...
NEXT_PUBLIC_SENTRY_DSN=...
```

---

## 🚀 API Endpoints

### Products
- `GET /api/products` - List products
- `GET /api/products/[id]` - Product details
- `POST /api/products` - Create (admin only)

### Cart
- `GET /api/cart` - View cart
- `POST /api/cart` - Add to cart
- `DELETE /api/cart/[productId]` - Remove from cart

### Orders
- `POST /api/checkout` - Create order
- `GET /api/orders` - View user orders

### Payments
- `POST /api/checkout` - Initiate payment
- `POST /api/verify-payment` - Verify payment
- `POST /api/razorpay/webhook` - Razorpay webhook

### Additional Features
- `GET /api/astrology` - Astrology data
- `GET /api/reports` - Astrology reports
- `GET /api/wishlist` - Wishlist items
- `GET /api/location-search` - Location-based search

---

## 📊 Database Tables

| Table | Purpose |
|-------|---------|
| `users` | User accounts and profiles |
| `products` | Product catalog |
| `categories` | Product categories |
| `cart_items` | Shopping cart |
| `orders` | Customer orders |
| `order_items` | Items in orders |
| `reviews` | Product reviews |
| `wishlist_items` | Saved products |
| `astrology_reports` | Generated astrology data |
| `service_bookings` | Service reservations |

---

## 🔐 Security Features

### Authentication
- ✅ Clerk-managed authentication
- ✅ Social login support (Google, GitHub, etc.)
- ✅ Multi-factor authentication
- ✅ JWT token management
- ✅ Secure HTTP-only cookies

### API Security
- ✅ Arcjet rate limiting (per-IP, per-user)
- ✅ Bot detection and blocking
- ✅ DDoS protection
- ✅ CORS configuration
- ✅ Input validation and sanitization

### Database Security
- ✅ Row-Level Security (RLS) policies
- ✅ Connection encryption
- ✅ Automatic backups
- ✅ Access control lists

### Payment Security
- ✅ PCI DSS compliance (via Razorpay)
- ✅ HMAC-SHA256 webhook verification
- ✅ Tokenized payments
- ✅ No card data storage

---

## 📈 Performance Features

### Client-Side
- ✅ Image optimization (Next.js Image)
- ✅ Code splitting and lazy loading
- ✅ Server-side rendering (SSR)
- ✅ Static generation (SSG)
- ✅ Incremental Static Regeneration (ISR)

### Server-Side
- ✅ Connection pooling
- ✅ Query optimization
- ✅ Caching strategies
- ✅ Database indexing

### Monitoring
- ✅ Core Web Vitals tracking
- ✅ Performance metrics
- ✅ Error rate monitoring
- ✅ Transaction tracing

---

## 🧪 Testing & Quality

### Code Quality
- **ESLint**: Code linting
- **TypeScript**: Type checking
- **Drizzle Kit**: Schema validation

### Testing Tools Available
- Unit testing frameworks
- Integration testing
- E2E testing with Playwright

---

## 🚢 Deployment

### Hosting
- **Vercel**: Next.js deployment platform
- **Supabase**: PostgreSQL hosting
- **CDN**: Edge network for static assets

### CI/CD
- GitHub Actions recommended
- Automated testing
- Automated deployment
- Release tracking with Sentry

---

## 📚 Documentation & References

- **Next.js Docs**: https://nextjs.org/docs
- **React Docs**: https://react.dev
- **Clerk Docs**: https://clerk.com/docs
- **Razorpay Docs**: https://razorpay.com/docs
- **Drizzle Docs**: https://orm.drizzle.team
- **Sentry Docs**: https://docs.sentry.io
- **Arcjet Docs**: https://arcjet.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Tailwind Docs**: https://tailwindcss.com/docs

---

## 💡 Key Design Patterns

1. **API Routes Pattern**: Serverless functions for backend
2. **Component-based Architecture**: Reusable React components
3. **Type-safe Database**: Drizzle ORM with TypeScript
4. **Event-driven Payment**: Webhook-based payment processing
5. **Real-time Updates**: WebSocket subscriptions
6. **Error Boundary**: Centralized error handling
7. **Rate Limiting**: Protection against abuse

---

**Quick Reference Version**: 1.0
**Last Updated**: May 3, 2026
**Technologies Covered**: 35+
**Code Examples**: 20+
