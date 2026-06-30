const API_URL = "http://127.0.0.1:8000/api";

export async function createMeeting() {
  const response = await fetch(`${API_URL}/create-meeting/`, {
    method: "POST",
  });

  return await response.json();
}