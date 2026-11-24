import { Component } from '@angular/core';
import { PlaceholderPageComponent } from '../../../shared/placeholder-page/placeholder-page.component';

@Component({ selector: 'app-admin-restaurants', standalone: true, imports: [PlaceholderPageComponent], template: '<app-placeholder-page title="Restaurants" />' })
export class AdminRestaurantsComponent {}
