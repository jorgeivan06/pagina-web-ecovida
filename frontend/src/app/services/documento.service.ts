import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Documento {
  name: string;
  filename: string;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentoService {
  private apiUrl = '/api/documentos';

  constructor(private http: HttpClient) { }

  getDocumentos(): Observable<Documento[]> {
    return this.http.get<Documento[]>(this.apiUrl);
  }

  uploadDocumento(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('documento', file);
    return this.http.post('/upload-financiero', formData);
  }

  deleteDocumento(filename: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${encodeURIComponent(filename)}`);
  }

  login(password: string): Observable<any> {
    return this.http.post('/api/admin/login', { password });
  }

  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post('/api/admin/change-password', { oldPassword, newPassword });
  }
}
