import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Exame } from '../../shared/models/exame.model';
import { v4 as uuidv4 } from 'uuid';
import { HttpHeaders } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ExamesService {
  private api = inject(ApiService);
  private pending = new Map<string, Promise<Exame>>(); // dedupe client side

  async list(page = 1, limit = 10) {
    return this.api.get<{ data: any[]; total: number }>('exames', { page, limit });
  }

  // async create(dto: any, idempotencyKey?: string) {
  //   const key = idempotencyKey ?? uuidv4();
  //   return this.api.post('exames', dto, { 'Idempotency-Key': key });
  // }

  async create(dto: any, idempotencyKey: string) {
    // inclui a chave direto no body
    return this.api.post('exames', { ...dto, idempotencyKey });
  }

  async findOne(id: string) {
    return this.api.get(`exames/${id}`);
  }

}
