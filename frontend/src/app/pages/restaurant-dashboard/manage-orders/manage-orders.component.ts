import { Component } from '@angular/core';
import { PlaceholderPageComponent } from '../../../shared/placeholder-page/placeholder-page.component';

@Component({ selector: 'app-manage-orders', standalone: true, imports: [PlaceholderPageComponent], template: '<app-placeholder-page title="Manage Orders" />' })
export class ManageOrdersComponent {}
