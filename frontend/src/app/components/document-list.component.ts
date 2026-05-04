import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentoService, Documento } from '../services/documento.service';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-5 mb-5">
      <div class="text-center">
        <h2 class="title-section">Estados Financieros</h2>
        <div class="divider"></div>
        <p class="text-muted">Consulte nuestros informes y estados contables públicos.</p>
      </div>

      <!-- GRID RESPONSIVO DE DOCUMENTOS -->
      <div class="grid-docs" *ngIf="documentos.length > 0; else loading">
        <div class="card-doc" *ngFor="let doc of documentos">
          <div style="font-size: 3rem; color: #e74c3c; margin-bottom: 20px;">
            <i class="fas fa-file-pdf"></i>
          </div>
          <h4 style="margin-bottom: 15px; font-weight: 600; font-size: 1rem;">{{ doc.name }}</h4>
          <a [href]="doc.url" target="_blank" class="btn btn-primary">
            <i class="fas fa-download" style="margin-right: 8px;"></i> Descargar
          </a>
        </div>
      </div>

      <ng-template #loading>
        <div class="text-center mt-5">
          <p class="text-muted" *ngIf="documentos.length === 0">No hay documentos disponibles en este momento.</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .grid-docs {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 25px;
      margin-top: 50px;
    }

    .card-doc {
      background: white;
      padding: 40px 20px;
      border-radius: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.05);
      border-top: 6px solid var(--primary);
      transition: all 0.4s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .card-doc:hover {
      transform: translateY(-10px);
      box-shadow: 0 15px 40px rgba(0,0,0,0.1);
    }

    @media (max-width: 600px) {
      .grid-docs {
        grid-template-columns: 1fr;
      }
      .card-doc {
        padding: 30px 15px;
      }
    }
  `]
})
export class DocumentListComponent implements OnInit {
  documentos: Documento[] = [];

  constructor(private documentoService: DocumentoService) {}

  ngOnInit(): void {
    this.documentoService.getDocumentos().subscribe(data => {
      this.documentos = data;
    });
  }
}
