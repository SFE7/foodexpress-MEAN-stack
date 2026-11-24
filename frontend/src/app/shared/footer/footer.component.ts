import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="food-footer mt-5">
      <div class="container py-4 d-flex flex-column flex-md-row justify-content-between gap-2">
        <a class="footer-brand" routerLink="/">FoodExpress</a>
        <span>Good food, delivered with care.</span>
        <span>© {{ year }} FoodExpress</span>
      </div>
    </footer>
  `,
  styles: [`
    .food-footer { background: #1f2937; color: #f9fafb; }
    .footer-brand { color: #fff; font-weight: 800; text-decoration: none; }
    .food-footer span { color: #d1d5db; font-size: .9rem; }
  `],
})
export class FooterComponent {
  protected readonly year = new Date().getFullYear();
}
