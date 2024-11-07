import { EMAIL_REGEX, PHONE_REGEX } from '../constants';

export function isEmailOrPhone(value: string): 'email' | 'phone' | 'invalid' {
  if (EMAIL_REGEX.test(value)) {
    return 'email';
  } else if (PHONE_REGEX.test(value)) {
    return 'phone';
  }
  return 'invalid';
}
