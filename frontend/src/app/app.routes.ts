/**
 * FILE: frontend/src/app/app.routes.ts
 * ROLE: Angular route table.
 * USED BY / TALKS TO: Router and page components.
 * KEY IDEA: Each route chooses a page and optional guards.
 */
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { CartComponent } from './pages/cart/cart.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { MyOrdersComponent } from './pages/my-orders/my-orders.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { RegisterComponent } from './pages/register/register.component';
import { RestaurantDetailsComponent } from './pages/restaurant-details/restaurant-details.component';
import { RestaurantsComponent } from './pages/restaurants/restaurants.component';
import { RestaurantDashboardComponent } from './pages/restaurant-dashboard/dashboard/dashboard.component';
import { ManageDishesComponent } from './pages/restaurant-dashboard/manage-dishes/manage-dishes.component';
import { ManageOrdersComponent } from './pages/restaurant-dashboard/manage-orders/manage-orders.component';
import { UsersComponent } from './pages/admin-dashboard/users/users.component';
import { AdminRestaurantsComponent } from './pages/admin-dashboard/restaurants/restaurants.component';
import { StatisticsComponent } from './pages/admin-dashboard/statistics/statistics.component';

export const routes: Routes = [
  // Public home route: any visitor can open it without a guard.
  { path: '', component: HomeComponent },
  // Public restaurant list; browsing does not require login.
  { path: 'restaurants', component: RestaurantsComponent },
  // Public restaurant details: the optional server auth may personalize data.
  { path: 'restaurants/:id', component: RestaurantDetailsComponent },
  // Login and registration are public so visitors can create sessions.
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  // Cart is public locally, but checkout requires login and the client role.
  { path: 'cart', component: CartComponent },
  // SECURITY: authGuard checks login and roleGuard checks the client role.
  { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard, roleGuard], data: { roles: ['client'] } },
  // Client-only order history.
  { path: 'my-orders', component: MyOrdersComponent, canActivate: [authGuard, roleGuard], data: { roles: ['client'] } },
  // Profile requires login but has no role restriction.
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  // Restaurateurs and admins may open the restaurant dashboard.
  {
    path: 'restaurant-dashboard',
    component: RestaurantDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['restaurateur', 'admin'] },
  },
  // Menu management is restricted to restaurateur or admin roles.
  {
    path: 'restaurant-dashboard/dishes',
    component: ManageDishesComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['restaurateur', 'admin'] },
  },
  // Restaurant order management uses the same role restriction.
  {
    path: 'restaurant-dashboard/orders',
    component: ManageOrdersComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['restaurateur', 'admin'] },
  },
  // Admin-only user, restaurant, and statistics pages.
  { path: 'admin/users', component: UsersComponent, canActivate: [authGuard, roleGuard], data: { roles: ['admin'] } },
  { path: 'admin/restaurants', component: AdminRestaurantsComponent, canActivate: [authGuard, roleGuard], data: { roles: ['admin'] } },
  { path: 'admin/statistics', component: StatisticsComponent, canActivate: [authGuard, roleGuard], data: { roles: ['admin'] } },
  { path: '**', redirectTo: '' },
];
