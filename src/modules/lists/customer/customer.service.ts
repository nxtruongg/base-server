import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from '@/base/base.service';
import { Customer } from '@/database/schemas/customer.schema';

@Injectable()
export class CustomerService extends BaseService<Customer> {
  constructor(
    @InjectModel(Customer.name) private readonly customerModel: Model<Customer>,
  ) {
    super(customerModel);
  }

  protected async beforeCreate(
    data: Partial<Customer>,
  ): Promise<Partial<Customer>> {
    const existingCustomer = await this.customerModel.findOne({
      ma_kh: data.ma_kh,
    });
    if (existingCustomer) {
      throw new ConflictException('Customer with this email already exists');
    }
    return data;
  }
}
