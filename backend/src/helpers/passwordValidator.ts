import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsPasswordValidConstraint implements ValidatorConstraintInterface {
  validate(password: string, args: ValidationArguments) {
    return /(?=.*\d)(?=.*[a-zA-Z]).{8,}/.test(password);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Password must be at least 8 characters long and contain at least one digit and one letter';
  }
}

export function IsPasswordValid(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsPasswordValidConstraint,
    });
  };
}
