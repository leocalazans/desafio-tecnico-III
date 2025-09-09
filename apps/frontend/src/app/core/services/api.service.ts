import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/api'; // ajuste conforme proxy Nx ou env

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const httpParams = new HttpParams({ fromObject: params ?? {} });
    return firstValueFrom(this.http.get<T>(`${this.baseUrl}/${endpoint}`, { params: httpParams }));
  }

  async post<T>(endpoint: string, body: any, headers?: Record<string, string>): Promise<T> {
    return firstValueFrom(this.http.post<T>(`${this.baseUrl}/${endpoint}`, body, { headers }));
  }

  async put<T>(endpoint: string, body: any): Promise<T> {
    return firstValueFrom(this.http.put<T>(`${this.baseUrl}/${endpoint}`, body));
  }

  async delete<T>(endpoint: string): Promise<T> {
    return firstValueFrom(this.http.delete<T>(`${this.baseUrl}/${endpoint}`));
  }
}
