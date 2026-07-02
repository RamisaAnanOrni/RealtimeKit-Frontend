const API_URL = "http://vetbackend.insurecow.com/api";

export async function createMeeting() {
  const response = await fetch(`${API_URL}/create-meeting/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to create meeting.");
  }

  return await response.json();
}