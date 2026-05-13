import type { User } from '@supabase/supabase-js';
import { resolveProfileSyncPlan } from '../services/profileSync/resolveProfileSyncPlan';

const user = {
  id: 'user-1',
  email: 'old@example.com',
  user_metadata: {
    full_name: 'Jan Kowalski',
    shelter_name: 'Stare Schronisko',
    phone: '111 222 333',
    city: 'Kraków',
    shelter_street: 'Stara 1',
    shelter_postal_code: '00-001',
  },
} as unknown as User;

describe('resolveProfileSyncPlan', () => {
  it('builds user auth payload and includes changed email and password', () => {
    const plan = resolveProfileSyncPlan({
      role: 'user',
      user,
      fullName: ' Anna Nowak ',
      city: ' Warszawa ',
      phone: ' 123 456 789 ',
      email: ' new@example.com ',
      avatarUrl: 'avatar.jpg',
      newPassword: 'sekret123',
    });

    expect(plan.authPayload).toEqual({
      data: {
        role: 'user',
        full_name: 'Anna Nowak',
        city: 'Warszawa',
        phone: '123 456 789',
        avatar_url: 'avatar.jpg',
      },
      password: 'sekret123',
      email: 'new@example.com',
    });
    expect(plan.identity).toMatchObject({
      nextName: 'Anna Nowak',
      nextEmail: 'new@example.com',
      previousEmail: 'old@example.com',
      previousCity: 'Kraków',
    });
  });

  it('uses shelter metadata for admin profiles and keeps email when unchanged', () => {
    const plan = resolveProfileSyncPlan({
      role: 'admin',
      user,
      fullName: ' Nowe Schronisko ',
      city: ' Łódź ',
      phone: ' 987 654 321 ',
      email: 'old@example.com',
      avatarUrl: null,
      shelterStreet: ' Nowa 5 ',
      shelterPostalCode: ' 11-111 ',
    });

    expect(plan.authPayload).toEqual({
      data: {
        role: 'admin',
        shelter_name: 'Nowe Schronisko',
        city: 'Łódź',
        shelter_street: 'Nowa 5',
        shelter_postal_code: '11-111',
        phone: '987 654 321',
        avatar_url: null,
      },
    });
  });

  it('falls back to current metadata when name or email fields are blank', () => {
    const plan = resolveProfileSyncPlan({
      role: 'user',
      user,
      fullName: '   ',
      city: '',
      phone: '',
      email: '   ',
    });

    expect(plan.authPayload.email).toBeUndefined();
    expect(plan.authPayload.data.full_name).toBe('Jan Kowalski');
    expect(plan.identity.nextEmail).toBe('old@example.com');
  });
});
