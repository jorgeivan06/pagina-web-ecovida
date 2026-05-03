import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentoService, Documento } from '../services/documento.service';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-5">
      <div class="text-center mb-5">
        <h2 class="title-section">Estados Financieros</h2>
        <div class="divider"></div>
      </div>

      <div class="grid-lab" *ngIf="documentos.length > 0; else noDocs">
        <div class="card-lab" *ngFor="let doc of documentos" style="display: flex; flex-direction: column; align-items: center; text-align: center;">
          <i class="fas fa-file-pdf" style="font-size: 3rem; color: #d32f2f; margin-bottom: 20px;"></i>
          <h3 style="font-size: 1.1rem; margin-bottom: 15px;">{{ doc.name }}</h3>
          <a [href]="doc.url" target="_blank" class="btn btn-secondary" style="padding: 8px 15px; font-size: 0.9rem;">Ver Documento</a>
        </div>
      </div>

      <ng-template #noDocs>
        <p class="text-center text-muted">No hay documentos disponibles en este momento.</p>
      </ng-template>
    </div>
  `
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
