// api/auth.ts
import { BASE_URL } from '@env';

// Type definitions for API responses and requests
export interface User {
  id?: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  userName?: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresUtc: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userName: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

/**
 * Call the backend login endpoint.
 *
 * POST /api/Auth/login
 * Body: { email, password }
 *
 * On success, backend returns:
 * {
 *   "accessToken": "string",
 *   "expiresUtc": "2025-11-14T17:10:05.034Z",
 *   "user": { ... }
 * }
 */
export async function loginRequest(email: string, password: string): Promise<LoginResponse> {
  console.log('Attempting to connect to:', `${BASE_URL}/api/Auth/login`);

  const res = await fetch(`${BASE_URL}/api/Auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    // JSON-encode the login body that your backend expects
    body: JSON.stringify({ email, password }),
  });

  // If the response is NOT 2xx (e.g. 400, 401, 500), treat it as a failure.
  if (!res.ok) {
    let message = 'Login failed';

    try {
      // Try to parse JSON error body from backend, if provided
      const data = await res.json();
      if (data.error) message = data.error;
      if (data.message) message = data.message;
    } catch (err) {
      // If JSON parsing fails, just keep the default message
    }

    // Throwing an Error here makes the caller's try/catch catch it
    throw new Error(message);
  }

  // If everything is OK, parse and return the JSON body.
  // Expected shape: { accessToken, expiresUtc, user }
  const data: LoginResponse = await res.json();
  return data;
}

/**
 * Call the backend register endpoint.
 *
 * POST /api/Auth/register
 * Body: { email, password, firstName, lastName, userName }
 *
 * Backend returns the same shape as login:
 * {
 *   "accessToken": "string",
 *   "expiresUtc": "2025-11-14T17:10:05.034Z",
 *   "user": { ... }
 * }
 */
export async function registerRequest({
  email,
  password,
  firstName,
  lastName,
  userName,
}: RegisterRequest): Promise<LoginResponse> {
  console.log('Attempting to connect to:', `${BASE_URL}/api/Auth/register`);

  const res = await fetch(`${BASE_URL}/api/Auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      firstName,
      lastName,
      userName,
    }),
  });

  if (!res.ok) {
    let message = 'Registration failed';

    try {
      // Backend is returning plain string, not JSON
      const text = await res.text();
      if (text) message = text;
    } catch (err) {
      // ignore parsing errors
    }

    throw new Error(message);
  }

  const data: LoginResponse = await res.json();
  return data;
}


/**
 * Change password for the currently logged-in user.
 *
 * POST /api/Auth/password/change
 * Body: { currentPassword, newPassword }
 *
 * Requires Authorization: Bearer <accessToken> header.
 */
export async function changePasswordRequest(
  accessToken: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  console.log('Attempting to connect to:', `${BASE_URL}/api/Auth/password/change`);

  const res = await fetch(`${BASE_URL}/api/Auth/password/change`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,  // token from login/register
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      currentPassword,
      newPassword,
    }),
  });

  if (!res.ok) {
    let message = 'Password change failed';

    try {
      // Your backend uses BadRequest("some message") → plain string body
      const text = await res.text();
      if (text) message = text;
    } catch (err) {
      // ignore parse errors
    }

    throw new Error(message);
  }

  // If backend returns JSON you care about, parse it here:
  try {
    await res.json();
  } catch {
    // No JSON body, nothing special returned
  }
}

/**
 * Reset password using email and reset token.
 *
 * POST /api/Auth/password/reset
 * Body: { email, token, newPassword }
 */
export async function resetPasswordRequest({
  email,
  token,
  newPassword,
}: ResetPasswordRequest): Promise<void> {
  console.log('Attempting to connect to:', `${BASE_URL}/api/Auth/password/reset`);

  const res = await fetch(`${BASE_URL}/api/Auth/password/reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      token,
      newPassword,
    }),
  });

  if (!res.ok) {
    let message = 'Password reset failed';

    try {
      const text = await res.text();
      if (text) message = text;
    } catch (err) {
      // ignore parsing errors
    }

    throw new Error(message);
  }

  // No return value expected
}
