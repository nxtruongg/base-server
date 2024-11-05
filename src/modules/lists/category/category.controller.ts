import { Controller } from '@nestjs/common';
import { BaseController } from 'src/base/base.controller';
import { Category } from 'src/database/schemas/category.schema';
import { CategoryService } from './category.service';

@Controller('category')
export class CategoryController extends BaseController<Category> {
  constructor(private readonly categoryService: CategoryService) {
    super(categoryService);
  }
}
