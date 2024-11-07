import {
  BadRequestException,
  Body,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { LIMIT } from '@/common/constants';
import { BaseService } from './base.service';

export class BaseController<
  T,
  CreateDto extends Partial<T> = T,
  UpdateDto extends Partial<T> = T,
> {
  constructor(private readonly baseService: BaseService<T>) {}

  @Get()
  async findAll(
    @Request() request: any,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('sort') sort?: Record<string, any>,
    @Query('q') q?: string,
  ) {
    const user = request.user;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || LIMIT;

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

  @Get(':id')
  async findOne(@Request() request: any, @Param('id') id: string) {
    const user = request.user;
    return this.baseService.findOne(id, user);
  }

  @Post()
  @UsePipes(new ValidationPipe())
  async create(@Body() data: CreateDto, @Request() request: any) {
    const user = request.user;
    return this.baseService.create(data, user);
  }

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

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() request: any) {
    const user = request.user;
    return this.baseService.remove(id, user);
  }
}
