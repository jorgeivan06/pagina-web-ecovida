import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
    <!-- BARRA SUPERIOR DE ESTADO (INDICADOR DE ROL) -->
    <div *ngIf="isAdminRoute" class="admin-status-bar">
      <div class="container">
        <span class="badge-admin"><i class="fas fa-user-shield"></i> MODO ADMINISTRADOR</span>
        <span class="admin-msg">Estás gestionando el contenido público</span>
      </div>
    </div>

    <header class="navbar" [class.admin-nav]="isAdminRoute">
      <div class="container nav-content">
        <div class="logo">
          <a href="/">
            <img src="https://static.wixstatic.com/media/7e16b4_47f971106b36479a905498b01633c52e~mv2.png/v1/fill/w_283,h_75,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Ecovida%20blanco%20y%20verde.png" alt="ECOVIDA">
          </a>
        </div>
        <nav>
          <ul class="nav-menu" id="nav-menu">
            <li><a href="/">Inicio</a></li>
            <li><a href="/financiero" [class.active]="!isAdminRoute">Documentos</a></li>
            <li>
              <a href="/financiero/admin" class="btn-nav" [class.btn-admin]="isAdminRoute">
                <i class="fas" [ngClass]="isAdminRoute ? 'fa-tachometer-alt' : 'fa-lock'"></i>
                {{ isAdminRoute ? 'Panel Control' : 'Acceso Admin' }}
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>

    <main [style.padding-top]="isAdminRoute ? '180px' : '150px'" style="min-height: 80vh;">
      <router-outlet></router-outlet>
    </main>

    <footer class="footer">
      <div class="container footer-grid-main">
        <div class="footer-brand-side">
          <img src="https://static.wixstatic.com/media/7e16b4_077240b038f34a1ba66ff0ee07287ffa~mv2.png/v1/fill/w_470,h_83,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/El%20Coraz%C3%B3n%20de%20Mam%C3%A1.png" alt="El Corazón de Mamá">
          <p>Tu bienestar es el latido que nos mueve.</p>
        </div>
        <div class="footer-contact-side">
          <h4><i class="fas fa-phone-alt"></i> Contacto Admin</h4>
          <p>Soporte Técnico: ext 105</p>
          <p>Email: sistemas@ecovida.com</p>
        </div>
        <div class="footer-hours-side">
          <h4><i class="fas fa-shield-alt"></i> Seguridad</h4>
          <p>Sesión protegida por encriptación SSL</p>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2026 ECOVIDA SAS. Panel de Gestión Financiera.</p>
      </div>
    </footer>
  `,
  styles: [`
    .admin-status-bar {
      background: #2c3e50;
      color: white;
      padding: 8px 0;
      font-size: 0.8rem;
      position: fixed;
      top: 0;
      width: 100%;
      z-index: 2100;
      border-bottom: 2px solid var(--accent);
    }

    .badge-admin {
      background: var(--accent);
      padding: 3px 10px;
      border-radius: 20px;
      font-weight: 700;
      margin-right: 15px;
      letter-spacing: 1px;
    }

    .admin-nav {
      top: 35px !important;
      border-bottom: 4px solid var(--accent);
    }

    .btn-admin {
      background: var(--accent) !important;
    }

    .nav-menu a.active {
      color: var(--accent);
    }

    .nav-menu a.active::after {
      width: 100% !important;
    }
  `]
})
export class AppComponent {
  isAdminRoute = false;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isAdminRoute = event.url.includes('/admin');
    });
  }
}
