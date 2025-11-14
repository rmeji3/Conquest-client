// api/auth.js
// Using your Mac's local IP address - this works with Expo Go on iOS Simulator
const BASE_URL = 'http://10.0.0.91:5055'; 
// ^ For iOS simulator with Expo Go - must use your computer's IP, not localhost
// For Android emulator, use: 'http://10.0.2.2:5055'
// For physical device, use the same IP: 'http://10.0.0.91:5055'

export async function loginRequest(email, password) {
  console.log('Attempting to connect to:', `${BASE_URL}/api/Auth/login`);
  const res = await fetch(`${BASE_URL}/api/Auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  // If backend returns 4xx/5xx, throw error
  if (!res.ok) {
    let message = 'Login failed';
    try {
      const data = await res.json();
      if (data.error) message = data.error;
    } catch (err) {
      // ignore JSON parse failures here
    }
    throw new Error(message);
  }

  const data = await res.json();
  return data; // { token, user }
}
