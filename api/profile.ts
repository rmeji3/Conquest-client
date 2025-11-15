/**
 * Update the current user's profile image.
 *
 * POST api/Profiles/me/profile-picture
 * Headers: Authorization: Bearer <token>
 * Body: { profileImageUrl: string }
 *
 * Returns: ProfileDto
 */
export async function updateProfileImage(accessToken: string, profileImageUrl: string): Promise<ProfileDto> {
  const res = await fetch(`${BASE_URL}/api/Profiles/me/profile-picture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ profileImageUrl }),
  });

  if (!res.ok) {
    let message = 'Failed to update profile image';
    try {
      const data = await res.json();
      if (data.error) message = data.error;
      if (data.message) message = data.message;
    } catch (err) {}
    throw new Error(message);
  }

  const data: ProfileDto = await res.json();
  return data;
}
import { BASE_URL } from '@env';

export interface ProfileDto {
  id: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string;
}

export interface UpdateProfileDto {
  firstName: string;
  lastName: string;
}

/**
 * Fetch the current user profile info from /api/Profiles/me using the accessToken.
 *
 * GET /api/Profiles/me
 * Headers: Authorization: Bearer <token>
 *
 * Returns: ProfileDto
 */
export async function getCurrentUserProfile(accessToken: string): Promise<ProfileDto> {
  const res = await fetch(`${BASE_URL}/api/Profiles/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch current user profile');
  }

  const data: ProfileDto = await res.json();
  return data;
}

/**
 * Update the current user's profile info.
 *
 * PATCH /api/Profiles/me
 * Headers: Authorization: Bearer <token>
 * Body: UpdateProfileDto
 *
 * Returns: ProfileDto
 */
export async function updateProfile(accessToken: string, update: UpdateProfileDto): Promise<ProfileDto> {
  const res = await fetch(`${BASE_URL}/api/Profiles/me`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(update),
  });

  if (!res.ok) {
    let message = 'Failed to update profile';
    try {
      const data = await res.json();
      if (data.error) message = data.error;
      if (data.message) message = data.message;
    } catch (err) {}
    throw new Error(message);
  }

  const data: ProfileDto = await res.json();
  return data;
}
