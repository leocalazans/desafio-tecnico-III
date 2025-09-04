import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ExamesService } from './exames.service';
import { CreateExameDto } from '@project/shared';

@ApiTags('Exames')
@Controller('exames')
export class ExamesController {
  constructor(private readonly examesService: ExamesService) { }

  @Post()
  @ApiOperation({ summary: 'Cria um novo exame para paciente existente' })
  @ApiResponse({ status: 201, description: 'Exame criado com sucesso.' })
  @ApiResponse({ status: 200, description: 'Exame já existia (idempotente).' })
  @ApiResponse({ status: 400, description: 'Paciente não encontrado ou dados inválidos.' })
  async create(@Body() dto: CreateExameDto) {
    try {
      return await this.examesService.create(dto);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Lista exames com paginação' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Página atual' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Quantidade por página' })
  @ApiResponse({ status: 200, description: 'Lista de exames retornada com sucesso.' })
  async findAll(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
  ) {
    return this.examesService.findAll(+page, +pageSize);
  }
}
