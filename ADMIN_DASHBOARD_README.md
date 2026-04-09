# Admin Dashboard Documentation

## Overview

The Admin Dashboard is a secure inventory management system for the Spiritual Store. Only users with Clerk private metadata `role: "admin"` can access it. Admins can view, create, edit, delete products and manage stock quantities.

## Features

### ✅ Product Management
- **View All Products**: Browse complete inventory with search, sort, and pagination
- **Create Products**: Add new products with title, description, price, stock, and attributes
- **Edit Products**: Update existing product details and inventory information
- **Delete Products**: Remove products from the catalog with confirmation
- **Stock Management**: Adjust product stock quantities (add, subtract, set)

### ✅ Security
- Role-based access control via Clerk private metadata
- Admin-only routes protected at middleware level
- API endpoints require admin authentication
- Non-admin users are redirected to home page

## Access & Setup

### To Grant Admin Access

1. Go to Clerk Dashboard (https://dashboard.clerk.com)
2. Navigate to Users section
3. Select a user to make admin
4. Click on "Edit" in the "Private Metadata" section
5. Add the following JSON:
   ```json
   {
     "role": "admin"
   }
   ```
6. Save changes

Now this user can access `/admin` routes.

## Routes & Pages

### Admin Pages
- `/admin` - Main dashboard with quick stats and actions
- `/admin/products` - Product listing with search and filter
- `/admin/products/new` - Create new product form
- `/admin/products/[id]/edit` - Edit existing product

### API Endpoints

All endpoints require admin role verification.

#### Products Listing
```
GET /api/admin/products
Response: [ { id, title, price, stock, productType, ... } ]
```

#### Get Product Details
```
GET /api/admin/products/[id]
Response: { id, title, description, price, stock, ... }
```

#### Create Product
```
POST /api/admin/products
Body: {
  title: string (required),
  description: string,
  price: string (required),
  originalPrice: string,
  stock: number,
  productType: "product" | "service",
  isLabCertified: boolean
}
Response: { id, title, price, stock, ... }
```

#### Update Product
```
PUT /api/admin/products/[id]
Body: { title, description, price, originalPrice, stock, productType, isLabCertified }
Response: { id, title, ... }
```

#### Delete Product
```
DELETE /api/admin/products/[id]
Response: { success: true, message: "Product deleted successfully" }
```

#### Adjust Stock
```
PATCH /api/admin/products/[id]/stock
Body: {
  action: "add" | "subtract" | "set",
  quantity: number
}
Response: { 
  success: true, 
  productId, 
  previousStock, 
  newStock, 
  action 
}
```

## UI Components

### AdminLayout (`/src/components/admin/admin-layout.tsx`)
- Responsive sidebar navigation
- Dark theme with Tailwind CSS
- Quick links to main admin features
- Sign out button

### DataTable (`/src/components/admin/data-table.tsx`)
- Searchable data table using TanStack React Table
- Sortable columns
- Pagination controls
- Customizable columns and row click handlers

### Product Forms
- Form validation for required fields
- Price and stock input fields
- Product type selector (Physical/Service)
- Lab certification checkbox
- Cancel and save/create buttons

## Authentication & Security

### Admin Auth Utility (`/src/lib/admin-auth.ts`)

Three main functions:

1. **isUserAdmin()** - Check if current user is admin
   ```typescript
   const isAdmin = await isUserAdmin();
   ```

2. **protectAdminRoute()** - Middleware for API routes
   ```typescript
   const error = await protectAdminRoute();
   if (error) return error; // User not admin, return error response
   ```

3. **getAdminMetadata()** - Get admin metadata from session
   ```typescript
   const metadata = await getAdminMetadata();
   ```

### Middleware Protection (`/src/middleware.ts`)
- Public routes: `/`, `/shop`, `/product`, `/services`, `/rashi`, `/api`, `/sign-in`, `/sign-up`
- Protected by auth: `/cart`, `/checkout`, `/orders`, `/wishlist`
- Admin-only: `/admin/**` - Requires `role: "admin"` in private metadata

## Dependencies

New packages added:
- `@tanstack/react-table` - Advanced table component library
- `lucide-react` - Icon library

## Development

### Running Locally
```bash
cd frontend
npm run dev
```

Navigate to `http://localhost:3000/admin` to access the dashboard.

### Building
```bash
npm run build
```

### Environment Variables
Ensure these are set in `.env.local`:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `DATABASE_URL`

## Error Handling

### 403 Forbidden
User is authenticated but doesn't have admin role. They are redirected to home page.

### 401 Unauthorized
User is not authenticated. Redirected to sign-in page with return URL.

### 400 Bad Request
Missing required fields (title, price) or invalid request body.

### 404 Not Found
Product doesn't exist (for GET, PUT, DELETE operations).

### 500 Internal Server Error
Database or server error. Check server logs for details.

## Future Enhancements

- [ ] Bulk stock updates
- [ ] Product image management
- [ ] Category management
- [ ] Inventory audit logs
- [ ] Low stock alerts and reports
- [ ] Product visibility toggle
- [ ] Discount management
- [ ] Analytics dashboard with sales charts

## Testing

To test admin access control:

1. Create a test user WITHOUT admin role - `/admin` should redirect to home
2. Create a test user WITH admin role - `/admin` should be accessible
3. Test API endpoints with both users - Non-admin should get 403

## Support

For issues or questions:
1. Check the middleware.ts for auth logic
2. Verify Clerk metadata is set correctly
3. Check browser console for client-side errors
4. Check server logs for API errors
