// api/auth.js
const BASE_URL = 'http://10.0.2.2:3000'; 
// ^ For Android emulator talking to backend running on your Windows machine.
// If you're using a physical phone, you'll use your PC's local IP like:
// const BASE_URL = 'http://192.168.1.50:3000';

export async function loginRequest(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
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
