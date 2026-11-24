import { Component } from '@angular/core';
import { PlaceholderPageComponent } from '../../shared/placeholder-page/placeholder-page.component';

@Component({ selector: 'app-cart-page', standalone: true, imports: [PlaceholderPageComponent], template: '<app-placeholder-page title="Cart" />' })
export class CartComponent {}
