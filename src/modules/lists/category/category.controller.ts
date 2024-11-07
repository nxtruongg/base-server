import { Controller } from '@nestjs/common';
import { BaseController } from '@/base/base.controller';
import { Category } from '@/database/schemas/category.schema';
import { CategoryService } from './category.service';

@Controller('category')
export class CategoryController extends BaseController<Category> {
  constructor(private readonly categoryService: CategoryService) {
    super(categoryService);
  }
}
