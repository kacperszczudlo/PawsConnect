const FEMALE_VALUES = ['samica', 'suczka', 'kotka', 'female', 'f'];

const isFemale = (sex?: string) => {
  if (!sex) return false;
  return FEMALE_VALUES.includes(sex.trim().toLowerCase());
};

export const formatAgeBySex = (age?: string, sex?: string) => {
  if (!age) return '';

  const normalizedAge = age.trim().toLowerCase();
  const female = isFemale(sex);

  if (normalizedAge === 'mlody' || normalizedAge === 'młody') {
    if (!sex) return 'Młody/a';
    return female ? 'Młoda' : 'Młody';
  }

  if (normalizedAge === 'dorosly' || normalizedAge === 'dorosły') {
    if (!sex) return 'Dorosły/a';
    return female ? 'Dorosła' : 'Dorosły';
  }

  return age;
};
