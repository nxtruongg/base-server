import {
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
  BadRequestException,
  Request,
} from '@nestjs/common';
import { BaseService } from './base.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

export class BaseController<
  T,
  CreateDto extends Partial<T> = T,
  UpdateDto extends Partial<T> = T,
> {
  constructor(private readonly baseService: BaseService<T>) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Request() request: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('sort') sort?: Record<string, any>,
    @Query('q') q?: string,
  ) {
    const user = request.user;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    let filter = {};
    if (q) {
      try {
        filter = JSON.parse(q);
      } catch (error) {
        throw new BadRequestException(
          'Invalid JSON format for query parameter "q"',
        );
      }
    }
    const sortOptions = sort ?? {};
    return this.baseService.findAll(
      filter,
      pageNum,
      limitNum,
      sortOptions,
      user,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Request() request: any, @Param('id') id: string) {
    const user = request.user;
    return this.baseService.findOne(id, user);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UsePipes(new ValidationPipe())
  async create(@Body() data: CreateDto, @Request() request: any) {
    const user = request.user;
    return this.baseService.create(data, user);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @UsePipes(new ValidationPipe())
  async update(
    @Param('id') id: string,
    @Body() data: UpdateDto,
    @Request() request: any,
  ) {
    const user = request.user;
    return this.baseService.update(id, data, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() request: any) {
    const user = request.user;
    return this.baseService.remove(id, user);
  }
}
