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
  { path: '', component: HomeComponent },
  { path: 'restaurants', component: RestaurantsComponent },
  { path: 'restaurants/:id', component: RestaurantDetailsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'cart', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard, roleGuard], data: { roles: ['client'] } },
  { path: 'my-orders', component: MyOrdersComponent, canActivate: [authGuard, roleGuard], data: { roles: ['client'] } },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  {
    path: 'restaurant-dashboard',
    component: RestaurantDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['restaurateur', 'admin'] },
  },
  {
    path: 'restaurant-dashboard/dishes',
    component: ManageDishesComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['restaurateur', 'admin'] },
  },
  {
    path: 'restaurant-dashboard/orders',
    component: ManageOrdersComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['restaurateur', 'admin'] },
  },
  { path: 'admin/users', component: UsersComponent, canActivate: [authGuard, roleGuard], data: { roles: ['admin'] } },
  { path: 'admin/restaurants', component: AdminRestaurantsComponent, canActivate: [authGuard, roleGuard], data: { roles: ['admin'] } },
  { path: 'admin/statistics', component: StatisticsComponent, canActivate: [authGuard, roleGuard], data: { roles: ['admin'] } },
  { path: '**', redirectTo: '' },
];
