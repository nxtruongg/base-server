import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsEmailOrPhone(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isEmailOrPhone',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          // Sử dụng regex để kiểm tra email
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          // Sử dụng regex để kiểm tra số điện thoại (10 chữ số)
          const phoneRegex = /^[0-9]{10}$/;

          return (
            typeof value === 'string' &&
            (emailRegex.test(value) || phoneRegex.test(value))
          );
        },
        defaultMessage(args: ValidationArguments) {
          return 'Contact must be a valid email address or a 10-digit phone number';
        },
      },
    });
  };
}
