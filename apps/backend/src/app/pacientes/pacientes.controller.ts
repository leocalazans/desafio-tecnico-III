import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Put,
  Param,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PacientesService } from './pacientes.service';
import { CreatePacienteDto } from '@project/shared';

@ApiTags('Pacientes')
@Controller('pacientes')
export class PacientesController {
  constructor(private readonly pacientesService: PacientesService) { }

  @Post()
  @ApiOperation({ summary: 'Cria um novo paciente' })
  @ApiResponse({ status: 201, description: 'Paciente criado com sucesso.' })
  @ApiResponse({ status: 409, description: 'Documento já cadastrado.' })
  async create(@Body() dto: CreatePacienteDto) {
    try {
      return await this.pacientesService.create(dto);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Lista pacientes com paginação' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Página atual' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Quantidade por página' })
  @ApiResponse({ status: 200, description: 'Lista de pacientes retornada com sucesso.' })
  async findAll(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
  ) {
    return this.pacientesService.findAll(+page, +pageSize);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retorna um paciente pelo ID' })
  @ApiResponse({ status: 200, description: 'Paciente retornado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Paciente não encontrado.' })
  async findOne(@Param('id') id: string) {
    const paciente = await this.pacientesService.findOne(id);
    if (!paciente) throw new NotFoundException('Paciente não encontrado');
    return paciente;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza um paciente pelo ID' })
  @ApiResponse({ status: 200, description: 'Paciente atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Paciente não encontrado.' })
  @ApiResponse({ status: 409, description: 'Documento já cadastrado.' })
  async update(@Param('id') id: string, @Body() dto: CreatePacienteDto) {
    try {
      return await this.pacientesService.update(id, dto);
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      throw error;
    }
  }
}
