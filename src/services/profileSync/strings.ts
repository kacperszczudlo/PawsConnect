export const joinShelterAddress = (city: string, street: string, postalCode: string) =>
  [city.trim(), street.trim(), postalCode.trim()].filter(Boolean).join(', ');

export const uniqueNonEmpty = (values: Array<string | undefined | null>) =>
  Array.from(new Set(values.map((value) => value?.trim() ?? '').filter(Boolean)));
