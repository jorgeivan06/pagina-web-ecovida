import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
    <div [class.admin-mode]="isAdminRoute">
      <!-- BARRA SUPERIOR (MODO ADMIN) -->
      <div *ngIf="isAdminRoute" class="admin-top-bar">
        <div class="container bar-content">
          <span class="badge"><i class="fas fa-user-shield"></i> PANEL ADMINISTRATIVO</span>
          <span class="status-text hidden-mobile">Sincronizado con la Nube</span>
        </div>
      </div>

      <!-- NAVEGACIÓN PRINCIPAL -->
      <header class="main-header">
        <div class="container header-container">
          <div class="logo-area">
            <a href="/">
              <img src="https://static.wixstatic.com/media/7e16b4_47f971106b36479a905498b01633c52e~mv2.png/v1/fill/w_283,h_75,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Ecovida%20blanco%20y%20verde.png" alt="ECOVIDA">
            </a>
          </div>

          <!-- BOTÓN MÓVIL -->
          <button class="menu-toggle" (click)="toggleMenu()" aria-label="Abrir menú">
            <i class="fas" [ngClass]="isMenuOpen ? 'fa-times' : 'fa-bars'"></i>
          </button>

          <!-- MENÚ DE NAVEGACIÓN -->
          <nav class="nav-wrapper" [class.is-active]="isMenuOpen">
            <ul class="nav-links">
              <li><a href="/" (click)="closeMenu()">Inicio</a></li>
              <li><a href="/financiero" [class.active]="!isAdminRoute" (click)="closeMenu()">Documentos</a></li>
              <li class="admin-action">
                <a href="/financiero/admin" class="btn-admin-nav" [class.is-admin]="isAdminRoute" (click)="closeMenu()">
                  <i class="fas" [ngClass]="isAdminRoute ? 'fa-chart-pie' : 'fa-lock'"></i>
                  <span>{{ isAdminRoute ? 'Gestionar' : 'Acceso Admin' }}</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <!-- CONTENIDO PRINCIPAL -->
      <main class="page-wrapper">
        <router-outlet></router-outlet>
      </main>

      <!-- PIE DE PÁGINA -->
      <footer class="main-footer">
        <div class="container footer-grid">
          <div class="footer-info">
            <img src="https://static.wixstatic.com/media/7e16b4_077240b038f34a1ba66ff0ee07287ffa~mv2.png/v1/fill/w_470,h_83,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/El%20Coraz%C3%B3n%20de%20Mam%C3%A1.png" alt="Ecovida Corazón">
            <p>Tu bienestar es nuestra prioridad.</p>
          </div>
          <div class="footer-links" *ngIf="!isAdminRoute">
            <h4>Secciones</h4>
            <a href="/">Inicio</a>
            <a href="/#nosotros">Nosotros</a>
            <a href="/#servicios">Servicios</a>
          </div>
          <div class="footer-contact">
            <h4>Contacto</h4>
            <p><i class="fas fa-phone"></i> (600) 000 0000</p>
            <p><i class="fab fa-whatsapp"></i> 300 000 0000</p>
          </div>
        </div>
        <div class="footer-copyright">
          <p>&copy; 2026 ECOVIDA SAS. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  `
})
export class AppComponent {
  isAdminRoute = false;
  isMenuOpen = false;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isAdminRoute = event.url.includes('/admin');
      window.scrollTo(0, 0); // Reset scroll on navigation
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }
}
