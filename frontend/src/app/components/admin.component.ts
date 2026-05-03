import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentoService, Documento } from '../services/documento.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-5 mb-5">
      <!-- FORMULARIO DE ACCESO MEJORADO -->
      <div *ngIf="!isAdmin" class="login-card">
        <div class="login-header">
          <div class="icon-circle">
            <i class="fas fa-lock-open"></i>
          </div>
          <h3>Acceso Administrativo</h3>
          <p>Portal de gestión de documentos financieros</p>
        </div>
        
        <div class="login-body">
          <div class="input-group">
            <label for="password"><i class="fas fa-key"></i> Clave de Seguridad</label>
            <input 
              id="password"
              type="password" 
              [(ngModel)]="password" 
              (keyup.enter)="login()"
              placeholder="Ingrese su clave" 
              class="portal-input-styled"
            >
          </div>
          
          <button (click)="login()" class="btn btn-primary btn-block">
            <i class="fas fa-sign-in-alt"></i> Entrar al Panel
          </button>
          
          <div *ngIf="loginError" class="error-alert">
            <i class="fas fa-exclamation-circle"></i> {{ loginError }}
          </div>
        </div>
        
        <div class="login-footer">
          <a href="/financiero"><i class="fas fa-arrow-left"></i> Volver al listado público</a>
        </div>
      </div>

      <!-- PANEL DE ADMINISTRACIÓN -->
      <div *ngIf="isAdmin" class="text-center animate-fade-in">
        <div class="admin-header-box mb-5">
          <h2 class="title-section">Panel de Control</h2>
          <p class="text-muted">Gestión de Estados Financieros ECOVIDA</p>
          <div class="divider"></div>
        </div>
        
        <div class="admin-grid">
          <!-- Fila Superior: Carga y Lista -->
          <div class="card-lab admin-upload-box">
            <div class="upload-icon-header">
              <i class="fas fa-cloud-upload-alt"></i>
            </div>
            <h3>Cargar Nuevo Documento</h3>
            <p class="text-muted mb-4">Formatos: PDF, DOC, DOCX</p>
            
            <div class="file-select-container">
              <input type="file" (change)="onFileSelected($event)" accept=".pdf,.doc,.docx" id="fileInput" class="hidden-input">
              <label for="fileInput" class="file-label">
                <i class="fas fa-file-alt"></i> 
                {{ selectedFile ? selectedFile.name : 'Seleccionar archivo...' }}
              </label>
            </div>

            <button (click)="upload()" class="btn btn-primary btn-block mt-4" [disabled]="!selectedFile || uploading">
              <span *ngIf="!uploading"><i class="fas fa-check-circle"></i> Iniciar Carga</span>
              <span *ngIf="uploading"><i class="fas fa-spinner fa-spin"></i> Subiendo...</span>
            </button>
          </div>

          <div class="card-lab admin-list-box">
            <h3 class="mb-4"><i class="fas fa-tasks"></i> Documentos Cargados</h3>
            
            <div class="admin-docs-list" *ngIf="documentos.length > 0; else noDocs">
              <div class="admin-doc-item" *ngFor="let doc of documentos">
                <div class="doc-info">
                  <i class="fas fa-file-pdf"></i>
                  <span class="doc-name">{{ doc.name }}</span>
                </div>
                <button (click)="eliminarDocumento(doc)" class="btn-delete" title="Eliminar">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
            
            <ng-template #noDocs>
              <p class="text-muted">No hay documentos cargados.</p>
            </ng-template>
          </div>

          <!-- Fila Inferior: Configuración -->
          <div class="card-lab config-box" style="grid-column: 1 / -1;">
            <h3><i class="fas fa-cog"></i> Configuración de Seguridad</h3>
            <p class="text-muted mb-4">Cambie su contraseña periódicamente para mantener la seguridad.</p>
            
            <div class="config-inputs">
              <div class="input-group">
                <label>Contraseña Actual</label>
                <input type="password" [(ngModel)]="oldPassword" class="portal-input-styled" placeholder="Contraseña actual">
              </div>
              <div class="input-group">
                <label>Nueva Contraseña</label>
                <input type="password" [(ngModel)]="newPassword" class="portal-input-styled" placeholder="Nueva contraseña">
              </div>
              <button (click)="cambiarClave()" class="btn btn-secondary" style="height: 55px; align-self: flex-end;">Actualizar Clave</button>
            </div>
          </div>
        </div>

        <!-- Banner de Mensajes Global -->
        <div *ngIf="message" class="message-banner mt-4" [style.background-color]="messageColor === '#1F9E89' ? '#e8f5f3' : '#fdeded'" [style.color]="messageColor">
          <i class="fas" [ngClass]="messageColor === '#1F9E89' ? 'fa-check-circle' : 'fa-times-circle'"></i> {{ message }}
        </div>
        
        <button (click)="logout()" class="btn btn-secondary mt-5">
          <i class="fas fa-sign-out-alt"></i> Cerrar Sesión Administrativa
        </button>
      </div>
    </div>
  `,
  styles: [`
    .admin-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .login-card {
      max-width: 450px; margin: 60px auto; background: white; border-radius: 20px;
      box-shadow: 0 15px 35px rgba(0,0,0,0.1); overflow: hidden; animation: slideUp 0.5s ease;
    }
    .login-header { background: var(--navbar-bg); padding: 40px 20px; text-align: center; color: white; }
    .icon-circle {
      width: 70px; height: 70px; background: rgba(255,255,255,0.1); border-radius: 50%;
      display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 2rem;
    }
    .login-body { padding: 40px; }
    .input-group { margin-bottom: 25px; text-align: left; }
    .input-group label { display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-dark); font-size: 0.9rem; }
    .portal-input-styled {
      width: 100%; padding: 15px; border: 2px solid #eee; border-radius: 10px;
      font-size: 1rem; transition: var(--transition);
    }
    .portal-input-styled:focus { outline: none; border-color: var(--accent); background: #fcfdfe; }
    .btn-block { width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; }
    
    .admin-upload-box, .admin-list-box, .config-box { padding: 40px !important; }
    .upload-icon-header { font-size: 3rem; color: var(--primary); margin-bottom: 15px; }
    .file-label {
      display: block; padding: 15px; border: 2px dashed #ddd; border-radius: 12px;
      cursor: pointer; transition: var(--transition); color: var(--text-light);
    }
    .file-label:hover { border-color: var(--accent); background: #f8fbff; }
    
    .config-inputs { display: grid; grid-template-columns: 1fr 1fr auto; gap: 20px; align-items: center; }

    .admin-docs-list { text-align: left; max-height: 300px; overflow-y: auto; }
    .admin-doc-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px; border-bottom: 1px solid #eee;
    }
    .btn-delete { background: none; border: none; color: #ccc; cursor: pointer; transition: 0.3s; }
    .btn-delete:hover { color: #e74c3c; }

    .error-alert { margin-top: 20px; padding: 12px; background: #fff5f5; color: #e74c3c; border-radius: 8px; border-left: 4px solid #e74c3c; }
    .message-banner { padding: 15px; border-radius: 10px; display: flex; align-items: center; justify-content: center; gap: 10px; font-weight: 600; }
    
    @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .animate-fade-in { animation: fadeIn 0.8s ease; }
    .login-footer { padding: 20px; background: #f9f9f9; text-align: center; border-top: 1px solid #eee; }
    .hidden-input { display: none; }

    @media (max-width: 992px) {
      .admin-grid { grid-template-columns: 1fr; }
      .config-inputs { grid-template-columns: 1fr; }
    }
  `]
})
export class AdminComponent implements OnInit {
  isAdmin = false;
  password = '';
  oldPassword = '';
  newPassword = '';
  selectedFile: File | null = null;
  uploading = false;
  message = '';
  messageColor = 'green';
  loginError = '';
  documentos: Documento[] = [];

  constructor(private documentoService: DocumentoService) {}

  ngOnInit() {
    this.cargarDocumentos();
  }

  cargarDocumentos() {
    this.documentoService.getDocumentos().subscribe(data => {
      this.documentos = data;
    });
  }

  login() {
    this.documentoService.login(this.password).subscribe({
      next: () => {
        this.isAdmin = true;
        this.loginError = '';
        this.message = '';
        this.cargarDocumentos();
      },
      error: (err) => {
        this.loginError = 'Clave incorrecta. Por favor intente de nuevo.';
        this.password = '';
      }
    });
  }

  logout() {
    this.isAdmin = false;
    this.password = '';
    this.loginError = '';
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  upload() {
    if (this.selectedFile) {
      this.uploading = true;
      this.message = '';
      this.documentoService.uploadDocumento(this.selectedFile).subscribe({
        next: () => {
          this.uploading = false;
          this.message = '¡Documento cargado con éxito!';
          this.messageColor = '#1F9E89';
          this.selectedFile = null;
          this.cargarDocumentos();
        },
        error: () => {
          this.uploading = false;
          this.message = 'Error al subir el archivo.';
          this.messageColor = '#e74c3c';
        }
      });
    }
  }

  eliminarDocumento(doc: Documento) {
    if (confirm(`¿Está seguro de que desea eliminar el documento: "${doc.name}"?`)) {
      this.documentoService.deleteDocumento(doc.filename).subscribe({
        next: () => {
          this.message = 'Documento eliminado correctamente.';
          this.messageColor = '#1F9E89';
          this.cargarDocumentos();
        },
        error: () => {
          this.message = 'Error al eliminar el documento.';
          this.messageColor = '#e74c3c';
        }
      });
    }
  }

  cambiarClave() {
    if (!this.oldPassword || !this.newPassword) {
      alert('Por favor complete ambos campos de contraseña.');
      return;
    }
    
    this.documentoService.changePassword(this.oldPassword, this.newPassword).subscribe({
      next: (res) => {
        this.message = '¡Contraseña actualizada con éxito!';
        this.messageColor = '#1F9E89';
        this.oldPassword = '';
        this.newPassword = '';
        const savedPass = this.password; // Opcional: mantener sesión o pedir login
      },
      error: (err) => {
        this.message = 'Error: ' + (err.error.message || 'No se pudo cambiar la clave');
        this.messageColor = '#e74c3c';
      }
    });
  }
}
