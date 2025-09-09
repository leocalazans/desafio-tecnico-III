import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PacientesService } from '../pacientes.service';
import { LoadingService } from '../../../core/services/loading.service';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { NgIf, NgFor } from '@angular/common';
import { inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-pacientes-list',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    NgFor,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterModule
  ],
  templateUrl: './pacientes-list.component.html',
  styleUrls: ['./pacientes-list.component.scss'],
})
export class PacientesListComponent {
  private svc = inject(PacientesService);
  private loadingSvc = inject(LoadingService);
  private snack = inject(SnackbarService);

  pacientes = signal<any[]>([]);
  total = signal(0);
  page = signal(1);
  pageSize = 10;
  error = signal<string | null>(null);

  // columns for material table
  displayedColumns = ['nome', 'documento', 'dataNascimento', 'acoes'];

  // expose global loading signal
  loading = this.loadingSvc.loading;

  constructor() {
    // auto-load on page change
    effect(() => {
      this.load(this.page());
    });
  }

  async load(page = 1) {
    this.error.set(null);
    try {
      this.loadingSvc.show();
      const res = await this.svc.list(page, this.pageSize);
      this.pacientes.set(res.data || []);
      this.total.set(res.total ?? (res.data?.length ?? 0));
    } catch (err: any) {
      this.error.set(err?.error?.message ?? err?.message ?? 'Erro ao carregar pacientes');
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
