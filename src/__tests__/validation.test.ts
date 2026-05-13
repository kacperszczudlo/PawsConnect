import {
  isValidPhone,
  isValidPostalCode,
  normalizePhone,
  normalizePostalCode,
} from '../utils/validation';

describe('validation utils', () => {
  describe('phone validation', () => {
    it('normalizes repeated whitespace without changing digits', () => {
      expect(normalizePhone('  +48   123  456 789  ')).toBe('+48 123 456 789');
    });

    it('accepts Polish local and +48 phone numbers', () => {
      expect(isValidPhone('123 456 789')).toBe(true);
      expect(isValidPhone('+48 123 456 789')).toBe(true);
    });

    it('rejects too short or non-Polish phone numbers', () => {
      expect(isValidPhone('123 456')).toBe(false);
      expect(isValidPhone('+49 123 456 789')).toBe(false);
    });
  });

  describe('postal code validation', () => {
    it('formats five postal code digits with a dash', () => {
      expect(normalizePostalCode('00123')).toBe('00-123');
      expect(normalizePostalCode('00 123')).toBe('00-123');
    });

    it('keeps invalid postal codes unchanged so validation can reject them', () => {
      expect(normalizePostalCode('0-123')).toBe('0-123');
      expect(isValidPostalCode('0-123')).toBe(false);
    });

    it('accepts only XX-XXX postal code format', () => {
      expect(isValidPostalCode('00-123')).toBe(true);
      expect(isValidPostalCode('00123')).toBe(false);
    });
  });
});
