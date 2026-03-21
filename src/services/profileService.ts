import { UserProfile } from '../types/profile';

const MOCK_PROFILE: UserProfile = {
  id: 'u1',
  fullName: 'Kacper Szczudło',
  email: 'kacper@example.com',
  phone: '+48 600 700 800',
  city: 'Kraków',
  avatarUrl:
    'https://images.unsplash.com/photo-1521119989659-a83eee488004?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
};

const wait = (delay = 250) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, delay);
  });

let profileDb = { ...MOCK_PROFILE };

export const profileService = {
  async getProfile(): Promise<UserProfile> {
    await wait();
    return { ...profileDb };
  },

  async updateProfile(payload: UserProfile): Promise<UserProfile> {
    await wait();
    profileDb = { ...payload };
    return { ...profileDb };
  },
};
