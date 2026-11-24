import { Component } from '@angular/core';
import { PlaceholderPageComponent } from '../../shared/placeholder-page/placeholder-page.component';

@Component({ selector: 'app-restaurant-details', standalone: true, imports: [PlaceholderPageComponent], template: '<app-placeholder-page title="Restaurant Details" />' })
export class RestaurantDetailsComponent {}
