/**
 * FILE: frontend/src/app/shared/placeholder-page/placeholder-page.component.ts
 * ROLE: Reusable Angular UI component.
 * USED BY / TALKS TO: Parent components and app shell.
 * KEY IDEA: Reusable UI keeps the project consistent.
 */
import { ChangeDetectionStrategy } from '@angular/core';
import { Component, Input } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-placeholder-page',
  standalone: true,
  template: `
    <section class="container py-5">
      <div class="food-card card p-5 text-center">
        <p class="eyebrow mb-2">FOODEXPRESS</p>
        <h1 class="h2 fw-bold mb-0">{{ title }} - Coming Soon</h1>
      </div>
    </section>
  `,
  styles: [`
    .eyebrow { color: #e4572e; font-size: .75rem; font-weight: 800; letter-spacing: .12em; }
  `],
})
// KEY: Dependency injection supplies shared services to this class.
export class PlaceholderPageComponent {
  @Input({ required: true }) title = '';
}
