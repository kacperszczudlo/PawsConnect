export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  avatarUrl: string;
}

export type ProfileSection =
  | 'overview'
  | 'edit'
  | 'myVisits'
  | 'upcoming'
  | 'favorites'
  | 'history';
