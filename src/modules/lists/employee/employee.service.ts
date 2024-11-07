import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from '@/base/base.service';
import { Employee } from '@/database/schemas/employee.schema';

@Injectable()
export class EmployeeService extends BaseService<Employee> {
  constructor(
    @InjectModel(Employee.name) private employeeModel: Model<Employee>,
  ) {
    super(employeeModel);
  }
}
