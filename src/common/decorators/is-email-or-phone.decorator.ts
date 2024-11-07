import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { EMAIL_REGEX, PHONE_REGEX } from '../constants';

@ValidatorConstraint({ async: false })
export class IsEmailOrPhoneConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    return EMAIL_REGEX.test(value) || PHONE_REGEX.test(value);
  }

  defaultMessage(args: ValidationArguments) {
    return 'The field must be a valid email address or phone number';
  }
}

export function IsEmailOrPhone(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsEmailOrPhoneConstraint,
    });
  };
}
