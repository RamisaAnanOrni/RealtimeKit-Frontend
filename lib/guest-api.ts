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

function getBaseUrl(): string {
  // Get the URL from environment
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  
  // If not set or invalid, use default based on environment
  if (!envUrl || envUrl === "undefined" || envUrl.trim() === "") {
    // In production, log error but use a sensible default
    if (process.env.NODE_ENV === 'production') {
      console.warn("NEXT_PUBLIC_API_BASE_URL not set in production! Using fallback.");
    } else {
      console.warn("NEXT_PUBLIC_API_BASE_URL not set, using localhost fallback");
    }
    // Return a fallback - change this to your production URL
    return "https://vetbackend.insurecow.com/api";
  }

  return envUrl.replace(/\/$/, "");
}

function normalizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

export async function submitGuestRequest(
  phone: string,
  problem: string
): Promise<GuestSubmitResponse> {
  const baseUrl = getBaseUrl();
  const normalized = normalizePhone(phone);
  
  const response = await fetch(`${baseUrl}/guest/request/`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "X-API-KEY": process.env.NEXT_PUBLIC_STATIC_API_KEY || "agrivet-secret-lifetime-key-2026"
    },
    body: JSON.stringify({ phone: normalized, problem }),
    cache: "no-store",
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
  const baseUrl = getBaseUrl();
  
  const response = await fetch(`${baseUrl}/guest/request/${requestId}/`, {
    method: "GET",
    cache: "no-store", 
    headers: {
      "Accept": "application/json",
      "X-API-KEY": process.env.NEXT_PUBLIC_STATIC_API_KEY || "agrivet-secret-lifetime-key-2026"
    },
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Poll error:", text);
    throw new Error("Failed to fetch request status.");
  }

  return response.json();
}