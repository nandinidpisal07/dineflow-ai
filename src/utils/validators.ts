export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (!password || password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long.' };
  }
  return { valid: true };
}

export function validatePhone(phone: string): boolean {
  if (!phone) return true; // Optional field in many places
  const re = /^[0-9+\s\-()]{7,15}$/;
  return re.test(phone);
}

export function validateTimeRange(openingTime: string, closingTime: string): boolean {
  if (!openingTime || !closingTime) return true;
  return openingTime !== closingTime;
}
