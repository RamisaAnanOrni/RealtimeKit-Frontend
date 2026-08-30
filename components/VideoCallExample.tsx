/**
 * VIDEO CALL COMPONENT EXAMPLE
 * 
 * ✅ CORRECT PATTERN:
 * - Use 'use client' directive
 * - Fetch meeting credentials from Django API directly
 * - Initialize Dyte video call with credentials
 * - Handle meeting lifecycle (start, end, record)
 * - NO Next.js API routes for any video call operations
 */

"use client";

import { useEffect, useRef, useState } from "react";
import DyteClient from "@dytesdk/web-core";
import { DyteSpinner } from "@dytesdk/react-ui-kit";
import { getMeetingCredentials, getMeeting, endMeeting } from "@/lib/meeting-api";
import { getErrorMessage } from "@/lib/api";

interface VideoCallExampleProps {
  meetingId: number | string;
  participantType: "farmer" | "vet";
}

export default function VideoCallExample({ meetingId, participantType }: VideoCallExampleProps) {
  const dyteRef = useRef<DyteClient | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meetingInfo, setMeetingInfo] = useState<any>(null);

  useEffect(() => {
    const initializeMeeting = async () => {
      try {
        setLoading(true);
        setError(null);

        // ✅ FETCH MEETING INFO FROM DJANGO
        const meeting = await getMeeting(meetingId);
        setMeetingInfo(meeting);

        // ✅ GET DYTE CREDENTIALS FROM DJANGO
        const credentials = await getMeetingCredentials(meetingId, participantType);

        // Initialize Dyte client with credentials from Django
        const dyte = await DyteClient.init({
          authToken: credentials.auth_token,
        });

        dyteRef.current = dyte;

        // Initialize UI if container exists
        if (containerRef.current) {
          await dyte.joinRoom();
          // Initialize Dyte UI components
          // (Dyte UI initialization would go here)
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    initializeMeeting();

    return () => {
      if (dyteRef.current) {
        dyteRef.current.leaveRoom();
      }
    };
  }, [meetingId, participantType]);

  const handleEndCall = async () => {
    try {
      if (dyteRef.current) {
        await dyteRef.current.leaveRoom();
      }
      // ✅ UPDATE MEETING STATUS IN DJANGO
      await endMeeting(meetingId, "Consultation completed");
      // Redirect or notify user
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) {
    return (
      <div className="video-call-container">
        <DyteSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="video-call-container">
        <div className="error-banner">{error}</div>
      </div>
    );
  }

  return (
    <div className="video-call-container">
      <div ref={containerRef} className="video-call" style={{ width: "100%", height: "100vh" }} />

      <div className="call-controls">
        <button onClick={handleEndCall} className="end-call-button">
          End Call
        </button>
      </div>

      {meetingInfo && (
        <div className="meeting-info">
          <p>Meeting ID: {meetingInfo.id}</p>
          <p>Farmer: {meetingInfo.farmer?.full_name}</p>
          {meetingInfo.vet && <p>Vet: {meetingInfo.vet.full_name}</p>}
          <p>Status: {meetingInfo.status}</p>
        </div>
      )}
    </div>
  );
}
