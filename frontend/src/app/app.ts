/**
 * FILE: frontend/src/app/app.ts
 * ROLE: Root Angular component.
 * USED BY / TALKS TO: app.html and shared shell components.
 * KEY IDEA: Signals control which shell UI is visible.
 */
import { ChangeDetectionStrategy } from '@angular/core';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FooterComponent } from './shared/footer/footer.component';
import { NavbarComponent } from './shared/navbar/navbar.component';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
// KEY: Dependency injection supplies shared services to this class.
export class App {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly showShell = signal(true);

  constructor() {
    this.updateShell();
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.updateShell());
  }

  private updateShell(): void {
    const path = this.router.url.split('?')[0];
    this.showShell.set(path !== '/login' && path !== '/register');
  }
}
