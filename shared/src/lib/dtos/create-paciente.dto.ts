import { IsNotEmpty, IsString, IsOptional, IsEmail } from 'class-validator';

export class CreatePacienteDto {
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @IsString()
  @IsNotEmpty()
  documento!: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
