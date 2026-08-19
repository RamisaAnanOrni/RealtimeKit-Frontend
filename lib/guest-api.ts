export interface GuestRequestResponse {
  request_id: number;
  status: "PENDING" | "MEETING_CREATED";
  problem: string;
  phone?: string;
  message: string;
  farmer_join_link?: string;
}

export interface GuestSubmitResponse {
  success: boolean;
  request_id: number;
  status: string;
  message: string;
  phone: string;
  problem: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!BASE_URL) {
  console.error(
    "NEXT_PUBLIC_API_BASE_URL is not set! Check your .env.local file."
  );
}

function normalizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

export async function submitGuestRequest(
  phone: string,
  problem: string
): Promise<GuestSubmitResponse> {
  const normalized = normalizePhone(phone);
  const response = await fetch(`${BASE_URL}/guest/request/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: normalized, problem }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Submit error:", text);
    throw new Error("Failed to submit request. Please try again.");
  }

  return response.json();
}

export async function getGuestRequest(
  requestId: number
): Promise<GuestRequestResponse> {
  const response = await fetch(`${BASE_URL}/guest/request/${requestId}/`);

  if (!response.ok) {
    const text = await response.text();
    console.error("Poll error:", text);
    throw new Error("Failed to fetch request status.");
  }

  return response.json();
}
