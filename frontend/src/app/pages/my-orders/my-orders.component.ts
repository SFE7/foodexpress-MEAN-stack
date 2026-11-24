import { Component } from '@angular/core';
import { PlaceholderPageComponent } from '../../shared/placeholder-page/placeholder-page.component';

@Component({ selector: 'app-my-orders', standalone: true, imports: [PlaceholderPageComponent], template: '<app-placeholder-page title="My Orders" />' })
export class MyOrdersComponent {}
