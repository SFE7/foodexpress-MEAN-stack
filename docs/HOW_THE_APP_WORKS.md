# How FoodExpress Works — Complete Beginner's Guide

Welcome to the **FoodExpress** guide! This document explains every part of our MEAN stack project in plain, simple English so all 4 team members can understand the whole app, explain any module, and answer teacher questions with confidence during the oral presentation.

---

## Table of Contents

1. [The Big Picture](#1-the-big-picture)
2. [How the Project Was Created, Step by Step](#2-how-the-project-was-created-step-by-step)
3. [Folder Tour](#3-folder-tour)
4. [Backend Explained](#4-backend-explained)
5. [Frontend Explained](#5-frontend-explained)
6. [Follow the Data: 4 Full Journeys](#6-follow-the-data-4-full-journeys)
7. [Security Explained Simply](#7-security-explained-simply)
8. [How to Run and Test](#8-how-to-run-and-test)
9. [Glossary (45 Key Terms)](#9-glossary-45-key-terms)
10. [Questions the Teacher May Ask Us (65+ Q&A)](#10-questions-the-teacher-may-ask-us-65-qa)
11. [Cheat Sheet for the Oral Presentation](#11-cheat-sheet-for-the-oral-presentation)
12. [Known Gaps and Limitations](#12-known-gaps-and-limitations)

---

## 1. The Big Picture

### What FoodExpress Does
FoodExpress is a web application for **online food ordering and restaurant management** (similar to Glovo or Uber Eats). Customers can browse restaurants, filter by cuisine, view menus, add dishes to a cart, place an order, and track its progress live. Restaurant owners can manage their menus and incoming orders, and an administrator oversees the whole platform.

### The 3 Actors (Roles)
1. **Client (`client`)**: Searches restaurants, views menus, builds a cart (from one restaurant at a time), places orders, tracks order status, and can cancel a pending (`en_attente`) order.
2. **Restaurateur (`restaurateur`)**: Creates and edits their own restaurants, organizes menu categories and dishes, toggles dish availability, views KPIs (key performance indicators), and updates order statuses from pending to delivered.
3. **Admin (`admin`)**: Validates or suspends restaurants, manages global cuisine categories, activates or deactivates user accounts, and views platform-wide statistics.

### The MEAN Stack in Plain Words
Think of FoodExpress like a real restaurant:
- **MongoDB** (*the fridge / storage room*): The database where all data (users, restaurants, categories, dishes, orders) is stored permanently as **JSON-like documents**.
- **Express.js** (*the kitchen manager*): A lightweight **Node.js** web framework that receives HTTP requests from the browser, checks permissions, runs business rules, and sends back JSON responses.
- **Angular** (*the waiter*): The frontend framework running in the user's browser. It displays pages, collects form inputs, shows the cart, and talks to Express over HTTP.
- **Node.js** (*the kitchen electricity / runtime*): The engine that lets us run JavaScript on the server (outside the browser) so Express can run.

### Architecture Diagram

```text
+--------------------+   HTTP / JSON + JWT    +--------------------+
|  Browser (Angular) | ---------------------> |  Express API       |
|  localhost:4200    | <--------------------- |  localhost:5000    |
|  (proxy /api ->    |   JSON Responses       |  (Routes, Middle-  |
|   localhost:5000)  |                        |   ware, Controllers|
+--------------------+                        +--------------------+
                                                        |
                                                        | Mongoose (ODM)
                                                        v
                                              +--------------------+
                                              |  MongoDB           |
                                              |  Database:         |
                                              |  "foodexpress"     |
                                              +--------------------+
```

---

## 2. How the Project Was Created, Step by Step

Building a full-stack app is like building a house: you start with the foundation, then the walls, then the rooms, then the furniture. Here is the exact order FoodExpress was built in:

### Step 1: Project Setup & Database Connection
- **What was built**: Node/Express backend skeleton (`backend/package.json`, `backend/server.js`), environment variables (`backend/.env`), MongoDB connection (`backend/config/database.js`), and Angular 22 standalone workspace (`frontend/`) with Bootstrap 5 (`frontend/src/styles.css`) and a dev proxy (`frontend/proxy.conf.json`).
- **Why first**: Nothing works until the backend can talk to MongoDB and the frontend can forward `/api` requests to the backend.

### Step 2: Authentication, Users & App Shell (Module 1)
- **What was built**: `User` model with password hashing (`backend/models/User.js`), `authController.js`, `authMiddleware.js`, `roleMiddleware.js`, `authRoutes.js`, `userRoutes.js`, `userController.js`. On the frontend: `AuthService`, `jwtInterceptor`, `authGuard`, `roleGuard`, `NavbarComponent`, `FooterComponent`, `LoginComponent`, `RegisterComponent`, `ProfileComponent`.
- **Why second**: Almost every feature needs to know *who* is logged in and *what role* they have (`client`, `restaurateur`, or `admin`).

### Step 3: Restaurants, Categories & Dishes (Module 2)
- **What was built**: `Restaurant`, `Category`, and `Dish` models; `restaurantController.js`, `categoryController.js`, `dishController.js` and their routes. On the frontend: `RestaurantService`, `CategoryService`, `DishService`, `HomeComponent`, `RestaurantsComponent` (search, cuisine filter, open-only toggle, pagination), `RestaurantDetailsComponent` (menu + category tabs), and `ManageDishesComponent` (restaurateur CRUD).
- **Why third**: Clients cannot order food until restaurants and dishes exist in the database.

### Step 4: Cart, Checkout & Order Lifecycle (Module 3)
- **What was built**: `Order` model (`backend/models/Order.js`), `orderController.js` (server-side price calculation + status transition rules), `orderRoutes.js`. On the frontend: `CartService` (saved in `localStorage`, locked to one restaurant), `OrderService`, `CartComponent`, `CheckoutComponent`, `MyOrdersComponent` (5-step visual tracker + 15s polling), and `ManageOrdersComponent` (restaurateur order queue).
- **Why fourth**: Orders link a `User` (client), a `Restaurant`, and `Dish` items together.

### Step 5: Dashboards, Admin Panel & Seed Data (Module 4)
- **What was built**: `dashboardController.js` and `dashboardRoutes.js` using MongoDB **aggregation pipelines** for KPIs and top dishes. Frontend: `PortalNavComponent`, `RestaurantDashboardComponent`, `StatisticsComponent` (pure SVG donut chart + CSS bars), `AdminRestaurantsComponent`, `UsersComponent`. Finally, `backend/scripts/seed.js` to populate realistic test data.
- **Why last**: Dashboards summarize existing orders, restaurants, and users, and the seed script populates all 5 collections at once for easy demos.

---

## 3. Folder Tour

### Backend (`backend/`)

| Path | What it does | Who talks to it |
| --- | --- | --- |
| `backend/server.js` | Starts Express, loads `.env`, enables CORS & JSON parsing, mounts all `/api/*` routes, and connects to MongoDB. | Angular frontend (via proxy) and Postman. |
| `backend/config/database.js` | Connects Mongoose to `MONGO_URI` using database name `foodexpress`. | `server.js` on startup. |
| `backend/.env` / `.env.example` | Stores secret config (`PORT`, `MONGO_URI`, `JWT_SECRET`). | `dotenv` in `server.js` and `seed.js`. |
| `backend/models/User.js` | Defines user schema (`nom`, `prenom`, `email`, `password`, `role`, `isActive`) and hashes passwords before saving. | `authController`, `userController`, `dashboardController`, `authMiddleware`. |
| `backend/models/Restaurant.js` | Defines restaurant schema (`nom`, `typeCuisine`, `fraisLivraison`, `isOpen`, `status`, `owner`). | `restaurantController`, `dishController`, `orderController`, `dashboardController`. |
| `backend/models/Category.js` | Defines category schema (`nom`, `description`, `restaurant` which is `null` for global categories). | `categoryController`, `dishController`, `restaurantController`. |
| `backend/models/Dish.js` | Defines dish schema (`nom`, `prix`, `disponible`, `categorie`, `restaurant`). | `dishController`, `orderController`, `categoryController`, `restaurantController`. |
| `backend/models/Order.js` | Defines order schema (`client`, `restaurant`, `articles[]` snapshot, `sousTotal`, `fraisLivraison`, `total`, `statut`). | `orderController`, `dashboardController`. |
| `backend/middleware/authMiddleware.js` | Verifies the `Bearer <token>` JWT header, loads the user, blocks disabled accounts, and sets `req.user`. | Protected routes in `routes/*.js`. |
| `backend/middleware/roleMiddleware.js` | Checks if `req.user.role` is in the allowed list (`authorize('admin')`, etc.). | Protected routes after `authMiddleware`. |
| `backend/controllers/*.js` | Contains the business logic for each resource (`auth`, `user`, `restaurant`, `category`, `dish`, `order`, `dashboard`). | `backend/routes/*.js` and Mongoose models. |
| `backend/routes/*.js` | Maps HTTP methods + URL paths to middleware and controller functions. | `backend/server.js`. |
| `backend/scripts/seed.js` | Clears all 5 collections and inserts 6 users, 20 categories, 5 restaurants, 19 dishes, and 10 orders. | Run manually via `npm run seed`. |

### Frontend (`frontend/src/app/`)

| Path | What it does | Who talks to it |
| --- | --- | --- |
| `frontend/proxy.conf.json` | Forwards `/api/*` requests from `localhost:4200` to `localhost:5000` during development. | Angular CLI dev server (`ng serve`). |
| `frontend/src/main.ts` | Bootstraps the standalone root `App` component with `appConfig`. | Browser on page load. |
| `frontend/src/app/app.config.ts` | Registers global providers: router and `HttpClient` with interceptors. | `main.ts`. |
| `frontend/src/app/app.routes.ts` | Maps URL paths (`/`, `/restaurants`, `/checkout`, `/admin/users`, etc.) to components and guards. | Angular Router & `NavbarComponent`. |
| `frontend/src/app/app.ts` / `app.html` | Root shell displaying `<app-navbar>`, `<router-outlet>`, and `<app-footer>` (hides navbar/footer on `/login` and `/register`). | All pages render inside `<router-outlet>`. |
| `core/models/*.model.ts` | TypeScript interfaces (`User`, `Restaurant`, `Dish`, `Order`) and status label/color maps. | Services and page components. |
| `core/guards/auth.guard.ts` | Blocks unauthenticated users from private routes and redirects to `/login`. | `app.routes.ts`. |
| `core/guards/role.guard.ts` | Blocks users whose role is not in `route.data['roles']` and redirects to their home page. | `app.routes.ts`. |
| `core/interceptors/jwt.interceptor.ts` | Attaches `Authorization: Bearer <token>` to every `/api/` HTTP request. | `HttpClient` via `app.config.ts`. |
| `core/interceptors/refresh.interceptor.ts` | Calls `appRef.tick()` after HTTP responses to trigger Angular change detection. | `HttpClient` via `app.config.ts`. |
| `core/services/*.service.ts` | `AuthService`, `CartService`, `RestaurantService`, `CategoryService`, `DishService`, `OrderService`, `UserService`, `DashboardService`. | Page and shared components. |
| `shared/navbar/navbar.component.ts` | Top navigation bar showing links based on user role and live cart item count. | `App` shell. |
| `shared/footer/footer.component.ts` | Dark footer with copyright and brand link. | `App` shell. |
| `shared/portal-nav/portal-nav.component.ts` | Sub-navigation pill bar for Restaurateur Space and Admin Space. | Restaurateur and Admin dashboard pages. |
| `pages/home/home.component.ts` | Landing page with search bar, cuisine chips, and 6 popular restaurants. | `RestaurantService`, `Router`. |
| `pages/restaurants/restaurants.component.ts` | Browsable restaurant catalog with search, cuisine filter, open-only switch, and pagination. | `RestaurantService`, `ActivatedRoute`. |
| `pages/restaurant-details/restaurant-details.component.ts` | Displays one restaurant's info, category tabs, dishes, and floating cart bar. | `RestaurantService`, `CategoryService`, `DishService`, `CartService`. |
| `pages/cart/cart.component.ts` | Shows cart items, quantity `+`/`-` buttons, subtotal/delivery/total, and checkout button. | `CartService`, `AuthService`, `Router`. |
| `pages/checkout/checkout.component.ts` | Delivery address, remark, payment method form, and order submission. | `CartService`, `OrderService`, `AuthService`. |
| `pages/my-orders/my-orders.component.ts` | Client's order history with 5-step status tracker, cancel button, and 15s auto-refresh. | `OrderService`. |
| `pages/login`, `register`, `profile` | Account authentication and profile editing forms. | `AuthService`, `Router`. |
| `pages/restaurant-dashboard/*` | `dashboard` (KPIs + top dishes), `manage-dishes` (restaurant/category/dish CRUD), `manage-orders` (status workflow). | `DashboardService`, `RestaurantService`, `CategoryService`, `DishService`, `OrderService`. |
| `pages/admin-dashboard/*` | `statistics` (global KPIs + SVG donut), `restaurants` (validate/suspend + global cuisines), `users` (search + toggle active). | `DashboardService`, `RestaurantService`, `CategoryService`, `UserService`. |

---

## 4. Backend Explained

### `server.js` — The Entry Point
`backend/server.js` sets up Express, enables `cors()` (so other origins can call the API) and `express.json()` (so `req.body` parses JSON), mounts 7 route files under `/api/*`, adds a global 500 error handler, and only starts listening after MongoDB connects:

*File: `backend/server.js`*
```js
const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/dishes', dishRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);
```

### Database Connection & `.env` Variables
`.env` is a hidden configuration file that holds **environment variables**—settings that change per computer or must stay secret (never committed to Git):
- `PORT=5000`: The port Express listens on.
- `MONGO_URI=...`: The MongoDB connection string (contains database username/password on Atlas).
- `JWT_SECRET=...`: The secret key used to sign and verify JWT tokens. If someone steals this key, they can forge fake login tokens!

*File: `backend/config/database.js`*
```js
async function connectDatabase() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required');
  }

  await mongoose.connect(process.env.MONGO_URI, { dbName: 'foodexpress' });
  console.log('Connected to MongoDB');
}
```

### Mongoose Models (Schemas & Relations)
Mongoose is an **ODM** (Object Data Modeling) library. It gives structure (a **schema**) to MongoDB's flexible documents:

1. **`User` (`backend/models/User.js`)**:
   - Fields: `nom`, `prenom`, `email` (`unique: true`, `lowercase: true`), `telephone`, `password` (`select: false` so queries hide it by default), `role` (`'client' | 'restaurateur' | 'admin'`), `isActive` (boolean).
   - **Pre-save hook**: Automatically hashes `password` with `bcrypt.hash(this.password, 12)` whenever the password is created or changed.
2. **`Restaurant` (`backend/models/Restaurant.js`)**:
   - Fields: `nom`, `description`, `adresse`, `typeCuisine`, `image`, `fraisLivraison`, `horaires`, `isOpen`, `status` (`'pending' | 'validated' | 'suspended'`), `owner` (`ObjectId` referencing `User`).
   - Why `status`? New restaurants created by restaurateurs start as `'pending'` until an admin validates them.
3. **`Category` (`backend/models/Category.js`)**:
   - Fields: `nom`, `description`, `restaurant` (`ObjectId` referencing `Restaurant`, default `null`).
   - Dual purpose: If `restaurant` is `null`, it is a **global cuisine category** managed by Admin. If `restaurant` has an ID, it is a **menu section** (e.g., "Pizzas", "Desserts") for that restaurant.
4. **`Dish` (`backend/models/Dish.js`)**:
   - Fields: `nom`, `description`, `prix` (`min: 0`), `image`, `disponible` (boolean), `categorie` (`ObjectId` -> `Category`), `restaurant` (`ObjectId` -> `Restaurant`).
5. **`Order` (`backend/models/Order.js`)**:
   - Fields: `client` (`ObjectId` -> `User`), `restaurant` (`ObjectId` -> `Restaurant`), `articles` (embedded array of `{ plat, nom, quantite, prixUnitaire }`), `adresseLivraison`, `sousTotal`, `fraisLivraison`, `total`, `modePaiement` (`'livraison' | 'en_ligne'`), `statut` (`'en_attente' | 'acceptee' | 'en_preparation' | 'en_livraison' | 'livree' | 'annulee'`), `remarque`.
   - Why store `nom` and `prixUnitaire` inside `articles`? It is a **snapshot**! If a restaurateur later changes a pizza's price or deletes the dish, past orders still show the exact price the client paid.

### Middleware (`authMiddleware.js` & `roleMiddleware.js`)
Middleware functions are like **security guards at a building entrance**—they run *before* the controller.
- `authMiddleware.js`: Reads `Authorization: Bearer <token>`, verifies it with `jwt.verify(token, process.env.JWT_SECRET)`, fetches the user from MongoDB (without password), checks `user.isActive !== false`, and attaches `req.user = user`.
- `roleMiddleware.js`: Returns a function `authorize(...roles)` that checks `roles.includes(req.user.role)`. If not allowed, it returns `403 Forbidden`.

### Complete Table of All API Routes

| Method | URL | Who can call it | What it does |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Public | Returns `{ status: 'ok' }` to verify server is up. |
| `POST` | `/api/auth/register` | Public | Creates a `client` or `restaurateur` account and returns JWT + user. |
| `POST` | `/api/auth/login` | Public | Verifies email/password, checks `isActive`, returns JWT + user. |
| `GET` | `/api/auth/me` | Authenticated | Returns the logged-in user's profile. |
| `PUT` | `/api/auth/profile` | Authenticated | Updates own `nom`, `prenom`, `telephone`, or `password`. |
| `GET` | `/api/users` | `admin` | Lists all users with optional `?search=` filter. |
| `PATCH` | `/api/users/:id/toggle-active` | `admin` | Activates or deactivates a user (blocks self-deactivation). |
| `GET` | `/api/restaurants` | Public | Lists `validated` restaurants with `search`, `typeCuisine`, `isOpen`, `sort`, `page`, `limit`. |
| `GET` | `/api/restaurants/cuisines` | Public | Returns distinct `typeCuisine` values of validated restaurants. |
| `GET` | `/api/restaurants/mine` | `restaurateur`, `admin` | Lists restaurants owned by the logged-in user. |
| `GET` | `/api/restaurants/admin/all` | `admin` | Lists all restaurants (pending, validated, suspended). |
| `GET` | `/api/restaurants/:id` | Public / Owner / `admin` | Gets one restaurant (non-validated only visible to owner or admin). |
| `POST` | `/api/restaurants` | `restaurateur`, `admin` | Creates a restaurant (`pending` for restaurateur, `validated` for admin). |
| `PUT` | `/api/restaurants/:id` | Owner, `admin` | Updates restaurant details. |
| `DELETE` | `/api/restaurants/:id` | Owner, `admin` | Deletes restaurant and cascade-deletes its dishes and categories. |
| `PATCH` | `/api/restaurants/:id/status` | `admin` | Changes restaurant status (`pending`, `validated`, `suspended`). |
| `GET` | `/api/categories` | Public | Lists restaurant categories (`?restaurant=id`) or global categories (no query). |
| `POST` | `/api/categories` | `restaurateur`, `admin` | Creates a global category (`admin`) or restaurant category (owner/`admin`). |
| `PUT` | `/api/categories/:id` | Owner, `admin` | Renames or updates a category. |
| `DELETE` | `/api/categories/:id` | Owner, `admin` | Deletes a category (refused with `400` if dishes still use it). |
| `GET` | `/api/dishes` | Public | Lists dishes with optional `restaurant`, `categorie`, `search`, `disponible`. |
| `GET` | `/api/dishes/:id` | Public | Gets a single dish by ID. |
| `POST` | `/api/dishes` | Owner, `admin` | Creates a dish in an owned restaurant. |
| `PUT` | `/api/dishes/:id` | Owner, `admin` | Updates dish details, price, category, or availability. |
| `DELETE` | `/api/dishes/:id` | Owner, `admin` | Deletes a dish. |
| `POST` | `/api/orders` | `client` | Places an order; server validates dishes and recomputes all totals. |
| `GET` | `/api/orders/my-orders` | `client` | Lists orders placed by the logged-in client. |
| `GET` | `/api/orders/restaurant` | `restaurateur`, `admin` | Lists orders for owned restaurants (filterable by `statut`, `restaurant`). |
| `GET` | `/api/orders/:id` | Client owner, Rest. owner, `admin` | Gets one order's details. |
| `PUT` | `/api/orders/:id/status` | Rest. owner, `admin`, Client (cancel `en_attente`) | Advances order status following `ORDER_TRANSITIONS`. |
| `GET` | `/api/dashboard/restaurant` | `restaurateur`, `admin` | Returns `totalOrders`, `pendingOrders`, `acceptedOrders`, `revenue`, `topDishes`. |
| `GET` | `/api/dashboard/admin` | `admin` | Returns `clientsCount`, `restaurantsCount`, `ordersCount`, `globalRevenue`, `ordersByStatus`. |

---

## 5. Frontend Explained

### Building Blocks in Angular
- **Standalone Components**: Visual building blocks (HTML + CSS + TypeScript class) with `standalone: true` and an `imports: [...]` array—no `NgModule` needed.
- **Services (`@Injectable({ providedIn: 'root' })`)**: Shared singleton helpers that hold state (like `AuthService`, `CartService`) or make HTTP calls (`RestaurantService`, `OrderService`).
- **Guards (`CanActivateFn`)**: Functions in `app.routes.ts` that decide *before* opening a page whether the user is allowed in.
- **Interceptors (`HttpInterceptorFn`)**: Functions that inspect/modify every outgoing HTTP request or incoming response automatically.

### Routing (`frontend/src/app/app.routes.ts`)
`app.routes.ts` maps URLs to components and attaches `authGuard` and `roleGuard`:

*File: `frontend/src/app/app.routes.ts`*
```ts
{ path: 'checkout', component: CheckoutComponent, canActivate: [authGuard, roleGuard], data: { roles: ['client'] } },
{ path: 'my-orders', component: MyOrdersComponent, canActivate: [authGuard, roleGuard], data: { roles: ['client'] } },
{ path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
{
  path: 'restaurant-dashboard',
  component: RestaurantDashboardComponent,
  canActivate: [authGuard, roleGuard],
  data: { roles: ['restaurateur', 'admin'] },
},
{ path: 'admin/users', component: UsersComponent, canActivate: [authGuard, roleGuard], data: { roles: ['admin'] } },
```

### How `AuthService` & `jwtInterceptor` Work
1. When you log in or register, `AuthService.storeSession()` saves `foodexpress_token` and `foodexpress_user` in `localStorage` and pushes the user into a `BehaviorSubject` (`currentUser$`) so the navbar updates immediately.
2. Every time any service calls `/api/...`, `jwtInterceptor` clones the request and attaches the `Authorization: Bearer <token>` header:

*File: `frontend/src/app/core/interceptors/jwt.interceptor.ts`*
```ts
export const jwtInterceptor: HttpInterceptorFn = (request, next) => {
  if (!/(^|\/)api\//.test(request.url)) {
    return next(request);
  }

  const token = inject(AuthService).getToken();
  if (!token) {
    return next(request);
  }

  return next(request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
```

### How `authGuard` and `roleGuard` Protect Pages
- `authGuard` checks `auth.isLoggedIn()` (whether a token exists in `localStorage`). If false, it redirects to `/login`.
- `roleGuard` reads `route.data['roles']` and compares it with `auth.getRole()`. If the user has the wrong role, it redirects them to their role's home page (`/` for client, `/restaurant-dashboard` for restaurateur, `/admin/statistics` for admin).

### How `CartService` Works
`CartService` stores the cart in `localStorage` under `'foodexpress_cart'` so refreshing the browser does not lose your items. It also enforces the **single-restaurant rule**: if your cart has items from Restaurant A and you click "+ Add to Cart" on Restaurant B, it asks for confirmation via `window.confirm(...)` and clears the old cart before adding the new item.

### Calling the API with `HttpClient` and Observables
Angular's `HttpClient` returns **Observables** (data streams from RxJS). Nothing is sent until a component calls `.subscribe({ next: ..., error: ... })`. For example, `RestaurantDashboardComponent` uses `forkJoin({ stats: ..., pendingOrders: ... })` to run two API calls in parallel and wait for both to finish.

---

## 6. Follow the Data: 4 Full Journeys

### Journey A: Register and Login
1. **User clicks "Create account"** in `RegisterComponent` (`register.component.ts`). The Reactive Form validates all fields + `matchingPasswords`.
2. **Service call**: `RegisterComponent.submit()` calls `AuthService.register(payload)` -> `POST /api/auth/register`.
3. **Proxy & Backend**: `proxy.conf.json` forwards to `localhost:5000/api/auth/register` -> `authRoutes.js` -> `authController.register()`.
4. **Validation & Hashing**: `authController.register()` validates fields, checks `User.exists({ email })` (returns `409` if duplicate), and calls `User.create(...)`. The `userSchema.pre('save')` hook in `User.js` hashes the password with `bcrypt.hash(this.password, 12)`.
5. **JWT Creation**: `createToken(user)` signs `{ id: user.id, role: user.role }` with `JWT_SECRET` (valid for 7 days) and returns `201 Created` with `{ token, user }` (password stripped).
6. **Token Stored**: `AuthService` receives the response, saves `foodexpress_token` and `foodexpress_user` to `localStorage`, updates `userSubject`, and `RegisterComponent` navigates to `/` (client) or `/restaurant-dashboard` (restaurateur).
7. **On Login (`LoginComponent`)**: `POST /api/auth/login` -> `authController.login()` fetches the user with `.select('+password')`, compares using `bcrypt.compare(password, user.password)`, checks `user.isActive !== false` (`403` if disabled), and returns a fresh `{ token, user }`.

### Journey B: Browsing Restaurants with Search, Filters & Pagination
1. **User types or selects a filter** in `RestaurantsComponent` (`restaurants.component.ts`), triggering `onFilterChange()` -> `syncUrlParams()`, which updates the browser URL query params (`?search=pizza&typeCuisine=Italien&isOpen=true&page=2`).
2. **URL subscription**: `ngOnInit()` subscribes to `this.route.queryParams`, reads the params, and calls `fetchRestaurants()`.
3. **HTTP Request**: `RestaurantService.getRestaurants(filters, page, limit)` builds `HttpParams` and sends `GET /api/restaurants?page=2&limit=12&search=pizza&typeCuisine=Italien&isOpen=true`.
4. **Database Query**: `restaurantController.getRestaurants()` builds `query = { status: 'validated' }`, adds case-insensitive regex on `nom`, exact `typeCuisine`, `isOpen: true`, and runs `Restaurant.countDocuments(query)` + `Restaurant.find(query).sort({ nom: 1 }).skip(skip).limit(limitNum).populate('owner', ...)` in parallel via `Promise.all`.
5. **Response & Render**: Express returns `{ data, page, totalPages, total }`. Angular updates `this.restaurants` and `@for` renders the restaurant cards and pagination buttons.

### Journey C: Placing an Order
1. **Adding dishes**: On `RestaurantDetailsComponent`, clicking `+ Add to Cart` calls `CartService.addItem(dish, restaurant)`, which saves the item in `localStorage` (`foodexpress_cart`).
2. **Going to Checkout**: On `CartComponent`, clicking "Proceed to Checkout" checks `auth.isLoggedIn()` and `role === 'client'`, then navigates to `/checkout` (protected by `authGuard` and `roleGuard`).
3. **Submitting Checkout**: On `CheckoutComponent`, the user enters `adresseLivraison` and optional `remarque`, and clicks "Confirm & Place Order". `submitOrder()` sends **only dish IDs and quantities** (never prices!) via `OrderService.createOrder(payload)` -> `POST /api/orders`.
4. **JWT & Role Check**: `jwtInterceptor` attaches `Bearer <token>`. On the backend, `authMiddleware` verifies the user and `authorize('client')` confirms the role.
5. **Server Validation & Price Calculation**: `orderController.createOrder()` loads the `Restaurant` (must be `validated` and `isOpen`), loads all `Dish` documents from MongoDB, checks each belongs to the restaurant and has `disponible === true`, then recomputes `sousTotal`, `fraisLivraison`, and `total` from the database prices:

*File: `backend/controllers/orderController.js`*
```js
let sousTotal = 0;
const orderArticles = articles.map((item) => {
  const dish = dishMap.get(item.plat.toString());
  const quantite = Number(item.quantite);
  const prixUnitaire = dish.prix;
  sousTotal += quantite * prixUnitaire;
  return { plat: dish._id, nom: dish.nom, quantite, prixUnitaire };
});
const fraisLivraison = restDoc.fraisLivraison || 0;
const total = sousTotal + fraisLivraison;
```
6. **Saved & Cleared**: The `Order` is saved with `statut: 'en_attente'` and returned (`201 Created`). `CheckoutComponent` calls `this.cartService.clear()` and redirects to `/my-orders`.

### Journey D: Restaurateur Changes Order Status & Client Sees It
1. **Restaurateur views orders**: `ManageOrdersComponent` (`manage-orders.component.ts`) calls `OrderService.getRestaurantOrders()` -> `GET /api/orders/restaurant`. `orderController.getRestaurantOrders()` finds restaurants owned by `req.user._id` and returns their orders.
2. **Restaurateur clicks "Accept"** (or "Start Prep", "Send Delivery", "Mark Delivered"): Calls `updateStatus(order, newStatus)` -> `PUT /api/orders/:id/status` with `{ statut: 'acceptee' }`.
3. **Lifecycle & Ownership Check**: `orderController.updateOrderStatus()` checks:
   - Order is not already `'livree'` or `'annulee'`.
   - The transition is valid in `ORDER_TRANSITIONS` (`en_attente` -> `['acceptee', 'annulee']`, `acceptee` -> `['en_preparation', 'annulee']`, `en_preparation` -> `['en_livraison']`, `en_livraison` -> `['livree']`).
   - The user is `admin`, the restaurant's `owner`, or (only when cancelling `en_attente`) the `client` who placed the order.
4. **Client sees the update**: `MyOrdersComponent` (`my-orders.component.ts`) runs `interval(15000)` to poll `GET /api/orders/my-orders` every 15 seconds (or when the user clicks "Refresh") and updates the 5-step visual progress bar.

---

## 7. Security Explained Simply

1. **Password Hashing (`bcryptjs`)**: We never store plain-text passwords. `User.js` runs `bcrypt.hash(password, 12)` before saving, turning `"Test1234!"` into an irreversible scrambled string with a random **salt** (cost factor 12).
2. **JWT (JSON Web Token)**: After login, Express gives the client a signed "wristband" containing `{ id, role }`. On every API call, `authMiddleware` checks the signature with `JWT_SECRET`. If anyone edits the token, the signature breaks and Express returns `401 Unauthorized`.
3. **Angular Guards vs. Server Roles**: Angular's `authGuard` and `roleGuard` are for **user experience** (hiding pages a user shouldn't see). Real security happens on the **server** (`authMiddleware` + `authorize(...)`), because anyone can bypass Angular using Postman or `curl`.
4. **Never Trust Client Totals**: In `CheckoutComponent`, Angular displays a total for convenience, but sends only `{ plat, quantite }`. `orderController.createOrder()` looks up the real prices in MongoDB so a hacker cannot change a 24 DT meal to 0.01 DT.
5. **Disabled Accounts (`isActive`)**: If an admin deactivates a user, both `authController.login()` and `authMiddleware.js` check `user.isActive === false` and return `403 Account disabled`—so even an already-logged-in user's token stops working immediately.
6. **Ownership Checks**: Being a `restaurateur` is not enough; `restaurantController`, `categoryController`, `dishController`, `orderController`, and `dashboardController` all verify `restaurant.owner.toString() === req.user._id.toString()` (unless `req.user.role === 'admin'`).

---

## 8. How to Run and Test

### 1. Install Dependencies
```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure `backend/.env`
Create `backend/.env` (you can copy `backend/.env.example`):
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/foodexpress
JWT_SECRET=foodexpress_super_secret_2026
```

### 3. Seed the Database
```bash
cd backend
npm run seed
```
*(Note: This clears `users`, `restaurants`, `categories`, `dishes`, and `orders` and inserts fresh test data.)*

### 4. Start Both Servers
In terminal 1 (Backend):
```bash
cd backend
npm run dev
```
In terminal 2 (Frontend):
```bash
cd frontend
ng serve
```
Open `http://localhost:4200` in your browser.

### 5. Test Accounts (from `backend/scripts/seed.js`)

| Role | Email | Password | Notes |
| --- | --- | --- | --- |
| **Admin** | `admin@foodexpress.tn` | `Admin123!` | Full admin access |
| **Restaurateur 1** | `karim@foodexpress.tn` | `Test1234!` | Owns *Pizza House*, *Bella Napoli*, *Tacos Express* (pending) |
| **Restaurateur 2** | `salma@foodexpress.tn` | `Test1234!` | Owns *Burger Spot*, *Dar Tounsi* |
| **Client 1** | `ines@foodexpress.tn` | `Test1234!` | Has existing orders |
| **Client 2** | `yassine@foodexpress.tn` | `Test1234!` | Has existing orders |
| **Client 3** | `amine@foodexpress.tn` | `Test1234!` | Has existing orders |

### 6. Postman Testing
Import `FoodExpress.postman_collection.json` into Postman, run **Login (Get Token)** (or update the email to `karim@foodexpress.tn` / `Test1234!`), and Postman automatically saves `{{token}}` for testing restaurant, category, and dish endpoints.

---

## 9. Glossary (45 Key Terms)

1. **API (Application Programming Interface)**: A set of URLs and rules that lets the frontend talk to the backend.
2. **REST (Representational State Transfer)**: An API style that uses standard HTTP methods (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) on resource URLs like `/api/restaurants`.
3. **CRUD**: The four basic database operations: **C**reate, **R**ead, **U**pdate, **D**elete.
4. **MEAN Stack**: A full-stack JavaScript architecture using **M**ongoDB, **E**xpress, **A**ngular, and **N**ode.js.
5. **JSON (JavaScript Object Notation)**: A lightweight text format (`{ "key": "value" }`) used to send data between browser, server, and database.
6. **MongoDB**: A NoSQL document database that stores records as flexible JSON-like objects (BSON) inside collections.
7. **Collection**: A group of documents in MongoDB (similar to a table in SQL).
8. **Document**: A single record in a MongoDB collection (similar to a row in SQL).
9. **ObjectId**: MongoDB's unique 12-byte identifier (`_id`) automatically given to every document.
10. **ODM (Object Data Modeling)**: A library like Mongoose that maps JavaScript objects to MongoDB documents with schemas and validation.
11. **Schema**: A blueprint in Mongoose that defines a document's fields, types, defaults, and validation rules.
12. **Populate**: A Mongoose method (`.populate('owner')`) that replaces an `ObjectId` reference with the actual referenced document.
13. **Sub-document**: A document nested inside another document, like `articles` inside `Order`.
14. **Aggregation Pipeline**: A multi-stage MongoDB query (`$match`, `$group`, `$unwind`, `$sort`) used to compute totals and statistics on the server.
15. **Node.js**: A runtime environment that executes JavaScript code on the server outside a web browser.
16. **Express.js**: A minimal Node.js web framework used to define routes, middleware, and HTTP responses.
17. **Middleware**: A function `(req, res, next)` that runs between receiving a request and sending a response (e.g., auth checks).
18. **Controller**: A file containing functions that handle the business logic for a route.
19. **Router**: An Express object (`express.Router()`) that groups related API routes together.
20. **CORS (Cross-Origin Resource Sharing)**: A security rule in browsers controlling whether one origin (`localhost:4200`) can call another (`localhost:5000`).
21. **Proxy**: A dev-server rule (`proxy.conf.json`) that forwards `/api` requests from Angular (`4200`) to Express (`5000`) so they look like the same origin.
22. **Environment Variables (`.env`)**: Secret or environment-specific settings (like `MONGO_URI` and `JWT_SECRET`) loaded by `dotenv`.
23. **JWT (JSON Web Token)**: A compact, digitally signed token sent in the `Authorization: Bearer` header to prove who the user is.
24. **Payload**: The data carried inside a JWT (here `{ id, role }`) or sent in an HTTP request body.
25. **Hash**: A one-way mathematical transformation that scrambles a password so it cannot be reversed back to plain text.
26. **Salt**: Random data added to a password before hashing so identical passwords produce different hashes.
27. **bcrypt (`bcryptjs`)**: A slow, secure password-hashing library that automatically generates salts and resists brute-force attacks.
28. **Authentication**: Verifying *who* a user is (e.g., logging in with email and password).
29. **Authorization**: Checking *what* an authenticated user is allowed to do (e.g., only `admin` can suspend a restaurant).
30. **RBAC (Role-Based Access Control)**: Restricting access based on user roles (`client`, `restaurateur`, `admin`).
31. **SPA (Single-Page Application)**: A web app like Angular that loads one HTML page and swaps views dynamically without full page reloads.
32. **Standalone Component**: An Angular component (`standalone: true`) that declares its own imports without needing an `NgModule`.
33. **Service**: An Angular class (`@Injectable`) that shares data or API calls across multiple components.
34. **Dependency Injection (`inject()`)**: Angular's pattern for giving a component or guard the services it needs automatically.
35. **Observable (RxJS)**: A lazy stream of asynchronous values over time; `HttpClient` returns Observables that run when you `.subscribe()`.
36. **BehaviorSubject**: An RxJS Observable that holds a current value (like the logged-in user or cart) and emits it to new subscribers immediately.
37. **Data Binding**: Connecting component TypeScript data to HTML templates using `{{ }}`, `[property]`, `(event)`, or `[(ngModel)]`.
38. **`@for` / `@if`**: Angular's built-in control flow syntax for looping over arrays and conditionally showing HTML blocks.
39. **Route Guard (`CanActivateFn`)**: A function that runs before entering a route (`authGuard`, `roleGuard`) to allow or redirect navigation.
40. **HTTP Interceptor (`HttpInterceptorFn`)**: A function that intercepts every `HttpClient` call (e.g., `jwtInterceptor` adds the JWT header).
41. **Reactive Forms**: Angular forms (`FormBuilder`, `Validators`) defined in TypeScript for strong validation and type safety.
42. **Template-Driven Forms**: Angular forms using `[(ngModel)]` directly in the HTML template (used in filters and modals).
43. **`localStorage`**: Browser storage that keeps small key-value strings (like the JWT and cart) even after refreshing or closing the tab.
44. **Polling**: Repeatedly asking the server for updates on a timer (every 15 seconds in `MyOrdersComponent` and `ManageOrdersComponent`).
45. **Seed Script**: A script (`backend/scripts/seed.js`) that resets and fills the database with sample data for testing and demos.

---

## 10. Questions the Teacher May Ask Us (65+ Q&A)

### A. General and Project
1. **What problem does FoodExpress solve?**
   It digitizes local food ordering and restaurant management in one place. Clients get a clear menu and live order tracking, restaurateurs get an order queue and KPIs, and admins control quality by validating restaurants.
2. **Who are the 3 actors and what can each do?**
   `client` browses validated restaurants, manages a cart, places orders, and tracks/cancels pending orders. `restaurateur` manages their restaurants, categories, dishes, and order statuses. `admin` validates/suspends restaurants, manages global cuisine categories, toggles user active status, and views global stats.
3. **What is the added value of your app compared to a simple CRUD?**
   We enforce real business rules: server-side price recalculation, strict order state-machine transitions (`ORDER_TRANSITIONS`), single-restaurant cart locking, ownership checks, and MongoDB aggregation dashboards with custom SVG/CSS charts.
4. **How did your team of 4 divide the work?**
   Module 1: Auth, Users & App Shell; Module 2: Restaurants, Categories & Dishes; Module 3: Cart, Checkout & Orders; Module 4: Dashboards, Admin Panel & Seed Script.
5. **What would you improve if you had 2 more weeks?**
   We would replace 15-second polling with WebSockets for instant notifications, integrate an online payment gateway (like Stripe) for `en_ligne`, add image file uploads, and write automated backend integration tests.

### B. Technology Choices
6. **Why did you choose MongoDB instead of a SQL database like MySQL?**
   MongoDB stores JSON-like documents that match JavaScript/TypeScript objects naturally. Nested data like `Order.articles` fits cleanly as an embedded array without needing an extra `order_items` join table.
7. **Why Express.js on Node.js?**
   Express is fast, minimal, and lets us use JavaScript on both frontend and backend. Its middleware pipeline (`authMiddleware` -> `roleMiddleware` -> controller) makes route protection very clean.
8. **Why Angular 22 with Standalone Components?**
   Angular gives us TypeScript type safety, built-in routing, guards, HTTP interceptors, and Reactive Forms out of the box. Standalone components remove `NgModule` boilerplate and keep each page self-contained.
9. **Why use JWT instead of server-side sessions?**
   JWTs are stateless: the server doesn't need to store session memory for every logged-in user. The browser sends the signed token in the `Authorization` header, which works cleanly with REST APIs and tools like Postman.
10. **What is Mongoose and why use it over the raw MongoDB driver?**
    Mongoose is an ODM that adds schemas, required/min validation, enum constraints, pre-save hooks (for password hashing), and `.populate()` for linking documents.
11. **What is Bootstrap 5 used for?**
    Bootstrap (`bootstrap.min.css` and `bootstrap-icons`) gives us responsive grid layouts (`row`, `col-md-6`), cards, modals, tables, and badges without writing all CSS from scratch.
12. **What is Postman used for in this project?**
    We use `FoodExpress.postman_collection.json` to test backend API routes directly (with automatic JWT saving) before or independently of the Angular frontend.

### C. MongoDB and Mongoose
13. **What is the difference between a MongoDB collection and a SQL table?**
    A SQL table enforces fixed columns for every row, while a MongoDB collection holds JSON-like documents. Mongoose adds a schema layer on top so our documents stay consistent.
14. **What is an `ObjectId`?**
    It is MongoDB's unique 24-character hex ID (`_id`) generated automatically for every document, used to reference documents across collections (e.g., `Restaurant.owner`).
15. **When did you use references (`ref`) vs. embedded sub-documents?**
    We used `ref` (`ObjectId`) between `User`, `Restaurant`, `Category`, and `Dish` because they live independently. We embedded `articles` inside `Order` because order items belong only to that order.
16. **Why does `Order.articles` store `nom` and `prixUnitaire` if it already has `plat` (`ObjectId`)?**
    To keep a historical snapshot. If a restaurant later renames a dish, changes its price, or deletes it, the client's past receipt still shows the exact name and price they paid.
17. **What does `.populate()` do? Give an example.**
    `.populate()` replaces a stored `ObjectId` with fields from the linked document. In `orderController.js`, `Order.find(...).populate('restaurant', 'nom image')` lets Angular display the restaurant's name without a second API call.
18. **How does the aggregation pipeline work in `dashboardController.js`?**
    In `getRestaurantDashboard`, `Order.aggregate` uses `$match` (filter by restaurant and non-cancelled), `$unwind: '$articles'` (split each item into its own row), `$group` (sum quantities by dish name), `$sort`, and `$limit: 5` to find the top 5 dishes.
19. **Do you have any indexes in MongoDB?**
    `User.js` creates a unique index on `email` (`unique: true`), which prevents duplicate accounts and speeds up login lookups. Other collections rely on the default `_id` index.

### D. Backend
20. **What is middleware in Express?**
    A function `(req, res, next)` that runs before a route handler. It can inspect/modify `req`, end the request early with an error (like `401`), or call `next()` to continue.
21. **Explain `authMiddleware.js` step by step.**
    1) Reads the `Authorization` header and splits `Bearer <token>`. 2) If missing, returns `401`. 3) Verifies the token with `jwt.verify(token, process.env.JWT_SECRET)`. 4) Finds the user by `payload.id` without password. 5) Returns `401` if not found, `403` if `isActive === false`. 6) Sets `req.user = user` and calls `next()`.
22. **What is the difference between authentication and authorization?**
    Authentication proves *who you are* (`authMiddleware.js`). Authorization checks *what you are allowed to do* (`roleMiddleware.js` `authorize('admin')` or ownership checks in controllers).
23. **Explain the HTTP status codes used in your backend.**
    `200` OK, `201` Created (register, create dish/order), `400` Bad Request (validation/invalid transition), `401` Unauthorized (missing/bad token or login), `403` Forbidden (wrong role, disabled account, not owner), `404` Not Found, `409` Conflict (duplicate email), `500` Server Error.
24. **Why do you use `bcryptjs` instead of `crypto.createHash('sha256')`?**
    `sha256` is too fast—attackers can guess billions of passwords per second. `bcrypt` is intentionally slow (cost factor `12` in `User.js`) and adds a unique random salt per user.
25. **What is inside your JWT payload?**
    Only `{ id: user.id, role: user.role }` (`authController.js`), signed with `JWT_SECRET` and `expiresIn: '7d'`. We never put passwords or sensitive personal data in the JWT.
26. **Why is `app.use(cors())` in `server.js`?**
    CORS allows requests from different origins (like `localhost:4200` or Postman) to reach `localhost:5000` without being blocked by browser security.
27. **Why do we use `.env` and `dotenv`?**
    To keep secrets (`MONGO_URI`, `JWT_SECRET`) and machine settings (`PORT`) out of the source code so they aren't leaked on GitHub.
28. **Why are `/mine`, `/admin/all`, and `/cuisines` declared before `/:id` in `restaurantRoutes.js`?**
    Express matches routes top-to-bottom. If `/:id` came first, Express would think `"mine"` or `"cuisines"` is an `:id` parameter and fail!
29. **What happens when a restaurant is deleted (`DELETE /api/restaurants/:id`)?**
    `restaurantController.deleteRestaurant()` performs a cascade delete: it deletes all `Dish` and `Category` documents belonging to that restaurant before deleting the restaurant itself.
30. **Why does `deleteCategory` refuse if dishes exist?**
    In `categoryController.js`, it counts `Dish.countDocuments({ categorie: category._id })`. If `> 0`, it returns `400` so dishes aren't left pointing to a deleted category.

### E. Frontend
31. **What is the difference between an Angular Component and a Service?**
    A Component controls a piece of the screen (HTML + UI events). A Service holds shared data or HTTP logic (`AuthService`, `CartService`) so components stay clean and don't duplicate API calls.
32. **What is a Standalone Component?**
    A component with `standalone: true` that lists its dependencies directly in `imports: [...]` instead of being declared inside an `NgModule`.
33. **What kinds of data binding do you use?**
    Interpolation (`{{ restaurant.nom }}`), property binding (`[src]="dish.image"`), event binding (`(click)="addToCart(dish)"`), and two-way binding (`[(ngModel)]="search"`).
34. **What is `@for` and `@if` in Angular 22?**
    Modern built-in control flow blocks replacing `*ngFor` and `*ngIf`. `@for` requires `track` (e.g., `track dish._id`) so Angular can update the DOM efficiently.
35. **How does `authGuard` work?**
    In `auth.guard.ts`, it injects `AuthService` and `Router`. If `auth.isLoggedIn()` is true, it returns `true`; otherwise it returns `router.createUrlTree(['/login'])`.
36. **How does `roleGuard` work?**
    In `role.guard.ts`, it reads `route.data['roles']` and checks if `auth.getRole()` is included. If not, it redirects to the user's role-specific home page.
37. **How does `jwtInterceptor` work?**
    It intercepts every HTTP request whose URL contains `api/`, reads the token from `AuthService.getToken()`, and clones the request with `Authorization: Bearer <token>`.
38. **What is the difference between an Observable and a Promise?**
    A Promise runs immediately and returns one value. An Observable (used by `HttpClient` and `BehaviorSubject`) is lazy (runs on `.subscribe()`), can emit multiple values over time (like `cart$` or `interval(15000)`), and can be cancelled (`.unsubscribe()`).
39. **Why do `LoginComponent` and `CheckoutComponent` use Reactive Forms while modals use `ngModel`?**
    Reactive Forms (`FormBuilder`, `Validators`) are great for complex validation (like `matchingPasswords` in `RegisterComponent`). `ngModel` is quick and simple for search inputs and small modals.
40. **How does the cart survive a page refresh?**
    `CartService.update()` saves the `CartState` JSON into `localStorage` under `'foodexpress_cart'`, and `readCart()` loads it back when the app starts.
41. **How does `proxy.conf.json` work?**
    When running `ng serve`, any request to `/api/...` is forwarded by the Angular dev server to `http://localhost:5000`, avoiding CORS issues in development.
42. **How does the Admin Statistics donut chart work without a chart library?**
    `StatisticsComponent.buildChartSegments()` calculates each status's circumference fraction and sets `stroke-dasharray` and `stroke-dashoffset` on SVG `<circle>` elements.

### F. Business Rules
43. **Explain the order lifecycle and `ORDER_TRANSITIONS`.**
    An order starts as `en_attente`. It can move to `acceptee` -> `en_preparation` -> `en_livraison` -> `livree`. It can only be `annulee` from `en_attente` or `acceptee`.
44. **Why can't a `livree` or `annulee` order be changed?**
    In `orderController.js`, `ORDER_TRANSITIONS.livree` and `ORDER_TRANSITIONS.annulee` are empty arrays `[]`, and the controller explicitly rejects changes with `400 Order can no longer be modified` because those are final states.
45. **Why does the server recompute the order total?**
    Because anything sent from the browser can be modified by a user in DevTools or Postman. `orderController.createOrder()` reads `dish.prix` and `restDoc.fraisLivraison` directly from MongoDB.
46. **What happens if a dish becomes unavailable while it is in a client's cart?**
    When the client clicks "Confirm & Place Order", `orderController.createOrder()` checks `dish.disponible` in MongoDB, collects unavailable dishes, and returns `400` with a clear message listing them.
47. **Can a client order from two restaurants in the same order?**
    No. Each `Order` has one `restaurant` field, and `CartService.addItem()` asks the user to confirm clearing the cart if they add a dish from a different restaurant.
48. **How is revenue calculated on the dashboards?**
    Both `getRestaurantDashboard` and `getAdminDashboard` sum `total` for all orders where `statut !== 'annulee'`.

### G. Security and "What If" Questions
49. **What if a user edits their JWT in `localStorage` to change `role` from `client` to `admin`?**
    Even if Angular's UI changes, the JWT signature will no longer match `JWT_SECRET`. Every backend call will fail in `authMiddleware.js` with `401 Invalid or expired token`.
50. **What if someone calls `POST /api/orders` directly from Postman without Angular?**
    `authMiddleware` requires a valid JWT, `authorize('client')` requires the client role, and `createOrder` validates the restaurant, dish availability, and prices on the server.
51. **What if a `client` types `/admin/users` in the browser address bar?**
    `roleGuard` sees `role === 'client'` is not in `['admin']` and redirects them back to `/`. Even if they called `GET /api/users` directly, the backend returns `403 Forbidden`.
52. **What if a `restaurateur` tries to edit or delete another restaurateur's restaurant or dish?**
    `restaurantController` and `dishController` compare `restDoc.owner.toString()` with `req.user._id.toString()` and return `403 Forbidden`.
53. **What happens when a JWT expires (after 7 days)?**
    `jwt.verify` throws `TokenExpiredError`, and `authMiddleware.js` returns `401 Invalid or expired token`. The user must log in again to get a new token.
54. **What if an admin tries to deactivate their own account?**
    Both `UsersComponent` (disables the button) and `userController.toggleActive()` (`if (req.params.id === req.user.id) return 400`) block self-deactivation.

### H. "Explain This Module" (Cross-Team Questions)
55. **Module 1 (Auth, Users & Shell): Explain how `User.js`, `authController.js`, and `AuthService` work together.**
    `User.js` defines the schema and hashes passwords in `pre('save')`. `authController.js` handles register/login/profile and signs JWTs. `AuthService` calls those endpoints, saves the token and user in `localStorage`, and exposes `currentUser$` to `NavbarComponent` and guards.
56. **Module 2 (Restaurants, Categories & Dishes): How do public browsing and restaurateur management share the same models?**
    Public routes (`GET /api/restaurants`) filter by `status: 'validated'`, while `GET /api/restaurants/mine` returns all restaurants owned by the logged-in restaurateur regardless of status so they can build their menu while `pending`.
57. **Module 3 (Cart & Orders): How does data flow from `RestaurantDetailsComponent` to `MyOrdersComponent`?**
    `RestaurantDetailsComponent` adds dishes to `CartService` (`localStorage`). `CheckoutComponent` sends IDs and quantities to `OrderService.createOrder()`, which hits `orderController.createOrder()` to save the `Order`. `MyOrdersComponent` polls `GET /api/orders/my-orders` every 15s to show the 5-step progress.
58. **Module 4 (Dashboards, Admin & Seed): How do `dashboardController.js` and `StatisticsComponent` work?**
    `dashboardController.getAdminDashboard()` runs parallel `countDocuments` and `Order.aggregate` queries to count clients, restaurants, orders, global revenue, and counts per status. `StatisticsComponent` converts `ordersByStatus` into SVG donut segments and CSS progress bars.

### I. "Live Challenge" Questions During the Demo
59. **Challenge: Add a `tempsPreparation` (preparation time in minutes) field to `Dish`.**
    1) `backend/models/Dish.js`: Add `tempsPreparation: { type: Number, default: 15, min: 0 }`.
    2) `backend/controllers/dishController.js`: Read `tempsPreparation` in `createDish` and `updateDish`.
    3) `frontend/src/app/core/models/restaurant.model.ts`: Add `tempsPreparation?: number` to `Dish`.
    4) `manage-dishes.component.ts` & `restaurant-details.component.ts`: Add the input in the dish modal and display it on the dish card.
60. **Challenge: Add a `maxDeliveryFee` filter to restaurant browsing.**
    1) `backend/controllers/restaurantController.js`: In `getRestaurants`, read `maxDeliveryFee` from `req.query` and add `query.fraisLivraison = { $lte: Number(maxDeliveryFee) }`.
    2) `frontend/src/app/core/models/restaurant.model.ts`: Add `maxDeliveryFee?: number` to `RestaurantQueryFilters`.
    3) `frontend/src/app/core/services/restaurant.service.ts`: Append `params.set('maxDeliveryFee', ...)` in `getRestaurants()`.
    4) `frontend/src/app/pages/restaurants/restaurants.component.ts`: Add the filter input and pass it in `fetchRestaurants()`.
61. **Challenge: Change minimum password length from 8 to 10 characters.**
    1) `backend/controllers/authController.js`: Change `password.length < 8` to `< 10` in `register` and `updateProfile`.
    2) `frontend/src/app/pages/register/register.component.ts` & `profile.component.ts`: Change `Validators.minLength(8)` to `Validators.minLength(10)` and update the error message text.
62. **Challenge: Add a route `GET /api/orders/stats/today` for admin to count today's orders.**
    1) `backend/controllers/orderController.js`: Write `getTodayOrdersCount` using `Order.countDocuments({ createdAt: { $gte: startOfDay } })`.
    2) `backend/routes/orderRoutes.js`: Add `router.get('/stats/today', authMiddleware, authorize('admin'), orderController.getTodayOrdersCount)` **before** `router.get('/:id', ...)`.
    3) `frontend/src/app/core/services/order.service.ts`: Add `getTodayCount()` calling `GET /api/orders/stats/today`.
63. **Challenge: Allow a restaurateur to mark a dish unavailable in one click.**
    Already implemented! `ManageDishesComponent.toggleDishAvailability(dish)` calls `dishService.update(dish._id, { disponible: !dish.disponible })` -> `PUT /api/dishes/:id`.
64. **Challenge: Add a new cuisine category via the UI.**
    Log in as Admin, go to `/admin/restaurants`, scroll to **Cuisine Categories**, type the name, and click **+ Add** (`POST /api/categories` with `restaurant: null`).
65. **Challenge: Show why a client cannot cancel an `acceptee` order.**
    In `MyOrdersComponent`, the "Cancel Order" button has `@if (order.statut === 'en_attente')`. On the backend, `orderController.updateOrderStatus()` checks `order.statut !== 'en_attente'` for clients and returns `403`.

---

## 11. Cheat Sheet for the Oral Presentation

### Module 1: Auth, Users & App Shell
- **What it does**: Handles registration, login, JWT tokens, role-based access, profile updates, and the main navbar/footer shell.
- **5 Key Files**: `backend/models/User.js`, `backend/controllers/authController.js`, `backend/middleware/authMiddleware.js`, `frontend/src/app/core/services/auth.service.ts`, `frontend/src/app/core/interceptors/jwt.interceptor.ts`.
- **3 Things to Say**:
  1. Passwords are never stored in plain text—`User.js` hashes them with `bcrypt` (salt rounds = 12).
  2. `AuthService` stores the JWT in `localStorage`, and `jwtInterceptor` attaches it to every `/api/` request automatically.
  3. `authGuard` and `roleGuard` protect Angular pages, while `authMiddleware` and `roleMiddleware` enforce real security on the server.
- **2 Likely Questions**: *What is inside the JWT?* (`{ id, role }`) / *What happens if an account is disabled?* (`403 Account disabled` in both login and `authMiddleware`).

### Module 2: Restaurants, Categories & Dishes
- **What it does**: Lets clients search/filter validated restaurants and browse menus, and lets restaurateurs manage their restaurants, categories, and dishes.
- **5 Key Files**: `backend/models/Restaurant.js`, `backend/models/Dish.js`, `backend/controllers/restaurantController.js`, `frontend/src/app/pages/restaurants/restaurants.component.ts`, `frontend/src/app/pages/restaurant-dashboard/manage-dishes/manage-dishes.component.ts`.
- **3 Things to Say**:
  1. New restaurants start as `pending` until an admin validates them; public `GET /api/restaurants` only shows `validated` ones.
  2. `Category` is reused for both global cuisine types (`restaurant: null`) and per-restaurant menu sections (`restaurant: id`).
  3. Deleting a restaurant cascade-deletes its dishes and categories, while deleting a category with dishes is blocked (`400`).
- **2 Likely Questions**: *Why are `/mine` and `/cuisines` before `/:id`?* (Route matching order) / *How does pagination work?* (`skip` + `limit` + `countDocuments` in `Promise.all`).

### Module 3: Cart, Checkout & Orders
- **What it does**: Manages the single-restaurant shopping cart in `localStorage`, places orders with server-side price validation, and tracks/updates order status.
- **5 Key Files**: `backend/models/Order.js`, `backend/controllers/orderController.js`, `frontend/src/app/core/services/cart.service.ts`, `frontend/src/app/pages/checkout/checkout.component.ts`, `frontend/src/app/pages/my-orders/my-orders.component.ts`.
- **3 Things to Say**:
  1. `CartService` persists items in `localStorage` and enforces one restaurant per cart.
  2. `CheckoutComponent` sends only dish IDs and quantities; `orderController.createOrder()` recalculates prices from MongoDB and saves a snapshot (`nom`, `prixUnitaire`).
  3. `ORDER_TRANSITIONS` enforces a strict lifecycle (`en_attente` -> `acceptee` -> `en_preparation` -> `en_livraison` -> `livree`), and `MyOrdersComponent` polls every 15s.
- **2 Likely Questions**: *Why store `nom` and `prixUnitaire` in `Order.articles`?* (Snapshot if menu changes) / *When can a client cancel?* (Only `en_attente`).

### Module 4: Dashboards, Admin Panel & Seed
- **What it does**: Provides KPIs and charts for restaurateurs and admins, user/restaurant administration, and a database seed script.
- **5 Key Files**: `backend/controllers/dashboardController.js`, `backend/controllers/userController.js`, `backend/scripts/seed.js`, `frontend/src/app/pages/restaurant-dashboard/dashboard/dashboard.component.ts`, `frontend/src/app/pages/admin-dashboard/statistics/statistics.component.ts`.
- **3 Things to Say**:
  1. `dashboardController.js` uses MongoDB aggregation pipelines (`$match`, `$unwind`, `$group`, `$sort`) to compute revenue (excluding `annulee`) and top 5 dishes.
  2. `StatisticsComponent` renders a pure SVG donut chart and CSS bars without any external chart library.
  3. `seed.js` clears all 5 collections and inserts 6 users, 20 categories, 5 restaurants, 19 dishes, and 10 orders across all statuses.
- **2 Likely Questions**: *Are cancelled orders counted in revenue?* (No, `$ne: 'annulee'`) / *Can an admin deactivate themselves?* (No, blocked in UI and `userController.js`).

---

## 12. Known Gaps and Limitations

Being honest about limitations shows maturity during an oral defense. Here are the real gaps currently in the codebase and how we can answer if asked ("future improvements"):

1. **Duplicate `provideHttpClient` in `frontend/src/app/app.config.ts`**: Lines 13–14 call `provideHttpClient` twice (first with `[jwtInterceptor]`, then with `[jwtInterceptor, refreshInterceptor]`). *Future fix*: Remove the redundant line 13.
2. **Online payment (`en_ligne`) is disabled in the UI**: The backend `Order` model and `orderController.js` accept `'en_ligne'`, and `seed.js` creates some `'en_ligne'` orders, but `CheckoutComponent` disables the card option with a "Coming soon" badge. *Future fix*: Integrate Stripe or a Tunisian payment gateway.
3. **15-second polling instead of WebSockets**: `MyOrdersComponent` and `ManageOrdersComponent` use `interval(15000)` to refresh orders. *Future fix*: Add Socket.io for instant push notifications.
4. **No image file upload**: Restaurant and dish images are URL strings (e.g., Unsplash links) rather than uploaded files. *Future fix*: Add Multer + Cloudinary or local static file serving.
5. **Restaurateur "Manage Orders" lacks a restaurant dropdown**: `OrderService.getRestaurantOrders()` supports filtering by `restaurantId`, but `ManageOrdersComponent` fetches all owned restaurants' orders together. *Future fix*: Add a restaurant selector like on `RestaurantDashboardComponent`.
6. **No automatic logout on expired/401 tokens**: If a JWT expires or a user is deactivated mid-session, `jwtInterceptor` doesn't catch `401`/`403` to auto-redirect to `/login`. *Future fix*: Add an error interceptor handling `401`.
7. **Unused `PlaceholderPageComponent` & minimal automated tests**: `shared/placeholder-page/placeholder-page.component.ts` is leftover scaffolding, and only `app.spec.ts` / `cart.service.spec.ts` exist (no backend test suite). *Future fix*: Remove unused placeholder and add Jest/Supertest API tests.
8. **No custom MongoDB indexes beyond `User.email`**: Frequent query fields (`restaurant`, `client`, `statut`) don't have explicit `.index()` definitions yet. *Future fix*: Add compound indexes for production scale.
9. **`backend/.env.example` contains a sample Atlas URI with credentials**: Instead of placeholder text, `backend/.env.example` currently has a concrete connection string. *Future fix*: Replace with `MONGO_URI=mongodb://127.0.0.1:27017/foodexpress` and rotate credentials.
