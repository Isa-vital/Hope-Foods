# Hope Foods Backend API

Restaurant & Hotel Management System backend (Node.js + Express + MySQL).

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL 5.7+ or 8.0+ (XAMPP works for local dev)

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Configure environment
Copy `.env.example` to `.env` and fill in your DB credentials:
```bash
cp .env.example .env
```

For local XAMPP MySQL:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=hopefoods_db
JWT_SECRET=any_long_random_string_here_at_least_32_chars
```

### 3. Run migrations + seed data
```bash
npm run setup
```

This creates the database, all 16 tables, and seeds:
- 6 default users (admin, manager, waiter, kitchen, cashier, receptionist)
- 4 menu categories
- 61 menu items (matches frontend menu)
- 12 restaurant tables
- 14 hotel rooms (Standard, Deluxe, Suite)

### 4. Start the server
```bash
npm run dev    # development with auto-reload
npm start      # production
```

API runs on `http://localhost:5000`.

## 🔐 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hopefoods.com | Admin@123 |
| Manager | manager@hopefoods.com | Manager@123 |
| Waiter | waiter@hopefoods.com | Waiter@123 |
| Kitchen | kitchen@hopefoods.com | Kitchen@123 |
| Cashier | cashier@hopefoods.com | Cashier@123 |
| Reception | reception@hopefoods.com | Reception@123 |

⚠️ **Change these passwords immediately in production!**

## 📡 API Endpoints

### Auth
- `POST /api/auth/register` - Register customer account
- `POST /api/auth/login` - Login (returns JWT)
- `GET /api/auth/me` - Current user (auth required)
- `PATCH /api/auth/profile` - Update profile
- `POST /api/auth/change-password` - Change password

### Menu (public reads)
- `GET /api/menu` - Full menu grouped by category
- `GET /api/menu/categories` - List categories
- `GET /api/menu/items` - List items (filter: `?category_id=1&available_only=true`)
- `GET /api/menu/items/:id` - Single item
- `POST /api/menu/items` - Create (admin/manager)
- `PATCH /api/menu/items/:id` - Update (admin/manager)
- `DELETE /api/menu/items/:id` - Disable (admin/manager)

### Orders
- `POST /api/orders` - Place order (guest or authenticated)
- `GET /api/orders` - List orders (customers see own; staff see all)
- `GET /api/orders/:id` - Order details with items
- `PATCH /api/orders/:id/status` - Update status (staff)
- `GET /api/orders/stats/today` - Today's stats (staff)

### Health
- `GET /api/health` - Service health check

## 📦 Project Structure
```
backend/
├── src/
│   ├── config/database.js       # MySQL pool
│   ├── controllers/             # Business logic
│   ├── database/
│   │   ├── schema.sql           # Complete DB schema (16 tables)
│   │   ├── migrate.js           # Run migrations
│   │   └── seed.js              # Seed initial data
│   ├── middleware/
│   │   ├── auth.js              # JWT verify + role authorization
│   │   └── errorHandler.js      # Global error handler
│   ├── routes/                  # Express routers
│   └── server.js                # Entry point
├── .env.example
└── package.json
```

## 🗄️ Database Tables
- `users` (with roles: admin, manager, waiter, kitchen, cashier, receptionist, customer)
- `categories` + `menu_items`
- `restaurant_tables` + `reservations`
- `orders` + `order_items`
- `payments`
- `room_types` + `rooms` + `bookings`
- `suppliers` + `inventory_items` + `inventory_transactions`
- `shifts` (POS)
- `activity_logs` (audit trail)

## 🚢 Deploying to HestiaCP VPS

1. Create MySQL DB in Hestia: User → DB → Add database
2. Upload backend folder via SFTP/Git to `/home/<user>/web/api.techmarketug.cloud/`
3. Install Node.js app via Hestia (or PM2):
   ```bash
   cd /home/<user>/web/api.techmarketug.cloud/
   npm install --production
   npm run setup       # one-time
   pm2 start src/server.js --name hopefoods-api
   pm2 save
   ```
4. Configure Nginx reverse proxy in Hestia → Web → Edit → Proxy Template → Custom (proxy to `localhost:5000`)
5. Enable Let's Encrypt SSL on `api.techmarketug.cloud`

## 🔧 Next Steps (Phase 2+)
- Reservations API
- Hotel bookings API
- Inventory management
- POS shift management
- Real-time order updates (Socket.io for KDS)
- Payment gateway integration (MTN MoMo, Airtel Money, Stripe)
- Admin dashboard frontend
- Reports & analytics
