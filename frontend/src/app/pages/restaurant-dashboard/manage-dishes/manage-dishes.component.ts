import { Component } from '@angular/core';
import { PlaceholderPageComponent } from '../../../shared/placeholder-page/placeholder-page.component';

@Component({ selector: 'app-manage-dishes', standalone: true, imports: [PlaceholderPageComponent], template: '<app-placeholder-page title="Manage Dishes" />' })
export class ManageDishesComponent {}
