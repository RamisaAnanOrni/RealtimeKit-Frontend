/**
 * GUEST CONSULTATION FORM - WORKING EXAMPLE
 * 
 * ✅ COMPLETE WORKING EXAMPLE:
 * - Direct Django API calls
 * - No Next.js API routes
 * - Polling for meeting creation
 * - Redirect to video call
 */

"use client";

import { useState } from "react";
import { submitGuestRequest, pollGuestRequest, getErrorMessage } from "@/lib/api";

export default function GuestConsultationForm() {
  const [phone, setPhone] = useState("");
  const [problem, setProblem] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<number | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingStatus, setPollingStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // ✅ SUBMIT DIRECTLY TO DJANGO
      const response = await submitGuestRequest(phone, problem);

      if (response.request_id) {
        setRequestId(response.request_id);
        setPollingStatus("Submitted! Waiting for vet to join...");
        setIsPolling(true);

        // ✅ START POLLING DJANGO FOR MEETING CREATION
        pollForMeeting(response.request_id);
      } else {
        setError(response.message || "Failed to submit request");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const pollForMeeting = async (reqId: number) => {
    let attempts = 0;
    const maxAttempts = 60; // 2 minutes with 2-second intervals

    const pollInterval = setInterval(async () => {
      attempts++;

      if (attempts > maxAttempts) {
        clearInterval(pollInterval);
        setPollingStatus("Request timeout. Please try again.");
        setIsPolling(false);
        return;
      }

      try {
        // ✅ POLL DJANGO FOR STATUS UPDATES
        const status = await pollGuestRequest(reqId);

        if (status.status === "MEETING_CREATED" && status.farmer_join_link) {
          // Meeting is ready - redirect to video call
          clearInterval(pollInterval);
          setPollingStatus("Meeting ready! Redirecting...");

          // Wait a moment before redirecting
          setTimeout(() => {
            window.location.href = status.farmer_join_link;
          }, 1000);
        } else {
          setPollingStatus("Waiting for vet... (attempt " + attempts + "/" + maxAttempts + ")");
        }
      } catch (err) {
        console.error("Polling error:", err);
        // Continue polling even if there's a transient error
      }
    }, 2000); // Poll every 2 seconds
  };

  if (requestId && isPolling) {
    return (
      <div className="polling-container">
        <div className="spinner"></div>
        <h2>Setting up your consultation</h2>
        <p>{pollingStatus}</p>
        <p className="request-id">Request ID: {requestId}</p>
      </div>
    );
  }

  return (
    <div className="guest-form-container">
      <div className="form-card">
        <h1>Guest Consultation Request</h1>
        <p className="subtitle">Connect with a veterinarian without creating an account</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              type="tel"
              placeholder="e.g., +880 1234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="problem">Livestock Problem</label>
            <textarea
              id="problem"
              placeholder="Describe the health issue or concern with your livestock..."
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              rows={4}
              required
              disabled={loading}
            ></textarea>
          </div>

          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? "Submitting..." : "Request Consultation"}
          </button>
        </form>

        <div className="info-box">
          <h3>How it works:</h3>
          <ol>
            <li>Submit your request and livestock problem</li>
            <li>Our system finds an available veterinarian</li>
            <li>You'll be automatically connected to a video consultation</li>
            <li>Discuss your livestock's health and receive advice</li>
          </ol>
        </div>
      </div>

      <style jsx>{`
        .guest-form-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }

        .form-card {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: 40px;
        }

        h1 {
          margin: 0 0 10px 0;
          color: #333;
        }

        .subtitle {
          color: #666;
          margin-bottom: 30px;
        }

        .alert {
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 20px;
        }

        .alert-error {
          background-color: #fee;
          border: 1px solid #f99;
          color: #c33;
        }

        .form-group {
          margin-bottom: 20px;
        }

        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #333;
        }

        input,
        textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: inherit;
          font-size: 14px;
        }

        input:disabled,
        textarea:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
        }

        .btn-submit {
          width: 100%;
          padding: 12px;
          background-color: #4caf50;
          color: white;
          border: none;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
          font-size: 16px;
        }

        .btn-submit:hover:not(:disabled) {
          background-color: #45a049;
        }

        .btn-submit:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }

        .info-box {
          margin-top: 30px;
          padding: 15px;
          background-color: #f0f7ff;
          border-left: 4px solid #2196f3;
          border-radius: 4px;
        }

        .info-box h3 {
          margin: 0 0 15px 0;
          color: #1976d2;
        }

        .info-box ol {
          margin: 0;
          padding-left: 20px;
          color: #555;
        }

        .info-box li {
          margin-bottom: 10px;
        }

        .polling-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          text-align: center;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: 60px 40px;
        }

        .spinner {
          width: 50px;
          height: 50px;
          margin: 0 auto 20px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #4caf50;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .polling-container h2 {
          margin: 0 0 10px 0;
          color: #333;
        }

        .polling-container p {
          color: #666;
          margin: 10px 0;
        }

        .request-id {
          font-size: 12px;
          color: #999;
          font-family: monospace;
        }
      `}</style>
    </div>
  );
}
