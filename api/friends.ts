// api/friends.ts
// Using your Mac's local IP address - this works with Expo Go on iOS Simulator
const BASE_URL = 'http://10.0.0.119:5055'; 
// ^ For iOS simulator with Expo Go - must use your computer's IP, not localhost
// For Android emulator, use: 'http://10.0.2.2:5055'
// For physical device, use the same IP: 'http://10.0.0.91:5055'

export interface Friend {
  id?: string;
  firstName?: string;
  lastName?: string;
  userName?: string;
  email?: string;
}

export interface FriendsResponse {
  friendsList: Friend[];
}

export async function getFriends(token: string): Promise<FriendsResponse> {
  console.log('Attempting to connect to:', `${BASE_URL}/api/Friends/friends`);
  const res = await fetch(`${BASE_URL}/api/Friends/friends`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });

  // If backend returns 4xx/5xx, throw error
  if (!res.ok) {
    let message = 'fetch friends failed';
    try {
      const data = await res.json();
      if (data.error) message = data.error;
    } catch (err) {
      // ignore JSON parse failures here
    }
    throw new Error(message);
  }

  const data: FriendsResponse = await res.json();
  return data; // {friendsList}
}
