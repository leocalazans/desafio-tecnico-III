import { Component, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { ExamesService } from '../exames.service';
import { LoadingService } from '../../../core/services/loading.service';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-exames-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './exames-list.component.html',
  styleUrls: ['./exames-list.component.scss'],
})
export class ExamesListComponent {
  private svc = inject(ExamesService);
  private loadingSvc = inject(LoadingService);
  private snack = inject(SnackbarService);

  exames = signal<any[]>([]);
  total = signal(0);
  page = signal(1);
  pageSize = 10;
  loading = this.loadingSvc.loading;
  error = signal<string | null>(null);

  displayedColumns = ['modalidade', 'pacienteNome', 'idempotencyKey', 'createdAt'];

  constructor() {
    effect(() => {
      this.load(this.page());
    });
  }

  async load(page = 1) {
    this.error.set(null);
    try {
      this.loadingSvc.show();
      const res = await this.svc.list(page, this.pageSize);
      this.exames.set(res.data || []);
      this.total.set(res.total ?? (res.data?.length ?? 0));
    } catch (err: any) {
      this.error.set(err?.error?.message ?? err?.message ?? 'Erro ao carregar exames');
      this.snack.show(this.error() ?? 'Erro desconhecido');

    } finally {
      this.loadingSvc.hide();
    }
  }

  onPageChange(newPage: number) {
    this.page.set(newPage);
  }

  onRetry() {
    this.load(this.page());
  }
}
