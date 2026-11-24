import { Component } from '@angular/core';
import { PlaceholderPageComponent } from '../../../shared/placeholder-page/placeholder-page.component';

@Component({ selector: 'app-admin-users', standalone: true, imports: [PlaceholderPageComponent], template: '<app-placeholder-page title="Users" />' })
export class UsersComponent {}
