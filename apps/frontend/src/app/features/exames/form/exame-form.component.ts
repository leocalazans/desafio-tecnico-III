import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ExamesService } from '../exames.service';
import { PacientesService } from '../../pacientes/pacientes.service';
import { Router } from '@angular/router';
import { LoadingService } from '../../../core/services/loading.service';
import { SnackbarService } from '../../../core/services/snackbar.service';

@Component({
  selector: 'app-exame-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './exame-form.component.html',
  styleUrls: ['./exame-form.component.scss'],
})
export class ExameFormComponent {
  private fb = inject(FormBuilder);
  private examesSvc = inject(ExamesService);
  private pacientesSvc = inject(PacientesService);
  private router = inject(Router);
  private loadingSvc = inject(LoadingService);
  private snack = inject(SnackbarService);

  modalidades = ['CR', 'CT', 'DX', 'MG', 'MR', 'NM', 'OT', 'PT', 'RF', 'US', 'XA'];

  form = this.fb.group({
    pacienteId: [null, Validators.required],
    modalidade: [null, Validators.required],
    // optional idempotencyKey if you want to reuse on retry
    idempotencyKey: [null],
  });

  pacientes = signal<any[]>([]);
  saving = signal(false);
  error = signal<string | null>(null);

  constructor() {
    // load pacientes for select
    this.loadPacientes();
  }

  async loadPacientes() {
    try {
      this.loadingSvc.show();
      const res = await this.pacientesSvc.list(1, 100);
      this.pacientes.set(res.data || []);
    } catch (err: any) {
      this.snack.show('Erro ao carregar pacientes');
    } finally {
      this.loadingSvc.hide();
    }
  }

  private getIdempotencyKey() {
    const existing = this.form.controls['idempotencyKey'].value;
    return existing ?? (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? (crypto as any).randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const key = this.getIdempotencyKey();
    this.form.controls['idempotencyKey'].setValue(key);
    this.error.set(null);
    this.saving.set(true);
    try {
      this.loadingSvc.show();
      await this.examesSvc.create({
        pacienteId: this.form.value.pacienteId,
        modalidade: this.form.value.modalidade,
      }, key);
      this.snack.show('Exame criado (ou já existia) com sucesso');
      await this.router.navigate(['/exames']);
    } catch (err: any) {
      const message = err?.error?.message ?? err?.message ?? 'Erro ao criar exame';
      this.error.set(message);
      this.snack.show(message, { panelClass: 'error' });
    } finally {
      this.saving.set(false);
      this.loadingSvc.hide();
    }
  }
}
