// api/auth.js

// BASE_URL is the root of backend API.
//
// In dev, this is usually machine's IP + port.
// - If running on iOS simulator or a physical device on Wi-Fi,
//   use computer’s LAN IP, e.g. 'http://10.0.0.50:5055'.
// - If running on Android emulator, use 'http://10.0.2.2:5055'.
//   (10.0.2.2 is a special address that points to host machine.)
//
// IMPORTANT: This must match whatever backend is actually running on.
const BASE_URL = 'http://10.0.0.50:5055';

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
export async function loginRequest(email, password) {
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
  const data = await res.json();
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
}) {
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
      const data = await res.json();
      if (data.error) message = data.error;
      if (data.message) message = data.message;
    } catch (err) {}

    throw new Error(message);
  }

  const data = await res.json();
  return data;
}

/**
 * Fetch the current user info from /api/Auth/me using the accessToken.
 *
 * GET /api/Auth/me
 * Headers: Authorization: Bearer <token>
 *
 * Returns:
 * { id, email, displayName, firstName, lastName }
 */
export async function getCurrentUser(accessToken) {
  const res = await fetch(`${BASE_URL}/api/Auth/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch current user');
  }

  const data = await res.json();
  return data;
}
