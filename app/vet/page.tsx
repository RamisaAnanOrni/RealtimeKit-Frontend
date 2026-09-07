"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useDyteClient } from "@dytesdk/react-web-core";
import { useMeetingLeaveSync } from "@/hooks/useMeetingLeaveSync";
import { completeConsultationRequest } from "@/lib/vet-api";

const DyteMeeting = dynamic(
  () =>
    import("@dytesdk/react-ui-kit").then((mod) => mod.DyteMeeting),
  {
    ssr: false,
  }
);

function VetMeeting() {
  const searchParams = useSearchParams();

  const token = searchParams.get("token");
  const ridParam = searchParams.get("rid");
  const roleParam = searchParams.get("role");

  const [meeting, initMeeting] = useDyteClient();

  useEffect(() => {
    if (!token) {
      alert("Invalid Vet Join Link");
      return;
    }

    initMeeting({
      authToken: token,
      defaults: {
        audio: true,
        video: true,
      },
    });
  }, [token, initMeeting]);

  // When the vet presses the built-in "Leave" control in the call UI, notify
  // Django immediately (request -> COMPLETED, Meeting -> ENDED, vet released),
  // then bounce back to the dashboard so the Join button disappears. `rid` and
  // `role` are appended by meetingLinkWithContext when the dashboard opens the
  // room, so this page knows which consultation it belongs to.
  useMeetingLeaveSync(meeting, async () => {
    if (ridParam && roleParam === "vet") {
      try {
        await completeConsultationRequest(Number(ridParam));
      } catch (err) {
        console.error("Failed to notify backend after leaving the call:", err);
      }
    }
    const destination =
      roleParam === "farmer" ? "/farmer/dashboard" : "/vet/dashboard";
    window.location.assign(destination);
  });

  if (!meeting) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: 24,
          fontWeight: "bold",
        }}
      >
        Joining Vet Consultation...
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100vh",
      }}
    >
      <DyteMeeting meeting={meeting} />
    </div>
  );
}

export default function VetPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: 24,
            fontWeight: "bold",
          }}
        >
          Loading...
        </div>
      }
    >
      <VetMeeting />
    </Suspense>
  );
}
