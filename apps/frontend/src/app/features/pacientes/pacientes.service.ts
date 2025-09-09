import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class PacientesService {
  private api = inject(ApiService);

  async list(page = 1, limit = 10) {
    return this.api.get<{ data: any[]; total: number }>('pacientes', { page, limit });
  }

  async create(dto: any) {
    return this.api.post('pacientes', dto);
  }

  async findOne(id: string) {
    return this.api.get(`pacientes/${id}`);
  }

  async update(id: string, dto: any) {
    return this.api.put(`pacientes/${id}`, dto);
  }
}
