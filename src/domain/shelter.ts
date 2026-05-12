export type AppStatus = 'Oczekujące' | 'Zaakceptowane' | 'Odrzucone';

export type UpdateApplicationStatusResult =
  | { ok: true }
  | {
      ok: false;
      reason: 'conflict';
      conflict: { applicantName: string; date: string; animalName: string };
    }
  | { ok: false; reason: 'unauthorized' }
  | { ok: false; reason: 'not_found' }
  | { ok: false; reason: 'error'; message?: string };

export interface Application {
  id: string;
  type: 'Adopcja' | 'Spacer';
  animalName: string;
  animalId?: string;
  applicantId?: string;
  applicantName: string;
  applicantEmail?: string;
  applicantPhone?: string;
  applicantCity?: string;
  applicantAvatarUrl?: string;
  /** Uzasadnienie adopcji lub inna treść od wnioskującego. */
  applicantMessage?: string;
  date: string;
  status: AppStatus;
  createdAt?: string;
  shelterUserId?: string;
  shelterName?: string;
  shelterAddress?: string;
  shelterPhone?: string;
  shelterEmail?: string;
}

export interface Animal {
  id: string;
  name: string;
  city?: string;
  shelterUserId?: string;
  shelterName?: string;
  shelterAddress?: string;
  shelterPhone?: string;
  shelterEmail?: string;
  type: string;
  breed: string;
  age: string;
  description?: string;
  image: string;
  sex?: string;
  liked?: boolean;
  gender?: string;
  weight?: string;
  color?: string;
}

/** Pola schroniska przy listowaniu wizyt użytkownika (częściowy odczyt zwierzęcia). */
export interface ShelterAnimalLink {
  id: string;
  city?: string;
  shelterName?: string;
  shelterAddress?: string;
  shelterPhone?: string;
  shelterEmail?: string;
}

export const ANIMALS_LIST_SELECT =
  'id,name,city,shelter_user_id,shelter_name,shelter_address,shelter_phone,shelter_email,type,breed,age,description,image,sex,weight,color';

export const ANIMALS_FALLBACK_SELECT =
  'id,name,city,shelter_name,shelter_address,shelter_phone,shelter_email,type,breed,age,description,image,sex,weight,color';

export const isMissingShelterUserIdColumnError = (error: { code?: string; message?: string } | null | undefined) => {
  if (!error) {
    return false;
  }
  if (error.code === '42703' || error.code === 'PGRST204') {
    return true;
  }
  const msg = (error.message ?? '').toLowerCase();
  return msg.includes('shelter_user_id') && (msg.includes('does not exist') || msg.includes('nie istnieje'));
};

export const normalizeAnimal = (row: any): Animal => ({
  id: String(row.id),
  name: row.name ?? '',
  city: row.city ?? row.shelter_city ?? undefined,
  shelterUserId:
    row.shelterUserId != null
      ? String(row.shelterUserId)
      : row.shelter_user_id != null
        ? String(row.shelter_user_id)
        : undefined,
  shelterName: row.shelterName ?? row.shelter_name ?? undefined,
  shelterAddress: row.shelterAddress ?? row.shelter_address ?? undefined,
  shelterPhone: row.shelterPhone ?? row.shelter_phone ?? undefined,
  shelterEmail: row.shelterEmail ?? row.shelter_email ?? undefined,
  type: row.type ?? '',
  breed: row.breed ?? '',
  age: row.age ?? '',
  description: row.description ?? undefined,
  image: row.image ?? row.image_url ?? '',
  sex: row.sex ?? undefined,
  liked: row.liked ?? undefined,
  gender: row.gender ?? undefined,
  weight: row.weight ?? undefined,
  color: row.color ?? undefined,
});

export const serializeAnimal = (animal: Omit<Animal, 'id'>) => ({
  name: animal.name,
  city: animal.city,
  shelter_name: animal.shelterName,
  shelter_address: animal.shelterAddress,
  shelter_phone: animal.shelterPhone,
  shelter_email: animal.shelterEmail,
  type: animal.type,
  breed: animal.breed,
  age: animal.age,
  description: animal.description,
  image: animal.image,
  sex: animal.sex,
  weight: animal.weight,
  color: animal.color,
});

export const normalizeApplication = (row: any): Application => {
  const rawDate = row.date ?? row.date_label;
  const dateStr =
    rawDate != null && String(rawDate).trim() !== ''
      ? String(rawDate)
      : row.type === 'Spacer'
        ? String(row.created_at ?? '')
        : '';

  return {
    id: String(row.id),
    type: row.type === 'Spacer' ? 'Spacer' : 'Adopcja',
    animalId: row.animal_id ? String(row.animal_id) : undefined,
    animalName: row.animal_name ?? row.animalName ?? 'Nieznane zwierzę',
    applicantId: row.applicant_id != null ? String(row.applicant_id) : undefined,
    applicantName: row.applicant_name ?? row.applicantName ?? 'Nieznany użytkownik',
    applicantEmail: row.applicant_email ?? row.applicantEmail ?? undefined,
    applicantPhone: row.applicant_phone ?? row.applicantPhone ?? undefined,
    applicantCity: row.applicant_city ?? row.applicantCity ?? undefined,
    applicantAvatarUrl: row.applicant_avatar_url ?? row.applicantAvatarUrl ?? undefined,
    applicantMessage: row.applicant_message ?? row.applicantMessage ?? undefined,
    date: dateStr,
    status: (row.status as AppStatus) ?? 'Oczekujące',
    createdAt: row.created_at != null ? String(row.created_at) : undefined,
    shelterUserId: row.shelter_user_id != null ? String(row.shelter_user_id) : undefined,
    shelterName: row.shelter_name ?? row.shelterName ?? undefined,
    shelterAddress: row.shelter_address ?? row.shelterAddress ?? undefined,
    shelterPhone: row.shelter_phone ?? row.shelterPhone ?? undefined,
    shelterEmail: row.shelter_email ?? row.shelterEmail ?? undefined,
  };
};

export const mapRowToShelterAnimalLink = (row: any): ShelterAnimalLink => ({
  id: String(row.id),
  city: row.city ?? undefined,
  shelterName: row.shelter_name ?? row.shelterName ?? undefined,
  shelterAddress: row.shelter_address ?? row.shelterAddress ?? undefined,
  shelterPhone: row.shelter_phone ?? row.shelterPhone ?? undefined,
  shelterEmail: row.shelter_email ?? row.shelterEmail ?? undefined,
});
