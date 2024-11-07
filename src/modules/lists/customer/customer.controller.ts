import { Controller } from '@nestjs/common';
import { BaseController } from '@/base/base.controller';
import { Customer } from '@/database/schemas/customer.schema';
import { CustomerService } from './customer.service';

@Controller('customer')
export class CustomerController extends BaseController<Customer> {
  constructor(private readonly customerService: CustomerService) {
    super(customerService);
  }
}
