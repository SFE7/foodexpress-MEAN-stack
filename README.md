# FoodExpress

FoodExpress is a full-stack food ordering and restaurant management platform built with the **MEAN stack** (MongoDB, Express, Angular, Node.js). Clients can browse validated restaurants, filter by cuisine or availability, place orders with server-side price validation, and track live order status updates. Restaurateurs manage menus, categories, incoming orders, and restaurant KPIs, while administrators oversee users, restaurant validations, global cuisine categories, and platform-wide statistics.

---

## Tech Stack

- **MongoDB & Mongoose** (`mongoose` 9): Document storage and aggregation pipelines for analytics.
- **Express 5 & Node.js**: REST API with JWT authentication (`jsonwebtoken`), password hashing (`bcryptjs`), and role-based access control.
- **Angular 22 (Standalone Components)** & **Bootstrap 5**: Responsive single-page application with route guards, HTTP JWT interceptor, proxy configuration (`/api` -> `http://localhost:5000`), and pure CSS/SVG data visualizations.

---

## Prerequisites

- **Node.js** `^22.22.3`, `^24.15.0`, or `>=26` and **npm** >= 10
- **MongoDB** running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas connection string
- **Angular CLI** (optional globally; included locally via `npx ng`)

---

## Installation

1. **Backend dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

---

## Environment Configuration (`.env`)

Create `backend/.env` with your MongoDB URI and JWT secret. The backend and seed script both use the `foodexpress` database, including when an Atlas URI does not specify a database path:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/foodexpress
JWT_SECRET=foodexpress_super_secret_2026
```

---

## Seeding the Database

Populate the `foodexpress` database with test users, general cuisine categories, restaurants (4 validated + 1 pending), per-restaurant categories, dishes (in DT), and orders across all statuses:

```bash
cd backend
npm run seed
```

> **Note:** `npm run seed` clears existing documents in `users`, `restaurants`, `categories`, `dishes`, and `orders` before inserting the test dataset.

---

## Running the Application

### 1. Start the Backend

```bash
cd backend
npm run dev
```

The API server listens on `http://localhost:5000` (health check: `GET http://localhost:5000/api/health`).

### 2. Start the Frontend

```bash
cd frontend
ng serve
```

The Angular app runs on `http://localhost:4200` and proxies `/api/*` requests to `http://localhost:5000` via `frontend/proxy.conf.json`.

---

## Test Accounts

| Role | Name | Email | Password | Notes |
| --- | --- | --- | --- | --- |
| **Admin** | FoodExpress Admin | `admin@foodexpress.tn` | `Admin123!` | Full access to users, restaurants, categories, statistics |
| **Restaurateur 1** | Karim Ben Ali | `karim@foodexpress.tn` | `Test1234!` | Owns *Pizza House*, *Bella Napoli*, *Tacos Express* (pending) |
| **Restaurateur 2** | Salma Trabelsi | `salma@foodexpress.tn` | `Test1234!` | Owns *Burger Spot*, *Dar Tounsi* |
| **Client 1** | Ines Gharbi | `ines@foodexpress.tn` | `Test1234!` | Client with existing orders |
| **Client 2** | Yassine Mansouri | `yassine@foodexpress.tn` | `Test1234!` | Client with existing orders |
| **Client 3** | Amine Bouazizi | `amine@foodexpress.tn` | `Test1234!` | Client with existing orders |

---

## API Routes

### Health & Authentication (`/api/health`, `/api/auth`)

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Public | Server health check |
| `POST` | `/api/auth/register` | Public | Register a `client` or `restaurateur` account |
| `POST` | `/api/auth/login` | Public | Authenticate and receive JWT + user profile |
| `GET` | `/api/auth/me` | Authenticated | Get current user profile |
| `PUT` | `/api/auth/profile` | Authenticated | Update own profile or password |

### Users (`/api/users`)

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/users?search=` | `admin` | List users with optional search on `nom`, `prenom`, `email` |
| `PATCH` | `/api/users/:id/toggle-active` | `admin` | Activate/deactivate a user (self-deactivation blocked) |

### Restaurants (`/api/restaurants`)

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/restaurants` | Public | List validated restaurants (`search`, `typeCuisine`, `isOpen`, `sort`, `page`, `limit`) |
| `GET` | `/api/restaurants/cuisines` | Public | List distinct cuisine types of validated restaurants |
| `GET` | `/api/restaurants/mine` | `restaurateur`, `admin` | List restaurants owned by the authenticated user |
| `GET` | `/api/restaurants/admin/all` | `admin` | List all restaurants regardless of status |
| `GET` | `/api/restaurants/:id` | Public / Owner / Admin | Get restaurant details (non-validated restricted to owner/admin) |
| `POST` | `/api/restaurants` | `restaurateur`, `admin` | Create a restaurant (`pending` for restaurateur, `validated` for admin) |
| `PUT` | `/api/restaurants/:id` | Owner, `admin` | Update restaurant details |
| `DELETE` | `/api/restaurants/:id` | Owner, `admin` | Delete restaurant and cascade-delete its categories and dishes |
| `PATCH` | `/api/restaurants/:id/status` | `admin` | Update restaurant status (`pending`, `validated`, `suspended`) |

### Categories (`/api/categories`)

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/categories?restaurant=` | Public | List restaurant categories (`restaurant` param) or general cuisine categories (no param) |
| `POST` | `/api/categories` | `restaurateur`, `admin` | Create general category (`admin`) or restaurant category (owner/`admin`) |
| `PUT` | `/api/categories/:id` | Owner, `admin` | Rename/update category |
| `DELETE` | `/api/categories/:id` | Owner, `admin` | Delete category (refused if dishes still reference it) |

### Dishes (`/api/dishes`)

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/dishes` | Public | List dishes (`restaurant`, `categorie`, `search`, `disponible`) |
| `GET` | `/api/dishes/:id` | Public | Get dish details |
| `POST` | `/api/dishes` | Owner, `admin` | Create a dish for an owned restaurant |
| `PUT` | `/api/dishes/:id` | Owner, `admin` | Update dish details, price, or availability |
| `DELETE` | `/api/dishes/:id` | Owner, `admin` | Delete a dish |

### Orders (`/api/orders`)

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/api/orders` | `client` | Create an order with server-side dish & total calculation |
| `GET` | `/api/orders/my-orders` | `client` | List orders placed by the authenticated client |
| `GET` | `/api/orders/restaurant` | `restaurateur`, `admin` | List incoming orders (`statut`, optional `restaurant`) |
| `GET` | `/api/orders/:id` | Client owner, Restaurant owner, `admin` | Get single order details |
| `PUT` | `/api/orders/:id/status` | Restaurant owner, `admin`, Client (cancel `en_attente`) | Transition order status (`en_attente` -> `acceptee` -> `en_preparation` -> `en_livraison` -> `livree` or `annulee`) |

### Dashboards (`/api/dashboard`)

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/dashboard/restaurant?restaurant=` | `restaurateur`, `admin` | Restaurant KPIs (`totalOrders`, `pendingOrders`, `acceptedOrders`, `revenue` excluding `annulee`, `topDishes`) |
| `GET` | `/api/dashboard/admin` | `admin` | Platform KPIs (`clientsCount`, `restaurantsCount`, `ordersCount`, `globalRevenue` excluding `annulee`, `ordersByStatus`) |

---

## Demo Scenario

1. **Seed & Launch**: Run `npm run seed` in `backend/`, start the backend with `npm run dev`, and start the frontend with `ng serve`.
2. **Client Browsing & Ordering**:
   - Visit `http://localhost:4200` and browse validated restaurants (*Pizza House*, *Burger Spot*, *Dar Tounsi*, *Bella Napoli*) or filter by cuisine.
   - Log in as `ines@foodexpress.tn` / `Test1234!`, add available dishes to the cart, complete checkout, and track the order in **My Orders**.
3. **Restaurateur Workflow**:
   - Log in as `karim@foodexpress.tn` / `Test1234!`.
   - On `/restaurant-dashboard`, switch between *Pizza House* and *Bella Napoli* using the restaurant selector, review KPIs and *Most Ordered Dishes*, and click **Accept** on a pending order in *Latest New Orders*.
   - Navigate via the portal tabs to **Manage Dishes** (`/restaurant-dashboard/dishes`) and **Manage Orders** (`/restaurant-dashboard/orders`) to advance orders through `en_preparation` -> `en_livraison` -> `livree`.
4. **Admin Oversight**:
   - Log in as `admin@foodexpress.tn` / `Admin123!`.
   - Review global KPIs and the pure SVG/CSS *Orders by Status* chart on `/admin/statistics`.
   - Open `/admin/restaurants`, validate the pending *Tacos Express* restaurant (or suspend/edit/add one), and manage general **Cuisine Categories**.
   - Open `/admin/users`, search for a client or restaurateur, and toggle account active status (self-deactivation is prevented).
