import type { User } from '@supabase/supabase-js';
import { buildApplicantApplicationFields } from '../utils/buildApplicantApplicationFields';

describe('buildApplicantApplicationFields', () => {
  it('builds a denormalized applicant snapshot from auth user metadata', () => {
    const user = {
      email: ' anna@example.com ',
      user_metadata: {
        full_name: ' Anna Nowak ',
        phone: ' 123 456 789 ',
        city: ' Warszawa ',
        avatar_url: ' avatar.jpg ',
      },
    } as unknown as User;

    expect(
      buildApplicantApplicationFields(user, { message: ' Chcę adoptować. ' }),
    ).toEqual({
      applicant_name: 'Anna Nowak',
      applicant_email: 'anna@example.com',
      applicant_phone: '123 456 789',
      applicant_city: 'Warszawa',
      applicant_avatar_url: 'avatar.jpg',
      applicant_message: 'Chcę adoptować.',
    });
  });

  it('falls back to email and then a generic user name', () => {
    expect(
      buildApplicantApplicationFields({
        email: 'user@example.com',
        user_metadata: {},
      } as unknown as User).applicant_name,
    ).toBe('user@example.com');

    expect(
      buildApplicantApplicationFields({
        user_metadata: {},
      } as unknown as User).applicant_name,
    ).toBe('Użytkownik');
  });

  it('omits blank optional message', () => {
    expect(
      buildApplicantApplicationFields(
        {
          email: 'user@example.com',
          user_metadata: {},
        } as unknown as User,
        { message: '   ' },
      ),
    ).not.toHaveProperty('applicant_message');
  });
});
