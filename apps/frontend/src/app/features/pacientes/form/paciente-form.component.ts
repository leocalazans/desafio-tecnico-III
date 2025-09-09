import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { PacientesService } from '../pacientes.service';
import { Router, ActivatedRoute } from '@angular/router';
import { LoadingService } from '../../../core/services/loading.service';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-paciente-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    NgIf,
  ],
  templateUrl: './paciente-form.component.html',
  styleUrls: ['./paciente-form.component.scss'],
})
export class PacienteFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(PacientesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private loadingSvc = inject(LoadingService);
  private snack = inject(SnackbarService);

  form = this.fb.group({
    nome: [null, [Validators.required, Validators.minLength(2)]],
    documento: [null, [Validators.required]],
    email: [null, [Validators.email]],
    dataNascimento: [null, [Validators.required]],
  });

  saving = signal(false);
  error = signal<string | null>(null);
  pacienteId: string | null = null;

  ngOnInit() {
    this.pacienteId = this.route.snapshot.paramMap.get('id');
    if (this.pacienteId) {
      this.loadPaciente();
    }
  }

  async loadPaciente() {
    this.loadingSvc.show();
    try {
      const paciente = await this.svc.findOne(this.pacienteId!);
      this.form.patchValue(paciente as Partial<{
        nome: null;
        documento: null;
        email: null;
        dataNascimento: null;
      }>);
    } catch (err: any) {
      const message = err?.error?.message ?? err?.message ?? 'Erro ao carregar paciente';
      this.error.set(message);
      this.snack.show(message, { panelClass: 'error' });
    } finally {
      this.loadingSvc.hide();
    }
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error.set(null);
    this.saving.set(true);
    this.loadingSvc.show();

    try {
      if (this.pacienteId) {
        await this.svc.update(this.pacienteId, this.form.value);
        this.snack.show('Paciente atualizado com sucesso');
      } else {
        await this.svc.create(this.form.value);
        this.snack.show('Paciente criado com sucesso');
      }
      await this.router.navigate(['/pacientes']);
    } catch (err: any) {
      const message = err?.error?.message ?? err?.message ?? 'Erro ao salvar paciente';
      this.error.set(message);
      this.snack.show(message, { panelClass: 'error' });
    } finally {
      this.saving.set(false);
      this.loadingSvc.hide();
    }
  }
}
