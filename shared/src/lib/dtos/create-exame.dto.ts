import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateExameDto {
  @IsUUID()
  @IsNotEmpty()
  pacienteId!: string;

  @IsString()
  @IsNotEmpty()
  modalidade!: string;

  @IsString()
  @IsNotEmpty()
  idempotencyKey!: string;
}
