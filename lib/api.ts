// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

export async function createMeeting() {
 
  const response = await fetch(`${API_URL}/meeting/create/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error("Backend Error:", errorData);
    throw new Error("Failed to create meeting.");
  }

  return await response.json();
}