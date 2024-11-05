export function isEmailOrPhone(value: string): 'email' | 'phone' | 'invalid' {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{10}$/;

  if (emailRegex.test(value)) {
    return 'email';
  } else if (phoneRegex.test(value)) {
    return 'phone';
  }
  return 'invalid';
}
