// lib/api.ts

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
const API_KEY =
  process.env.NEXT_PUBLIC_STATIC_API_KEY || 'agrivet-secret-lifetime-key-2026';

// 🟢 Export apiFetch so other components can use it
export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
    ...options.headers,
  };

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
};

export async function createMeeting() {
  const response = await apiFetch('/meeting/create/', {
    method: 'POST',
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('Backend Error:', errorData);
    throw new Error('Failed to create meeting.');
  }

  return await response.json();
}