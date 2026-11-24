import { Component } from '@angular/core';
import { PlaceholderPageComponent } from '../../shared/placeholder-page/placeholder-page.component';

@Component({ selector: 'app-checkout', standalone: true, imports: [PlaceholderPageComponent], template: '<app-placeholder-page title="Checkout" />' })
export class CheckoutComponent {}
