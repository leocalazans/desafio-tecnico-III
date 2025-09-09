import { Paciente } from './paciente.model';
import { ModalidadeDICOM } from '@project/shared';

export interface Exame {
  id: string;
  pacienteId: string;
  modalidade: ModalidadeDICOM;
  idempotencyKey: string;
  createdAt?: string;
  paciente?: Paciente;
}
