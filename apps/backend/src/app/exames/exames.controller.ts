import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ExamesService } from './exames.service';
import { CreateExameDto } from '@project/shared';

@Controller('exames')
export class ExamesController {
  constructor(private readonly examesService: ExamesService) { }

  @Post()
  create(@Body() dto: CreateExameDto) {
    return this.examesService.create(dto);
  }

  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
  ) {
    return this.examesService.findAll(+page, +pageSize);
  }
}
