import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useProfile } from '../useProfile';
import { profileService } from '../../services/profileService';
import { UserProfile } from '../../types/profile';

jest.mock('../../services/profileService', () => ({
  profileService: {
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
  },
}));

const mockedProfileService = profileService as jest.Mocked<typeof profileService>;

const MOCK_PROFILE: UserProfile = {
  id: 'u1',
  fullName: 'Jan Kowalski',
  email: 'jan@example.com',
  phone: '+48 500 500 500',
  city: 'Kraków',
  avatarUrl: 'https://example.com/avatar.png',
};

describe('useProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads profile on mount', async () => {
    // Arrange
    mockedProfileService.getProfile.mockResolvedValue(MOCK_PROFILE);

    // Act
    const { result } = renderHook(() => useProfile());

    // Assert
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.profile).toEqual(MOCK_PROFILE);
    expect(result.current.error).toBeNull();
  });

  it('saves profile and updates local state', async () => {
    // Arrange
    mockedProfileService.getProfile.mockResolvedValue(MOCK_PROFILE);
    const nextProfile: UserProfile = {
      ...MOCK_PROFILE,
      city: 'Warszawa',
    };
    mockedProfileService.updateProfile.mockResolvedValue(nextProfile);
    const { result } = renderHook(() => useProfile());
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Act
    await act(async () => {
      await result.current.saveProfile(nextProfile);
    });

    // Assert
    expect(mockedProfileService.updateProfile).toHaveBeenCalledWith(nextProfile);
    expect(result.current.profile?.city).toBe('Warszawa');
    expect(result.current.error).toBeNull();
  });
});
