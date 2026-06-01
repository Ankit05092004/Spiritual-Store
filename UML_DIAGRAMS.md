# Spiritual Store - UML & Component Diagrams

Comprehensive collection of UML and component diagrams for the Spiritual Store project architecture, design patterns, and system interactions.

---

## Table of Contents

1. [Use Case Diagram](#use-case-diagram)
2. [Component Diagram](#component-diagram)
3. [Class Diagram (Entity Model)](#class-diagram-entity-model)
4. [Sequence Diagrams](#sequence-diagrams)
   - [Checkout & Payment Flow](#checkout--payment-flow-sequence)
   - [Authentication Flow](#authentication-flow-sequence)
   - [Astrology Report Generation](#astrology-report-generation-sequence)
5. [State Diagrams](#state-diagrams)
   - [Order State Machine](#order-state-machine)
   - [Payment State Machine](#payment-state-machine)
6. [Activity Diagrams](#activity-diagrams)
   - [User Registration Flow](#user-registration-flow-activity)
   - [Product Purchase Workflow](#product-purchase-workflow-activity)
7. [Entity Relationship Diagram](#entity-relationship-diagram)
8. [System Architecture Diagram](#system-architecture-diagram)
9. [Deployment Diagram](#deployment-diagram)

---

## Use Case Diagram

Shows all actors (users/systems) and their interactions with the Spiritual Store platform.

```mermaid
flowchart TD
    Customer[👤 Customer/User]
    Admin[👨‍💼 Admin]
    PaymentGateway[💳 Razorpay]
    AuthService[🔐 Clerk Auth]
    EmailService[📧 Email Service]
    MonitoringService[📊 Sentry]

    Customer -->|Browse Products| UC1[Browse/Search Products]
    Customer -->|Authenticate| UC2[Sign Up / Sign In]
    Customer -->|Manage Items| UC3[Add to Wishlist]
    Customer -->|Shopping| UC4[Add to Cart]
    Customer -->|Purchase| UC5[Checkout]
    Customer -->|Payment| UC6[Make Payment]
    Customer -->|View History| UC7[View Orders]
    Customer -->|Explore Features| UC8[Generate Astrology Report]
    Customer -->|Discover Services| UC9[Browse Services]
    Customer -->|Track Status| UC10[Track Order Status]

    Admin -->|Manage Inventory| UA1[Manage Products]
    Admin -->|Monitor Sales| UA2[Monitor Orders]
    Admin -->|Manage Users| UA3[User Management]

    UC5 -->|Initiates| UC6
    UC6 -->|Requests| PaymentGateway
    PaymentGateway -->|Confirms| UC6
    UC6 -->|Logs| MonitoringService
    UC2 -->|Uses| AuthService
    UC5 -->|Sends| EmailService
```

### Use Case Details

| Use Case                  | Actor    | Description                                 |
| ------------------------- | -------- | ------------------------------------------- |
| Browse/Search Products    | Customer | Search, filter, and browse product catalog  |
| Sign Up / Sign In         | Customer | Register or authenticate via Clerk          |
| Add to Wishlist           | Customer | Save products for later viewing             |
| Add to Cart               | Customer | Select products and quantities for purchase |
| Checkout                  | Customer | Review cart, enter shipping, initiate order |
| Make Payment              | Customer | Process payment via Razorpay gateway        |
| View Orders               | Customer | Access order history and details            |
| Generate Astrology Report | Customer | Create personalized astrology insights      |
| Browse Services           | Customer | Discover consultation and service offerings |
| Track Order Status        | Customer | Monitor order fulfillment progress          |
| Manage Products           | Admin    | CRUD operations on product catalog          |
| Monitor Orders            | Admin    | View and manage customer orders             |
| User Management           | Admin    | Handle user accounts and permissions        |

---

## Component Diagram

Shows high-level system components and their dependencies.

```mermaid
graph TB
    subgraph "Client Layer"
        Browser["🌐 Web Browser<br/>React 19 UI"]
    end

    subgraph "Next.js Application Layer"
        Pages["📄 Pages & Routes<br/>App Router"]
        API["🔌 API Routes<br/>Backend Logic"]
        Middleware["🛡️ Middleware<br/>Auth & Security"]
    end

    subgraph "Business Logic & Services"
        ProductService["📦 Product Service"]
        OrderService["🛒 Order Service"]
        PaymentService["💳 Payment Service"]
        AstrologyService["✨ Astrology Service"]
        WishlistService["❤️ Wishlist Service"]
        UserService["👤 User Service"]
    end

    subgraph "Data Access Layer"
        ORM["🗄️ Drizzle ORM<br/>Data Mapper"]
        Queries["📝 Query Builder"]
    end

    subgraph "External Services"
        Clerk["🔐 Clerk<br/>Authentication"]
        Razorpay["💰 Razorpay<br/>Payments"]
        Sentry["📊 Sentry<br/>Monitoring"]
        Arcjet["🛡️ Arcjet<br/>Security"]
    end

    subgraph "Data Layer"
        Database["🐘 PostgreSQL<br/>Supabase/Neon"]
    end

    Browser -->|HTTP/HTTPS| Middleware
    Middleware -->|Routes| Pages
    Pages -->|Business Logic| API
    API -->|Uses| ProductService
    API -->|Uses| OrderService
    API -->|Uses| PaymentService
    API -->|Uses| AstrologyService
    API -->|Uses| WishlistService
    API -->|Uses| UserService

    ProductService -->|Query| ORM
    OrderService -->|Query| ORM
    PaymentService -->|Query| ORM
    AstrologyService -->|Query| ORM
    WishlistService -->|Query| ORM
    UserService -->|Query| ORM

    ORM -->|Execute| Queries
    Queries -->|SQL| Database

    API -->|Auth| Clerk
    API -->|Payment| Razorpay
    API -->|Logs| Sentry
    API -->|Security| Arcjet

    Middleware -->|Verify| Clerk
    Middleware -->|Rate Limit| Arcjet
```

### Component Responsibilities

| Component         | Responsibility                                           |
| ----------------- | -------------------------------------------------------- |
| Web Browser       | Renders React components, handles user interactions      |
| Pages & Routes    | Render server-side pages and client-side navigation      |
| API Routes        | Handle HTTP requests and business logic                  |
| Middleware        | Authentication verification, CORS, request preprocessing |
| Product Service   | Product catalog, search, filtering, inventory            |
| Order Service     | Order creation, management, status tracking              |
| Payment Service   | Payment processing, verification, webhook handling       |
| Astrology Service | Report generation, calculations, storage                 |
| Wishlist Service  | Add/remove items, retrieve user wishlist                 |
| User Service      | Profile management, preferences, authentication sync     |
| Drizzle ORM       | Type-safe database access and query building             |
| PostgreSQL        | Persistent data storage with full ACID support           |
| Clerk             | User authentication and session management               |
| Razorpay          | Payment processing and verification                      |
| Sentry            | Error tracking and performance monitoring                |
| Arcjet            | API rate limiting and bot detection                      |

---

## Class Diagram (Entity Model)

Shows data models and their relationships.

```mermaid
classDiagram
    class User {
        id: UUID
        clerkId: String
        email: String
        fullName: String
        avatar?: String
        createdAt: Timestamp
        updatedAt: Timestamp
        +getOrders()
        +getWishlist()
        +getProfile()
    }

    class Product {
        id: UUID
        title: String
        description: String
        category: String
        price: Decimal
        stock: Integer
        images: String[]
        createdAt: Timestamp
        updatedAt: Timestamp
        +getDetails()
        +checkAvailability()
        +updateStock()
    }

    class Cart {
        id: UUID
        userId: UUID
        items: CartItem[]
        totalPrice: Decimal
        createdAt: Timestamp
        updatedAt: Timestamp
        +addItem()
        +removeItem()
        +updateQuantity()
        +calculateTotal()
    }

    class CartItem {
        id: UUID
        cartId: UUID
        productId: UUID
        quantity: Integer
        price: Decimal
        +updateQuantity()
    }

    class Order {
        id: UUID
        userId: UUID
        status: OrderStatus
        totalAmount: Decimal
        shippingAddress: String
        items: OrderItem[]
        createdAt: Timestamp
        updatedAt: Timestamp
        +getItems()
        +updateStatus()
        +calculateTotal()
    }

    class OrderItem {
        id: UUID
        orderId: UUID
        productId: UUID
        quantity: Integer
        price: Decimal
    }

    class Payment {
        id: UUID
        orderId: UUID
        razorpayOrderId: String
        status: PaymentStatus
        amount: Decimal
        method: String
        createdAt: Timestamp
        updatedAt: Timestamp
        +verify()
        +capture()
        +refund()
    }

    class Wishlist {
        id: UUID
        userId: UUID
        productId: UUID
        addedAt: Timestamp
        +addProduct()
        +removeProduct()
    }

    class AstrologyReport {
        id: UUID
        userId: UUID
        birthDate: Date
        birthTime: Time
        birthLocation: String
        reportData: JSON
        generatedAt: Timestamp
        +generateReport()
        +getInsights()
    }

    User "1" --> "*" Order
    User "1" --> "1" Cart
    User "1" --> "*" Wishlist
    User "1" --> "*" AstrologyReport
    Cart "1" --> "*" CartItem
    CartItem "1" --> "1" Product
    Order "1" --> "*" OrderItem
    OrderItem "1" --> "1" Product
    Order "1" --> "1" Payment
    Wishlist "1" --> "1" Product

    OrderStatus: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED
    PaymentStatus: PENDING, AUTHORIZED, CAPTURED, FAILED, REFUNDED
```

### Entity Descriptions

- **User**: Represents a customer with authentication via Clerk
- **Product**: Represents items available for purchase
- **Cart**: Temporary shopping cart for a user session
- **CartItem**: Individual items in a cart with quantity
- **Order**: Finalized purchase with items and shipping information
- **OrderItem**: Line items in an order with pricing snapshot
- **Payment**: Payment transaction tracking and status
- **Wishlist**: User-saved products for future purchase
- **AstrologyReport**: Generated personalized astrology insights

---

## Sequence Diagrams

### Checkout & Payment Flow (Sequence)

Shows the detailed interaction sequence during checkout and payment.

```mermaid
sequenceDiagram
    participant User as 👤 User
    participant Browser as 🌐 Browser
    participant API as 🔌 API
    participant DB as 🐘 Database
    participant Razorpay as 💳 Razorpay
    participant Sentry as 📊 Sentry

    User->>Browser: Click Checkout
    Browser->>API: POST /api/checkout
    API->>API: Verify Auth (Clerk)
    API->>DB: Fetch Cart Items
    DB-->>API: Return Items
    API->>DB: Create Order (PENDING)
    DB-->>API: Order ID
    API->>Razorpay: Create Payment Order
    Razorpay-->>API: Razorpay Order ID
    API-->>Browser: Order & Payment Details
    Browser->>User: Show Razorpay Modal
    User->>Razorpay: Complete Payment
    Razorpay-->>Browser: Payment Success Callback
    Browser->>API: POST /api/verify-payment
    API->>API: Verify Signature (HMAC-SHA256)
    alt Payment Verified
        API->>DB: Update Order Status (PAID)
        API->>DB: Clear Cart
        API->>Sentry: Log Success
        API-->>Browser: Order Confirmation
        Browser-->>User: Show Order Success
    else Payment Failed
        API->>DB: Update Order Status (FAILED)
        API->>Sentry: Log Payment Error
        API-->>Browser: Error Response
        Browser-->>User: Show Error Message
    end
```

### Authentication Flow (Sequence)

Shows user authentication and session management.

```mermaid
sequenceDiagram
    participant User as 👤 User
    participant Browser as 🌐 Browser
    participant Clerk as 🔐 Clerk
    participant Middleware as 🛡️ Middleware
    participant API as 🔌 API
    participant DB as 🐘 Database

    User->>Browser: Click Sign In
    Browser->>Clerk: Redirect to Sign In
    Clerk-->>Browser: Sign In Form
    User->>Clerk: Enter Credentials
    Clerk->>Clerk: Validate & Create Session
    Clerk-->>Browser: JWT Token + Redirect
    Browser->>Middleware: Request with Token
    Middleware->>Clerk: Verify Token
    Clerk-->>Middleware: Valid Session
    Middleware->>API: Forward Request
    API->>DB: Sync User (if new)
    DB-->>API: User Record
    API-->>Middleware: Response
    Middleware-->>Browser: Authenticated Response
    Browser-->>User: Logged In
```

### Astrology Report Generation (Sequence)

Shows the flow of generating personalized astrology reports.

```mermaid
sequenceDiagram
    participant User as 👤 User
    participant Browser as 🌐 Browser
    participant API as 🔌 API
    participant Service as ✨ Astrology Service
    participant DB as 🐘 Database
    participant Cache as 💾 Cache

    User->>Browser: Submit Birth Details
    Browser->>API: POST /api/astrology/report
    API->>API: Validate Birth Data
    API->>Cache: Check Cache by Hash
    alt Cache Hit
        Cache-->>API: Cached Report
        API-->>Browser: Return Report
    else Cache Miss
        API->>Service: Generate Report
        Service->>Service: Calculate Planet Positions
        Service->>Service: Generate Interpretations
        Service-->>API: Report Data (JSON)
        API->>DB: Store Report
        DB-->>API: Report ID
        API->>Cache: Cache Report
        API-->>Browser: Return Report
    end
    Browser-->>User: Display Report
```

---

## State Diagrams

### Order State Machine

Shows all possible states and transitions for an order.

```mermaid
stateDiagram-v2
    [*] --> PENDING: Order Created

    PENDING --> PROCESSING: Payment Verified
    PENDING --> CANCELLED: User Cancels or Payment Fails
    PENDING --> FAILED: Checkout Error

    PROCESSING --> SHIPPED: Items Dispatched
    PROCESSING --> CANCELLED: Admin Cancels

    SHIPPED --> DELIVERED: Delivery Confirmed
    SHIPPED --> FAILED: Shipping Issue

    DELIVERED --> [*]: Order Complete

    CANCELLED --> [*]: Order Closed
    FAILED --> [*]: Order Closed

    note right of PENDING
        Waiting for payment
        verification
    end note

    note right of PROCESSING
        Payment confirmed
        preparing shipment
    end note

    note right of SHIPPED
        Package in transit
        to customer
    end note

    note right of DELIVERED
        Customer received
        order
    end note
```

### Payment State Machine

Shows all payment states and transitions.

```mermaid
stateDiagram-v2
    [*] --> PENDING: Payment Initiated

    PENDING --> AUTHORIZED: User Completes Payment
    PENDING --> FAILED: User Cancels or Timeout
    PENDING --> EXPIRED: 15min Timeout

    AUTHORIZED --> CAPTURED: Server Verification Success
    AUTHORIZED --> FAILED: Verification Failed

    CAPTURED --> REFUND_PENDING: User Requests Refund
    CAPTURED --> [*]: Payment Complete

    REFUND_PENDING --> REFUNDED: Refund Processed
    REFUND_PENDING --> FAILED: Refund Failed

    FAILED --> [*]: Payment Failed
    EXPIRED --> [*]: Payment Expired
    REFUNDED --> [*]: Refunded

    note right of PENDING
        Awaiting payment
        gateway response
    end note

    note right of AUTHORIZED
        Payment authorized
        awaiting capture
    end note

    note right of CAPTURED
        Payment captured
        successfully
    end note
```

---

## Activity Diagrams

### User Registration Flow (Activity)

Shows the step-by-step user registration process.

```mermaid
flowchart TD
    Start([User Initiates Sign Up]) --> OpenForm["Open Sign Up Form"]
    OpenForm --> EnterDetails["Enter Email & Password"]
    EnterDetails --> Validate{Valid Input?}

    Validate -->|No| ShowError["Show Validation Error"]
    ShowError --> EnterDetails

    Validate -->|Yes| ClerkSignUp["Send to Clerk"]
    ClerkSignUp --> VerifyEmail{Email Verified?}

    VerifyEmail -->|Pending| AwaitVerification["Await Email Verification"]
    AwaitVerification --> VerifyEmail

    VerifyEmail -->|Yes| CreateUser["Create User in Database"]
    CreateUser --> SyncProfile["Sync Clerk Profile"]
    SyncProfile --> GenerateToken["Generate Session Token"]
    GenerateToken --> Redirect["Redirect to Dashboard"]
    Redirect --> End([Registration Complete])

    style ClerkSignUp fill:#4a90e2
    style CreateUser fill:#50c878
    style Redirect fill:#50c878
```

### Product Purchase Workflow (Activity)

Shows the complete purchase workflow from browsing to order confirmation.

```mermaid
flowchart TD
    Start([User Starts Shopping]) --> Browse["Browse Products"]
    Browse --> Search{Found Product?}

    Search -->|No| Browse
    Search -->|Yes| ViewDetails["View Product Details"]
    ViewDetails --> Decision{Add to Cart?}

    Decision -->|No| Browse
    Decision -->|Yes| AddCart["Add to Cart"]
    AddCart --> ContinueShopping{Continue<br/>Shopping?}

    ContinueShopping -->|Yes| Browse
    ContinueShopping -->|No| ViewCart["View Cart"]
    ViewCart --> ReviewItems["Review Items & Quantities"]
    ReviewItems --> Proceed{Proceed to<br/>Checkout?}

    Proceed -->|No| EditCart["Edit Cart"]
    EditCart --> ReviewItems

    Proceed -->|Yes| Checkout["Enter Checkout"]
    Checkout --> VerifyAuth{Authenticated?}

    VerifyAuth -->|No| Login["Redirect to Login"]
    Login --> VerifyAuth

    VerifyAuth -->|Yes| ShippingInfo["Enter Shipping Address"]
    ShippingInfo --> ReviewOrder["Review Order Summary"]
    ReviewOrder --> Confirm{Confirm Order?}

    Confirm -->|No| EditCart
    Confirm -->|Yes| InitPayment["Initiate Payment"]
    InitPayment --> PaymentModal["Open Razorpay Modal"]
    PaymentModal --> CompletePayment["User Completes Payment"]
    CompletePayment --> VerifyPayment{Payment<br/>Verified?}

    VerifyPayment -->|No| PaymentError["Show Payment Error"]
    PaymentError --> RetryPayment{Retry?}
    RetryPayment -->|Yes| InitPayment
    RetryPayment -->|No| CancelOrder["Cancel Order"]

    VerifyPayment -->|Yes| CreateOrder["Create Order Record"]
    CreateOrder --> ClearCart["Clear Shopping Cart"]
    ClearCart --> SendConfirmation["Send Confirmation Email"]
    SendConfirmation --> ShowSuccess["Show Order Success Page"]
    ShowSuccess --> End([Purchase Complete])

    CancelOrder --> End

    style InitPayment fill:#ffa500
    style CreateOrder fill:#50c878
    style ShowSuccess fill:#50c878
```

---

## Entity Relationship Diagram

Shows database table relationships and constraints.

```mermaid
erDiagram
    USER ||--o{ ORDER : places
    USER ||--o{ CART : has
    USER ||--o{ WISHLIST : manages
    USER ||--o{ ASTROLOGY_REPORT : generates

    CART ||--|{ CART_ITEM : contains
    CART_ITEM }o--|| PRODUCT : references

    ORDER ||--|{ ORDER_ITEM : contains
    ORDER_ITEM }o--|| PRODUCT : references
    ORDER ||--|| PAYMENT : processed_by

    PRODUCT ||--o{ CART_ITEM : added_in
    PRODUCT ||--o{ ORDER_ITEM : purchased_as
    PRODUCT ||--o{ WISHLIST : saved_in

    WISHLIST }o--|| PRODUCT : contains

    USER {
        uuid id PK
        string clerk_id UK
        string email UK
        string full_name
        string avatar
        timestamp created_at
        timestamp updated_at
    }

    PRODUCT {
        uuid id PK
        string title
        text description
        string category
        decimal price
        integer stock
        json images
        timestamp created_at
        timestamp updated_at
    }

    CART {
        uuid id PK
        uuid user_id FK
        timestamp created_at
        timestamp updated_at
    }

    CART_ITEM {
        uuid id PK
        uuid cart_id FK
        uuid product_id FK
        integer quantity
        decimal price
    }

    ORDER {
        uuid id PK
        uuid user_id FK
        string status
        decimal total_amount
        text shipping_address
        timestamp created_at
        timestamp updated_at
    }

    ORDER_ITEM {
        uuid id PK
        uuid order_id FK
        uuid product_id FK
        integer quantity
        decimal price
    }

    PAYMENT {
        uuid id PK
        uuid order_id FK
        string razorpay_order_id
        string status
        decimal amount
        string method
        timestamp created_at
        timestamp updated_at
    }

    WISHLIST {
        uuid id PK
        uuid user_id FK
        uuid product_id FK
        timestamp added_at
    }

    ASTROLOGY_REPORT {
        uuid id PK
        uuid user_id FK
        date birth_date
        time birth_time
        string birth_location
        json report_data
        timestamp generated_at
    }
```

---

## System Architecture Diagram

Shows the complete system architecture with all layers and services.

```mermaid
graph TB
    subgraph "Client Layer"
        Web["🌐 Web Browser<br/>React 19 + Next.js Client"]
        Mobile["📱 Mobile Web<br/>Responsive Design"]
    end

    subgraph "CDN & Edge"
        Vercel["⚡ Vercel CDN<br/>Edge Functions"]
        Cache["💾 Static Cache<br/>Images & Assets"]
    end

    subgraph "API Gateway & Security"
        Arcjet["🛡️ Arcjet<br/>Rate Limit + Bot Detection"]
        CORS["🔒 CORS Middleware<br/>Cross-Origin Validation"]
    end

    subgraph "Application Layer"
        Next["▲ Next.js 16<br/>App Router + API Routes"]
        Auth["🔐 Auth Middleware<br/>Clerk Integration"]
    end

    subgraph "Business Logic Services"
        ProductSvc["📦 Product Service<br/>Catalog & Inventory"]
        OrderSvc["🛒 Order Service<br/>Order Management"]
        PaymentSvc["💳 Payment Service<br/>Payment Processing"]
        AstrologySvc["✨ Astrology Service<br/>Report Generation"]
        WishlistSvc["❤️ Wishlist Service<br/>Saved Items"]
    end

    subgraph "Data Access & Caching"
        ORM["🗄️ Drizzle ORM<br/>Type-Safe Queries"]
        Cache2["💾 Query Cache<br/>Performance Optimization"]
    end

    subgraph "Data Storage"
        PrimaryDB["🐘 PostgreSQL Primary<br/>Supabase/Neon"]
        Replica["🐘 PostgreSQL Replica<br/>Read Optimization"]
    end

    subgraph "External Integrations"
        Clerk2["🔐 Clerk<br/>Authentication Service"]
        Razorpay2["💳 Razorpay<br/>Payment Gateway"]
        Email["📧 Email Service<br/>Notifications"]
    end

    subgraph "Monitoring & Observability"
        Sentry2["📊 Sentry<br/>Error Tracking & Performance"]
        Logs["📝 Logs<br/>Application Logging"]
    end

    Web --> Vercel
    Mobile --> Vercel
    Vercel --> Arcjet
    Arcjet --> CORS
    CORS --> Next
    Next --> Auth
    Auth --> ProductSvc
    Auth --> OrderSvc
    Auth --> PaymentSvc
    Auth --> AstrologySvc
    Auth --> WishlistSvc

    ProductSvc --> ORM
    OrderSvc --> ORM
    PaymentSvc --> ORM
    AstrologySvc --> ORM
    WishlistSvc --> ORM

    ORM --> Cache2
    Cache2 --> PrimaryDB
    PrimaryDB --> Replica

    PaymentSvc -.->|Webhook| Razorpay2
    Auth -.->|Session| Clerk2
    OrderSvc -.->|Send| Email
    Next -.->|Track| Sentry2
    Next -.->|Log| Logs

    style Web fill:#e3f2fd
    style Vercel fill:#fff3e0
    style Arcjet fill:#f3e5f5
    style Next fill:#e8f5e9
    style Sentry2 fill:#fce4ec
```

---

## Deployment Diagram

Shows how the system is deployed across services and infrastructure.

```mermaid
graph TB
    subgraph "Client Devices"
        Desktop["🖥️ Desktop<br/>Chrome, Safari, Firefox"]
        Tablet["📱 Tablet<br/>iPad, Android Tablet"]
        Phone["📱 Mobile<br/>iPhone, Android Phone"]
    end

    subgraph "CDN & Hosting"
        Vercel2["⚡ Vercel Platform<br/>Next.js Deployment"]
        Edge["🌐 Edge Locations<br/>Global CDN"]
    end

    subgraph "Database Hosting"
        Supabase["🐘 Supabase<br/>PostgreSQL + Real-time"]
        Backups["💾 Automated Backups<br/>30-day Retention"]
    end

    subgraph "External Services - Cloud"
        Clerk3["🔐 Clerk<br/>Auth Platform"]
        Razorpay3["💳 Razorpay<br/>Payment Service"]
        Sentry3["📊 Sentry<br/>Error Monitoring"]
        Arcjet2["🛡️ Arcjet<br/>API Security"]
    end

    subgraph "Monitoring & Logging"
        Logs2["📝 Vercel Logs<br/>Application Logs"]
        Metrics["📊 Performance Metrics<br/>Core Web Vitals"]
    end

    Desktop -->|HTTPS| Edge
    Tablet -->|HTTPS| Edge
    Phone -->|HTTPS| Edge

    Edge -->|Deploy| Vercel2
    Vercel2 -->|Query| Supabase
    Supabase -->|Backup| Backups

    Vercel2 -.->|Auth Request| Clerk3
    Vercel2 -.->|Payment| Razorpay3
    Vercel2 -.->|Monitor| Sentry3
    Vercel2 -.->|Security| Arcjet2

    Vercel2 -->|Emit| Logs2
    Vercel2 -->|Collect| Metrics

    style Desktop fill:#e3f2fd
    style Vercel2 fill:#fff3e0
    style Supabase fill:#e8f5e9
    style Clerk3 fill:#f3e5f5
    style Sentry3 fill:#fce4ec
```

---

## Diagram Export & Usage Notes

### For PowerPoint/Presentation

1. **Export Mermaid Diagrams**: Use online Mermaid editor (https://mermaid.live) to:
   - Copy each diagram code
   - Export as PNG or SVG
   - Adjust styling/colors as needed

2. **Recommended Slide Assignments**:
   - Slide 1: System Architecture Diagram
   - Slide 2: Use Case Diagram
   - Slide 3: Component Diagram
   - Slide 4: Class/Entity Diagram
   - Slide 5: Checkout Sequence Diagram
   - Slide 6: Order State Machine
   - Slide 7: Payment State Machine

3. **Color Scheme for Custom Styling**:
   - Primary: `#1976d2` (Blue)
   - Success: `#388e3c` (Green)
   - Warning: `#f57c00` (Orange)
   - Error: `#d32f2f` (Red)
   - Secondary: `#7b1fa2` (Purple)

### For Documentation

- Each diagram includes detailed descriptions
- Cross-references between diagrams show relationships
- State machines clarify business logic
- Sequence diagrams show interaction protocols

### For Development

- Class diagram provides database schema reference
- Component diagram shows API module organization
- Activity diagrams clarify user workflows
- ERD helps with query optimization

---

## Quick Reference: Diagram Types Explained

| Diagram Type            | Purpose                                         | Use Case                                     |
| ----------------------- | ----------------------------------------------- | -------------------------------------------- |
| **Use Case**            | Shows actors and their interactions with system | Planning features, stakeholder communication |
| **Component**           | Shows system modules and dependencies           | Architecture review, module responsibilities |
| **Class/Entity**        | Shows data structure and relationships          | Database design, data model validation       |
| **Sequence**            | Shows message flow over time                    | Understanding workflows, debugging           |
| **State**               | Shows possible states and transitions           | Business logic, status tracking              |
| **Activity**            | Shows process flow step-by-step                 | User workflows, decision trees               |
| **Entity Relationship** | Shows database table relationships              | Database design, constraint definition       |
| **System Architecture** | Shows complete system structure                 | System overview, deployment planning         |
| **Deployment**          | Shows infrastructure and services               | DevOps, CI/CD planning                       |

---

**Last Updated**: May 8, 2026  
**Format**: Mermaid-compatible Markdown  
**For Use With**: PowerPoint, Documentation, Architecture Reviews, Team Presentations
