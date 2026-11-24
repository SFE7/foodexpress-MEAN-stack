import { Component } from '@angular/core';
import { PlaceholderPageComponent } from '../../shared/placeholder-page/placeholder-page.component';

@Component({ selector: 'app-home', standalone: true, imports: [PlaceholderPageComponent], template: '<app-placeholder-page title="Home" />' })
export class HomeComponent {}
