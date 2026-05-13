import {
  isMissingShelterUserIdColumnError,
  normalizeAnimal,
  normalizeApplication,
  serializeAnimal,
} from '../domain/shelter';

describe('shelter domain mapping', () => {
  it('normalizes animal rows from Supabase snake_case fields', () => {
    expect(
      normalizeAnimal({
        id: 42,
        name: 'Mika',
        shelter_user_id: 'shelter-1',
        shelter_name: 'Schronisko',
        shelter_address: 'ul. Testowa 1',
        shelter_phone: '123456789',
        shelter_email: 'kontakt@example.com',
        type: 'Psy',
        breed: 'Mix',
        age: '2 lata',
        image_url: 'https://example.com/mika.jpg',
        sex: 'Samica',
      }),
    ).toEqual({
      id: '42',
      name: 'Mika',
      city: undefined,
      shelterUserId: 'shelter-1',
      shelterName: 'Schronisko',
      shelterAddress: 'ul. Testowa 1',
      shelterPhone: '123456789',
      shelterEmail: 'kontakt@example.com',
      type: 'Psy',
      breed: 'Mix',
      age: '2 lata',
      description: undefined,
      image: 'https://example.com/mika.jpg',
      sex: 'Samica',
      liked: undefined,
      gender: undefined,
      weight: undefined,
      color: undefined,
    });
  });

  it('serializes animals to database column names', () => {
    expect(
      serializeAnimal({
        name: 'Mika',
        city: 'Warszawa',
        shelterName: 'Schronisko',
        shelterAddress: 'ul. Testowa 1',
        shelterPhone: '123456789',
        shelterEmail: 'kontakt@example.com',
        type: 'Psy',
        breed: 'Mix',
        age: '2 lata',
        description: 'Łagodna',
        image: 'image.jpg',
        sex: 'Samica',
        weight: '12 kg',
        color: 'biały',
      }),
    ).toMatchObject({
      shelter_name: 'Schronisko',
      shelter_address: 'ul. Testowa 1',
      shelter_phone: '123456789',
      shelter_email: 'kontakt@example.com',
      image: 'image.jpg',
    });
  });

  it('normalizes missing application values with user-facing defaults', () => {
    expect(
      normalizeApplication({
        id: 7,
        type: 'Spacer',
        created_at: '2026-05-13T10:00:00Z',
      }),
    ).toMatchObject({
      id: '7',
      type: 'Spacer',
      animalName: 'Nieznane zwierzę',
      applicantName: 'Nieznany użytkownik',
      date: '2026-05-13T10:00:00Z',
      status: 'Oczekujące',
    });
  });

  it('detects schema errors for missing shelter_user_id column', () => {
    expect(isMissingShelterUserIdColumnError({ code: '42703' })).toBe(true);
    expect(isMissingShelterUserIdColumnError({ code: 'PGRST204' })).toBe(true);
    expect(
      isMissingShelterUserIdColumnError({
        message: 'column shelter_user_id does not exist',
      }),
    ).toBe(true);
    expect(
      isMissingShelterUserIdColumnError({ message: 'permission denied' }),
    ).toBe(false);
  });
});
